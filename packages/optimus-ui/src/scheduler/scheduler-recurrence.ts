import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { MINUTE_MS, addDays, addMonths, dayKey, startOfWeek, toDate, type SchedulerRange } from './scheduler-date';

/**
 * Recurrence: turning one event carrying an `rrule` into the occurrences a view has to draw.
 *
 * The expansion happens HERE and not in the application, because every view needs the same answer
 * and the answer depends on the visible range: a weekly series has no end, so the only sane unit of
 * work is "the occurrences that touch this window". The application keeps the series and its
 * exceptions; the Scheduler generates the copies and throws them away on the next render.
 *
 * The rule language is the RFC 5545 `RRULE` subset that calendars actually use: `FREQ`, `INTERVAL`,
 * `COUNT`, `UNTIL`, `BYDAY`, `BYMONTHDAY` and `BYMONTH`. Anything else in the string is ignored
 * rather than rejected — a rule the Scheduler does not fully understand should still produce its
 * base occurrences instead of making the event disappear.
 *
 * Everything is pure and local-time, like the rest of the engine.
 *
 * @module scheduler-recurrence
 */

/** How often a series repeats. */
export type SchedulerRecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/** A parsed `RRULE`. */
export interface SchedulerRecurrenceRule {
    /** Unit the series steps by. */
    freq: SchedulerRecurrenceFreq;
    /** How many units between occurrences. 1 unless the rule says otherwise. */
    interval: number;
    /** Hard cap on how many occurrences the series has, including the first. */
    count?: number;
    /** Last instant an occurrence may start at, inclusive. */
    until?: Date;
    /** Weekdays the rule lands on, 0 = Sunday. Only meaningful for `WEEKLY`. */
    byDay?: number[];
    /** Days of the month the rule lands on. Only meaningful for `MONTHLY` and `YEARLY`. */
    byMonthDay?: number[];
    /** Months the rule is restricted to, 1 = January. */
    byMonth?: number[];
}

/** Weekday codes of RFC 5545, in the order the standard numbers them. */
const WEEKDAYS: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

/**
 * Hard stop on how many candidates the expander will consider for one series.
 *
 * A rule with neither `COUNT` nor `UNTIL` is infinite, and the window is what normally bounds the
 * work — but a badly formed rule (say `INTERVAL=0`, or an `UNTIL` before the start) could otherwise
 * spin. The cap is generous enough that no real series reaches it inside one visible range: a daily
 * rule across a year view needs 366.
 */
const MAX_CANDIDATES = 2000;

/**
 * Parses an `RRULE` string.
 *
 * Returns `undefined` for anything without a usable `FREQ`, which is what makes an unparseable rule
 * degrade into "not a series" rather than into an error.
 */
export function parseRRule(value: string | undefined | null): SchedulerRecurrenceRule | undefined {
    if (!value) return undefined;

    const parts = new Map<string, string>();
    for (const chunk of value.split(';')) {
        const index = chunk.indexOf('=');
        if (index > 0) parts.set(chunk.slice(0, index).trim().toUpperCase(), chunk.slice(index + 1).trim());
    }

    const freq = parts.get('FREQ')?.toUpperCase();
    if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY' && freq !== 'YEARLY') return undefined;

    const interval = Number(parts.get('INTERVAL') ?? 1);
    const count = Number(parts.get('COUNT'));
    const numbers = (raw: string | undefined) =>
        raw
            ?.split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => Number.isFinite(item));

    return {
        freq,
        // An INTERVAL of 0 or less would stop the expander ever advancing: it is normalised to 1.
        interval: Number.isFinite(interval) && interval > 0 ? Math.floor(interval) : 1,
        count: Number.isFinite(count) && count > 0 ? Math.floor(count) : undefined,
        until: inclusiveUntil(parts.get('UNTIL')),
        byDay: parts
            .get('BYDAY')
            ?.split(',')
            // BYDAY's ordinal prefix (-1SU, 2MO) is not supported: the day is read and the ordinal
            // ignored, which beats discarding the whole rule.
            .map((item) => WEEKDAYS[item.trim().toUpperCase().slice(-2)])
            .filter((day) => day != null),
        byMonthDay: numbers(parts.get('BYMONTHDAY')),
        byMonth: numbers(parts.get('BYMONTH'))
    };
}

/**
 * `UNTIL` as the last instant it allows.
 *
 * RFC 5545 wants `UNTIL` to match the value type of `DTSTART`, but plenty of exports write a bare
 * date next to a timed start. Read literally that is local midnight, which silently drops every
 * occurrence on the last day — so a date-only value is taken as the END of its day, which is what
 * "until the 10th" means to whoever wrote it.
 */
