import { InjectionToken, signal } from '@angular/core';
import type { TaskBoardItem } from '@openng/optimus-ui/types/taskboard';
import { TaskBoardState, taskBoardIdKey } from './taskboard-state';

/**
 * The pointer sensor: card moves, column reorders, edge auto-scroll and the geometry the drop
 * decisions are taken against.
 *
 * A snapshot and not live `getBoundingClientRect()` calls: hit-testing on every pointer move against
 * a board of a few hundred cards forces a layout per move and the drag stutters. The snapshot is
 * refreshed when something actually invalidates it — a scroll of the board or of a column — which is
 * also what keeps the marker and the accepted index agreeing after an auto-scroll.
 *
 * @module taskboard-drag
 */

/** One drop cell, as measured at drag start. */
interface CellGeometry {
    /** Column the cell belongs to. */
    columnValue: string | number;
    /** Swimlane the cell belongs to, on a grouped board. */
    swimlaneValue?: string | number;
    /** The scrollable body the cards live in. */
    element: HTMLElement;
    /** Where the body is on screen. */
    rect: DOMRect;
    /** The card wrappers of the cell, in render order. */
    cards: { key: string; rect: DOMRect; index: number }[];
}

/** How close to an edge auto-scroll kicks in, in pixels. */
const EDGE_ZONE = 56;

/** How fast auto-scroll runs, in pixels per frame. */
const EDGE_SPEED = 18;

/**
 * The pointer sensor of one board.
 *
 * @group Types
 */
export class TaskBoardDrag<T extends TaskBoardItem = TaskBoardItem> {
    constructor(private readonly state: TaskBoardState<T>) {}

    private host?: HTMLElement;
    private document?: Document;

    /** Where the drag preview should sit, in viewport coordinates. */
    readonly previewPosition = signal<{ x: number; y: number } | null>(null);

    /** Width the preview should take, copied off the source card so it does not jump. */
    readonly previewWidth = signal<number | null>(null);

    /**
     * A copy of the source card's visible body, for the preview to show when nothing was projected
     * into it.
     *
     * A preview has to look like the card being dragged, and the runtime cannot know what the
     * application's card component renders — so it takes the rendered nodes. Cloned, never moved:
     * the real card stays in its column, dimmed, until the drop is decided.
     */
    readonly previewClone = signal<HTMLElement[] | null>(null);

    /** Where the runtime insertion line should sit, when the target has no authored marker. */
    readonly runtimeIndicator = signal<{ top: number; left: number; width: number } | null>(null);

    /**
     * Whether the `click` the browser is about to fire belongs to a drag.
     *
     * A pointer drag still ends in a `click` on the source element, and left alone that click would
     * change the selection of the card the user just dropped. The flag is raised when a gesture
     * actually became a drag and cleared by the next press.
     */
    private clickFromDrag = false;

    private pointerId: number | null = null;
    private origin: { x: number; y: number } | null = null;
    private candidate: T | null = null;
    private candidateElement: HTMLElement | null = null;
    private started = false;

    private geometry: CellGeometry[] = [];
    private scrollListeners: { element: EventTarget; handler: () => void }[] = [];
    private edgeFrame: number | null = null;
    private edgePointer: { x: number; y: number } | null = null;

    private columnCandidate: { id: string | number; index: number; element: HTMLElement } | null = null;
    private columnRects: { id: string | number; index: number; element: HTMLElement; rect: DOMRect }[] = [];
    private columnStarted = false;

    /** Binds the sensor to the board's root element. */
    attach(host: HTMLElement): void {
        this.host = host;
        this.document = host.ownerDocument;
    }

    /** Drops every listener still attached. Called when the board goes away, mid-drag included. */
    destroy(): void {
        this.detachWindow();
        this.detachScroll();
        this.stopEdgeScroll();
    }

    // ---------------------------------------------------------------------------------------------
    // Card drag
    // ---------------------------------------------------------------------------------------------

