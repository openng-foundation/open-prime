import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input } from '@angular/core';
import type { TaskBoardColumnModel, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_COLUMN_CONTEXT, TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT, TASKBOARD_SWIMLANE_HEADER_CONTEXT, type TaskBoardColumnContext, type TaskBoardSwimlaneColumnHeaderContext, type TaskBoardSwimlaneHeaderContext } from './taskboard-context';
import { TASKBOARD_DRAG } from './taskboard-drag';
import { TASKBOARD_STATE, formatLabel } from './taskboard-state';

/**
 * The structural surfaces.
 *
 * Most of these are deliberately thin: a host element carrying the layout class, the data attributes
 * and the ARIA role, plus `<ng-content>`. They are the CONTEXT BOUNDARIES the docs describe — a
 * child injects the context of whichever part it was placed under, with no inputs to thread — and
 * keeping them free of markup is what lets an application replace the visible content without losing
 * the focus, drag, collapse and accessibility contract.
 *
 * @module taskboard-parts
 */

// The decorators are written out by hand rather than produced by a helper: Angular's AOT compiler
// has to READ the metadata statically, and an object returned from a call leaves the template
// invisible to it and fails with NG2001.

/**
 * Board-level chrome: the place a product toolbar, search, filters or export controls go.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'header', class: 'p-taskboard-header' }
})
export class TaskBoardHeader {}

/**
 * The column header surface.
 *
 * Also the reorder handle: a press that starts here and travels far enough picks the column up, which
 * is why nested controls that must not start a drag have to stop `pointerdown` themselves.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'column-header',
        role: 'heading',
        'aria-level': '2',
        class: 'p-taskboard-column-header',
        style: 'display: block',
        '[attr.aria-label]': 'ariaLabel()',
        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class TaskBoardColumnHeader {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly drag = inject(TASKBOARD_DRAG);
    private readonly column = inject<TaskBoardColumnContext | null>(TASKBOARD_COLUMN_CONTEXT, { optional: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly ariaLabel = computed(() => (this.column ? formatLabel(this.state.labels().columnHeader, this.column.label()) : null));

    protected onPointerDown(event: PointerEvent): void {
        const value = this.column?.value();
        if (value == null) return;

        const element = this.hostElement.nativeElement.closest<HTMLElement>('[data-part="column"]');
        if (!element) return;

        this.drag.onColumnPointerDown(event, value, element);
    }
}

/**
 * The scope the visible cards of a column live in.
 *
 * Reports its scroll position so the virtual window can follow it, and only then: a board without
 * `virtualScroll` never reads the offset, so the listener costs a passive handler and nothing else.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-content',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'column-content',
        class: 'p-taskboard-column-body',
        '(scroll)': 'onScroll()'
    }
})
export class TaskBoardColumnContent {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly column = inject<TaskBoardColumnContext | null>(TASKBOARD_COLUMN_CONTEXT, { optional: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    protected onScroll(): void {
        if (!this.state.virtual()) return;

        const key = this.column?.cellKey();
        if (key == null) return;

        const element = this.hostElement.nativeElement;
        this.state.setViewport(key, element.scrollTop, element.clientHeight);
    }
}

/**
 * The column footer surface: add actions, totals, column metadata.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-footer',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'column-footer', class: 'p-taskboard-column-footer' }
})
export class TaskBoardColumnFooter {}

/**
 * The empty surface of a column or a swimlane cell.
 *
 * Ships a default copy so an empty column is not a blank rectangle, and takes projected content when
 * the product has something better to say.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-empty',
    standalone: true,
    template: `<ng-content>{{ emptyLabel() }}</ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'column-empty', class: 'p-taskboard-empty-column' }
})
export class TaskBoardColumnEmpty {
    private readonly state = inject(TASKBOARD_STATE);

    protected readonly emptyLabel = computed(() => this.state.labels().empty);
}

/**
 * A dedicated add-column surface, sitting outside the card lists.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-add',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'column-add', class: 'p-taskboard-column-add' }
})
export class TaskBoardColumnAdd {}

/**
 * Header outlet inside a card.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-header', class: 'p-taskboard-card-header' }
})
export class TaskBoardCardHeader {}

/**
 * Main outlet inside a card.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-content',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-content', class: 'p-taskboard-card-content' }
})
export class TaskBoardCardContent {}

/**
 * Footer outlet inside a card.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-footer',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-footer', class: 'p-taskboard-card-footer' }
})
export class TaskBoardCardFooter {}

/**
 * The add-card surface of a column.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-add',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-add', class: 'p-taskboard-card-add' }
})
export class TaskBoardCardAdd {}

/**
 * The left-hand row header of a grouped board.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-swimlane-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: TASKBOARD_SWIMLANE_HEADER_CONTEXT, useFactory: () => inject(TaskBoardSwimlaneHeader).swimlaneContext }],
    host: {
        'data-scope': 'taskboard',
        'data-part': 'swimlane-header',
        class: 'p-taskboard-swimlane-header',
        '[attr.data-swimlane-id]': 'swimlane().id'
    }
})
export class TaskBoardSwimlaneHeader {
    private readonly state = inject(TASKBOARD_STATE);

    /**
     * The row this header names. Required.
     * @group Props
     */
    readonly swimlane = input.required<TaskBoardSwimlane>();

    /** @internal The context this header's children inject. */
    readonly swimlaneContext: TaskBoardSwimlaneHeaderContext = {
        swimlane: computed(() => this.swimlane()),
        itemCount: computed(() => this.state.countOfSwimlane(this.swimlane().id)),
        isCollapsed: computed(() => this.state.isSwimlaneCollapsed(this.swimlane().id)),
        toggleCollapse: () => this.state.toggleSwimlane(this.swimlane().id)
    };

    /** Toggles this row's collapsed state. */
    toggleCollapse(): void {
        this.state.toggleSwimlane(this.swimlane().id);
    }
}

/**
 * A column label in the swimlane grid's header row.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-swimlane-column-header',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT, useFactory: () => inject(TaskBoardSwimlaneColumnHeader).columnHeaderContext }],
    host: {
        'data-scope': 'taskboard',
        'data-part': 'swimlane-column-header',
        class: 'p-taskboard-swimlane-column-header',
        '[attr.data-column-id]': 'column().id'
    }
})
export class TaskBoardSwimlaneColumnHeader {
    private readonly state = inject(TASKBOARD_STATE);

    /**
     * The column this label names. Required.
     * @group Props
     */
    readonly column = input.required<TaskBoardColumnModel>();

    /** @internal The context this header's children inject. */
    readonly columnHeaderContext: TaskBoardSwimlaneColumnHeaderContext = {
        column: computed(() => this.column()),
        itemCount: computed(() => this.state.countOfColumn(this.column().id))
    };
}

/**
 * The board's loading surface.
 *
 * Shown only while `loading` is on, so a page can leave it declared and let the board decide when it
 * appears. It is `aria-hidden` because the root already carries `aria-busy` — announcing the same
 * state twice is worse than announcing it once.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-loading',
    standalone: true,
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'loading',
        'aria-hidden': 'true',
        class: 'p-taskboard-loading',
        '[hidden]': '!loading()'
    }
})
export class TaskBoardLoading {
    private readonly state = inject(TASKBOARD_STATE);

    protected readonly loading = computed(() => this.state.loading());
}
