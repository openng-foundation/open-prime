import type { SchedulerDragPayload, SchedulerDropInfo, SchedulerEvent, SchedulerResizeEdge, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { MINUTE_MS, startOfDay, toDate } from './scheduler-date';

/**
 * Moving and resizing events with the pointer.
 *
 * The hard part of a drag is not the pointer maths, it is knowing WHERE the pointer is in calendar
 * terms — and that answer is different in every view: a vertical slot in the week grid, a whole day
 * in the month, a horizontal column on a timeline whose axis skips the nights. Instead of teaching
 * this module the geometry of four renderers, every cell already publishes the interval it
 * represents as `data-start-date`/`data-end-date`, so the target is read out of the DOM under the
 * pointer. A new view gets drag support for free by labelling its cells.
 *
 * The Scheduler never mutates the bound array. A finished drag becomes a *pending change* — an
 * override applied on top of the input until the application either persists it (the bound event
 * starts matching what was asked for) or rejects it (`revert()`). That is what makes the interaction
 * feel immediate without taking ownership of the data.
 *
 * @module scheduler-drag
 */

/** What the pointer is over, in calendar terms. */
export interface SchedulerDragTarget {
    /** First instant of the cell under the pointer. */
    start: Date;
    /** First instant after it. */
    end: Date;
    /** Whether the cell belongs to an all-day surface. */
    allDay: boolean;
    /** Whether the cell is a whole day with no sub-cell precision (month grid, all-day strip). */
    whole: boolean;
    /** Resource of the lane the cell belongs to, when the view has lanes. */
    resourceId?: string | number;
    /** The instant the pointer itself is at, interpolated inside the cell. */
    instant: Date;
}

/** A change the Scheduler is holding on top of the bound data. */
export interface SchedulerPendingChange {
    /** Where the event was before the interaction, used to tell "persisted" from "still pending". */
    from: { start: number; end: number; resourceId?: string | number; allDay?: boolean };
    /** Where the interaction left it. */
    to: { start: Date; end: Date; resourceId?: string | number; allDay?: boolean };
}

/** What the controller needs from the Scheduler to do its job. */
export interface SchedulerDragDeps {
    /** Active view, for the payloads and for `eventAllow`. */
    view: () => SchedulerViewType;
    /** Whether moving is allowed at all. */
    startEditable: (event: SchedulerEvent) => boolean;
    /** Whether resizing is allowed at all. */
    durationEditable: (event: SchedulerEvent) => boolean;
    /** Minutes every proposal is rounded to. */
    snapMinutes: (target: SchedulerDragTarget) => number;
    /** Shortest duration a resize may leave. */
    minEventMinutes: () => number;
    /** Duration given to an event with no `end`. */
    defaultEventDuration: () => number;
    /** How far the pointer must travel before a press becomes a drag. */
    minDistance: () => number;
    /** Application veto on a proposal. */
    allow: (info: SchedulerDropInfo) => boolean;
    /** Shows the live proposal. */
    preview: (eventId: string | number | null, change: SchedulerPendingChange | null, kind: 'move' | 'resize') => void;
    /** Accepts the proposal as a pending change. */
    commit: (eventId: string | number, change: SchedulerPendingChange) => void;
    /** Drops a pending change, which is what `revert()` calls. */
    rollback: (eventId: string | number) => void;
    /** Reports a finished move. */
    emitDrop: (payload: SchedulerDragPayload) => void;
    /** Reports the start of a resize. */
    emitResizeStart: (payload: SchedulerDragPayload) => void;
    /** Reports a resize in progress. */
    emitResize: (payload: SchedulerDragPayload) => void;
    /** Reports a finished resize. */
    emitResizeStop: (payload: SchedulerDragPayload) => void;
    /** Reports the start of a move. */
    emitDragStart: (payload: SchedulerDragPayload) => void;
}

/**
 * The interval a cell represents, read off its data attributes.
 *
 * `null` for anything that is not a labelled cell, which is what makes dragging over the header, the
 * gutter or outside the Scheduler a no-op instead of a wrong answer.
 */
export function readCellTarget(element: Element | null): SchedulerDragTarget | null {
    const cell = element?.closest<HTMLElement>('[data-start-date][data-end-date]');
    if (!cell) return null;

    const start = Number(cell.dataset['startDate']);
    const end = Number(cell.dataset['endDate']);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

    const slot = cell.dataset['slot'] ?? '';
    const allDay = slot === 'scheduler-all-day-cell';
    // A month cell or an all-day lane is a WHOLE day: interpolating inside one would invent a time
    // out of where the mouse happens to sit within a 6rem box.
    const whole = allDay || slot === 'scheduler-month-cell';
    const lane = cell.closest<HTMLElement>('[data-resource-id]');
    const rawResourceId = lane?.dataset['resourceId'] || undefined;

    return {
        start: new Date(start),
        end: new Date(end),
        allDay,
        whole,
        // A data attribute is always text and `SchedulerResource.id` can be a number: without
        // converting it back, dragging onto resource 3's column proposed resource "3" and matched
        // nothing in the collection.
        resourceId: rawResourceId != null && rawResourceId !== '' && String(Number(rawResourceId)) === rawResourceId ? Number(rawResourceId) : rawResourceId,
        instant: new Date(start)
    };
}

/**
 * Where inside its cell the pointer is, as an instant.
 *
 * The axis comes from the cell's own geometry rather than from the view: a cell wider than it is
 * tall is a timeline column, and time runs along it. Cells that stand for a whole day are not
 * interpolated at all.
 */
function instantAt(hit: CellHit, clientX: number, clientY: number, rtl: boolean): Date {
    const { target, box } = hit;
    if (target.whole) return target.start;

    const horizontal = box.width > box.height;
    const along = horizontal ? (rtl ? box.right - clientX : clientX - box.left) / box.width : (clientY - box.top) / box.height;
    const fraction = Math.min(Math.max(along, 0), 1);
    const span = target.end.getTime() - target.start.getTime();

    return new Date(target.start.getTime() + fraction * span);
}

/** Rounds an instant to a multiple of `minutes`, counted from the start of its day. */
export function snapInstant(date: Date, minutes: number): Date {
    if (!Number.isFinite(minutes) || minutes <= 0) return date;

    const dayStart = startOfDay(date).getTime();
    const step = minutes * MINUTE_MS;
    return new Date(dayStart + Math.round((date.getTime() - dayStart) / step) * step);
}

/** A cell the pointer is over, with its measured box so the next move can skip the hit test. */
interface CellHit {
    target: SchedulerDragTarget;
    element: HTMLElement;
    box: DOMRect;
}

/** Reads the deepest labelled cell under a point, ignoring the surface being dragged. */
function cellUnder(clientX: number, clientY: number): CellHit | null {
    // elementsFromPoint and not elementFromPoint: the event being dragged sits right under the
    // pointer and would always be the answer.
    const stack = typeof document === 'undefined' ? [] : document.elementsFromPoint(clientX, clientY);
    for (const element of stack) {
        const cell = element.closest<HTMLElement>('[data-start-date][data-end-date]');
        if (!cell) continue;
        const target = readCellTarget(cell);
        if (target) return { target, element: cell, box: cell.getBoundingClientRect() };
    }
    return null;
}

/**
 * Whether there is a browser to interact with.
 *
 * Nothing in here can run server-side — there is no pointer — but `teardown` is reached anyway,
 * because prerendering renders the component and then destroys it. Removing a listener that was
 * never added has to be a no-op rather than a `ReferenceError`.
 */
function hasBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** Whether a point is inside a box. */
function inside(box: DOMRect, clientX: number, clientY: number): boolean {
    return clientX >= box.left && clientX < box.right && clientY >= box.top && clientY < box.bottom;
}

/** One interaction in flight. */
interface DragSession {
    /** Whether the pointer is moving the event or pulling one of its edges. */
    kind: 'move' | 'resize';
    /** The edge being pulled, for a resize. */
    edge?: SchedulerResizeEdge;
    /** The event being interacted with. */
    event: SchedulerEvent;
    /** Where it started, so a pending change can tell "persisted" from "still pending". */
    baseStart: number;
    /** Where it ended. */
    baseEnd: number;
    /** The resource it was in. */
    baseResourceId?: string | number;
    /** Whether it was an all-day event. */
    baseAllDay: boolean;
    /** How far into the event the pointer grabbed it. */
    grabOffset: number;
    /** Where the press happened, for the distance threshold. */
    originX: number;
    /** @see originX */
    originY: number;
    /** Whether the threshold has been crossed and this is a real drag. */
    started: boolean;
    /** The last accepted proposal. */
    last?: SchedulerPendingChange['to'];
    /** Reading direction, read once: it cannot change mid-drag and `getComputedStyle` is not free. */
    rtl: boolean;
    /** The cell the pointer was last over, reused while the pointer stays inside its box. */
    hit: CellHit | null;
}

/**
 * Drives one move or resize at a time.
 *
 * Lives for the life of the Scheduler and holds no state between interactions beyond the listeners
 * it attaches while one is running.
 */
export class SchedulerDragController {
    constructor(private readonly deps: SchedulerDragDeps) {}

    private session: DragSession | null = null;

    /** Whether an interaction is running. */
    get active(): boolean {
        return this.session?.started === true;
    }

    private suppressNextClick = false;

    /**
     * Whether the click about to arrive is the tail of a drag, clearing the flag as it answers.
     *
     * A pointerup that ends a drag is followed by a click on the same element, and treating it as a
     * click would select the event the user just moved.
     */
    consumeClickSuppression(): boolean {
        const suppress = this.suppressNextClick;
        this.suppressNextClick = false;
        return suppress;
    }

    /** Begins a move. Does nothing when the event is not start-editable. */
    startMove(originalEvent: PointerEvent, event: SchedulerEvent): void {
        if (originalEvent.button !== 0 || !this.deps.startEditable(event)) return;
        this.begin(originalEvent, event, 'move');
    }

    /**
     * Moves or resizes an event by a fixed amount, with no pointer involved.
     *
     * This is the keyboard path, and it goes through exactly the same validation and the same
     * pending-change commit as a drag: a schedule you can only edit with a mouse is a schedule some
     * users cannot edit, and giving the keyboard its own shortcut pipeline is how the two drift
     * apart.
     */
    nudge(originalEvent: KeyboardEvent, event: SchedulerEvent, kind: 'move' | 'resize', minutes: number): boolean {
        if (kind === 'move' ? !this.deps.startEditable(event) : !this.deps.durationEditable(event)) return false;

        const baseStart = toDate(event.start);
        const rawEnd = event.end != null ? toDate(event.end) : null;
        const baseEnd = rawEnd && rawEnd > baseStart ? rawEnd : new Date(baseStart.getTime() + this.deps.defaultEventDuration() * MINUTE_MS);
        const shift = minutes * MINUTE_MS;

        const start = kind === 'move' ? new Date(baseStart.getTime() + shift) : baseStart;
        const min = this.deps.minEventMinutes() * MINUTE_MS;
        const end = kind === 'move' ? new Date(baseEnd.getTime() + shift) : new Date(Math.max(baseEnd.getTime() + shift, start.getTime() + min));

        const to = { start, end, resourceId: event.resourceId, allDay: !!event.allDay };
        if (!this.deps.allow({ event, start, end, allDay: to.allDay, resourceId: to.resourceId, view: this.deps.view() })) return false;

        const change: SchedulerPendingChange = {
            from: { start: baseStart.getTime(), end: baseEnd.getTime(), resourceId: event.resourceId, allDay: !!event.allDay },
            to
        };
        this.deps.commit(event.id, change);

        const payload: SchedulerDragPayload = {
            originalEvent,
            event,
            start,
            end,
            allDay: to.allDay,
            resourceId: to.resourceId,
            edge: kind === 'resize' ? 'end' : undefined,
            revert: () => this.deps.rollback(event.id)
        };
        kind === 'move' ? this.deps.emitDrop(payload) : this.deps.emitResizeStop(payload);
        return true;
    }

    /** Begins a resize of one edge. */
    startResize(originalEvent: PointerEvent, event: SchedulerEvent, edge: SchedulerResizeEdge): void {
        if (originalEvent.button !== 0 || !this.deps.durationEditable(event)) return;
        // A resize handle lives INSIDE the event's surface: without stopping propagation, the same
        // pointerdown would start a move as well.
        originalEvent.stopPropagation();
        this.begin(originalEvent, event, 'resize', edge);
    }

    private begin(originalEvent: PointerEvent, event: SchedulerEvent, kind: 'move' | 'resize', edge?: SchedulerResizeEdge): void {
        const start = toDate(event.start);
        const rawEnd = event.end != null ? toDate(event.end) : null;
        const end = rawEnd && rawEnd > start ? rawEnd : new Date(start.getTime() + this.deps.defaultEventDuration() * MINUTE_MS);
        const under = cellUnder(originalEvent.clientX, originalEvent.clientY);

        this.session = {
            kind,
            edge,
            event,
            baseStart: start.getTime(),
            baseEnd: end.getTime(),
            baseResourceId: event.resourceId,
            baseAllDay: !!event.allDay,
            // Grabbed where it was pressed, not by its start: dragging a two-hour appointment from
            // the middle must not teleport its start under the pointer.
            grabOffset: under ? instantAt(under, originalEvent.clientX, originalEvent.clientY, this.isRtl(under.element)).getTime() - start.getTime() : 0,
            originX: originalEvent.clientX,
            originY: originalEvent.clientY,
            started: false,
            rtl: under ? this.isRtl(under.element) : false,
            hit: under
        };

        if (!hasBrowser()) return;
        window.addEventListener('pointermove', this.onPointerMove, true);
        window.addEventListener('pointerup', this.onPointerUp, true);
        window.addEventListener('pointercancel', this.onPointerCancel, true);
    }

    private isRtl(element: HTMLElement): boolean {
        return getComputedStyle(element).direction === 'rtl';
    }

    private frame = 0;
    private queued: PointerEvent | null = null;

    /**
     * Queues the move for the next frame.
     *
     * `pointermove` fires faster than the screen repaints — a 120Hz pointer can deliver two or three
     * events per frame, and each one used to run a hit test, a layout read and a re-render of the
     * grid. Coalescing to one per animation frame is what makes the drag follow the pointer instead
     * of stuttering behind it.
     */
    private readonly onPointerMove = (originalEvent: PointerEvent): void => {
        if (!this.session) return;
        this.queued = originalEvent;
        if (this.frame || !hasBrowser()) return;
        this.frame = requestAnimationFrame(() => {
            this.frame = 0;
            const queued = this.queued;
            this.queued = null;
            if (queued) this.handleMove(queued);
        });
    };

    private handleMove(originalEvent: PointerEvent): void {
        const session = this.session;
        if (!session) return;

        if (!session.started) {
            const travelled = Math.hypot(originalEvent.clientX - session.originX, originalEvent.clientY - session.originY);
            if (travelled < this.deps.minDistance()) return;
            session.started = true;
            // A selection already under way stays alive and the browser would drag it along with
            // the pointer: it is cleared at the threshold, which is when this becomes a drag.
            document.getSelection?.()?.removeAllRanges();
            const payload = this.payload(originalEvent, { start: new Date(session.baseStart), end: new Date(session.baseEnd), resourceId: session.baseResourceId, allDay: session.baseAllDay }, session);
            session.kind === 'move' ? this.deps.emitDragStart(payload) : this.deps.emitResizeStart(payload);
        }

        const proposal = this.propose(originalEvent);
        if (!proposal) return;

        session.last = proposal;
        this.deps.preview(session.event.id, { from: this.baseOf(session), to: proposal }, session.kind);
        if (session.kind === 'resize') this.deps.emitResize(this.payload(originalEvent, proposal, session));
    }

    /** Where the event was when the interaction started. */
    private baseOf(session: DragSession): SchedulerPendingChange['from'] {
        return { start: session.baseStart, end: session.baseEnd, resourceId: session.baseResourceId, allDay: session.baseAllDay };
    }

    /** The range the current pointer position would produce, or `null` when it is not a legal target. */
    private propose(originalEvent: PointerEvent): SchedulerPendingChange['to'] | null {
        const session = this.session;
        if (!session) return null;

        // The hit test only runs again when the pointer LEAVES the cell already measured: testing a
        // point against a rectangle is free, and elementsFromPoint plus a getBoundingClientRect per
        // move is not.
        const under = session.hit && inside(session.hit.box, originalEvent.clientX, originalEvent.clientY) ? session.hit : cellUnder(originalEvent.clientX, originalEvent.clientY);
        if (!under) return null;
        session.hit = under;

        const pointerInstant = instantAt(under, originalEvent.clientX, originalEvent.clientY, session.rtl);
        const snap = this.deps.snapMinutes(under.target);
        const duration = session.baseEnd - session.baseStart;

        let start: Date;
        let end: Date;

        if (session.kind === 'move') {
            if (under.target.whole) {
                // On a whole-day cell the DAY changes and the time is kept: that is what dragging
                // an appointment across the month grid means.
                const base = new Date(session.baseStart);
                start = new Date(under.target.start.getFullYear(), under.target.start.getMonth(), under.target.start.getDate(), base.getHours(), base.getMinutes(), base.getSeconds());
            } else {
                start = snapInstant(new Date(pointerInstant.getTime() - session.grabOffset), snap);
            }
            end = new Date(start.getTime() + duration);
        } else {
            const min = this.deps.minEventMinutes() * MINUTE_MS;
            if (session.edge === 'start') {
                start = snapInstant(pointerInstant, snap);
                end = new Date(session.baseEnd);
                if (end.getTime() - start.getTime() < min) start = new Date(end.getTime() - min);
            } else {
                start = new Date(session.baseStart);
                end = snapInstant(under.target.whole ? under.target.end : pointerInstant, snap);
                if (end.getTime() - start.getTime() < min) end = new Date(start.getTime() + min);
            }
        }

        const resourceId = session.kind === 'move' ? (under.target.resourceId ?? session.baseResourceId) : session.baseResourceId;
        const allDay = session.kind === 'move' ? under.target.allDay : session.baseAllDay;
        const proposal = { start, end, resourceId, allDay };

        return this.deps.allow({ event: session.event, start, end, allDay, resourceId, view: this.deps.view() }) ? proposal : null;
    }

    private readonly onPointerUp = (originalEvent: PointerEvent): void => {
        const session = this.session;
        this.teardown();
        if (!session) return;

        // Below the threshold there was no drag: the click runs its course and selects.
        if (!session.started || !session.last) {
            this.deps.preview(null, null, session.kind);
            return;
        }

        const change: SchedulerPendingChange = { from: this.baseOf(session), to: session.last };

        this.suppressNextClick = true;
        this.deps.preview(null, null, session.kind);
        this.deps.commit(session.event.id, change);

        const payload = this.payload(originalEvent, session.last, session);
        session.kind === 'move' ? this.deps.emitDrop(payload) : this.deps.emitResizeStop(payload);
    };

    private readonly onPointerCancel = (): void => {
        const session = this.session;
        this.teardown();
        if (session) this.deps.preview(null, null, session.kind);
    };

    /**
     * Builds an output payload.
     *
     * The session comes in as an argument and is not read off the field: `onPointerUp` tears the
     * session down before it emits —the listeners have to go even if a handler throws— and reading
     * `this.session` there was reading `null`.
     */
    private payload(originalEvent: PointerEvent, to: SchedulerPendingChange['to'], session: DragSession): SchedulerDragPayload {
        const id = session.event.id;
        return {
            originalEvent,
            event: session.event,
            start: to.start,
            end: to.end,
            allDay: !!to.allDay,
            resourceId: to.resourceId,
            edge: session.edge,
            revert: () => this.deps.rollback(id)
        };
    }

    private teardown(): void {
        this.session = null;
        this.queued = null;
        if (!hasBrowser()) return;

        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = 0;
        window.removeEventListener('pointermove', this.onPointerMove, true);
        window.removeEventListener('pointerup', this.onPointerUp, true);
        window.removeEventListener('pointercancel', this.onPointerCancel, true);
    }

    /** Drops any listener still attached, for when the Scheduler goes away mid-drag. */
    destroy(): void {
        this.teardown();
    }
}

/**
 * Applies the pending changes on top of the bound collection.
 *
 * A change is applied only while the bound event still looks the way it did when the interaction
 * started. The moment the application persists it — or changes that event for any other reason — the
 * override stops being applied, so the data always wins in the end and there is no state to
 * invalidate by hand.
 */
export function applyPendingChanges<T extends SchedulerEvent>(events: readonly T[], pending: ReadonlyMap<string | number, SchedulerPendingChange>): T[] {
    if (!pending.size) return events as T[];

    return events.map((event) => {
        const change = pending.get(event.id);
        if (!change) return event;

        const start = toDate(event.start).getTime();
        const end = event.end != null ? toDate(event.end).getTime() : change.from.end;
        if (start !== change.from.start || end !== change.from.end || (event.resourceId ?? undefined) !== change.from.resourceId) return event;

        return { ...event, start: change.to.start, end: change.to.end, resourceId: change.to.resourceId, allDay: change.to.allDay ?? event.allDay };
    });
}
