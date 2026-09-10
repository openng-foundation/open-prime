/**
 * Tick generation. A tick algorithm has one job: land on numbers a reader recognises. Dividing a
 * domain into `n` equal parts gives ticks like 3.7143, so the numeric generator snaps the step to
 * 1, 2, 5 or 10 times a power of ten, and the time generator snaps to calendar boundaries.
 */
import type { TimeUnit } from '@openng/optimus-ui/types/charts';
import { TIME_UNIT_MS } from './scale';

/**
 * Thresholds for snapping a step to 1, 2, 5 or 10 times a power of ten.
 *
 * They are geometric means -- sqrt(50), sqrt(10), sqrt(2) -- so a raw step snaps to the *nearest*
 * nice value rather than up to the next one. Rounding up sounds safer but reads worse: a span of 20
 * over 8 ticks is 2.5, and rounding up gives labels of 40, 42.5, 45 where the nearest value gives
 * 40, 42, 44. Half-steps on integer data look like a mistake.
 */
const STEP_THRESHOLDS: [number, number][] = [
    [Math.sqrt(50), 10],
    [Math.sqrt(10), 5],
    [Math.sqrt(2), 2]
];

/** Snaps a raw step to the nearest recognisable number. */
export function niceStep(rawStep: number): number {
    if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;

    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;

    for (const [threshold, step] of STEP_THRESHOLDS) {
        if (normalized >= threshold) return step * magnitude;
    }

    return magnitude;
}

/**
 * Generates linear ticks across a domain. The returned ticks cover the domain and may sit slightly
 * outside it, which is what lets an axis end on a round number.
 */
export function linearTicks(min: number, max: number, count = 6): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
    if (min === max) return [min];

    const step = niceStep((max - min) / Math.max(count, 1));
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];

    // Accumulating by multiplication rather than by repeated addition keeps floating-point drift
    // from turning 0.3 into 0.30000000000000004 on the label.
    const steps = Math.round((end - start) / step);

    for (let i = 0; i <= steps; i++) {
        ticks.push(roundToStep(start + i * step, step));
    }

    return ticks;
}

/** Trims the floating-point tail a tick picks up, to the precision the step justifies. */
export function roundToStep(value: number, step: number): number {
    const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);

    return Number(value.toFixed(Math.min(decimals, 20)));
}

/**
 * Rounds a domain outward to the tick step, so the axis ends on a labelled tick rather than mid-gap.
 */
export function niceDomain(min: number, max: number, count = 6): [number, number] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min, max];

    const step = niceStep((max - min) / Math.max(count, 1));

    return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
}

/** Generates logarithmic ticks, one per decade, with intermediate ticks on a short domain. */
export function logTicks(min: number, max: number, base = 10): number[] {
    const lo = min > 0 ? min : 1e-6;
    const hi = max > lo ? max : lo * base;
    const startExp = Math.floor(Math.log(lo) / Math.log(base));
    const endExp = Math.ceil(Math.log(hi) / Math.log(base));
    const decades = endExp - startExp;
    const ticks: number[] = [];

    for (let exp = startExp; exp <= endExp; exp++) {
        const decade = Math.pow(base, exp);

        ticks.push(decade);

        // Only subdivide when there is room for the labels; across many decades the minor ticks
        // would collide into an unreadable smear.
        if (decades <= 3) {
            for (let m = 2; m < base; m++) {
                const value = decade * m;

                if (value < hi) ticks.push(value);
            }
        }
    }

    return ticks.filter((t) => t >= lo / base && t <= hi * base).sort((a, b) => a - b);
}

/** The calendar steps a time axis may snap to, in ascending order. */
const TIME_STEPS: [TimeUnit, number][] = [
    ['millisecond', 1],
    ['millisecond', 10],
    ['millisecond', 100],
    ['second', 1],
    ['second', 5],
    ['second', 15],
    ['second', 30],
    ['minute', 1],
    ['minute', 5],
    ['minute', 15],
    ['minute', 30],
    ['hour', 1],
    ['hour', 3],
    ['hour', 6],
    ['hour', 12],
    ['day', 1],
    ['day', 2],
    ['week', 1],
    ['month', 1],
    ['month', 3],
    ['year', 1],
    ['year', 5],
    ['year', 10]
];

