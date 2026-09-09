import type { TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { TaskBoardState, taskBoardIdKey } from './taskboard-state';

/**
 * The keyboard controller: one handler on the root, driving the same focus, selection, movement and
 * history paths the pointer drives.
 *
 * One handler and not a listener per card: the roving focus means only one card is tabbable at a
 * time, so the board itself is the only element that has to hear the key. It also keeps the shortcut
 * table in one readable place instead of scattered across the parts.
 *
 * @module taskboard-keyboard
 */

/** Element names that own their keyboard behaviour and must not be intercepted. */
const NATIVE_CONTROLS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'OPTION', 'AUDIO', 'VIDEO', 'SUMMARY', 'DETAILS']);

/** ARIA roles that mean "this is a control", for widgets built out of generic elements. */
const INTERACTIVE_ROLES = new Set(['button', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'textbox', 'combobox', 'listbox', 'option', 'tab', 'slider', 'spinbutton', 'switch', 'checkbox', 'radio', 'link', 'searchbox']);

/**
 * The keyboard controller of one board.
 *
 * @group Types
 */
export class TaskBoardKeyboard<T extends TaskBoardItem = TaskBoardItem> {
    constructor(
        private readonly state: TaskBoardState<T>,
        private readonly host: () => HTMLElement | undefined
    ) {}

    /** The single entry point, bound to `keydown` on the root. */
    onKeyDown(event: KeyboardEvent): void {
        if (this.state.inert() && event.key !== 'Escape') return;
        if (this.ownedByControl(event)) return;

        const meta = event.ctrlKey || event.metaKey;

        if (meta && (event.key === 'z' || event.key === 'Z')) {
            event.preventDefault();
            if (event.shiftKey) this.state.redo();
            else this.state.undo();

            return;
        }

        if (meta && (event.key === 'y' || event.key === 'Y')) {
            event.preventDefault();
            this.state.redo();

            return;
        }

        if (meta && (event.key === 'a' || event.key === 'A')) {
            const cell = this.state.focusCell();
            if (cell.columnValue == null) return;

            event.preventDefault();
            this.state.selectCell(cell.columnValue, cell.swimlaneValue);

            return;
        }

        switch (event.key) {
            case 'Escape':
                this.escape(event);
                return;
            case 'Enter':
                this.activate(event);
                return;
            case ' ':
            case 'Spacebar':
                this.toggle(event);
                return;
            case 'Home':
            case 'End':
                this.edge(event, event.key === 'Home' ? 'start' : 'end');
                return;
            case 'Tab':
                this.column(event, event.shiftKey ? -1 : 1);
                return;
            case 'ArrowUp':
            case 'ArrowDown':
                this.vertical(event, event.key === 'ArrowUp' ? -1 : 1);
                return;
            case 'ArrowLeft':
            case 'ArrowRight':
                this.horizontal(event, event.key === 'ArrowLeft' ? -1 : 1);
                return;
            default:
                return;
        }
    }

    /**
     * Whether the key belongs to something inside the board that owns it.
     *
     * Without this a Space on a button inside a card would toggle the card's selection instead of
     * pressing the button, and typing into a card's inline input would reorder the board. Native
     * semantics first, then an explicit interactive role, then `contenteditable`.
     */
    private ownedByControl(event: KeyboardEvent): boolean {
        let element = event.target as HTMLElement | null;
        const host = this.host();

        while (element && element !== host) {
            if (NATIVE_CONTROLS.has(element.tagName)) return true;
            if (element.isContentEditable) return true;

            const role = element.getAttribute('role');
            if (role && INTERACTIVE_ROLES.has(role)) return true;

            // A <label> only claims the key if it governs an enabled control: a bare label inside a
            // card is text, and the board's keyboard still applies there.
            if (element.tagName === 'LABEL') {
                const control = (element as HTMLLabelElement).control;
                if (control && !(control as HTMLInputElement).disabled) return true;
            }

            element = element.parentElement;
        }

        return false;
    }