function inclusiveUntil(value: string | undefined): Date | undefined {
    const parsed = parseRRuleDate(value);
    if (!parsed || !value || /T/i.test(value)) return parsed;

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
}

/**
 * Reads a date out of a rule or an `EXDATE`/`RDATE` entry.
 *
 * Accepts the compact RFC 5545 forms (`20260908`, `20260908T090000Z`) as well as anything `Date`
 * parses, because payloads coming off a JSON API use ISO strings.
 */
export function parseRRuleDate(value: string | number | Date | undefined | null): Date | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === 'number') return new Date(value);

    const compact = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value.trim());
    if (compact) {
        const [, y, m, d, hh = '0', mm = '0', ss = '0', utc] = compact;
        const year = Number(y);
        const monthIndex = Number(m) - 1;
        const day = Number(d);
        const hour = Number(hh);
        const minute = Number(mm);
        const second = Number(ss);
        return utc ? new Date(Date.UTC(year, monthIndex, day, hour, minute, second)) : new Date(year, monthIndex, day, hour, minute, second);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/** A list of dates given as an array, a comma-separated string, or a single value. */
function parseDateList(value: unknown): Date[] {
    if (value == null) return [];
    const raw = Array.isArray(value) ? value : String(value).split(',');
    return raw.map((item) => parseRRuleDate(item as any)).filter((date): date is Date => date != null);
}

/**
 * The instants a series starts at inside a window.
 *
 * Candidates are generated from the series start and not from the window, so `COUNT` and `INTERVAL`
 * mean what the rule says even when the window opens in the middle of the series — a
 * `FREQ=WEEKLY;INTERVAL=2` looked at from March has to land on the same weeks it would have landed
 * on from January.
 */
export function recurrenceStarts(start: Date, rule: SchedulerRecurrenceRule, window: SchedulerRange): Date[] {
    const starts: Date[] = [];
    const until = rule.until?.getTime() ?? Infinity;
    const windowEnd = window.end.getTime();
    let emitted = 0;
    // "Exhausted" is not the same as "this step produced no date": a BYMONTHDAY=30,31 rule yields
    // nothing in February and has to carry on into March, whereas running past UNTIL or COUNT does
    // end the series. Conflating the two cut the series off in February.
    let exhausted = false;

    const accept = (date: Date): void => {
        if (date.getTime() > until || (rule.count != null && emitted >= rule.count)) {
            exhausted = true;
            return;
        }
        if (rule.byMonth?.length && !rule.byMonth.includes(date.getMonth() + 1)) return;

        emitted++;
        // An occurrence before the window COUNTS towards COUNT but is not drawn: that is what keeps
        // the series ordered and counted when the window starts partway through. The caller widens
        // the window as much as it needs so a multi-day appointment that started earlier still
        // comes in.
        if (date.getTime() < windowEnd && date.getTime() >= window.start.getTime()) starts.push(new Date(date.getTime()));
    };

    if (rule.freq === 'WEEKLY' && rule.byDay?.length) {
        const days = [...new Set(rule.byDay)].sort((a, b) => a - b);
        const firstWeek = startOfWeek(start, 0);
        for (let step = 0; step < MAX_CANDIDATES && !exhausted; step++) {
            const weekStart = addDays(firstWeek, step * 7 * rule.interval);
            if (weekStart.getTime() > windowEnd) break;
            for (const day of days) {
                const date = withTimeOf(addDays(weekStart, day), start);
                // A BYDAY before the series start, in its first week, does not exist.
                if (date.getTime() < start.getTime()) continue;
                accept(date);
                if (exhausted) break;
            }
        }
        return starts;
    }

    if ((rule.freq === 'MONTHLY' || rule.freq === 'YEARLY') && rule.byMonthDay?.length) {
        const days = [...new Set(rule.byMonthDay)].sort((a, b) => a - b);
        for (let step = 0; step < MAX_CANDIDATES && !exhausted; step++) {
            const anchor = stepFrom(startOfMonthKeepingTime(start), rule, step);
            if (anchor.getTime() > windowEnd) break;
            const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
            for (const day of days) {
                // A day that month does not have (the 31st in February) is skipped, not clamped:
                // clamping would put two occurrences on the same day when the rule asks for 30 and
                // 31.
                if (day < 1 || day > lastDay) continue;
                const date = withTimeOf(new Date(anchor.getFullYear(), anchor.getMonth(), day), start);
                if (date.getTime() < start.getTime()) continue;
                accept(date);
                if (exhausted) break;
            }
        }
        return starts;
    }

    for (let step = 0; step < MAX_CANDIDATES && !exhausted; step++) {
        const date = stepFrom(start, rule, step);
        if (date.getTime() > windowEnd) break;
        accept(date);
    }

    return starts;
}

/** The first of the month the date falls in, keeping its wall-clock time. */
function startOfMonthKeepingTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}

