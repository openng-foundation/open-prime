import type { SchedulerEvent, SchedulerLayoutItem } from '@openng/optimus-ui/types/scheduler';
import { MINUTE_MS, daysBetween, type SchedulerRange, toDate } from './scheduler-date';

/**
 * Event placement for the Scheduler. Pure functions over plain data: no DOM, no Angular, so the
 * awkward parts (overlap columns, row packing, clipping at the range edges) are unit-testable.
 *
 * Coordinates come out as fractions of the container (0..1) rather than pixels, which is what lets
 * the same result drive a vertical time grid and a horizontal timeline.
 *
 * @module scheduler-layout
 */

/**
 * An event with its instants resolved once, so the sort and the sweep don't re-parse.
 */
interface Bounded<T> {
    event: T;
    start: number;
    end: number;
}

function bound<T extends SchedulerEvent>(events: T[], defaultDurationMinutes: number): Bounded<T>[] {
    return events
        .map((event) => {
            const start = toDate(event.start).getTime();
            const rawEnd = event.end != null ? toDate(event.end).getTime() : NaN;
            // An event with no end, or with an end before its start, cannot vanish from the
            // calendar: it gets the default duration instead of a zero or negative size.
            const end = Number.isFinite(rawEnd) && rawEnd > start ? rawEnd : start + defaultDurationMinutes * MINUTE_MS;
            return { event, start, end };
        })
        .sort((a, b) => a.start - b.start || b.end - a.end);
}

/**
 * Options for {@link layoutTimeGrid}.
 */
export interface TimeGridLayoutOptions {
    /** The visible range the fractions are relative to. */
    range: SchedulerRange;
    /** Duration given to events without an `end`. */
    defaultEventDuration?: number;
    /**
     * Shortest slice an event is allowed to occupy, in minutes. Without it a one-minute appointment
     * renders as an unreadable hairline — real clocking data is full of them.
     */
    minEventMinutes?: number;
}

/**
 * Places events on a time axis, splitting overlapping ones into side-by-side columns.
 *
 * The columns come from a sweep over the events sorted by start: a *cluster* is a maximal run of
 * events connected by overlap, and every member of a cluster is given the same column count so
 * their widths line up. This is the behaviour people expect from a calendar — two overlapping
 * appointments each take half the width, and a third that only overlaps one of them still splits
 * the cluster three ways rather than jumping the grid.
 */
export function layoutTimeGrid<T extends SchedulerEvent>(events: T[], options: TimeGridLayoutOptions): SchedulerLayoutItem<T>[] {
    const { range, defaultEventDuration = 30, minEventMinutes = 15 } = options;
    const from = range.start.getTime();
    const to = range.end.getTime();
    const span = to - from;
    if (span <= 0) return [];

    const bounded = bound(events, defaultEventDuration).filter((b) => b.start < to && b.end > from);
    const items: SchedulerLayoutItem<T>[] = [];

    // Sweep: `columnEnds[i]` is when column i frees up. A cluster ends when every column is free,
    // and only then can the column count be assigned — it isn't known until the cluster is closed.
    let columnEnds: number[] = [];
    let clusterStart = 0;

    // A cluster's width is its PEAK concurrency (how many columns it ever needed), not how many
    // events it holds: in an a-b-c chain where a and c do not overlap, c reuses a's column and all
    // three are drawn at half width instead of a third.
    const closeCluster = () => {
        const width = columnEnds.length || 1;
        for (let i = clusterStart; i < items.length; i++) {
            items[i].columns = width;
        }
        columnEnds = [];
        clusterStart = items.length;
    };

    for (const b of bounded) {
        if (columnEnds.length && columnEnds.every((end) => end <= b.start)) {
            closeCluster();
        }

        let column = columnEnds.findIndex((end) => end <= b.start);
        if (column === -1) {
            column = columnEnds.length;
        }
        columnEnds[column] = b.end;

        const visibleStart = Math.max(b.start, from);
        const visibleEnd = Math.min(b.end, to);
        const minSize = (minEventMinutes * MINUTE_MS) / span;

        const offset = (visibleStart - from) / span;

        items.push({
            event: b.event,
            offset,
            // The minimum cannot run past the end: a one-minute appointment at 23:59 asked for 15
            // minutes of height and drew outside the grid. What is left of the container is the cap.
            size: Math.min(Math.max((visibleEnd - visibleStart) / span, minSize), 1 - offset),
            column,
            columns: 1,
            row: 0,
            continuesBefore: b.start < from,
            continuesAfter: b.end > to
        });
    }
    closeCluster();

    return items;
}

