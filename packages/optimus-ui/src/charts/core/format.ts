/**
 * Number and date formatting. Everything a chart writes out — an axis tick, a tooltip value, a
 * legend value, a data label — goes through here, so one `locale` on the root is enough to move a
 * whole chart into another language, currency or numeral system.
 */
import type { TickValue, TimeUnit } from '@openng/optimus-ui/types/charts';

/**
 * Formatter instances are cached by locale and options. `Intl` constructors are expensive relative
 * to a format call, and a chart formats every tick on every frame.
 */
const numberCache = new Map<string, Intl.NumberFormat>();
const dateCache = new Map<string, Intl.DateTimeFormat>();

function cacheKey(locale: string | undefined, options: object | undefined): string {
    return `${locale ?? ''}|${options ? JSON.stringify(options) : ''}`;
}

/** A cached `Intl.NumberFormat`. */
export function numberFormatter(locale?: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = cacheKey(locale, options);
    const cached = numberCache.get(key);

    if (cached) return cached;

    const formatter = new Intl.NumberFormat(locale, options);

    numberCache.set(key, formatter);

    return formatter;
}

/** A cached `Intl.DateTimeFormat`. */
export function dateFormatter(locale?: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = cacheKey(locale, options);
    const cached = dateCache.get(key);

    if (cached) return cached;

    const formatter = new Intl.DateTimeFormat(locale, options);

    dateCache.set(key, formatter);

    return formatter;
}

/** The date fields each time unit puts on a tick label. */
const UNIT_DATE_OPTIONS: Record<TimeUnit, Intl.DateTimeFormatOptions> = {
    millisecond: { minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 },
    second: { minute: '2-digit', second: '2-digit' },
    minute: { hour: 'numeric', minute: '2-digit' },
    hour: { hour: 'numeric' },
    day: { month: 'short', day: 'numeric' },
    week: { month: 'short', day: 'numeric' },
    month: { month: 'short', year: 'numeric' },
    quarter: { month: 'short', year: 'numeric' },
    year: { year: 'numeric' }
};

/** Formats a timestamp for a tick at the given granularity. */
export function formatTimeTick(time: number, unit: TimeUnit, locale?: string, overrides?: Partial<Record<TimeUnit, string | Intl.DateTimeFormatOptions>>, timeZone?: string): string {
    const override = overrides?.[unit];

    if (typeof override === 'string') return formatWithPattern(new Date(time), override, locale, timeZone);

    const options = { ...UNIT_DATE_OPTIONS[unit], ...(override ?? {}), ...(timeZone ? { timeZone } : {}) };

    return dateFormatter(locale, options).format(time);
}

/**
 * The tokens a date pattern string understands. A pattern is a convenience for the common cases;
 * anything beyond it should pass `Intl.DateTimeFormatOptions` instead, which handles calendars and
 * numeral systems properly.
 */
const PATTERN_TOKENS = /yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|a/g;

/** Formats a date against a token pattern, resolving each token through `Intl` for the locale. */
export function formatWithPattern(date: Date, pattern: string, locale?: string, timeZone?: string): string {
    const zone = timeZone ? { timeZone } : {};
    const part = (options: Intl.DateTimeFormatOptions) => dateFormatter(locale, { ...options, ...zone }).format(date);

    return pattern.replace(PATTERN_TOKENS, (token) => {
        switch (token) {
            case 'yyyy':
                return part({ year: 'numeric' });
            case 'yy':
                return part({ year: '2-digit' });
            case 'MMMM':
                return part({ month: 'long' });
            case 'MMM':
                return part({ month: 'short' });
            case 'MM':
                return part({ month: '2-digit' });
            case 'M':
                return part({ month: 'numeric' });
            case 'dd':
                return part({ day: '2-digit' });
            case 'd':
                return part({ day: 'numeric' });
            case 'HH':
                return part({ hour: '2-digit', hour12: false });
            case 'H':
                return part({ hour: 'numeric', hour12: false });
            case 'hh':
                return part({ hour: '2-digit', hour12: true }).replace(/\s*[^\d\s].*$/, '');
            case 'h':
                return part({ hour: 'numeric', hour12: true }).replace(/\s*[^\d\s].*$/, '');
            case 'mm':
                return part({ minute: '2-digit' }).padStart(2, '0');
            case 'm':
                return part({ minute: 'numeric' });
            case 'ss':
                return part({ second: '2-digit' }).padStart(2, '0');
            case 's':
                return part({ second: 'numeric' });
            case 'a':
                return part({ hour: 'numeric', hour12: true }).replace(/^[\d\s]*/, '');
            default:
                return token;
        }
    });
}

/**
 * The default numeric tick format: it abbreviates large magnitudes so an axis reads `1.2M` rather
 * than `1200000`, and keeps small values at full precision.
 *
 * Compact notation is used only where the locale actually abbreviates at that magnitude. Not every
 * locale does: German renders 5000 compactly as `5000`, which is not shorter than the plain form
 * *and* has lost the thousands separator that `5.000` would have had. Checking whether the compact
 * output still reads as bare digits catches that, so an axis never trades a grouped number for an
 * ungrouped one of the same length.
 */
export function formatNumberTick(value: number, locale?: string, options?: Intl.NumberFormatOptions): string {
    if (options) return numberFormatter(locale, options).format(value);

    const magnitude = Math.abs(value);
    // Three significant digits is enough for an axis label, and dropping the trailing zeros keeps
    // 0.5 from rendering as 0.500.
    const plain = () => numberFormatter(locale, { maximumFractionDigits: 3 }).format(value);

    if (magnitude < 1000) return plain();

    const compact = numberFormatter(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

    return compact === String(Math.round(value)) ? plain() : compact;
}

/**
 * Formats whatever a tick turns out to be. A category tick is already its own label; a numeric or
 * date tick goes through the matching formatter.
 */
export function formatTickValue(value: TickValue, locale?: string, options?: Intl.NumberFormatOptions): string {
    if (typeof value === 'string') return value;
    if (value instanceof Date) return dateFormatter(locale, { dateStyle: 'medium' }).format(value);

    return formatNumberTick(value, locale, options);
}

/** Formats a percentage for a data label or a tooltip. */
export function formatPercentage(fraction: number, locale?: string, digits = 1): string {
    return numberFormatter(locale, { style: 'percent', maximumFractionDigits: digits }).format(fraction);
}

/** Resolves the text direction actually in force, following the document when asked to. */
export function resolveDirection(dir: 'auto' | 'ltr' | 'rtl' | undefined, host: Element | null): 'ltr' | 'rtl' {
    if (dir === 'ltr' || dir === 'rtl') return dir;

    if (host && typeof getComputedStyle === 'function') {
        return getComputedStyle(host).direction === 'rtl' ? 'rtl' : 'ltr';
    }

    return 'ltr';
}
