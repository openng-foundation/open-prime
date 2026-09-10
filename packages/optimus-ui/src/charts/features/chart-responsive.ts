/**
 * ChartResponsive.
 *
 * A chart is sized by its container, not by the viewport, so two charts side by side on a wide
 * screen are both narrow and a CSS media query cannot tell. That is the whole reason this exists as
 * a chart part: the rules are evaluated against the chart's own measured box.
 *
 * Auto-adaptive scaling is on without this element -- the title, the caption and the axis labels
 * already follow the tier. What the element adds is the rules, the breakpoint overrides, and the
 * ability to switch the adaptation off.
 */
import { DestroyRef, Directive, booleanAttribute, computed, inject, input } from '@angular/core';
import type { ChartResponsiveProps, ResponsiveBreakpoints, ResponsiveRule } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * Applies size-conditional overrides to the chart's parts.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-responsive',
    standalone: true,
    host: { style: 'display: none' }
})
export class ChartResponsive {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Condition-based overrides, evaluated against the chart container's dimensions.
     * @group Props
     */
    readonly rules = input<ResponsiveRule[] | undefined>(undefined);
    /**
     * Overrides the tier thresholds the auto-adaptive scaling uses.
     * @group Props
     */
    readonly breakpoints = input<Partial<ResponsiveBreakpoints> | undefined>(undefined);
    /**
     * Switches font and layout scaling off, locking the chart to the `lg` tier defaults.
     * @defaultValue false
     * @group Props
     */
    readonly disableAutoAdaptive = input(false, { transform: booleanAttribute });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartResponsiveProps>(() => ({
        rules: this.rules(),
        breakpoints: this.breakpoints(),
        disableAutoAdaptive: this.disableAutoAdaptive()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'responsive', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}

/**
 * The overrides in force at the chart's current size.
 *
 * Every matching rule is applied rather than the first, with the last one winning a key it shares
 * with an earlier rule. That is what makes a set of rules composable: a narrow-and-short rule can
 * add to what the narrow rule already said instead of replacing it wholesale.
 */
export function activeOverrides(rules: readonly ResponsiveRule[] | undefined, width: number, height: number): Record<string, Record<string, unknown>> {
    if (!rules?.length) return {};

    const merged: Record<string, Record<string, unknown>> = {};

    for (const rule of rules) {
        if (rule.maxWidth != null && width > rule.maxWidth) continue;
        if (rule.minWidth != null && width < rule.minWidth) continue;
        if (rule.maxHeight != null && height > rule.maxHeight) continue;
        if (rule.minHeight != null && height < rule.minHeight) continue;

        for (const [target, props] of Object.entries(rule.props ?? {})) {
            merged[target] = { ...merged[target], ...props };
        }
    }

    return merged;
}