    /**
     * Records a press on a card without committing to a drag.
     *
     * Nothing moves until the pointer has travelled `dragMinDistance`, which is what keeps a tap on
     * a touch screen a tap: below the threshold the gesture stays a click and goes to the selection.
     */
    onCardPointerDown(event: PointerEvent, item: T, element: HTMLElement): void {
        if (!this.draggable(item)) return;
        if (event.button !== 0 && event.pointerType === 'mouse') return;

        this.pointerId = event.pointerId;
        this.origin = { x: event.clientX, y: event.clientY };
        this.candidate = item;
        this.candidateElement = element;
        this.started = false;
        this.clickFromDrag = false;
        this.state.pressing.set(true);

        this.attachWindow();
    }

    private onPointerMove = (event: PointerEvent): void => {
        if (this.pointerId !== null && event.pointerId !== this.pointerId) return;

        if (this.columnCandidate) {
            this.moveColumn(event);
            return;
        }

        if (!this.origin || !this.candidate) return;

        if (!this.started) {
            const travelled = Math.hypot(event.clientX - this.origin.x, event.clientY - this.origin.y);
            if (travelled < this.state.dragMinDistance()) return;

            this.beginCardDrag(event);
        }

        this.previewPosition.set({ x: event.clientX, y: event.clientY });
        this.edgePointer = { x: event.clientX, y: event.clientY };
        this.startEdgeScroll();
        this.resolveTarget(event.clientX, event.clientY);
    };

    private beginCardDrag(event: PointerEvent): void {
        const item = this.candidate;
        if (!item) return;

        this.started = true;
        this.clickFromDrag = true;
        this.state.beginCardDrag(item);
        this.snapshot();

        // Whatever the browser managed to select before the threshold was crossed is dropped;
        // otherwise the gesture drags the card and leaves a stripe of highlighted text behind.
        this.document?.getSelection()?.removeAllRanges();

        const source = this.candidateElement?.getBoundingClientRect();
        this.previewWidth.set(source ? source.width : null);
        this.previewClone.set(this.cloneBody(this.candidateElement));

        const columnValue = this.state.columnOf(item);
        this.state.emitDragStart(item, columnValue == null ? undefined : this.state.columnById(columnValue), event);
    }