    /**
     * Unwinds one layer of board state, in the order the docs fix.
     *
     * Most-transient first: a pending confirmation, then a drag, then a column reorder, then the
     * selection, then the focus. One Escape should undo the last thing the user did, not everything.
     */
    private escape(event: KeyboardEvent): void {
        if (this.state.pendingMove()) {
            event.preventDefault();
            this.state.cancelPendingMove();

            return;
        }

        if (this.state.dragging()) {
            event.preventDefault();
            this.state.endCardDrag();

            return;
        }

        if (this.state.reorderingColumnId() != null) {
            event.preventDefault();
            this.state.endColumnDrag();

            return;
        }

        if (this.state.selectedIds().length > 0) {
            event.preventDefault();
            this.state.clearSelection();

            return;
        }

        const focused = this.state.focusedId();
        if (focused == null) return;

        event.preventDefault();
        this.state.setFocus(null);
    }

    private activate(event: KeyboardEvent): void {
        const item = this.focusedItem();
        if (!item) return;

        event.preventDefault();
        this.state.activate(item, 'keyboard', event);
    }

    private toggle(event: KeyboardEvent): void {
        const item = this.focusedItem();
        if (!item || !this.state.selectable()) return;

        event.preventDefault();
        this.state.selectFromPointer(item, { toggle: this.state.selectionMode() === 'multiple' });
    }

    private edge(event: KeyboardEvent, side: 'start' | 'end'): void {
        const cell = this.currentCell();
        if (cell.length === 0) return;

        event.preventDefault();
        this.focusItem(side === 'start' ? cell[0] : cell[cell.length - 1]);
    }

    /**
     * Vertical arrows: move the focus inside a cell, extend a range, or reorder.
     *
     * Alt is the movement modifier throughout — Alt alone reorders inside the lane and Alt+Shift
     * crosses rows — which is what keeps plain arrows safe to explore a board with.
     */
    private vertical(event: KeyboardEvent, direction: 1 | -1): void {
        const item = this.focusedItem();

        if (event.altKey) {
            if (!item) return;

            event.preventDefault();
            if (event.shiftKey) this.moveAcrossSwimlanes(item, direction);
            else this.reorderInCell(item, direction);

            return;
        }

        if (event.shiftKey && item) {
            const cell = this.currentCell();
            const index = this.indexOf(cell, item);
            const next = cell[index + direction];
            if (!next) return;

            event.preventDefault();
            this.state.extendSelection(item, next);
            this.focusItem(next, false);

            return;
        }

        const cell = this.currentCell();
        if (cell.length === 0) return;

        event.preventDefault();

        if (!item) {
            this.focusItem(direction === 1 ? cell[0] : cell[cell.length - 1]);
            return;
        }

        const index = this.indexOf(cell, item);
        const next = cell[index + direction];
        if (next) this.focusItem(next);
    }

    /** Horizontal arrows: walk the columns, or move the card between them. */
    private horizontal(event: KeyboardEvent, direction: 1 | -1): void {
        const step = this.state.rtl() ? ((direction * -1) as 1 | -1) : direction;

        if (event.altKey) {
            const item = this.focusedItem();
            if (!item) return;

            event.preventDefault();
            this.moveAcrossColumns(item, step);

            return;
        }

        event.preventDefault();
        this.column(event, step);
    }

    /**
     * Moves the focus to another column, landing on its first card or on the empty column itself.
     *
     * Parking on an empty column matters: without it the focus skips over a lane the user is trying
     * to reach, and a keyboard move into an empty column becomes impossible.
     */
    private column(event: KeyboardEvent, direction: 1 | -1): void {
        const columns = this.state.columns();
        if (columns.length === 0) return;

        const cell = this.state.focusCell();
        const current = cell.columnValue == null ? -1 : columns.findIndex((column) => column.id === cell.columnValue);
        const next = columns[Math.min(columns.length - 1, Math.max(0, (current < 0 ? 0 : current) + direction))];

        if (!next || next.id === cell.columnValue) return;

        event.preventDefault();

        const items = this.state.itemsOf(next.id, cell.swimlaneValue);

        this.state.setFocusCell(next.id, cell.swimlaneValue ?? null);

        if (items.length > 0) this.focusItem(items[0]);
        else this.state.setFocus(null);
    }

