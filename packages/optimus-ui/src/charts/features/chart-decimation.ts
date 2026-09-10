/**
 * ChartDecimation.
 *
 * Downsampling is a decision about the chart, not about the data: the rows are untouched, and each
 * kept point still carries its own index so a tooltip finds the original row. That is why it is a
 * part rather than a transform the caller applies before binding -- removing the element gives back
 * every point without touching the data source.
 */
import { DestroyRef, Directive, computed, inject, input, numberAttribute } from '@angular/core';
import type { ChartDecimationProps, DecimationAlgorithm } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * Reduces a large series to a representative sample before it is drawn.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-decimation',
    standalone: true,
    host: { style: 'display: none' }
})
export class ChartDecimation {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Which downsampler to use. `'lttb'` keeps the shape, `'min-max'` keeps the extremes and
     * `'k-means'` keeps the clusters.
     * @defaultValue 'lttb'
     * @group Props
     */
    readonly algorithm = input<DecimationAlgorithm>('lttb');
    /**
     * How many points to keep.
     * @defaultValue 500
     * @group Props
     */
    readonly samples = input(500, { transform: numberAttribute });
    /**
     * Point count above which decimation kicks in. Below it the series is drawn in full.
     * @defaultValue 1000
     * @group Props
     */
    readonly threshold = input(1000, { transform: numberAttribute });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartDecimationProps>(() => ({
        algorithm: this.algorithm(),
        samples: this.samples(),
        threshold: this.threshold()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'decimation', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}