/**
 * Options for {@link layoutRows}.
 */
export interface RowLayoutOptions {
    /** The visible range the fractions are relative to. */
    range: SchedulerRange;
    /** Duration given to events without an `end`. */
    defaultEventDuration?: number;
    /**
     * How many rows fit. Events that don't fit are left out and reported as overflow, which is what
     * feeds the "+2 more" link.
     */
    maxRows?: number;
}

/**
 * The result of packing events into rows.
 */
export interface RowLayoutResult<T = SchedulerEvent> {
    /** The events that fit, each with its `row`. */
    items: SchedulerLayoutItem<T>[];
    /** How many events did not fit, keyed by the index of the day they were dropped from. */
    overflow: Map<number, T[]>;
}

/**
 * Packs events into horizontal rows, first-fit, for the all-day strip, the month cells and the
 * timelines.
 *
 * A multi-day event has to stay on ONE row across every day it spans or it reads as several
 * different appointments, so a row is only usable if it is free for the event's whole width. That
 * is the difference from {@link layoutTimeGrid}, where overlapping events sit side by side instead.
 */
export function layoutRows<T extends SchedulerEvent>(events: T[], options: RowLayoutOptions): RowLayoutResult<T> {
    const { range, defaultEventDuration = 30, maxRows = Infinity } = options;
    const from = range.start.getTime();
    const to = range.end.getTime();
    const span = to - from;
    const overflow = new Map<number, T[]>();
    if (span <= 0) return { items: [], overflow };

    const bounded = bound(events, defaultEventDuration).filter((b) => b.start < to && b.end > from);
    const items: SchedulerLayoutItem<T>[] = [];

    // `rows[i]` is when row i frees up. First fit keeps the strip compact and, because the events
    // are sorted by start, stable: the same input always lands on the same rows.
    const rows: number[] = [];

    for (const b of bounded) {
        const visibleStart = Math.max(b.start, from);
        const visibleEnd = Math.min(b.end, to);

        let row = rows.findIndex((end) => end <= visibleStart);
        if (row === -1) {
            row = rows.length;
        }

        if (row >= maxRows) {
            // CALENDAR days rather than milliseconds over 86,400,000: the day the clocks change is
            // 23 or 25 hours long, and dividing shifted the index of every later day of the week,
            // hanging the "+N more" off the wrong one.
            const dayIndex = daysBetween(range.start, new Date(visibleStart));
            const bucket = overflow.get(dayIndex) ?? [];
            bucket.push(b.event);
            overflow.set(dayIndex, bucket);
            continue;
        }

        rows[row] = visibleEnd;
        items.push({
            event: b.event,
            offset: (visibleStart - from) / span,
            size: (visibleEnd - visibleStart) / span,
            column: 0,
            columns: 1,
            row,
            continuesBefore: b.start < from,
            continuesAfter: b.end > to
        });
    }

    return { items, overflow };
}

/**
 * Buckets events by the local day they appear on, keyed by {@link dayKey}.
 *
 * An event is listed under EVERY day it touches, not just the one it starts on: a Friday-to-Monday
 * booking has to show up on Saturday and Sunday too.
 */
export function groupByDay<T extends SchedulerEvent>(events: T[], defaultEventDuration = 30): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const b of bound(events, defaultEventDuration)) {
        const start = new Date(b.start);
        const last = new Date(b.end - 1); // -1ms: an event ending at midnight does NOT reach the next day
        for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= last; d.setDate(d.getDate() + 1)) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const bucket = groups.get(key) ?? [];
            bucket.push(b.event);
            groups.set(key, bucket);
        }
    }

    return groups;
}

/**
 * Buckets events by resource. Events whose `resourceId` matches no known resource are collected
 * under the `null` key so a view can decide whether to show them in an "unassigned" row instead of
 * silently dropping them.
 */
export function groupByResource<T extends SchedulerEvent>(events: T[], resourceIds: (string | number)[]): Map<string | number | null, T[]> {
    const known = new Set(resourceIds);
    const groups = new Map<string | number | null, T[]>();
    for (const id of resourceIds) {
        groups.set(id, []);
    }

    for (const event of events) {
        const key = event.resourceId != null && known.has(event.resourceId) ? event.resourceId : null;
        const bucket = groups.get(key) ?? [];
        bucket.push(event);
        groups.set(key, bucket);
    }

    return groups;
}