/** Picks the smallest calendar step that keeps the tick count near the target. */
export function pickTimeStep(spanMs: number, targetCount: number): { unit: TimeUnit; step: number } {
    const ideal = spanMs / Math.max(targetCount, 1);

    for (const [unit, step] of TIME_STEPS) {
        if (TIME_UNIT_MS[unit] * step >= ideal) return { unit, step };
    }

    const [unit, step] = TIME_STEPS[TIME_STEPS.length - 1];

    return { unit, step };
}

/**
 * Snaps a timestamp down to a calendar boundary. Months and years go through the `Date` fields
 * rather than through millisecond arithmetic, because a month is not a fixed number of milliseconds
 * and rounding by an average would drift a January tick into December.
 */
export function floorToUnit(time: number, unit: TimeUnit, step: number): number {
    const date = new Date(time);

    switch (unit) {
        case 'year': {
            const year = Math.floor(date.getFullYear() / step) * step;

            return new Date(year, 0, 1).getTime();
        }
        case 'quarter': {
            const quarter = Math.floor(date.getMonth() / 3) * 3;

            return new Date(date.getFullYear(), quarter, 1).getTime();
        }
        case 'month': {
            const month = Math.floor(date.getMonth() / step) * step;

            return new Date(date.getFullYear(), month, 1).getTime();
        }
        case 'week': {
            const day = date.getDay();
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);

            return start.getTime();
        }
        case 'day':
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        default: {
            const size = TIME_UNIT_MS[unit] * step;

            return Math.floor(time / size) * size;
        }
    }
}

/** Advances a timestamp by one calendar step, in the same field-aware way. */
export function addUnit(time: number, unit: TimeUnit, step: number): number {
    const date = new Date(time);

    switch (unit) {
        case 'year':
            return new Date(date.getFullYear() + step, date.getMonth(), date.getDate()).getTime();
        case 'quarter':
            return new Date(date.getFullYear(), date.getMonth() + 3 * step, date.getDate()).getTime();
        case 'month':
            return new Date(date.getFullYear(), date.getMonth() + step, date.getDate()).getTime();
        default:
            return time + TIME_UNIT_MS[unit] * step;
    }
}

/** Generates time ticks across a range, snapped to calendar boundaries. */
export function timeTicks(min: number, max: number, count = 6, forced?: { unit?: TimeUnit; step?: number }): number[] {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];

    const picked = pickTimeStep(max - min, count);
    const unit = forced?.unit ?? picked.unit;
    const step = forced?.step ?? (forced?.unit ? 1 : picked.step);
    const ticks: number[] = [];

    let cursor = floorToUnit(min, unit, step);

    if (cursor < min) cursor = addUnit(cursor, unit, step);

    // A hard ceiling on the loop: a pathological unit and range combination should degrade to
    // fewer ticks rather than hang the render.
    for (let guard = 0; cursor <= max && guard < 1000; guard++) {
        ticks.push(cursor);
        cursor = addUnit(cursor, unit, step);
    }

    return ticks;
}

/**
 * Thins a list of tick positions so no two labels sit closer than `minDistance`. The first tick is
 * always kept, and the last is kept in place of its predecessor when the two would collide, so an
 * axis does not lose its end label to the skip.
 */
export function skipCollisions<T>(ticks: readonly T[], positionOf: (tick: T) => number, minDistance: number): T[] {
    if (ticks.length <= 1 || minDistance <= 0) return [...ticks];

    const kept: T[] = [ticks[0]];
    let lastPosition = positionOf(ticks[0]);

    for (let i = 1; i < ticks.length; i++) {
        const position = positionOf(ticks[i]);

        if (Math.abs(position - lastPosition) >= minDistance) {
            kept.push(ticks[i]);
            lastPosition = position;
            continue;
        }

        if (i === ticks.length - 1 && kept.length > 1) {
            kept[kept.length - 1] = ticks[i];
            lastPosition = position;
        }
    }

    return kept;
}
