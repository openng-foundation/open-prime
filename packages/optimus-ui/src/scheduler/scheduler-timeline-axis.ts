import type { SchedulerEvent, SchedulerLayoutItem, SchedulerTimeFormatOptions, SchedulerTimelineScale } from '@openng/optimus-ui/types/scheduler';
import { addDays, addMinutes, dayKey, eachDay, formatTime, isToday, startOfDay, startOfMonth, timeSlots, type SchedulerRange } from './scheduler-date';

/**
 * The horizontal axis of the timeline views, and the placement of events on it.
 *
 * The four scales are not the same axis at four zoom levels: a **day** and a **week** are made of
 * *time* slots bounded by `dayStartHour`/`dayEndHour`, so the axis SKIPS the nights, while a
 * **month** is made of days and a **year** of months, where every column is one full unit. That
 * discontinuity is the whole reason this module exists: with the night hours missing, an event's
 * position is no longer a linear fraction of `[start, end)` — 15:00 on Wednesday is not 40 % of the
 * way through the week when the axis only shows 07:00–19:00 of each day. So the axis owns the
 * mapping from an instant to a fraction ({@link SchedulerTimelineAxis.position}), and every renderer
 * asks it rather than doing the arithmetic itself.
 *
 * Everything here is pure: dates in, plain objects out, no DOM and no Angular.
 *
 * @module scheduler-timeline-axis
 */

/** One column of the axis. */
export interface SchedulerTimelineSlot {
    /** Tracking key. */
    key: string;
    /** First instant of the column. */
    start: Date;
    /** First instant after the column. */
    end: Date;
    /** What the header prints for it. */
    label: string;
    /** Whether the column starts a unit worth a solid rule: an hour, a week, a quarter. */
    major: boolean;
    /** Whether the column belongs to today. */
    today: boolean;
}

/** One cell of a header band above the columns. */
export interface SchedulerTimelineTierCell {
    /** Tracking key. */
    key: string;
    /** Text of the cell. */
    label: string;
    /** How many columns it covers. */
    span: number;
    /** Whether the cell covers today. */
    today: boolean;
}

/** A header band above the columns: the month a week belongs to, the day its hours belong to. */
export interface SchedulerTimelineTier {
    /** Identifies the band, and is also its `data-tier` attribute: `period` or `day`. */
    key: 'period' | 'day';
    /** The cells of the band, left to right. */
    cells: SchedulerTimelineTierCell[];
}

/** The built axis. */
export interface SchedulerTimelineAxis {
    /** The scale it was built for. */
    scale: SchedulerTimelineScale;
    /** The columns. */
    slots: SchedulerTimelineSlot[];
    /** The header bands above the columns, outermost first. */
    tiers: SchedulerTimelineTier[];
    /** Whether the axis spans more than one day, which is what makes marking today worth it. */
    multiDay: boolean;
    /**
     * Where an instant sits along the axis, as a fraction of its full width.
     *
     * An instant inside a gap the axis does not draw — a night in the day and week scales — lands on
     * the edge of the gap rather than being interpolated across it.
     */
    position(date: Date): number;
}

/** What {@link buildTimelineAxis} needs to know beyond the range. */
export interface SchedulerTimelineAxisOptions {
    /** The visible range of the view. */
    range: SchedulerRange;
    /** Wall-clock hours the time-based scales draw, as `[start, end)`. */
    dayBounds: { start: number; end: number };
    /** Minutes per column in the time-based scales. */
    slotMinutes: number;
    /** First day of the week, 0 = Sunday. Decides where the month scale draws its solid rules. */
    firstDayOfWeek: number;
    /** Locale every label is formatted in. */
    locale?: string;
    /** How the hour is written on the time-based scales. */
    timeFormat?: SchedulerTimeFormatOptions;
    /**
     * Now, in the zone being rendered.
     *
     * Passed in rather than read from the clock: with a target timezone it is already tomorrow over
     * there at 23:00 here, and an axis that marks the local day marks the wrong column.
     */
    now?: Date;
}

