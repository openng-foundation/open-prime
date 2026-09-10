/**
 * ChartBar: column, bar, grouped, stacked, waterfall, floating and variwide series.
 *
 * Orientation is chosen by which fields are bound rather than by a flag: `categoryXField` with
 * `valueYField` gives columns, `categoryYField` with `valueXField` gives horizontal bars. That
 * keeps the field names describing the axis they belong to instead of describing the default.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import type { NamedAnimationSpec, BarEdge, BarSeriesProps, BarShapeInfo, BorderAlign, BorderJoinStyle, BorderRadius, CategorySortOrder, ConnectNullsMode, DashAccessor, FieldAccessor, FillValue } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, CHART_OVERLAP, CHART_STACK, CHART_WATERFALL, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A bar series. Without a wrapper, several bar series render side by side in each category; wrap
 * them in `ChartStacked` to stack them or `ChartOverlap` to layer them.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-bar',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartBar }]
})
export class ChartBar<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly stack = inject(CHART_STACK, { optional: true });

    private readonly waterfall = inject(CHART_WATERFALL, { optional: true });

    private readonly overlap = inject(CHART_OVERLAP, { optional: true });

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

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Category field for the x axis, for vertical bars.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Category field for the y axis. Use this instead of `categoryXField` to draw bars horizontally.
     * @group Props
     */
    readonly categoryYField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Value field for the y axis, for vertical bars.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueYField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Value field for the x axis, for horizontal bars.
     * @group Props
     */
    readonly valueXField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Bar fill colour. An array cycles by index.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Bar fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Series name, used in the legend and the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field name giving each item a stable identity, so animations match up when the data is
     * reordered.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Fixed bar thickness in pixels, overriding the computed width.
     * @group Props
     */
    readonly barThickness = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Maximum bar width in pixels. Ignored when `barThickness` is set.
     * @group Props
     */
    readonly maxBarThickness = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Minimum bar length in pixels, so very small values stay visible.
     * @group Props
     */
    readonly minBarLength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Gap between bars within a group, as a fraction of the category band width.
     * @defaultValue 0.02
     * @group Props
     */
    readonly barGap = input(0.02, { transform: numberAttribute });
    /**
     * Gap between category groups, as a fraction of the category band width.
     * @defaultValue 0.1
     * @group Props
     */
    readonly categoryGap = input(0.1, { transform: numberAttribute });
    /**
     * Bar ordering applied before render.
     * @group Props
     */
    readonly sort = input<CategorySortOrder | undefined>(undefined);
    /**
     * How multi-series values are combined when sorting by value.
     * @defaultValue 'sum'
     * @group Props
     */
    readonly sortAggregate = input<'sum' | 'max' | 'min' | 'first'>('sum');
    /**
     * Corner radius, uniform or per corner.
     * @defaultValue 0
     * @group Props
     */
    readonly borderRadius = input<FieldAccessor<T, BorderRadius> | undefined>(undefined);
    /**
     * Border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Offset into the dash pattern.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * How border segments connect at bar corners.
     * @defaultValue 'miter'
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle>('miter');
    /**
     * Border alignment relative to the bar edge.
     * @defaultValue 'center'
     * @group Props
     */
    readonly borderAlign = input<BorderAlign>('center');
    /**
     * Which bar edges skip the border stroke. `'start'` is always the baseline edge.
     * @group Props
     */
    readonly borderSkipped = input<FieldAccessor<T, false | 'start' | 'end' | BarEdge> | undefined>(undefined);
    /**
     * Per-bar fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-bar border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Start value for floating and range bars: the bar spans from here to the value field.
     * @group Props
     */
    readonly openField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Proportional bar width field, which is what makes a variwide or Marimekko chart.
     * @group Props
     */
    readonly weightField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Custom shape per bar, returning an SVG path `d` string.
     * @group Props
     */
    readonly renderShape = input<((bar: BarShapeInfo) => string | undefined) | undefined>(undefined);
    /**
     * Null value handling.
     * @defaultValue 'gap'
     * @group Props
     */
    readonly connectNulls = input<ConnectNullsMode>('gap');
    /**
     * Bind to a specific x axis by id.
     * @group Props
     */
    readonly xAxisId = input<string | undefined>(undefined);
    /**
     * Bind to a specific y axis by id.
     * @group Props
     */
    readonly yAxisId = input<string | undefined>(undefined);
    /**
     * Stacking order within `ChartStacked`. 0 is the bottom of the stack.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Per-series animation overrides, keyed by the property they drive.
     *
     * A series can need a different timing from the chart -- a target line that appears at once over
     * bars that grow in -- and stating it on the series is the only place that reads as belonging to
     * that series.
     * @group Props
     */
    readonly animations = input<Record<string, NamedAnimationSpec> | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('bar');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<BarSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryXField: this.categoryXField(),
        categoryYField: this.categoryYField(),
        valueYField: this.valueYField(),
        valueXField: this.valueXField(),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId,
        barThickness: this.barThickness(),
        maxBarThickness: this.maxBarThickness(),
        minBarLength: this.minBarLength(),
        barGap: this.barGap(),
        categoryGap: this.categoryGap(),
        sort: this.sort(),
        sortAggregate: this.sortAggregate(),
        borderRadius: this.borderRadius(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderColor: this.borderColor(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderJoinStyle: this.borderJoinStyle(),
        borderAlign: this.borderAlign(),
        borderSkipped: this.borderSkipped(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        openField: this.openField(),
        weightField: this.weightField(),
        renderShape: this.renderShape(),
        connectNulls: this.connectNulls(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        order: this.order()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'bar',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId)),
            stackId: this.stack?.id,
            overlapId: this.overlap?.id,
            waterfall: this.waterfall ? { totalField: this.waterfall.totalField() } : undefined
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
