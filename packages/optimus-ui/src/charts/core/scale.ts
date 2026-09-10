/**
 * Scales map data values to pixel positions. Every chart family goes through one of these,
 * so the geometry of a bar, a line vertex and an axis tick all agree by construction.
 */
import type { BandScale, LinearScale, TickValue, TimeUnit } from '@openng/optimus-ui/types/charts';

/** Pixel range a scale projects onto, in the order the renderer draws it. */
export interface ScaleRange {
    start: number;
    end: number;
}

/**
 * Categorical scale: one band per category, with padding expressed as a fraction of the step.
 * `outerPadding` trims the leading and trailing half-gap so the first band does not hug the axis.
 */
export function bandScale(categories: readonly string[], range: ScaleRange, innerPadding = 0.2, outerPadding = 0.1): BandScale {
    const count = Math.max(categories.length, 1);
    const span = range.end - range.start;
    /*
     * The bands are laid out along the range's magnitude and then placed in its direction.
     *
     * Doing the arithmetic on the signed span instead produced a negative step and a negative
     * bandwidth on any inverted range -- which is every y axis, since screen y grows downward and a
     * value axis runs bottom to top. Nothing noticed while only the x band's width was ever read;
     * a heatmap reads the y band's too, and every one of its cells came out zero-height.
     */
    const direction = span < 0 ? -1 : 1;
    const length = Math.abs(span);
    const step = length / (count + 2 * outerPadding - innerPadding);
    const bandwidth = Math.max(step * (1 - innerPadding), 0);
    const offset = range.start + direction * step * outerPadding;
    const index = new Map<string, number>();

    categories.forEach((category, i) => {
        // First occurrence wins so duplicated categories collapse onto one band.
        if (!index.has(category)) index.set(category, i);
    });

    /** The band's leading edge, in range order. */
    const edgeOf = (i: number) => offset + direction * i * step;

    return {
        type: 'band',
        domain: [...categories],
        range: [range.start, range.end],
        bandwidth,
        step,
        scale: (value: unknown) => {
            const i = index.get(String(value));

            return i == null ? Number.NaN : edgeOf(i) + (direction * bandwidth) / 2;
        },
        bandStart: (value: unknown) => {
            const i = index.get(String(value));

            if (i == null) return Number.NaN;

            const edge = edgeOf(i);

            // The smaller coordinate of the band, whichever way the range runs, so a caller can
            // draw a rectangle from it without knowing the direction.
            return direction > 0 ? edge : edge - bandwidth;
        },
        indexAt: (pixel: number) => {
            const raw = Math.floor((direction * (pixel - offset) + step * innerPadding * 0.5) / step);

            return Math.min(Math.max(raw, 0), count - 1);
        },
        invert: (pixel: number) => {
            const raw = Math.floor((direction * (pixel - offset) + step * innerPadding * 0.5) / step);
            const i = Math.min(Math.max(raw, 0), count - 1);

            return categories[i];
        }
    };
}

/** Continuous linear scale. A zero-width domain is widened so a flat series still renders mid-plot. */
export function linearScale(domainMin: number, domainMax: number, range: ScaleRange): LinearScale {
    let min = domainMin;
    let max = domainMax;

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        min = 0;
        max = 1;
    }

    if (min === max) {
        const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;

        min -= pad;
        max += pad;
    }

    const span = max - min;
    const pixelSpan = range.end - range.start;

    return {
        type: 'linear',
        domain: [min, max],
        range: [range.start, range.end],
        scale: (value: unknown) => {
            const n = toNumber(value);

            return n == null ? Number.NaN : range.start + ((n - min) / span) * pixelSpan;
        },
        invert: (pixel: number) => min + ((pixel - range.start) / pixelSpan) * span
    };
}

/**
 * Logarithmic scale. Non-positive bounds are clamped up to the smallest representable decade
 * rather than rejected, because a log axis on data that touches zero is a common accident.
 */
export function logScale(domainMin: number, domainMax: number, range: ScaleRange, base = 10): LinearScale {
    const min = domainMin > 0 ? domainMin : 1e-6;
    const max = domainMax > min ? domainMax : min * base;
    const logBase = Math.log(base);
    const logMin = Math.log(min) / logBase;
    const logMax = Math.log(max) / logBase;
    const span = logMax - logMin;
    const pixelSpan = range.end - range.start;

    return {
        type: 'logarithmic',
        domain: [min, max],
        range: [range.start, range.end],
        scale: (value: unknown) => {
            const n = toNumber(value);

            if (n == null || n <= 0) return Number.NaN;

            return range.start + ((Math.log(n) / logBase - logMin) / span) * pixelSpan;
        },
        invert: (pixel: number) => Math.pow(base, logMin + ((pixel - range.start) / pixelSpan) * span)
    };
}

/** Time scale. Timestamps are linear underneath; only the tick generator and formatter differ. */
export function timeScale(domainMin: number | Date, domainMax: number | Date, range: ScaleRange): LinearScale {
    const min = domainMin instanceof Date ? domainMin.getTime() : domainMin;
    const max = domainMax instanceof Date ? domainMax.getTime() : domainMax;
    const linear = linearScale(min, max, range);

    return {
        ...linear,
        type: 'time',
        scale: (value: unknown) => linear.scale(value instanceof Date ? value.getTime() : value)
    };
}

/** Reads a numeric value out of the loosely typed data a chart is handed. */
export function toNumber(value: unknown): number | null {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value instanceof Date) return value.getTime();

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

/** Milliseconds in each time unit, used to pick a tick granularity for a visible range. */
export const TIME_UNIT_MS: Record<TimeUnit, number> = {
    millisecond: 1,
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_629_800_000,
    quarter: 7_889_400_000,
    year: 31_557_600_000
};

/** Widens a numeric domain so the extremes are not pinned to the plot edge. */
export function padDomain(min: number, max: number, fraction: number): [number, number] {
    const span = max - min || Math.abs(max) || 1;
    const pad = span * fraction;

    return [min - pad, max + pad];
}

/** True when a tick value carries no meaningful position on the given scale. */
export function isDrawable(pixel: number): boolean {
    return Number.isFinite(pixel);
}

/** Collects the ordered union of categories across every series feeding one axis. */
export function unionCategories(lists: readonly (readonly string[])[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const list of lists) {
        for (const category of list) {
            if (seen.has(category)) continue;
            seen.add(category);
            out.push(category);
        }
    }

    return out;
}

/** Sorts tick values so a time or linear axis always renders left to right. */
export function sortTicks(values: readonly TickValue[]): TickValue[] {
    return [...values].sort((a, b) => {
        const na = toNumber(a);
        const nb = toNumber(b);

        if (na == null || nb == null) return 0;

        return na - nb;
    });
}
