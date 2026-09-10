/**
 * Stacking and the waterfall running total.
 *
 * Stacking is a transform on values, not a rendering mode: each series ends up with a base and a
 * top per category, and the bar, area and polar renderers all draw between those two numbers.
 */
import type { StackingMode } from '@openng/optimus-ui/types/charts';

/** One series' values, keyed by category. */
export interface StackInput {
    /**
     * Dataset id.
     */
    id: string;
    /**
     * Position in the stack, where 0 is the bottom.
     */
    order: number;
    /**
     * Values by category. A missing category is a hole, not a zero.
     */
    values: Map<string, number | null>;
}

/** One series' resolved span per category. */
export interface StackSpan {
    /**
     * Value the segment starts at.
     */
    base: number;
    /**
     * Value the segment ends at.
     */
    top: number;
}

/** The stacked result, keyed by dataset then category. */
export type StackResult = Map<string, Map<string, StackSpan>>;

/**
 * Stacks a set of series.
 *
 * Positive and negative values are accumulated separately, so a series with mixed signs stacks
 * upward from zero and downward from zero rather than cancelling out — a bar of +10 on top of -10
 * has to stay visible as two bars, not vanish into a zero-height nothing.
 */
export function stackSeries(inputs: readonly StackInput[], categories: readonly string[], mode: StackingMode = 'normal'): StackResult {
    const result: StackResult = new Map();
    const ordered = [...inputs].sort((a, b) => a.order - b.order);

    for (const input of ordered) result.set(input.id, new Map());

    if (mode === 'none') {
        for (const input of ordered) {
            const spans = result.get(input.id)!;

            for (const category of categories) {
                const value = input.values.get(category);

                if (value == null) continue;
                spans.set(category, { base: 0, top: value });
            }
        }

        return result;
    }

    for (const category of categories) {
        let positiveTotal = 0;
        let negativeTotal = 0;

        if (mode === 'percent') {
            // The denominator is the sum of magnitudes, so a category of +30/-70 normalizes to
            // 30% and 70% of the bar rather than to a 100% span of -40.
            for (const input of ordered) {
                const value = input.values.get(category);

                if (value == null) continue;
                if (value >= 0) positiveTotal += value;
                else negativeTotal += Math.abs(value);
            }
        }

        let positiveCursor = 0;
        let negativeCursor = 0;

        for (const input of ordered) {
            const raw = input.values.get(category);

            if (raw == null) continue;

            const spans = result.get(input.id)!;

            if (raw >= 0) {
                const value = mode === 'percent' ? (positiveTotal === 0 ? 0 : (raw / (positiveTotal + negativeTotal)) * 100) : raw;

                spans.set(category, { base: positiveCursor, top: positiveCursor + value });
                positiveCursor += value;
            } else {
                const magnitude = Math.abs(raw);
                const value = mode === 'percent' ? (negativeTotal === 0 ? 0 : (magnitude / (positiveTotal + negativeTotal)) * 100) : magnitude;

                spans.set(category, { base: negativeCursor, top: negativeCursor - value });
                negativeCursor -= value;
            }
        }
    }

    return result;
}

/** One step of a waterfall. */
export interface WaterfallStep {
    /**
     * Value the bar starts at.
     */
    base: number;
    /**
     * Value the bar ends at.
     */
    top: number;
    /**
     * Whether this bar is a summary rather than a delta.
     */
    isTotal: boolean;
    /**
     * Whether the delta is a decrease.
     */
    isNegative: boolean;
}

/**
 * Turns a series of deltas into a waterfall.
 *
 * A bar flagged by `totalField` is a summary: it spans from zero to the running total rather than
 * continuing the chain, which is what makes a "Net" or "Total" column read as an absolute figure
 * instead of one more step.
 */
export function waterfallSteps(values: readonly (number | null)[], isTotal: readonly boolean[]): WaterfallStep[] {
    const steps: WaterfallStep[] = [];
    let running = 0;

    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        // The total is checked before the null, not after: a summary row carries no delta of its
        // own, so a total with no value is the normal case rather than a gap.
        if (isTotal[i]) {
            // A total does not add to the chain; it reports where the chain has got to.
            steps.push({ base: 0, top: running, isTotal: true, isNegative: running < 0 });
            continue;
        }

        if (value == null) {
            steps.push({ base: running, top: running, isTotal: false, isNegative: false });
            continue;
        }

        const next = running + value;

        steps.push({ base: running, top: next, isTotal: false, isNegative: value < 0 });
        running = next;
    }

    return steps;
}

/** The domain a set of stacked spans needs, including zero. */
export function stackedDomain(result: StackResult): [number, number] {
    let min = 0;
    let max = 0;

    for (const spans of result.values()) {
        for (const span of spans.values()) {
            min = Math.min(min, span.base, span.top);
            max = Math.max(max, span.base, span.top);
        }
    }

    return [min, max];
}

/** The domain a set of waterfall steps needs. */
export function waterfallDomain(steps: readonly WaterfallStep[]): [number, number] {
    let min = 0;
    let max = 0;

    for (const step of steps) {
        min = Math.min(min, step.base, step.top);
        max = Math.max(max, step.base, step.top);
    }

    return [min, max];
}

/** How the values of one category are combined when sorting a bar chart by value. */
export type SortAggregate = 'sum' | 'max' | 'min' | 'first';

/** Combines the values several series contribute to one category. */
export function aggregateCategory(values: readonly (number | null)[], aggregate: SortAggregate = 'sum'): number {
    const numbers = values.filter((v): v is number => v != null);

    if (numbers.length === 0) return 0;

    switch (aggregate) {
        case 'max':
            return Math.max(...numbers);
        case 'min':
            return Math.min(...numbers);
        case 'first':
            return numbers[0];
        default:
            return numbers.reduce((total, value) => total + value, 0);
    }
}

/** Sorts categories by aggregate value or by label. */
export function sortCategories(categories: readonly string[], valueOf: (category: string) => number, order: 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc'): string[] {
    const sorted = [...categories];

    switch (order) {
        case 'value-asc':
            return sorted.sort((a, b) => valueOf(a) - valueOf(b));
        case 'value-desc':
            return sorted.sort((a, b) => valueOf(b) - valueOf(a));
        case 'label-asc':
            return sorted.sort((a, b) => a.localeCompare(b));
        default:
            return sorted.sort((a, b) => b.localeCompare(a));
    }
}
