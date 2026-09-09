import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, contentChild, effect, inject, input, signal } from '@angular/core';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_COLUMN_CONTEXT, type TaskBoardColumnContext, type TaskBoardColumnRenderContext } from './taskboard-context';
import { TaskBoardColumnDef } from './taskboard-registry';
import { TASKBOARD_STATE, formatLabel, taskBoardIdKey } from './taskboard-state';

/**
 * The column wrapper: identity, collapse state, drop target, ARIA and the column context.
 *
 * Nothing visible of its own. What it guarantees is that whatever the application renders inside it
 * keeps the contract the runtime depends on — the data attributes the drag controller hit-tests
 * against, the list semantics a screen reader reads, and the context its children inject.
 *
 * @module taskboard-column
 */

/**
 * A workflow column, or one cell of a swimlane row.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column',
    standalone: true,
    exportAs: 'pTaskBoardColumn',
    template: `
        @if (definition()) {
            <ng-container [ngTemplateOutlet]="definition()!.template" [ngTemplateOutletContext]="definitionContext()" />
        } @else {
            <ng-content />
        }
    `,
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: TASKBOARD_COLUMN_CONTEXT, useFactory: () => inject(TaskBoardColumn).columnContext }],
    host: {
        'data-scope': 'taskboard',
        'data-part': 'column',
        role: 'list',
        tabindex: '-1',
        '[class]': 'hostClass()',
        '[attr.data-column-id]': 'value()',
        '[attr.data-taskboard-id-key]': 'idKey()',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-expanded]': 'collapsible() ? !collapsed() : null'
    }
})
export class TaskBoardColumn<T extends TaskBoardItem = TaskBoardItem> {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * Value this column is registered under, matched against each card's `columnField`. Required.
     * @group Props
     */
    readonly value = input.required<string | number>();
    /**
     * Visible and accessible name of the column. Required.
     * @group Props
     */
    readonly label = input.required<string>();
    /**
     * The column metadata, when the board has any. Supplies the status strip, the WIP limit, the
     * lock and the transition rules.
     * @group Props
     */
    readonly column = input<TaskBoardColumnModel | undefined>(undefined);
    /**
     * Swimlane this cell belongs to, on a grouped board.
     *
     * Optional because the documented swimlane layout sets `data-swimlane-id` on the host instead;
     * the column falls back to reading that attribute, so both spellings scope the same cell.
     * @group Props
     */
    readonly swimlane = input<string | number | undefined>(undefined);

    /** The typed repeated template, when one was declared. */
    protected readonly definition = contentChild(TaskBoardColumnDef<T>);

    /** The swimlane this cell is scoped to, from the input or from the host attribute. */
    private readonly swimlaneValue = computed(() => {
        const explicit = this.swimlane();
        if (explicit != null) return explicit;

        const raw = this.hostAttribute();
        if (raw == null) return undefined;

        return this.state.swimlanes().find((entry) => String(entry.id) === raw)?.id;
    });

    /**
     * `data-swimlane-id` as the template set it.
     *
     * Read once on init: the attribute comes from the row the cell was stamped in, and a row does
     * not change identity under a cell — the loop re-creates the cell instead.
     */
    private readonly hostAttribute = signal<string | null>(null);

    private readonly readHostAttribute = effect(() => {
        this.hostAttribute.set(this.hostElement.nativeElement.getAttribute('data-swimlane-id'));
    });

    /** Every card of this cell, in board order. */
    protected readonly items = computed<T[]>(() => this.state.itemsOf(this.value(), this.swimlaneValue()) as T[]);

    /** Key of the cell, for the virtual window. */
    private readonly cellKey = computed(() => `${taskBoardIdKey(this.value())}|${taskBoardIdKey(this.swimlaneValue())}`);

    private readonly windowRange = computed(() => this.state.windowOf(this.cellKey(), this.items().length));

    /** The cards to render: the whole cell, or the mounted window when virtual scroll is on. */
    protected readonly visibleItems = computed<T[]>(() => {
        const range = this.windowRange();
        const items = this.items();

        return range.start === 0 && range.end >= items.length ? items : items.slice(range.start, range.end);
    });

    /** Whether the column is collapsed. */
    protected readonly collapsed = computed(() => this.state.isColumnCollapsed(this.value()));

    /** Whether the collapse affordance is offered. */
    protected readonly collapsible = computed(() => this.state.collapsible());

    /** How many cards the cell holds. */
    protected readonly itemCount = computed(() => this.items().length);

    protected readonly idKey = computed(() => taskBoardIdKey(this.value()));

    protected readonly ariaLabel = computed(() => formatLabel(this.state.labels().column, this.label(), this.itemCount()));

    /**
     * The host classes: the base class, the status family, and the runtime states.
     *
     * `p-taskboard-column-wip-*` is derived and not stored, so a card arriving from anywhere — a
     * drag, a keyboard move, a store refresh — repaints the capacity state without anyone telling
     * the column about it.
     */
    protected readonly hostClass = computed(() => {
        const metadata = this.resolvedColumn();
        const classes = ['p-taskboard-column'];

        if (metadata?.statusType) classes.push(`p-taskboard-column-${metadata.statusType}`);
        if (this.collapsed()) classes.push('p-taskboard-column-collapsed');
        if (metadata?.locked) classes.push('p-taskboard-column-locked');
        if (metadata?.pinned) classes.push('p-taskboard-column-pinned');
        if (this.state.reorderingColumnId() === this.value()) classes.push('p-taskboard-column-dragging');

        const wip = this.state.wipStateOf(this.value());
        if (wip === 'warning') classes.push('p-taskboard-column-wip-warning');
        if (wip === 'exceeded') classes.push('p-taskboard-column-wip-exceeded');

        return classes.join(' ');
    });

    /** The metadata for this column: the input, else the entry the root was given. */
    private readonly resolvedColumn = computed(() => this.column() ?? this.state.columnById(this.value()));

    /** @internal The context this column's children inject. */
    readonly columnContext: TaskBoardColumnContext<T> = {
        value: computed(() => this.value()),
        label: computed(() => this.label()),
        columnData: computed(() => this.resolvedColumn()),
        itemCount: computed(() => this.itemCount()),
        items: computed(() => this.items()),
        visibleItems: computed(() => this.visibleItems()),
        isCollapsed: computed(() => this.collapsed()),
        toggleCollapse: () => this.state.toggleColumn(this.value()),
        addItem: (item: T) => this.state.addItem(item, this.value()),
        virtualStartIndex: computed(() => this.windowRange().start),
        virtualPaddingTop: computed(() => this.windowRange().paddingTop),
        virtualPaddingBottom: computed(() => this.windowRange().paddingBottom),
        toLogicalIndex: (renderedIndex: number) => this.windowRange().start + renderedIndex,
        cellKey: computed(() => this.cellKey())
    };

    /**
     * The context a `pTaskBoardColumnDef` template is stamped with.
     *
     * The same values, unwrapped: Angular's `let-` microsyntax cannot call a signal, so a definition
     * that had to write `columnContext.visibleItems()` would not compile in the microsyntax form the
     * docs use.
     */
    protected readonly definitionContext = computed(() => {
        const render: TaskBoardColumnRenderContext<T> = {
            value: this.value(),
            label: this.label(),
            column: this.resolvedColumn(),
            items: this.items(),
            visibleItems: this.visibleItems(),
            itemCount: this.itemCount(),
            isCollapsed: this.collapsed(),
            toggleCollapse: this.columnContext.toggleCollapse,
            addItem: this.columnContext.addItem
        };

        return { $implicit: render, context: render, ...render };
    });

    /**
     * Announces this column to the root, so a board with no `columns` input still has a column list.
     *
     * Only when the root was given none: with an explicit `columns` array that array is the source of
     * truth, and a swimlane layout renders the same lane once per row — registering from every cell
     * would report the same column several times.
     *
     * It reads the `column` INPUT and not the resolved metadata on purpose. Resolving falls back to
     * the root's column list, which is the very thing this effect writes: reading it here would make
     * the effect its own trigger and spin forever.
     */
    private readonly register = effect(() => {
        if (this.state.hasDeclaredColumns()) return;

        this.state.registerColumn({ ...(this.column() ?? {}), id: this.value(), label: this.label() });
    });

    private readonly unregister = inject(DestroyRef).onDestroy(() => {
        if (this.state.hasDeclaredColumns()) return;

        this.state.unregisterColumn(this.value());
    });

    /** Toggles this column's collapsed state. */
    toggleCollapse(): void {
        this.state.toggleColumn(this.value());
    }

    /** Collapses this column. */
    collapse(): void {
        this.state.setColumnCollapsed(this.value(), true);
    }

    /** Expands this column. */
    expand(): void {
        this.state.setColumnCollapsed(this.value(), false);
    }
}
