/**
 * ChartHeatmap: a grid of two categorical dimensions with the value carried by colour.
 *
 * It is the one cartesian series whose *both* axes are band scales and neither measures the value.
 * The colour scale is, in effect, its value axis -- which is why `ChartColorLegend` rather than
 * `ChartLegend` is what makes one readable.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { BorderAlign, BorderJoinStyle, DashAccessor, FieldAccessor, FillValue, HeatmapCellContext, HeatmapSeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';
import { ChartHeatmapCellDef } from '../features/chart-defs';

/**
 * A heatmap series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-heatmap',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartHeatmap }]
})
export class ChartHeatmap<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Inline `ChartItem` children, which stand in for a `data` array.
     *
     * `data` wins when both are present: an explicit array is the more deliberate statement, and
     * silently merging the two would make the order of the result depend on nothing visible.
     */
    protected readonly items = createItemRegistry();

    /** @internal Registers an inline item. Called through `CHART_ITEM_HOST`. */
    readonly registerItem = this.items.registerItem;

    /** A projected template that replaces the content of each cell. */
    readonly cellDef = contentChild(ChartHeatmapCellDef);

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Field name for the x axis category.
     * @defaultValue 'column'
     * @group Props
     */
    readonly categoryXField = input<string | undefined>(undefined);
    /**
     * Field name for the y axis category.
     * @defaultValue 'row'
     * @group Props
     */
    readonly categoryYField = input<string | undefined>(undefined);
    /**
     * Field name for the numeric value that drives the cell colour.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<string | undefined>(undefined);
    /**
     * A single colour whose opacity is mapped to the value. Used when no colorRange is set.
     * @group Props
     */
    readonly color = input<FillValue | undefined>(undefined);
    /**
     * Multi-stop colour gradient. Without colorScale, the breakpoints come from the data extremes.
     * @group Props
     */
    readonly colorRange = input<string[] | undefined>(undefined);
    /**
     * Explicit breakpoints for the colour interpolation, one per colorRange stop.
     * @group Props
     */
    readonly colorScale = input<number[] | undefined>(undefined);
    /**
     * Fill colour for null or missing cells.
     * @group Props
     */
    readonly nullColor = input<string | undefined>(undefined);
    /**
     * Override the minimum value used for colour mapping.
     * @group Props
     */
    readonly min = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Override the maximum value used for colour mapping.
     * @group Props
     */
    readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Cell fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Gap between cells in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly spacing = input(1, { transform: numberAttribute });
    /**
     * Corner radius of the cells in pixels.
     * @defaultValue 0
     * @group Props
     */
    readonly borderRadius = input(0, { transform: numberAttribute });
    /**
     * Cell border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Cell border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Cell border dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Cell border dash phase offset.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Cell border path join style.
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle | undefined>(undefined);
    /**
     * Border alignment relative to the cell edge.
     * @defaultValue 'center'
     * @group Props
     */
    readonly borderAlign = input(<BorderAlign>'center');
    /**
     * Show null cells with a dashed border background, so a hole reads as no reading rather than as a reading of
     * zero.
     * @defaultValue true
     * @group Props
     */
    readonly showEmptyCells = input(true, { transform: booleanAttribute });
    /**
     * Custom cell content renderer.
     * @group Props
     */
    readonly renderContent = input<((context: HeatmapCellContext<T>) => unknown) | undefined>(undefined);
    /**
     * Per-cell fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Explicit draw order, which overrides the registration order.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Per-cell border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Dataset label, used in the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field name giving each cell a stable identity, used for animation matching.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('heatmap');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<HeatmapSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryXField: this.categoryXField(),
        categoryYField: this.categoryYField(),
        valueField: this.valueField(),
        color: this.color() ?? this.items.overrides().color,
        colorRange: this.colorRange(),
        colorScale: this.colorScale(),
        nullColor: this.nullColor(),
        min: this.min(),
        max: this.max(),
        opacity: this.opacity(),
        spacing: this.spacing(),
        borderRadius: this.borderRadius(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderJoinStyle: this.borderJoinStyle(),
        borderAlign: this.borderAlign(),
        showEmptyCells: this.showEmptyCells(),
        renderContent: this.renderContent(),
        hoverColor: this.hoverColor(),
        order: this.order(),
        hoverBorderColor: this.hoverBorderColor(),
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ heatmapCell: this.cellDef()?.template ?? null })),
            id: this.datasetId,
            type: 'heatmap',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId))
        });

        this.destroyRef.onDestroy(remove);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