/**
 * Builds the axis for a scale.
 */
export function buildTimelineAxis(scale: SchedulerTimelineScale, options: SchedulerTimelineAxisOptions): SchedulerTimelineAxis {
    const slots = scale === 'year' ? monthSlots(options) : scale === 'month' ? daySlots(options) : timeColumns(options);
    const tiers = scale === 'year' ? yearTiers(slots, options) : scale === 'month' ? monthTiers(slots, options) : timeTiers(scale, slots, options);
    const days = new Set(slots.map((slot) => dayKey(slot.start)));

    return {
        scale,
        slots,
        tiers,
        multiDay: days.size > 1,
        position: (date: Date) => positionOn(slots, date)
    };
}

/**
 * Columns of the day and week scales: the same wall-clock window repeated for each day of the range,
 * so the nights between them are not drawn at all.
 */
function timeColumns(options: SchedulerTimelineAxisOptions): SchedulerTimelineSlot[] {
    const { range, dayBounds, slotMinutes, locale } = options;
    // Every day of the RANGE, on the day scale too: buildTimelineAxis is public and its range is
    // not limited to a single day, and keeping only the first left every later event pinned to the
    // end of the axis.
    const days = eachDay(range.start, range.end);
    const slots: SchedulerTimelineSlot[] = [];

    for (const day of days) {
        for (const slot of timeSlots(dayBounds.start, dayBounds.end, slotMinutes)) {
            const start = addMinutes(day, slot.minutes);
            slots.push({
                key: `${dayKey(day)}|${slot.minutes}`,
                start,
                end: addMinutes(start, slotMinutes),
                label: formatTime(start, locale, options.timeFormat),
                major: slot.major,
                today: isToday(day, options.now)
            });
        }
    }

    return slots;
}

/** Columns of the month scale: one per day. */
function daySlots(options: SchedulerTimelineAxisOptions): SchedulerTimelineSlot[] {
    const { range, firstDayOfWeek, locale } = options;
    return eachDay(range.start, range.end).map((day) => ({
        key: dayKey(day),
        start: day,
        end: addDays(day, 1),
        label: day.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' }),
        // The solid rule lands where the week starts: that is what makes weeks countable at a
        // glance on an axis of thirty-one identical columns.
        major: day.getDay() === firstDayOfWeek,
        today: isToday(day, options.now)
    }));
}

/** Columns of the year scale: one per month. */
function monthSlots(options: SchedulerTimelineAxisOptions): SchedulerTimelineSlot[] {
    const { range, locale } = options;
    const slots: SchedulerTimelineSlot[] = [];
    const first = startOfMonth(range.start);
    const now = options.now ?? new Date();

    for (let index = 0; ; index++) {
        const start = new Date(first.getFullYear(), first.getMonth() + index, 1);
        if (start >= range.end) break;
        const end = new Date(first.getFullYear(), first.getMonth() + index + 1, 1);
        slots.push({
            key: `${start.getFullYear()}-${start.getMonth()}`,
            start,
            end,
            label: start.toLocaleDateString(locale, { month: 'short' }),
            // Quarters: the only subdivision a twelve-column axis can mark without adding noise.
            major: start.getMonth() % 3 === 0,
            today: now >= start && now < end
        });
    }

    return slots;
}

/** Header bands of the day and week scales: the month, then the day the hours belong to. */
function timeTiers(scale: SchedulerTimelineScale, slots: SchedulerTimelineSlot[], options: SchedulerTimelineAxisOptions): SchedulerTimelineTier[] {
    const { locale } = options;
    if (!slots.length) return [];

    return [
        {
            key: 'period',
            cells: groupSlots(
                slots,
                (slot) => `${slot.start.getFullYear()}-${slot.start.getMonth()}`,
                (slot) => slot.start.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
            )
        },
        {
            key: 'day',
            // Per day on both scales: buildTimelineAxis is not limited to a single day, not even on
            // the day scale, and one cell labelled with the first day lied about the rest of the
            // columns. With a single day, grouping by day gives exactly one cell, which is what was
            // drawn before.
            cells: groupSlots(
                slots,
                (slot) => dayKey(slot.start),
                (slot) => slot.start.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' })
            )
        }
    ];
}

