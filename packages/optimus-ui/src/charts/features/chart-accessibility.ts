/**
 * ChartAccessibility.
 *
 * A chart is a picture of numbers, and a picture is where a screen reader stops. The description
 * and the data table that give it the numbers are published by the root, always -- accessibility is
 * not opt-in.
 *
 * So this element renders nothing. It registers the options that surface reads: the prose, the
 * verbosity, the table's size, the patterns, and the keyboard navigation between points. Adding it
 * takes control of the output rather than switching it on.
 */
import { DestroyRef, Directive, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import type { ChartAccessibilityProps, DataTableCellContext, KeyboardNavigationConfig, PointDescriptionContext, SeriesDescriptionContext } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * Screen reader support and keyboard navigation for the chart's data.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-accessibility',
    standalone: true,
    host: { style: 'display: none' }
})
export class ChartAccessibility {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Whether the accessible description and table are published.
     * @defaultValue true
     * @group Props
     */
    readonly enabled = input(true, { transform: booleanAttribute });
    /**
     * Fill the marks with patterns as well as colour, so the series stay distinguishable without it.
     * @defaultValue false
     * @group Props
     */
    readonly patterns = input(false, { transform: booleanAttribute });
    /**
     * The chart's description, which replaces the generated one.
     * @group Props
     */
    readonly description = input<string | undefined>(undefined);
    /**
     * How the chart type is described, for the generated prose.
     * @group Props
     */
    readonly typeDescription = input<string | undefined>(undefined);
    /**
     * Heading level for the chart's landmark.
     * @defaultValue 'h3'
     * @group Props
     */
    readonly headingLevel = input<'h2' | 'h3' | 'h4' | 'h5' | 'h6'>('h3');
    /**
     * Point count above which individual points stop being described one by one.
     * @defaultValue 30
     * @group Props
     */
    readonly pointDescriptionThreshold = input(30, { transform: numberAttribute });
    /**
     * Maximum rows in the published data table.
     * @defaultValue 100
     * @group Props
     */
    readonly dataTableMaxRows = input(100, { transform: numberAttribute });
    /**
     * Formats one table cell.
     * @group Props
     */
    readonly dataTableCellFormatter = input<((context: DataTableCellContext) => string) | undefined>(undefined);
    /**
     * Formats one point's description.
     * @group Props
     */
    readonly pointDescriptionFormatter = input<((context: PointDescriptionContext) => string) | undefined>(undefined);
    /**
     * Formats one series' description.
     * @group Props
     */
    readonly seriesDescriptionFormatter = input<((context: SeriesDescriptionContext) => string) | undefined>(undefined);
    /**
     * How much of the chart is announced as a landmark.
     * @defaultValue 'all'
     * @group Props
     */
    readonly landmarkVerbosity = input<'all' | 'chart' | 'disabled'>('all');
    /**
     * Keyboard navigation between data points.
     * @group Props
     */
    readonly keyboardNavigation = input<KeyboardNavigationConfig | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartAccessibilityProps>(() => ({
        enabled: this.enabled(),
        patterns: this.patterns(),
        description: this.description(),
        typeDescription: this.typeDescription(),
        headingLevel: this.headingLevel(),
        pointDescriptionThreshold: this.pointDescriptionThreshold(),
        dataTableMaxRows: this.dataTableMaxRows(),
        dataTableCellFormatter: this.dataTableCellFormatter(),
        pointDescriptionFormatter: this.pointDescriptionFormatter(),
        seriesDescriptionFormatter: this.seriesDescriptionFormatter(),
        landmarkVerbosity: this.landmarkVerbosity(),
        keyboardNavigation: this.keyboardNavigation()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'accessibility', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}
