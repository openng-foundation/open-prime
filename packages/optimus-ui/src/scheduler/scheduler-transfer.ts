import type { SchedulerCategory, SchedulerEvent, SchedulerResource } from '@openng/optimus-ui/types/scheduler';
import { dayKey, toDate } from './scheduler-date';
import { parseRRuleDate } from './scheduler-recurrence';

/**
 * Getting schedules in and out: iCalendar for the outside world, JSON for your own storage.
 *
 * Both directions are pure functions over the same event shape the Scheduler renders, which is the
 * point — an import is not a special kind of event and an export is not a special kind of view.
 *
 * The iCalendar support is the VEVENT subset a calendar actually exchanges: `SUMMARY`,
 * `DTSTART`/`DTEND`, `DESCRIPTION`, `LOCATION`, `RRULE`, `EXDATE`, `RDATE`, `UID`. It is not a
 * complete RFC 5545 implementation and does not pretend to be — no VTIMEZONE, no VALARM, no
 * VFREEBUSY — but it round-trips what this component can display, which is the only promise worth
 * making.
 *
 * @module scheduler-transfer
 */

/** What {@link toICalendar} needs beyond the events. */
export interface SchedulerICalendarOptions {
    /** Value of `PRODID`. Identify your product, not this library. */
    prodId?: string;
    /** Name of the calendar, exported as `X-WR-CALNAME`. */
    name?: string;
    /** Field the event title comes from. */
    titleField?: string;
}

/** A parsed calendar. */
export interface SchedulerICalendarResult {
    /** The events, in the order they appeared. */
    events: SchedulerEvent[];
    /** Name of the calendar, when it carried one. */
    name?: string;
}

/** What a JSON round-trip carries. */
export interface SchedulerTransferPayload {
    /** Schema version, so a stored payload can be migrated instead of guessed at. */
    version: 1;
    /** The events, with every instant as an ISO string. */
    events: SchedulerEvent[];
    /** The resources, when they were included. */
    resources?: SchedulerResource[];
    /** The categories, when they were included. */
    categories?: SchedulerCategory[];
}

/** Escapes a text value: commas, semicolons, backslashes and newlines are all structural in ICS. */
function escapeText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/**
 * Undoes {@link escapeText}, in a single left-to-right pass.
 *
 * Sequential replaces cannot do this: decoding `\\n` first turns the escaped backslash of
 * `C:\\\\network` into a real one and then reads the following `n` as a newline, so a Windows path
 * comes back split in two. Consuming two characters at a time is the only order that is correct,
 * because an escape can only be read once its own backslash has been consumed.
 */
function unescapeText(value: string): string {
    let result = '';

    for (let index = 0; index < value.length; index++) {
        const character = value[index];
        if (character !== '\\' || index + 1 >= value.length) {
            result += character;
            continue;
        }

        const escaped = value[++index];
        result += escaped === 'n' || escaped === 'N' ? '\n' : escaped;
    }

    return result;
}

/** An instant as `YYYYMMDDTHHMMSSZ`, which is the only form every calendar agrees on. */
function toUtcStamp(date: Date): string {
    const pad = (value: number, length = 2) => String(value).padStart(length, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/** A date as `YYYYMMDD`, for the all-day form. */
function toDateStamp(date: Date): string {
    return dayKey(date).replace(/-/g, '');
}

/**
 * Folds a line at 75 octets, as the spec requires.
 *
 * Not cosmetic: plenty of parsers reject longer lines outright, and a description is the field that
 * blows past it first.
 */
function fold(line: string): string {
    if (line.length <= 75) return line;
    const parts: string[] = [line.slice(0, 75)];
    for (let index = 75; index < line.length; index += 74) parts.push(` ${line.slice(index, index + 74)}`);
    return parts.join('\r\n');
}

/**
 * Serialises events as an iCalendar document.
 *
 * All-day events are written as `VALUE=DATE` with an exclusive `DTEND`, which is what the format
 * means by a whole day — an all-day event on the 8th ends on the 9th.
 */
export function toICalendar(events: readonly SchedulerEvent[], options: SchedulerICalendarOptions = {}): string {
    const { prodId = '-//optimus-ui//scheduler//EN', name, titleField = 'title' } = options;
    const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${prodId}`, 'CALSCALE:GREGORIAN'];
    if (name) lines.push(`X-WR-CALNAME:${escapeText(name)}`);

    for (const event of events) {
        const start = toDate(event.start);
        const end = event.end != null ? toDate(event.end) : start;

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${escapeText(String(event.id))}`);
        lines.push(`DTSTAMP:${toUtcStamp(new Date())}`);

        if (event.allDay) {
            // DTEND is EXCLUSIVE in the format: the day after the last occupied one. Writing it as
            // it stands would export a whole day with zero duration, which is how any other calendar
            // would read it. The last occupied day is derived the way the views derive it, by
            // subtracting a millisecond, so an end at midnight does not drag the next day in.
            const lastMs = (end.getTime() > start.getTime() ? end.getTime() : start.getTime() + 1) - 1;
            const last = new Date(lastMs);
            const exclusive = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);

            lines.push(`DTSTART;VALUE=DATE:${toDateStamp(start)}`);
            lines.push(`DTEND;VALUE=DATE:${toDateStamp(exclusive)}`);
        } else {
            lines.push(`DTSTART:${toUtcStamp(start)}`);
            lines.push(`DTEND:${toUtcStamp(end)}`);
        }

        const title = event[titleField] ?? event.title;
        if (title != null) lines.push(`SUMMARY:${escapeText(String(title))}`);
        if (event.description) lines.push(`DESCRIPTION:${escapeText(String(event.description))}`);
        if (event.location) lines.push(`LOCATION:${escapeText(String(event.location))}`);
        if (event['rrule']) lines.push(`RRULE:${event['rrule']}`);

        for (const field of ['exdate', 'rdate'] as const) {
            const value = event[field];
            if (!value) continue;
            const dates = (Array.isArray(value) ? value : [value]).map((item) => toUtcStamp(toDate(item as any)));
            if (dates.length) lines.push(`${field.toUpperCase()}:${dates.join(',')}`);
        }

        // Resources and the category travel as CATEGORIES/X-: there is no standard field for "the
        // resource", and losing them on export would turn a team plan into a list of appointments.
        if (event.resourceId != null) lines.push(`X-OPTIMUS-RESOURCE:${escapeText(String(event.resourceId))}`);
        const categoryId = event['categoryId'];
        if (categoryId != null) lines.push(`CATEGORIES:${escapeText(String(categoryId))}`);

        lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n');
}

