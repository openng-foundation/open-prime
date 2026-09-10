/**
 * The series containers: `ChartStacked`, `ChartWaterfall`, `ChartOverlap` and `ChartRange`.
 *
 * Each one is a wrapper whose only job is to tell its children what relationship they are in. That
 * is why they take almost no inputs: the relationship *is* the configuration, and expressing it as
 * nesting keeps the template readable in a way a `stack: 'group-a'` string on every series would
 * not.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, numberAttribute, signal } from '@angular/core';
import type { FillValue } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_OVERLAP, CHART_RANGE, CHART_STACK, CHART_WATERFALL, nextGroupId, type OverlapContext, type RangeContext, type StackContext, type WaterfallContext } from '../charts-registry';

/**
 * Stacks the series it wraps. On bar and line series that means segments piled on one another; on
 * pie and radar it means concentric rings, where only `gap` and `id` apply.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-stacked',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_STACK, useFactory: () => inject(ChartStacked).stackContext }]
})
export class ChartStacked {
    /**
     * `'normal'` stacks absolute values, with negatives stacking downward; `'percent'` normalizes
     * each category to 100%.
     * @defaultValue 'normal'
     * @group Props
     */
    readonly mode = input<'normal' | 'percent'>('normal');
    /**
     * Pixel gap between the stacked segments.
     * @defaultValue 0
     * @group Props
     */
    readonly gap = input(0, { transform: numberAttribute });
    /**
     * Stack group identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);

    /** The group id, generated once so the children keep the same stack across input changes. */
    readonly stackId = this.id() ?? nextGroupId('stack');

    /** What the wrapped series inject. */
    readonly stackContext: StackContext = {
        id: this.stackId,
        mode: computed(() => this.mode()),
        gap: computed(() => this.gap())
    };
}

/**
 * Turns the bar series it wraps into a waterfall: each bar starts where the previous one ended.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-waterfall',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_WATERFALL, useFactory: () => inject(ChartWaterfall).waterfallContext }]
})
export class ChartWaterfall {
    /**
     * Field name that resolves truthy on the summary bars. A total bar resets from zero and shows
     * the cumulative sum.
     * @group Props
     */
    readonly totalField = input<string | undefined>(undefined);

    /** What the wrapped series inject. */
    readonly waterfallContext: WaterfallContext = {
        totalField: computed(() => this.totalField())
    };
}

/**
 * Layers the series it wraps at the same category position rather than side by side. Render order
 * is depth: the first child draws widest and the last narrowest, so each stays visible.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-overlap',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_OVERLAP, useFactory: () => inject(ChartOverlap).overlapContext }]
})
export class ChartOverlap {
    private readonly claimed = signal(0);

    /** The group id, generated once. */
    readonly overlapId = nextGroupId('overlap');

    /** What the wrapped series inject. */
    readonly overlapContext: OverlapContext = {
        id: this.overlapId,
        claimDepth: () => {
            const depth = this.claimed();

            this.claimed.set(depth + 1);

            return computed(() => ({ depth, total: this.claimed() }));
        }
    };
}

/**
 * Pairs the two line series it wraps into a filled band. The first child is the upper edge and the
 * second the lower, which is what a high/low range or a confidence interval wants.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-range',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_RANGE, useFactory: () => inject(ChartRange).rangeContext }]
})
export class ChartRange {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    private edges = 0;

    /**
     * Single fill colour for the band. Omit for dual-colour mode, where each child's own line
     * colour fills the region in which that series is on top.
     * @group Props
     */
    readonly color = input<FillValue | undefined>(undefined);
    /**
     * Fill opacity for the band.
     * @defaultValue 0.3
     * @group Props
     */
    readonly fillOpacity = input(0.3, { transform: numberAttribute });
    /**
     * Range group identifier.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);

    /** The group id, which an explicit `id` replaces. */
    readonly rangeId = this.id() ?? nextGroupId('range');

    /** The group's current inputs, as the root reads them when it fills the band. */
    readonly props = computed(() => ({ color: this.color(), fillOpacity: this.fillOpacity(), id: this.rangeId }));

    /** What the wrapped series inject. */
    readonly rangeContext: RangeContext = {
        id: this.rangeId,
        claimEdge: () => {
            // Registration order decides which edge a series is, so the template reads top-down.
            const edge = this.edges === 0 ? ('upper' as const) : ('lower' as const);

            this.edges += 1;

            return edge;
        }
    };

    constructor() {
        if (!this.context) return;

        // Registered under a suffixed type, because a chart can hold several bands and each one
        // fills with its own colour.
        const remove = this.context.registerFeature({ type: `range:${this.rangeId}`, props: this.props as never });

        this.destroyRef.onDestroy(remove);
    }
}
