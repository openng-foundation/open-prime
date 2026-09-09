import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, inject, input } from '@angular/core';
import type { TaskBoardColumnModel, TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_CARD_CONTEXT, TASKBOARD_COLUMN_CONTEXT, type TaskBoardCardContext, type TaskBoardColumnContext } from './taskboard-context';
import { TASKBOARD_DRAG } from './taskboard-drag';
import { TASKBOARD_STATE, taskBoardIdKey } from './taskboard-state';

/**
 * The card wrapper: focus, selection, activation, drag start, state classes, data attributes and the
 * card context.
 *
 * @module taskboard-card
 */

/** The shortcuts a card claims, advertised so a reader can list them while the card has focus. */
const CARD_KEYSHORTCUTS = 'Enter Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight Alt+Shift+ArrowUp Alt+Shift+ArrowDown';

/**
 * One card.
 *
 * The visible body is projected. This wrapper is what makes it a card as far as the board is
 * concerned: it is the focus target, the drag source, the hit-test rectangle and the context
 * boundary its content injects.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card',
    standalone: true,
    exportAs: 'pTaskBoardCard',
    template: `<ng-content />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: TASKBOARD_CARD_CONTEXT, useFactory: () => inject(TaskBoardCard).cardContext }],
    host: {
        'data-scope': 'taskboard',
        'data-part': 'card',
        role: 'listitem',
        '[class]': 'hostClass()',
        '[attr.tabindex]': 'focused() ? 0 : -1',
        '[attr.data-task-id]': 'id()',
        '[attr.data-taskboard-id-key]': 'idKey()',
        '[attr.data-task-index]': 'index()',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-grabbed]': 'draggable() ? dragging() : null',
        '[attr.aria-keyshortcuts]': 'keyShortcuts',
        '[attr.aria-disabled]': 'disabled() ? true : null',
        '(pointerdown)': 'onPointerDown($event)',
        '(click)': 'onClick($event)',
        '(dblclick)': 'onDblclick($event)',
        '(focusin)': 'onFocusIn()'
    }
})
export class TaskBoardCard<T extends TaskBoardItem = TaskBoardItem> {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly drag = inject(TASKBOARD_DRAG);
    private readonly columnContext = inject<TaskBoardColumnContext<T> | null>(TASKBOARD_COLUMN_CONTEXT, { optional: true });
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

    /**
     * The application record this card renders. Required.
     * @group Props
     */
    readonly item = input.required<T>();
    /**
     * The column metadata, when the template has it to hand. Resolved from the card's own field
     * otherwise, so it is a convenience and not a requirement.
     * @group Props
     */
    readonly column = input<TaskBoardColumnModel | undefined>(undefined);

    /** @internal The shortcut list advertised on the host. */
    readonly keyShortcuts = CARD_KEYSHORTCUTS;

    /** Value of the card's `dataKey` field. */
    protected readonly id = computed(() => this.state.idOf(this.item()));

    protected readonly idKey = computed(() => taskBoardIdKey(this.id()));

    /** Where the card sits in its cell, exposed for tests and for styling nth-of-type cases. */
    protected readonly index = computed(() => {
        const cell = this.columnContext?.items() ?? [];
        const key = this.idKey();

        return cell.findIndex((entry) => taskBoardIdKey(this.state.idOf(entry)) === key);
    });

    protected readonly selected = computed(() => this.state.isSelected(this.id()));

    protected readonly focused = computed(() => this.state.isFocused(this.id()));

    protected readonly dragging = computed(() => this.state.isDragging(this.id()));

    /**
     * Effective disabled state: the card's own, or a disabled board.
     *
     * A READ-ONLY board is deliberately not included. Read-only means nothing can be changed, not
     * that the cards stop being content: marking them disabled dimmed every card to half opacity and
     * took away the pointer, so the text could not be selected and a link inside a card could not be
     * followed. The mutation guards live in the runtime, which refuses every write either way.
     */
    protected readonly disabled = computed(() => this.item().disabled === true || this.state.disabled());

    /** Whether this card can be picked up. */
    protected readonly draggable = computed(() => {
        if (this.disabled() || !this.state.dragEnabled()) return false;
        if (this.item().draggable === false) return false;
        if (this.state.access()?.canDrag === false) return false;

        const columnValue = this.state.columnOf(this.item());

        return columnValue == null || this.state.access()?.columnAccess?.[columnValue]?.canMoveOut !== false;
    });

    protected readonly ariaLabel = computed(() => this.state.titleOf(this.item()));

    /**
     * The host classes.
     *
     * `p-taskboard-card-dragging-source` is separate from `p-taskboard-card-dragging` on purpose: on
     * a multi-card drag every travelling card is "dragging", but only one of them is the card the
     * gesture started on, and a preview that wants to point back at it needs to tell them apart.
     */
    protected readonly hostClass = computed(() => {
        const classes = ['p-taskboard-card'];

        if (this.draggable()) classes.push('p-taskboard-card-draggable');
        if (this.dragging()) classes.push('p-taskboard-card-dragging');
        if (this.state.draggingItem() && taskBoardIdKey(this.state.idOf(this.state.draggingItem() as T)) === this.idKey()) classes.push('p-taskboard-card-dragging-source');
        if (this.selected()) classes.push('p-taskboard-card-selected');
        if (this.focused()) classes.push('p-taskboard-card-focused');
        if (this.disabled()) classes.push('p-taskboard-card-disabled');

        return classes.join(' ');
    });

    /** @internal The context this card's children inject. */
    readonly cardContext: TaskBoardCardContext<T> = {
        item: computed(() => this.item()),
        column: computed(() => this.column() ?? this.state.columnModelOf(this.item())),
        isSelected: computed(() => this.selected()),
        isFocused: computed(() => this.focused()),
        isDisabled: computed(() => this.disabled()),
        isDragging: computed(() => this.dragging())
    };

    /**
     * Records the press and hands it to the drag sensor.
     *
     * The sensor decides whether it becomes a drag; nothing happens here beyond arming it, which is
     * why a press that never travels far enough still arrives at `click` as a click.
     */
    protected onPointerDown(event: PointerEvent): void {
        if (this.disabled()) return;

        this.state.setFocus(this.id());
        this.state.setFocusCell(this.state.columnOf(this.item()) ?? null, this.state.swimlaneOf(this.item()) ?? null);

        this.drag.onCardPointerDown(event, this.item(), this.hostElement.nativeElement);
    }

    protected onClick(event: MouseEvent): void {
        if (this.disabled()) return;

        // A pointer drag also ends in a click; that one does not touch the selection.
        if (this.drag.shouldSwallowClick()) return;

        this.state.selectFromPointer(this.item(), { toggle: event.ctrlKey || event.metaKey, range: event.shiftKey });
        this.state.emitCardClick(this.item(), event);
    }

    protected onDblclick(event: MouseEvent): void {
        if (this.disabled()) return;

        this.state.emitCardDblclick(this.item(), event);
    }

    /**
     * Keeps the roving focus in step with the DOM focus.
     *
     * A card can take focus without the board's keyboard handler being involved — a Tab from outside,
     * a `scrollToCard` followed by a click, a screen reader moving the virtual cursor — and the
     * board's idea of where the focus is has to follow, or the next arrow key jumps somewhere else.
     */
    protected onFocusIn(): void {
        if (this.disabled()) return;

        this.state.setFocus(this.id());
        this.state.setFocusCell(this.state.columnOf(this.item()) ?? null, this.state.swimlaneOf(this.item()) ?? null);
    }
}