    private reorderInCell(item: T, direction: 1 | -1): void {
        const cell = this.currentCell();
        const index = this.indexOf(cell, item);
        const target = index + direction;

        if (index < 0 || target < 0 || target >= cell.length) return;

        const columnValue = this.state.columnOf(item);
        if (columnValue == null) return;

        this.state.requestMove(item, { id: this.state.idOf(item), columnValue, index: target, swimlaneValue: this.state.swimlaneOf(item) }, this.movingIds(item));
    }

    private moveAcrossColumns(item: T, direction: 1 | -1): void {
        const columns = this.state.columns();
        const columnValue = this.state.columnOf(item);
        const current = columns.findIndex((column) => column.id === columnValue);
        const next = columns[current + direction];

        if (current < 0 || !next) return;

        const target = this.state.itemsOf(next.id, this.state.swimlaneOf(item));

        this.state.requestMove(item, { id: this.state.idOf(item), columnValue: next.id, index: target.length, swimlaneValue: this.state.swimlaneOf(item) }, this.movingIds(item));
    }

    private moveAcrossSwimlanes(item: T, direction: 1 | -1): void {
        if (!this.state.grouped()) return;

        const swimlanes = this.state.swimlanes();
        const swimlaneValue = this.state.swimlaneOf(item);
        const current = swimlanes.findIndex((swimlane) => swimlane.id === swimlaneValue);
        const next = swimlanes[current + direction];
        const columnValue = this.state.columnOf(item);

        if (current < 0 || !next || columnValue == null) return;

        const target = this.state.itemsOf(columnValue, next.id);

        this.state.requestMove(item, { id: this.state.idOf(item), columnValue, index: target.length, swimlaneValue: next.id }, this.movingIds(item));
    }

    /**
     * Which cards a keyboard move carries.
     *
     * The whole selection when the focused card is part of it — same rule the pointer follows — and
     * only the focused card otherwise, so a stale selection elsewhere on the board does not get
     * dragged along by an arrow key.
     */
    private movingIds(item: T): (string | number)[] | undefined {
        const id = this.state.idOf(item);
        if (this.state.selectionMode() !== 'multiple' || !this.state.isSelected(id)) return undefined;

        return this.state.selectedIds().length > 1 ? [...this.state.selectedIds()] : undefined;
    }

    private focusedItem(): T | undefined {
        const id = this.state.focusedId();
        return id == null ? undefined : this.state.itemById(id);
    }

    private currentCell(): T[] {
        const cell = this.state.focusCell();
        return cell.columnValue == null ? [] : this.state.itemsOf(cell.columnValue, cell.swimlaneValue);
    }

    private indexOf(cell: T[], item: T): number {
        const key = taskBoardIdKey(this.state.idOf(item));
        return cell.findIndex((entry) => taskBoardIdKey(this.state.idOf(entry)) === key);
    }

    /** Moves the roving focus and, unless told otherwise, the DOM focus with it. */
    private focusItem(item: T, moveDom = true): void {
        const id = this.state.idOf(item);

        this.state.setFocus(id);
        this.state.setFocusCell(this.state.columnOf(item) ?? null, this.state.swimlaneOf(item) ?? null);

        if (!moveDom) return;

        const element = this.host()?.querySelector<HTMLElement>(`[data-part="card"][data-taskboard-id-key="${taskBoardIdKey(id)}"]`);
        element?.focus({ preventScroll: false });
    }
}
