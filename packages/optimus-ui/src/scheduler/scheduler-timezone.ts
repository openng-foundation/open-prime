/**
 * Showing a schedule in a timezone that is not the browser's.
 *
 * The engine works in local time everywhere, on purpose: a calendar shows the user's day, and any
 * detour through UTC shifts every boundary by the offset. That decision is what makes a target
 * timezone tractable — instead of teaching every renderer about zones, an instant is SHIFTED so that
 * its local wall clock reads as the target zone's wall clock, and the existing local-time maths then
 * lays it out correctly.
 *
 * A shifted date is a display value and nothing else. It is the wrong instant, deliberately: 15:00
 * in Tokyo becomes a `Date` whose local hours are 15. Everything the application gets back —
 * drag payloads, slot clicks, the emitted range — goes through the reverse shift first, so the
 * outside world only ever sees real instants.
 *
 * Offsets come from `Intl`, so DST in the target zone is handled by the platform's tz database
 * rather than by a table shipped here. The offset is computed PER INSTANT, which is the part a
 * fixed-offset implementation gets wrong twice a year.
 *
 * @module scheduler-timezone
 */

/** Milliseconds in a minute. */
const MINUTE_MS = 60_000;

/**
 * Cache of formatters, keyed by zone.
 *
 * `Intl.DateTimeFormat` construction is the expensive part — the formatting itself is cheap — and a
 * calendar asks for the same zone thousands of times per render.
 */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat | null {
    const cached = formatters.get(timeZone);
    if (cached) return cached;

    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        formatters.set(timeZone, formatter);
        return formatter;
    } catch {
        // A zone the platform does not know cannot bring the calendar down: it falls back to local.
        formatters.set(timeZone, null as unknown as Intl.DateTimeFormat);
        return null;
    }
}

/** The wall-clock fields of an instant in a timezone. */
interface ZoneParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
}

/** Reads an instant's wall clock in a zone, or `null` when the platform does not know the zone. */
function zoneParts(date: Date, timeZone: string): ZoneParts | null {
    const formatter = formatterFor(timeZone);
    if (!formatter) return null;

    const parts = formatter.formatToParts(date);
    const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const hour = read('hour');

    return {
        year: read('year'),
        month: read('month'),
        day: read('day'),
        // Some platforms report midnight as 24 with hour12:false.
        hour: hour === 24 ? 0 : hour,
        minute: read('minute'),
        second: read('second')
    };
}

/**
 * Offset of a timezone at an instant, in minutes east of UTC.
 *
 * Derived by formatting the instant in the zone and reading the parts back, which is the only way to
 * get this out of `Intl` without a dependency. `NaN` when the zone is unknown.
 */
export function zoneOffsetMinutes(date: Date, timeZone: string): number {
    const parts = zoneParts(date, timeZone);
    if (!parts) return NaN;

    const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return Math.round((asUtc - date.getTime()) / MINUTE_MS);
}

/**
 * An instant as the date to render: same wall clock as the target zone, wrong instant on purpose.
 *
 * Built from the zone's wall-clock FIELDS and not by adding an offset. Offset arithmetic needs the
 * local zone's offset too, and picking it at the wrong end of a local daylight-saving boundary is an
 * hour of error: the instant and its display date can sit on opposite sides of the local switch.
 * Copying the fields cannot have that problem.
 */
export function toDisplayTime(date: Date, timeZone: string | undefined): Date {
    if (!timeZone) return date;

    const parts = zoneParts(date, timeZone);
    if (!parts) return date;

    return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, date.getMilliseconds());
}

/**
 * The reverse: which instant reads like this wall clock over there.
 *
 * A total function with a stated rule, not a best guess. The fields are treated as UTC, the zone is
 * probed on both sides of the point for the offsets that could apply, and every candidate is checked
 * by formatting it back:
 *
 * - normally exactly one candidate matches, and it is the answer;
 * - the hour a fall-back REPEATS has two, and the EARLIEST is returned — the same wall clock
 *   deterministically means the first occurrence, every time;
 * - the hour a spring-forward SKIPS has none, because that wall clock never happens in the zone, and
 *   the instant just after the gap is returned, which is what every calendar does with it.
 *
 * The repeated hour is the one case where `instant → wall clock → instant` cannot be an identity for
 * the second occurrence: two instants share one wall clock, and a wall clock is all this is given.
 * Callers that hold the original instant should not ask — {@link SchedulerState} keeps it and uses
 * it for any endpoint the user did not move, so the ambiguity never reaches an application.
 */
export function fromDisplayTime(date: Date, timeZone: string | undefined): Date {
    if (!timeZone || !formatterFor(timeZone)) return date;

    const asUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());

    // Probed at ±14 h as well as the point itself because a zone's shift reaches 14 h, and the
    // offset being looked for is the one in force at the RESULTING instant, not at the probe.
    const probes = [asUtc, asUtc - 14 * 60 * MINUTE_MS, asUtc + 14 * 60 * MINUTE_MS];
    const offsets = [...new Set(probes.map((probe) => zoneOffsetMinutes(new Date(probe), timeZone)).filter((offset) => !Number.isNaN(offset)))];

    const matches = offsets
        .map((offset) => new Date(asUtc - offset * MINUTE_MS))
        .filter((candidate) => zoneOffsetMinutes(candidate, timeZone) === Math.round((asUtc - candidate.getTime()) / MINUTE_MS))
        .sort((a, b) => a.getTime() - b.getTime());

    if (matches.length) return matches[0];

    // The spring-forward gap: no candidate exists in the zone. The offset AFTER the jump puts the
    // result just past the gap.
    const after = Math.min(...offsets);
    return new Date(asUtc - after * MINUTE_MS);
}

/**
 * The label the time gutter prints in its corner: `GMT+9`.
 *
 * Not decoration. A time grid without it is ambiguous the moment the data comes from another zone,
 * and that ambiguity is exactly what a timezone feature introduces.
 */
export function zoneLabel(date: Date, timeZone: string | undefined): string {
    const minutes = timeZone ? zoneOffsetMinutes(date, timeZone) : -date.getTimezoneOffset();
    const offset = Number.isNaN(minutes) ? -date.getTimezoneOffset() : minutes;
    const sign = offset < 0 ? '-' : '+';
    const hours = Math.floor(Math.abs(offset) / 60);
    const rest = Math.abs(offset) % 60;
    return `GMT${sign}${hours}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
}
