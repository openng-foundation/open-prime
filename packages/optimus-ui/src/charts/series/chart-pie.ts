/**
 * ChartPie: pie, donut, gauge and nightingale.
 *
 * One component rather than four. A donut is a pie with `innerRadius`, a gauge is a donut with a
 * `sweepAngle` under 360, and a nightingale is a pie whose slices take their own radius from
 * `sliceRadiusValue`. Keeping them as one series is what makes every other input -- the labels, the
 * hover treatment, the slice template -- work across all four instead of being re-implemented per
 * type.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { BorderAlign, BorderJoinStyle, BorderRadius, DashAccessor, FieldAccessor, FillValue, PieSeriesProps, SliceRenderContext, SliceSortOrder } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, CHART_STACK, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';
import { ChartCenterContentDef, ChartSliceDef } from '../features/chart-defs';

/**
 * A pie series. Give it `innerRadius` for a donut, a `sweepAngle` under 360 for a gauge, and
 * `sliceRadiusValue` for a nightingale.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-pie',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartPie }]
})
export class ChartPie<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly stack = inject(CHART_STACK, { optional: true });

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

    /** A projected template that replaces the content inside each slice. */
    readonly sliceDef = contentChild(ChartSliceDef);

    /** A projected template that fills the middle of a donut or gauge. */
    readonly centerContentDef = contentChild(ChartCenterContentDef);

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Numeric value field, which sets the slice angle.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Slice label field.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Per-slice colours. Accepts hex, RGB, CSS variables and radial gradient objects.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Slice fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Per-slice radial offset in pixels, which pulls slices out of the centre for an exploded pie.
     * @defaultValue 0
     * @group Props
     */
    readonly offset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Donut hole ratio, from 0 to 1. At 0 the chart is a solid pie.
     * @defaultValue 0
     * @group Props
     */
    readonly innerRadius = input(0, { transform: numberAttribute });
    /**
     * Outer radius ratio, from 0 to 1. At 1 the chart fills the available space.
     * @defaultValue 1
     * @group Props
     */
    readonly outerRadius = input(1, { transform: numberAttribute });
    /**
     * Where slices begin, in degrees. -90 is twelve o'clock, 0 is three o'clock.
     * @defaultValue -90
     * @group Props
     */
    readonly startAngle = input(-90, { transform: numberAttribute });
    /**
     * Arc span in degrees. 360 is a full circle, 180 a half-circle gauge.
     * @defaultValue 360
     * @group Props
     */
    readonly sweepAngle = input(360, { transform: numberAttribute });
    /**
     * Gap between slices in pixels.
     * @defaultValue 0
     * @group Props
     */
    readonly spacing = input(0, { transform: numberAttribute });
    /**
     * Per-slice variable outer radius, which is what makes a nightingale chart.
     * @group Props
     */
    readonly sliceRadiusValue = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Slice ordering applied before render.
     * @group Props
     */
    readonly sort = input<SliceSortOrder | undefined>(undefined);
    /**
     * Rounded slice corners.
     * @group Props
     */
    readonly borderRadius = input<FieldAccessor<T, BorderRadius> | undefined>(undefined);
    /**
     * Slice border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Slice border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
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
     * How border segments connect at slice corners.
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle | undefined>(undefined);
    /**
     * Border alignment relative to the slice edge.
     * @defaultValue 'inner'
     * @group Props
     */
    readonly borderAlign = input<BorderAlign>('inner');
    /**
     * Per-slice fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-slice border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Custom content inside each slice.
     * @group Props
     */
    readonly renderContent = input<((context: SliceRenderContext<T>) => unknown) | undefined>(undefined);
    /**
     * Dataset label, used in the legend.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Stacking order for concentric rings. 0 is the innermost.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
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

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('pie');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<PieSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        valueField: this.valueField(),
        categoryField: this.categoryField(),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        offset: this.offset(),
        innerRadius: this.innerRadius(),
        outerRadius: this.outerRadius(),
        startAngle: this.startAngle(),
        sweepAngle: this.sweepAngle(),
        spacing: this.spacing(),
        sliceRadiusValue: this.sliceRadiusValue(),
        sort: this.sort(),
        borderRadius: this.borderRadius(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderJoinStyle: this.borderJoinStyle(),
        borderAlign: this.borderAlign(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        renderContent: this.renderContent(),
        name: this.name(),
        order: this.order(),
        keyField: this.keyField(),
        id: this.datasetId
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ slice: this.sliceDef()?.template ?? null, centerContent: this.centerContentDef()?.template ?? null })),
            // 'donut' is not a separate type: the hole is a parameter, so the registration stays
            // 'pie' and the geometry reads innerRadius.
            id: this.datasetId,
            type: 'pie',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId)),
            stackId: this.stack?.id
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