    /**
     * The visible body of a card, cloned and stripped of everything that made it interactive.
     *
     * The wrapper's own element children are taken and not the wrapper itself: the wrapper carries
     * the drag state classes, and `p-taskboard-card-dragging` would render the preview at the same
     * 35% the real card is showing.
     */
    private cloneBody(element: HTMLElement | null): HTMLElement[] | null {
        if (!element) return null;

        const clones = Array.from(element.children).map((child) => child.cloneNode(true) as HTMLElement);
        if (clones.length === 0) return null;

        for (const clone of clones) {
            for (const node of [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))]) {
                node.removeAttribute('id');
                node.removeAttribute('tabindex');
                node.setAttribute('aria-hidden', 'true');
                if (node instanceof HTMLInputElement || node instanceof HTMLButtonElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) node.disabled = true;
            }
        }

        return clones;
    }

    private onPointerUp = (event: PointerEvent): void => {
        if (this.pointerId !== null && event.pointerId !== this.pointerId) return;

        if (this.columnCandidate) {
            this.releaseColumn();
            return;
        }

        const item = this.candidate;
        const dragged = this.started;
        const target = this.state.dropTarget();

        // Everything needed is read BEFORE the drag is closed: resetCard empties the travelling set,
        // and reading it afterwards would leave the move with no cards in it.
        const ids = [...this.state.draggingIds()];
        const oldColumnValue = item ? this.state.columnOf(item) : undefined;
        const oldColumn = oldColumnValue == null ? undefined : this.state.columnById(oldColumnValue);
        const oldCell = oldColumnValue == null || !item ? [] : this.state.itemsOf(oldColumnValue, this.state.swimlaneOf(item));
        const oldIndex = item ? oldCell.findIndex((entry) => taskBoardIdKey(this.state.idOf(entry)) === taskBoardIdKey(this.state.idOf(item))) : -1;

        this.resetCard();

        if (!dragged || !item) return;

        if (!target) {
            this.state.emitDragCancel(item, oldColumn);
            return;
        }

        this.state.requestMove(item, { id: this.state.idOf(item), columnValue: target.columnValue, index: target.index, swimlaneValue: target.swimlaneValue }, ids);

        this.state.emitDragEnd(item, oldColumn, this.state.columnById(target.columnValue), Math.max(0, oldIndex), target.index);
    };

    /**
     * Refuses the browser's own text selection while a press is being tracked.
     *
     * `user-select: none` covers the board's own surfaces, but a card projects arbitrary content and
     * a stylesheet the application owns can put `user-select: text` back on part of it. Cancelling
     * `selectstart` is the one hook that cannot be overridden from CSS.
     */
    private onSelectStart = (event: Event): void => {
        if (this.origin === null) return;

        event.preventDefault();
    };

    private onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape') return;

        if (this.columnCandidate) {
            this.releaseColumn(true);
            return;
        }

        const item = this.candidate;
        const dragged = this.started;
        const columnValue = item ? this.state.columnOf(item) : undefined;

        this.resetCard();

        if (dragged && item) this.state.emitDragCancel(item, columnValue == null ? undefined : this.state.columnById(columnValue));
    };

    private resetCard(): void {
        if (this.started) this.state.endCardDrag();

        this.state.pressing.set(false);
        this.previewClone.set(null);
        this.pointerId = null;
        this.origin = null;
        this.candidate = null;
        this.candidateElement = null;
        this.started = false;
        this.geometry = [];
        this.previewPosition.set(null);
        this.previewWidth.set(null);
        this.runtimeIndicator.set(null);

        this.detachWindow();
        this.detachScroll();
        this.stopEdgeScroll();
    }

    /** Whether the click now arriving is the tail of a drag, and should not touch the selection. */
    shouldSwallowClick(): boolean {
        if (!this.clickFromDrag) return false;

        this.clickFromDrag = false;

        return true;
    }

    /** Whether this card responds to the pointer at all. */
    private draggable(item: T): boolean {
        if (this.state.inert()) return false;
        if (!this.state.features().dragDrop || !this.state.dragEnabled()) return false;
        if (item.draggable === false || item.disabled === true) return false;

        const access = this.state.access();
        if (access?.canDrag === false) return false;

        const columnValue = this.state.columnOf(item);
        if (columnValue != null && access?.columnAccess?.[columnValue]?.canMoveOut === false) return false;

        return true;
    }

    // ---------------------------------------------------------------------------------------------
    // Geometry
    // ---------------------------------------------------------------------------------------------

    /**
     * Measures every drop cell and every card in it, once.
     *
     * The cells are found through the public data attributes and not through Angular queries, because
     * a swimlane layout is authored by the application: the runtime does not know which template put
     * a cell where, only that a cell carries `data-column-id` and, when grouped, `data-swimlane-id`.
     */
    private snapshot(): void {
        const host = this.host;
        if (!host) return;

        const bodies = Array.from(host.querySelectorAll<HTMLElement>('[data-part="column-content"], .p-taskboard-swimlane-cell'));
        this.geometry = [];

        for (const element of bodies) {
            const owner = element.closest<HTMLElement>('[data-column-id]');
            const columnValue = owner?.dataset['columnId'];
            if (columnValue == null) continue;

            const column = this.state.columns().find((entry) => String(entry.id) === columnValue);
            if (!column) continue;

            const swimlaneRaw = element.closest<HTMLElement>('[data-swimlane-id]')?.dataset['swimlaneId'];
            const swimlane = swimlaneRaw == null ? undefined : this.state.swimlanes().find((entry) => String(entry.id) === swimlaneRaw);
            if (this.state.grouped() && !swimlane) continue;

            // The typed key is stored, not data-task-id. The DOM only knows strings, so a numeric id
            // of 7 comes back as "7" and never matches the n:7 the state holds. The filter removed
            // nothing, the travelling card kept counting towards the midpoint, and the resolved index
            // came out one position below the line the user was looking at.
            const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-part="card"][data-taskboard-id-key]'))
                .filter((card) => card.closest('[data-part="column-content"], .p-taskboard-swimlane-cell') === element)
                .map((card, index) => ({ key: card.dataset['taskboardIdKey'] as string, rect: card.getBoundingClientRect(), index }));

            this.geometry.push({ columnValue: column.id, swimlaneValue: swimlane?.id, element, rect: element.getBoundingClientRect(), cards });
        }

        this.attachScroll();
    }

    private attachScroll(): void {
        this.detachScroll();

        const host = this.host;
        if (!host) return;

        const refresh = () => this.refreshGeometry();
        const targets: EventTarget[] = [host, ...Array.from(host.querySelectorAll('.p-taskboard-columns, .p-taskboard-column-body, .p-taskboard-swimlane-grid'))];

        for (const element of targets) {
            element.addEventListener('scroll', refresh, { passive: true });
            this.scrollListeners.push({ element, handler: refresh });
        }
    }

    private detachScroll(): void {
        for (const { element, handler } of this.scrollListeners) element.removeEventListener('scroll', handler);
        this.scrollListeners = [];
    }

    /** Re-measures in place, keeping the cell list, after the board or a column has scrolled. */
    private refreshGeometry(): void {
        for (const cell of this.geometry) {
            cell.rect = cell.element.getBoundingClientRect();
            for (const card of cell.cards) {
                const element = cell.element.querySelector<HTMLElement>(`[data-taskboard-id-key="${cssEscape(card.key)}"]`);
                if (element) card.rect = element.getBoundingClientRect();
            }
        }

        if (this.edgePointer) this.resolveTarget(this.edgePointer.x, this.edgePointer.y);
    }

    // ---------------------------------------------------------------------------------------------
    // Hit testing
    // ---------------------------------------------------------------------------------------------

    /**
     * Turns a pointer position into a cell and an insertion index.
     *
     * The index is decided by the MIDPOINT of each card: above it the pointer means "before this
     * card", below it "after". Comparing against the card's edges instead leaves a dead band between
     * two cards where the marker does not move, which reads as the board ignoring the pointer.
     */
    private resolveTarget(x: number, y: number): void {
        const cell = this.cellAt(x, y);

        if (!cell) {
            this.state.setDropTarget(null);
            this.runtimeIndicator.set(null);

            return;
        }

        const travelling = new Set(this.state.draggingIds().map(taskBoardIdKey));
        const cards = cell.cards.filter((card) => !travelling.has(card.key));

        let index = cards.length;
        for (let position = 0; position < cards.length; position += 1) {
            const rect = cards[position].rect;
            if (y < rect.top + rect.height / 2) {
                index = position;
                break;
            }
        }

        this.state.setDropTarget({ columnValue: cell.columnValue, swimlaneValue: cell.swimlaneValue, index });
        this.placeIndicator(cell, cards, index);
    }

    /** The cell under the pointer, preferring a hit inside one over the nearest one. */
    private cellAt(x: number, y: number): CellGeometry | undefined {
        const inside = this.geometry.find((cell) => x >= cell.rect.left && x <= cell.rect.right && y >= cell.rect.top && y <= cell.rect.bottom);
        if (inside) return this.droppable(inside) ? inside : undefined;

        // Outside every cell the column is found by its horizontal band: dragging below a column's
        // last gap still means "at the end of this column".
        const column = this.geometry.filter((cell) => x >= cell.rect.left && x <= cell.rect.right);
        if (column.length === 0) return undefined;

        const nearest = column.reduce((best, cell) => (Math.abs(y - centreOf(cell.rect)) < Math.abs(y - centreOf(best.rect)) ? cell : best));

        return this.droppable(nearest) ? nearest : undefined;
    }

    /** Whether a cell accepts a drop at all: a collapsed column and a closed row do not. */
    private droppable(cell: CellGeometry): boolean {
        if (this.state.isColumnCollapsed(cell.columnValue)) return false;
        if (cell.swimlaneValue != null && this.state.isSwimlaneCollapsed(cell.swimlaneValue)) return false;

        return true;
    }

    // ---------------------------------------------------------------------------------------------
    // Insertion marker
    // ---------------------------------------------------------------------------------------------

    /**
     * Positions the runtime line, for a cell that authored no marker of its own.
     *
     * An authored `<p-taskboard-drop-indicator>` reveals itself by comparing its own index against
     * the published target, so nothing has to be written into the DOM here — only the fallback line
     * needs coordinates, and only when the cell has no marker to reveal.
     */
    private placeIndicator(cell: CellGeometry, cards: { key: string; rect: DOMRect; index: number }[], index: number): void {
        if (cell.element.querySelector('[data-drop-index]')) {
            this.runtimeIndicator.set(null);
            return;
        }

        const before = cards[index]?.rect;
        const after = cards[index - 1]?.rect;
        const top = before ? before.top : after ? after.bottom : cell.rect.top + 8;

        this.runtimeIndicator.set({ top, left: cell.rect.left + 4, width: Math.max(0, cell.rect.width - 8) });
    }

    // ---------------------------------------------------------------------------------------------
    // Edge auto-scroll
    // ---------------------------------------------------------------------------------------------

    /**
     * Scrolls the board while the pointer sits near an edge.
     *
     * Clamped to the real bounds rather than left running: a drag parked at the right edge of the
     * last column would otherwise keep asking for a scroll that cannot happen, and the geometry
     * refresh it triggers on every frame is wasted work.
     */
    private startEdgeScroll(): void {
        if (this.edgeFrame != null) return;

        const step = (): void => {
            this.edgeFrame = null;

            const pointer = this.edgePointer;
            // `started` belongs to the card gesture; a column reorder has its own flag, and without
            // checking it the first frame returned and never rescheduled: dragging a header to the
            // edge did not scroll the board, so an off-screen column could not be reached.
            if (!pointer || (!this.started && !this.columnStarted)) return;

            const horizontal = this.host?.querySelector<HTMLElement>('.p-taskboard-columns, .p-taskboard-swimlane-grid');
            let scrolled = false;

            if (horizontal) {
                const rect = horizontal.getBoundingClientRect();
                const max = horizontal.scrollWidth - horizontal.clientWidth;

                if (pointer.x < rect.left + EDGE_ZONE && horizontal.scrollLeft > 0) {
                    horizontal.scrollLeft = Math.max(0, horizontal.scrollLeft - EDGE_SPEED);
                    scrolled = true;
                } else if (pointer.x > rect.right - EDGE_ZONE && horizontal.scrollLeft < max) {
                    horizontal.scrollLeft = Math.min(max, horizontal.scrollLeft + EDGE_SPEED);
                    scrolled = true;
                }
            }

            const cell = this.cellAt(pointer.x, pointer.y);

            if (cell) {
                const max = cell.element.scrollHeight - cell.element.clientHeight;

                if (pointer.y < cell.rect.top + EDGE_ZONE && cell.element.scrollTop > 0) {
                    cell.element.scrollTop = Math.max(0, cell.element.scrollTop - EDGE_SPEED);
                    scrolled = true;
                } else if (pointer.y > cell.rect.bottom - EDGE_ZONE && cell.element.scrollTop < max) {
                    cell.element.scrollTop = Math.min(max, cell.element.scrollTop + EDGE_SPEED);
                    scrolled = true;
                }
            }

            if (scrolled) this.refreshGeometry();

            this.edgeFrame = requestAnimationFrame(step);
        };

        this.edgeFrame = requestAnimationFrame(step);
    }

    private stopEdgeScroll(): void {
        if (this.edgeFrame != null) cancelAnimationFrame(this.edgeFrame);

        this.edgeFrame = null;
        this.edgePointer = null;
    }

    // ---------------------------------------------------------------------------------------------
    // Column reorder
    // ---------------------------------------------------------------------------------------------

    /** Records a press on a column header without committing to a reorder. */
    onColumnPointerDown(event: PointerEvent, id: string | number, element: HTMLElement): void {
        if (!this.columnReorderable(id)) return;
        if (event.button !== 0 && event.pointerType === 'mouse') return;

        const columns = this.state.columns();
        const index = columns.findIndex((column) => column.id === id);
        if (index < 0) return;

        this.pointerId = event.pointerId;
        this.origin = { x: event.clientX, y: event.clientY };
        this.columnCandidate = { id, index, element };
        this.columnStarted = false;
        this.state.pressing.set(true);

        this.attachWindow();
    }

    private moveColumn(event: PointerEvent): void {
        const candidate = this.columnCandidate;
        if (!candidate || !this.origin) return;

        if (!this.columnStarted) {
            if (Math.abs(event.clientX - this.origin.x) < this.state.dragMinDistance()) return;

            this.columnStarted = true;
            this.state.beginColumnDrag(candidate.id);
            this.document?.getSelection()?.removeAllRanges();
            this.measureColumns();
        }

        candidate.element.classList.add('p-taskboard-column-dragging');
        this.edgePointer = { x: event.clientX, y: event.clientY };
        this.startEdgeScroll();
    }

    private releaseColumn(cancelled = false): void {
        const candidate = this.columnCandidate;
        const started = this.columnStarted;
        const pointer = this.edgePointer;

        candidate?.element.classList.remove('p-taskboard-column-dragging');
        this.state.endColumnDrag();

        this.columnCandidate = null;
        this.columnStarted = false;
        this.columnRects = [];
        this.pointerId = null;
        this.origin = null;
        this.state.pressing.set(false);

        this.detachWindow();
        this.stopEdgeScroll();

        if (cancelled || !started || !candidate || !pointer) return;

        // The rects are read from the DOM again rather than from the snapshot: if auto-scroll moved
        // the track during the drag, the target index is the one in the on-screen order now.
        this.measureColumns();

        const target = this.columnRects.find((entry) => pointer.x >= entry.rect.left && pointer.x <= entry.rect.right);
        if (!target || target.index === candidate.index) return;

        this.state.reorderColumns(candidate.index, target.index);
    }

    private measureColumns(): void {
        const host = this.host;
        if (!host) return;

        const columns = this.state.columns();

        this.columnRects = Array.from(host.querySelectorAll<HTMLElement>('[data-part="column"][data-column-id]'))
            .map((element) => {
                const raw = element.dataset['columnId'];
                const index = columns.findIndex((column) => String(column.id) === raw);

                return index < 0 ? null : { id: columns[index].id, index, element, rect: element.getBoundingClientRect() };
            })
            .filter((entry): entry is { id: string | number; index: number; element: HTMLElement; rect: DOMRect } => entry !== null);
    }

    /** Whether this column can be picked up. */
    private columnReorderable(id: string | number): boolean {
        if (this.state.inert()) return false;
        if (!this.state.columnReorderEnabled()) return false;
        if (this.state.access()?.canReorderColumns === false) return false;

        return this.state.columnById(id)?.locked !== true;
    }

    // ---------------------------------------------------------------------------------------------
    // Window listeners
    // ---------------------------------------------------------------------------------------------

    private windowAttached = false;

    private attachWindow(): void {
        if (this.windowAttached || !this.document) return;

        this.windowAttached = true;
        this.document.addEventListener('pointermove', this.onPointerMove);
        this.document.addEventListener('pointerup', this.onPointerUp);
        this.document.addEventListener('pointercancel', this.onPointerUp);
        this.document.addEventListener('keydown', this.onKeyDown);
        this.document.addEventListener('selectstart', this.onSelectStart);
    }

    private detachWindow(): void {
        if (!this.windowAttached || !this.document) return;

        this.windowAttached = false;
        this.document.removeEventListener('pointermove', this.onPointerMove);
        this.document.removeEventListener('pointerup', this.onPointerUp);
        this.document.removeEventListener('pointercancel', this.onPointerUp);
        this.document.removeEventListener('keydown', this.onKeyDown);
        this.document.removeEventListener('selectstart', this.onSelectStart);
    }
}

/** Vertical centre of a rect. */
function centreOf(rect: DOMRect): number {
    return rect.top + rect.height / 2;
}

/** `CSS.escape` where it exists, and a conservative fallback where it does not. */
function cssEscape(value: string): string {
    const api = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape : undefined;
    return api ? api(value) : value.replace(/["\\]/g, '\\$&');
}

/**
 * Token the card and column-header parts read their board's pointer sensor through.
 *
 * @group Types
 */
export const TASKBOARD_DRAG = new InjectionToken<TaskBoardDrag>('TASKBOARD_DRAG');
