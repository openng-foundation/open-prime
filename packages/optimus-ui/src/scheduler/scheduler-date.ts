import type { SchedulerTimeFormatOptions, SchedulerTimelineScale, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';

/**
 * Date arithmetic for the Scheduler. Everything here is pure and works on LOCAL time on purpose:
 * a calendar shows the user's day, and any detour through UTC shifts every boundary by the offset
 * (in UTC+2, local midnight is 22:00 the day before, so `toISOString().slice(0, 10)` reports the
 * wrong day and "previous day" jumps two). Composing the parts by hand is the only safe way.
 *
 * @module scheduler-date
 */

/** Milliseconds in a minute. */
export const MINUTE_MS = 60_000;
/** Milliseconds in an hour. */
export const HOUR_MS = 3_600_000;

/**
 * Coerces whatever the consumer put in `SchedulerEvent.start` into a `Date`.
 */
export function toDate(value: Date | string | number): Date {
    return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

/**
 * Local calendar day of a date as `YYYY-MM-DD`. The identity used to bucket events into cells.
 */
export function dayKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Local midnight of the day the date falls in.
 */
export function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Local midnight of the day after. Ranges are half-open, `[start, end)`, so this is the exclusive
 * upper bound of a single day.
 */
export function endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

/**
 * Adds days keeping the local wall-clock time. Crossing a DST boundary changes the elapsed
 * milliseconds, which is what a calendar wants: the 26th at 09:00 plus one day is the 27th at 09:00.
 */
export function addDays(date: Date, amount: number): Date {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + amount);
    return next;
}

/**
 * Adds months clamping the day of month, so 31 January plus one month is 28 (or 29) February
 * rather than spilling into March.
 */
export function addMonths(date: Date, amount: number): Date {
    const day = date.getDate();
    const next = new Date(date.getFullYear(), date.getMonth() + amount, 1, date.getHours(), date.getMinutes());
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
    return next;
}

/**
 * Adds minutes. Plain elapsed time: an appointment's duration does not stretch across a DST change.
 */
export function addMinutes(date: Date, amount: number): Date {
    return new Date(date.getTime() + amount * MINUTE_MS);
}

/**
 * Whether the two dates fall on the same local calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Whether the date is today.
 */
export function isToday(date: Date, now: Date = new Date()): boolean {
    return isSameDay(date, now);
}

/**
 * Start of the week the date falls in, honouring `firstDayOfWeek` (0 = Sunday).
 */
export function startOfWeek(date: Date, firstDayOfWeek = 0): Date {
    const start = startOfDay(date);
    const shift = (start.getDay() - firstDayOfWeek + 7) % 7;
    return addDays(start, -shift);
}

/**
 * Start of the month the date falls in.
 */
export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * First instant after the month the date falls in.
 */
export function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Whole days between two dates, ignoring the time of day. DST-safe: it compares local midnights
 * rather than dividing elapsed milliseconds, which would be off by one on the shift days.
 */
export function daysBetween(from: Date, to: Date): number {
    const a = startOfDay(from);
    const b = startOfDay(to);
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/**
 * Consecutive local midnights covering `[start, end)`.
 */
export function eachDay(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    for (let d = startOfDay(start); d < end; d = addDays(d, 1)) {
        days.push(d);
    }
    return days;
}

/**
 * The scale of a timeline view, or `undefined` for a view that is not a timeline.
 *
 * `timeline` and `resourceTimeline` are the original names of the day-scale timelines and stay
 * supported as aliases, so the mapping is by suffix with those two as special cases.
 */
export function timelineScaleOf(view: SchedulerViewType): SchedulerTimelineScale | undefined {
    switch (view) {
        case 'timeline':
        case 'timelineDay':
        case 'resourceTimeline':
        case 'resourceTimelineDay':
            return 'day';
        case 'timelineWeek':
        case 'resourceTimelineWeek':
            return 'week';
        case 'timelineMonth':
        case 'resourceTimelineMonth':
            return 'month';
        case 'timelineYear':
        case 'resourceTimelineYear':
            return 'year';
        default:
            return undefined;
    }
}

/**
 * Whether a timeline view puts one lane per resource instead of a single lane.
 */
export function isResourceTimeline(view: SchedulerViewType): boolean {
    return view.startsWith('resourceTimeline');
}

/**
 * A half-open interval. Everything in the Scheduler is expressed as one.
 */
export interface SchedulerRange {
    /** First instant included. */
    start: Date;
    /** First instant excluded. */
    end: Date;
}

/**
 * Options that change how a range is derived from an anchor date.
 */
export interface SchedulerRangeOptions {
    /** 0 = Sunday. Applies to the week-based views and the month grid. */
    firstDayOfWeek?: number;
    /** How many days a `day`-family view shows at once. */
    dayCount?: number;
    /** How many months a `month`-family view shows at once. */
    monthCount?: number;
    /** How many days the agenda spans. */
    agendaDays?: number;
    /** How many days the timeline spans. */
    timelineDays?: number;
    /** Whether the month grid is padded to whole weeks. */
    fixedWeeks?: boolean;
}

/**
 * The visible range of a view, given the anchor date.
 *
 * The month grid deliberately extends past the month: a calendar shows whole weeks, so the leading
 * and trailing days of the neighbouring months are part of the range and get rendered greyed out.
 */
export function viewRange(view: SchedulerViewType, date: Date, options: SchedulerRangeOptions = {}): SchedulerRange {
    const { firstDayOfWeek = 0, dayCount = 1, monthCount = 1, agendaDays = 30, timelineDays = 1, fixedWeeks = true } = options;

    switch (view) {
        case 'day':
        case 'resourceDay':
        case 'dateDay': {
            const start = startOfDay(date);
            return { start, end: addDays(start, dayCount) };
        }
        case 'week':
        case 'resourceWeek':
        case 'dateWeek': {
            const start = startOfWeek(date, firstDayOfWeek);
            return { start, end: addDays(start, 7) };
        }
        case 'month':
        case 'resourceMonth':
        case 'dateMonth': {
            // `monthCount` months side by side, each drawn as its own grid: the range is the union,
            // from the first week of the first month to the last week of the last one.
            const months = monthCount > 1 ? Math.trunc(monthCount) : 1; // NaN falls through to 1
            const first = startOfMonth(date);
            const start = startOfWeek(first, firstDayOfWeek);
            const lastFirst = addMonths(first, months - 1);
            const last = endOfMonth(lastFirst);
            const end = fixedWeeks ? addDays(startOfWeek(lastFirst, firstDayOfWeek), 42) : addDays(startOfWeek(addDays(last, -1), firstDayOfWeek), 7);
            return { start, end };
        }
        case 'year': {
            const start = new Date(date.getFullYear(), 0, 1);
            return { start, end: new Date(date.getFullYear() + 1, 0, 1) };
        }
        case 'agenda': {
            const start = startOfDay(date);
            return { start, end: addDays(start, agendaDays) };
        }
        default: {
            // The four timeline scales. The month is NOT padded to whole weeks the way the month
            // grid is: a horizontal axis labelled "September" that starts on 30 August lies about
            // what it is showing.
            switch (timelineScaleOf(view)) {
                case 'week': {
                    const start = startOfWeek(date, firstDayOfWeek);
                    return { start, end: addDays(start, 7) };
                }
                case 'month': {
                    const start = startOfMonth(date);
                    return { start, end: endOfMonth(date) };
                }
                case 'year': {
                    const start = new Date(date.getFullYear(), 0, 1);
                    return { start, end: new Date(date.getFullYear() + 1, 0, 1) };
                }
                default: {
                    const start = startOfDay(date);
                    return { start, end: addDays(start, timelineDays) };
                }
            }
        }
    }
}

/**
 * How far one press of the previous/next control moves the anchor date, per view.
 */
export function navigate(view: SchedulerViewType, date: Date, direction: -1 | 1, options: SchedulerRangeOptions = {}): Date {
    const { dayCount = 1, monthCount = 1, agendaDays = 30, timelineDays = 1 } = options;

    switch (view) {
        case 'day':
        case 'resourceDay':
        case 'dateDay':
            return addDays(date, direction * dayCount);
        case 'week':
        case 'resourceWeek':
        case 'dateWeek':
            return addDays(date, direction * 7);
        case 'month':
        case 'resourceMonth':
        case 'dateMonth':
            // A page press moves by WHAT IS ON SCREEN: showing three months and stepping one would
            // repeat two thirds of the grid on every press.
            return addMonths(date, direction * (monthCount > 1 ? Math.trunc(monthCount) : 1));
        case 'year':
            return addMonths(date, direction * 12);
        case 'agenda':
            return addDays(date, direction * agendaDays);
        default:
            switch (timelineScaleOf(view)) {
                case 'week':
                    return addDays(date, direction * 7);
                case 'month':
                    return addMonths(date, direction);
                case 'year':
                    return addMonths(date, direction * 12);
                default:
                    return addDays(date, direction * timelineDays);
            }
    }
}

/**
 * Wall-clock time of a date, as the locale prints it: `9:00 AM`, `9:00`, `٩:٠٠ ص`.
 *
 * `hour: 'numeric'` and not `'2-digit'`: en-US pads to `09:00 AM`, which is two characters of noise
 * per label in a gutter that repeats it every half hour, and no calendar prints it that way.
 */
export function formatTime(date: Date, locale?: string, options?: SchedulerTimeFormatOptions): string {
    const { format = 'auto', showMinutes = 'always', showAMPM = true } = options ?? {};
    const minutes = date.getMinutes();
    const printMinutes = showMinutes === 'always' || minutes !== 0;

    // 'auto' deja decidir al locale, que es lo que sabe si esa cultura escribe 14:00 o 2 PM.
    const hour12 = format === 'auto' ? undefined : format === '12h';
    const text = date.toLocaleTimeString(locale, {
        hour: 'numeric',
        ...(printMinutes ? { minute: '2-digit' as const } : {}),
        ...(hour12 == null ? {} : { hour12 })
    });

    // El AM/PM se quita del resultado y no pidiendo hour12:false, que cambiaria tambien el reloj:
    // "2 PM" sin sufijo es "2", no "14".
    return showAMPM ? text : text.replace(/\s*[APap]\.?\s?[Mm]\.?/u, '').trim();
}

/**
 * The `start - end` an event prints. A plain hyphen, not an en dash: it is the separator every
 * calendar uses, and an en dash in a 6rem event cell is a pixel of ambiguity.
 *
 * `rangeDisplay` decides how much of it survives. `compact` drops the repeated meridiem — `9 - 10 AM`
 * rather than `9 AM - 10 AM`, which is what fits in a month cell — and `locale` hands the whole range
 * to `Intl` so a culture that writes it its own way gets its own way.
 */
export function formatTimeRange(start: Date, end: Date, locale?: string, options?: SchedulerTimeFormatOptions): string {
    const display = options?.rangeDisplay ?? 'full';

    if (display === 'locale') {
        const format = options?.format ?? 'auto';
        try {
            const formatter = new Intl.DateTimeFormat(locale, {
                hour: 'numeric',
                minute: '2-digit',
                ...(format === 'auto' ? {} : { hour12: format === '12h' })
            });
            // formatRange es lo unico que sabe donde pone cada cultura el separador de un rango.
            return formatter.formatRange(start, end);
        } catch {
            // Una plataforma sin formatRange cae al formato completo en vez de quedarse sin hora.
        }
    }

    const from = formatTime(start, locale, options);
    const to = formatTime(end, locale, options);

    if (display === 'compact') {
        const meridiem = /\s*[APap]\.?\s?[Mm]\.?$/u;
        const tail = to.match(meridiem)?.[0];
        // Solo se recorta cuando los dos extremos llevan el MISMO sufijo: 11 AM - 1 PM los necesita.
        if (tail && from.endsWith(tail.trim())) return `${from.replace(meridiem, '').trim()} - ${to}`;
    }

    return `${from} - ${to}`;
}

/**
 * One row of the time gutter.
 */
export interface SchedulerTimeSlot {
    /** Wall-clock start of the slot, as minutes from midnight. */
    minutes: number;
    /** Whether the slot sits on a whole hour, which is where the gutter prints a label. */
    major: boolean;
}

/**
 * The rows of a time grid between two wall-clock hours.
 *
 * `dayEndHour` is exclusive and accepts 24, so a full day is `0..24`.
 */
export function timeSlots(dayStartHour = 0, dayEndHour = 24, slotMinutes = 30): SchedulerTimeSlot[] {
    const slots: SchedulerTimeSlot[] = [];
    const from = dayStartHour * 60;
    const to = dayEndHour * 60;
    for (let m = from; m < to; m += slotMinutes) {
        slots.push({ minutes: m, major: m % 60 === 0 });
    }
    return slots;
}

/**
 * Whether an event overlaps a range. Half-open on both sides, so an appointment ending exactly at
 * midnight belongs to the day that is ending and does not leak an empty sliver into the next one.
 */
export function overlaps(eventStart: Date, eventEnd: Date, range: SchedulerRange): boolean {
    return eventStart < range.end && eventEnd > range.start;
}