/** Header band of the month scale: the month the days belong to. */
function monthTiers(slots: SchedulerTimelineSlot[], options: SchedulerTimelineAxisOptions): SchedulerTimelineTier[] {
    if (!slots.length) return [];
    return [
        {
            key: 'period',
            cells: groupSlots(
                slots,
                (slot) => `${slot.start.getFullYear()}-${slot.start.getMonth()}`,
                (slot) => slot.start.toLocaleDateString(options.locale, { month: 'long', year: 'numeric' })
            )
        }
    ];
}

/** Header band of the year scale: the year the months belong to. */
function yearTiers(slots: SchedulerTimelineSlot[], _options: SchedulerTimelineAxisOptions): SchedulerTimelineTier[] {
    if (!slots.length) return [];
    return [
        {
            key: 'period',
            cells: groupSlots(
                slots,
                (slot) => String(slot.start.getFullYear()),
                (slot) => String(slot.start.getFullYear())
            )
        }
    ];
}

/**
 * Collapses consecutive columns that share a key into one header cell, and reports its span in
 * columns — which is what lets the band line up with the axis through a single grid template.
 */
function groupSlots(slots: SchedulerTimelineSlot[], keyOf: (slot: SchedulerTimelineSlot) => string, labelOf: (slot: SchedulerTimelineSlot) => string): SchedulerTimelineTierCell[] {
    const cells: SchedulerTimelineTierCell[] = [];
    let current: { key: string; cell: SchedulerTimelineTierCell } | null = null;

    for (const slot of slots) {
        const key = keyOf(slot);
        if (current && current.key === key) {
            current.cell.span++;
            current.cell.today = current.cell.today || slot.today;
            continue;
        }
        current = { key, cell: { key, label: labelOf(slot), span: 1, today: slot.today } };
        cells.push(current.cell);
    }

    return cells;
}

/**
 * Fraction of the axis an instant sits at.
 *
 * Before the first column it is 0 and after the last one it is 1, so an event that starts the day
 * before is clipped to the edge instead of being drawn off-screen. An instant in a gap the axis
 * skips resolves to the boundary of the gap.
 */
function positionOn(slots: SchedulerTimelineSlot[], date: Date): number {
    if (!slots.length) return 0;

    const time = date.getTime();
    if (time <= slots[0].start.getTime()) return 0;
    if (time >= slots[slots.length - 1].end.getTime()) return 1;

    for (let index = 0; index < slots.length; index++) {
        const start = slots[index].start.getTime();
        const end = slots[index].end.getTime();
        // Before this column and after the previous one: it falls in a gap the axis does not draw
        // (a night), so it resolves to the edge instead of being interpolated across the gap.
        if (time < start) return index / slots.length;
        if (time < end) return (index + (time - start) / (end - start)) / slots.length;
    }

    return 1;
}

/**
 * Re-places already-packed events on the axis.
 *
 * The overlap packing (which lane row an event goes in) is time arithmetic and stays where it is,
 * in `layoutTimeGrid`; what this does is throw away the linear `offset`/`size` that came out of it
 * and ask the axis instead. An event shorter than half a column keeps half a column of width, or a
 * two-hour appointment on a year axis would be a quarter of a pixel.
 */
export function placeOnAxis<T extends SchedulerEvent>(items: SchedulerLayoutItem<T>[], axis: SchedulerTimelineAxis, bounds: (event: T) => { start: Date; end: Date }): SchedulerLayoutItem<T>[] {
    const minSize = 0.5 / Math.max(axis.slots.length, 1);

    return items.map((item) => {
        const { start, end } = bounds(item.event);
        const offset = axis.position(start);
        const size = Math.max(axis.position(end) - offset, minSize);
        return { ...item, offset, size: Math.min(size, 1 - offset) };
    });
}