/** The `step`-th candidate of a non-BYDAY rule. */
function stepFrom(start: Date, rule: SchedulerRecurrenceRule, step: number): Date {
    const amount = step * rule.interval;
    switch (rule.freq) {
        case 'DAILY':
            return addDays(start, amount);
        case 'WEEKLY':
            return addDays(start, amount * 7);
        case 'MONTHLY':
            return addMonths(start, amount);
        case 'YEARLY':
            return addMonths(start, amount * 12);
    }
}

/** The date with the wall-clock time of another. */
function withTimeOf(date: Date, time: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

/**
 * Expands one event into its occurrences inside a window.
 *
 * An event with no `rrule` comes back as itself, so this is safe to run over the whole collection.
 * Each occurrence is a shallow copy with:
 *
 * - a NEW `id`, because ids are the tracking key of every list and the identity used by selection —
 *   two occurrences sharing one id would fight over the same DOM node and the same selected state;
 * - `recurrenceId` pointing at the series, which is what an application saves against;
 * - `recurrenceStart`, the instant this occurrence was generated for, which is what identifies it
 *   inside the series after the user drags it somewhere else.
 */
export function expandEvent<T extends SchedulerEvent>(event: T, window: SchedulerRange, defaultEventDuration: number, overrides?: ReadonlySet<string>): T[] {
    const rule = parseRRule(event['rrule']);
    if (!rule) return [event];

    const start = toDate(event.start);
    const rawEnd = event.end != null ? toDate(event.end) : null;
    const duration = rawEnd && rawEnd > start ? rawEnd.getTime() - start.getTime() : defaultEventDuration * MINUTE_MS;

    const excluded = new Set(parseDateList(event['exdate']).map((date) => date.getTime()));
    const excludedDays = new Set(parseDateList(event['exdate']).map((date) => dayKey(date)));
    const extra = parseDateList(event['rdate']);

    const starts = [...recurrenceStarts(start, rule, window), ...extra.filter((date) => date >= window.start && date < window.end)].sort((a, b) => a.getTime() - b.getTime());

    const occurrences: T[] = [];
    for (const occurrenceStart of starts) {
        // EXDATE is matched by instant AND by day: a calendar that exports EXDATE as a bare date
        // (no time) still has to be able to skip that day's appointment.
        if (excluded.has(occurrenceStart.getTime()) || excludedDays.has(dayKey(occurrenceStart))) continue;
        // An override stored separately replaces its occurrence; drawing both would duplicate it.
        if (overrides?.has(overrideKey(event.id, occurrenceStart))) continue;

        occurrences.push({
            ...event,
            id: `${event.id}::${occurrenceStart.toISOString()}`,
            start: occurrenceStart,
            end: new Date(occurrenceStart.getTime() + duration),
            recurrenceId: event.id,
            recurrenceStart: occurrenceStart
        });
    }

    return occurrences;
}

/** Key an exception is matched to its occurrence by. */
function overrideKey(seriesId: string | number, start: Date): string {
    return `${seriesId}::${start.getTime()}`;
}

/**
 * Expands a whole collection.
 *
 * Events carrying a `recurrenceId` are EXCEPTIONS to a series — the copy the user edited and the
 * application saved on its own. They are passed through untouched, and the occurrence they replace
 * is dropped from the expansion, keyed by `recurrenceStart` (or, failing that, by where the
 * exception itself starts).
 */
export function expandEvents<T extends SchedulerEvent>(events: readonly T[], window: SchedulerRange, defaultEventDuration: number): T[] {
    let hasRule = false;
    const overrides = new Set<string>();

    for (const event of events) {
        if (event['rrule']) hasRule = true;
        if (event['recurrenceId'] != null) {
            const original = parseRRuleDate(event['recurrenceStart']) ?? toDate(event.start);
            overrides.add(overrideKey(event['recurrenceId'], original));
        }
    }

    // With no rule anywhere in the collection the array is returned AS IS, uncopied: most calendars
    // have no series and should pay neither for the expansion nor with the array's identity, which is
    // what lets consumers compare by reference.
    if (!hasRule) return events as T[];

    const expanded: T[] = [];
    for (const event of events) {
        if (event['recurrenceId'] != null) {
            expanded.push(event);
            continue;
        }
        expanded.push(...expandEvent(event, window, defaultEventDuration, overrides));
    }

    return expanded;
}