/**
 * Reads an iCalendar document back into events.
 *
 * Unfolds the continuation lines first, then walks the VEVENTs. Anything it does not understand is
 * ignored rather than fatal: half a calendar is more useful than an exception.
 */
export function parseICalendar(text: string): SchedulerICalendarResult {
    // Unfolding comes first: a property split across two lines cannot be read line by line.
    const unfolded = text.replace(/\r?\n[ \t]/g, '');
    const lines = unfolded.split(/\r?\n/);

    const events: SchedulerEvent[] = [];
    let name: string | undefined;
    let current: Record<string, any> | null = null;
    let index = 0;

    for (const line of lines) {
        if (line === 'BEGIN:VEVENT') {
            current = {};
            continue;
        }
        if (line === 'END:VEVENT') {
            if (current) {
                const start = current['start'];
                // No DTSTART, no appointment: a VEVENT without an instant cannot be placed anywhere.
                if (start) events.push({ id: current['id'] ?? `ics-${index++}`, ...current } as SchedulerEvent);
            }
            current = null;
            continue;
        }

        const separator = line.indexOf(':');
        if (separator < 0) continue;
        const rawName = line.slice(0, separator);
        const value = line.slice(separator + 1);
        const [property, ...params] = rawName.split(';');
        const upper = property.toUpperCase();

        if (!current) {
            if (upper === 'X-WR-CALNAME') name = unescapeText(value);
            continue;
        }

        const isDateOnly = params.some((param) => param.toUpperCase() === 'VALUE=DATE');

        switch (upper) {
            case 'UID':
                current['id'] = unescapeText(value);
                break;
            case 'SUMMARY':
                current['title'] = unescapeText(value);
                break;
            case 'DESCRIPTION':
                current['description'] = unescapeText(value);
                break;
            case 'LOCATION':
                current['location'] = unescapeText(value);
                break;
            case 'DTSTART':
                current['start'] = parseRRuleDate(value);
                if (isDateOnly) current['allDay'] = true;
                break;
            case 'DTEND':
                current['end'] = parseRRuleDate(value);
                break;
            case 'RRULE':
                current['rrule'] = value;
                break;
            case 'EXDATE':
            case 'RDATE':
                current[upper.toLowerCase()] = value
                    .split(',')
                    .map((item) => parseRRuleDate(item))
                    .filter(Boolean);
                break;
            case 'CATEGORIES':
                current['categoryId'] = unescapeText(value.split(',')[0]);
                break;
            case 'X-OPTIMUS-RESOURCE':
                current['resourceId'] = unescapeText(value);
                break;
        }
    }

    return { events, name };
}

/**
 * Packs a schedule for your own storage or an API call.
 *
 * Instants become ISO strings, because a `Date` does not survive `JSON.stringify` in a form anything
 * can read back reliably.
 */
export function serializeSchedule(events: readonly SchedulerEvent[], extra: { resources?: readonly SchedulerResource[]; categories?: readonly SchedulerCategory[] } = {}): SchedulerTransferPayload {
    return {
        version: 1,
        events: events.map((event) => ({
            ...event,
            start: toDate(event.start).toISOString(),
            ...(event.end != null ? { end: toDate(event.end).toISOString() } : {}),
            ...(event['recurrenceStart'] != null ? { recurrenceStart: toDate(event['recurrenceStart']).toISOString() } : {})
        })),
        ...(extra.resources ? { resources: [...extra.resources] } : {}),
        ...(extra.categories ? { categories: [...extra.categories] } : {})
    };
}

/**
 * Unpacks what {@link serializeSchedule} produced, turning the instants back into `Date`s.
 *
 * `SchedulerEvent.start` accepts a string, so this is a convenience rather than a requirement — but
 * an application that compares or sorts its own events wants real dates.
 */
export function parseSchedule(payload: SchedulerTransferPayload | string): SchedulerTransferPayload {
    const data: SchedulerTransferPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

    return {
        ...data,
        version: 1,
        events: (data.events ?? []).map((event) => ({
            ...event,
            start: toDate(event.start),
            ...(event.end != null ? { end: toDate(event.end) } : {}),
            ...(event['recurrenceStart'] != null ? { recurrenceStart: toDate(event['recurrenceStart']) } : {})
        }))
    };
}
