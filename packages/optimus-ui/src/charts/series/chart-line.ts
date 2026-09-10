/**
 * ChartLine: line, area and stacked-area series.
 *
 * Like every part, it draws nothing itself. It registers what it is with the root and the root
 * paints it, which is what lets the same element work under `ChartSvg` and `ChartCanvas` without
 * knowing which one it is inside.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { NamedAnimationSpec, BorderJoinStyle, ConnectNullsMode, CurveType, DashAccessor, FieldAccessor, FillValue, LineCapStyle, LineSeriesProps, PointRenderContext, SegmentStyleValue } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, CHART_RANGE, CHART_STACK, nextDatasetId } from '../charts-registry';
import { ChartMarkerDef } from '../features/chart-defs';
import { createItemRegistry } from './chart-items';

/**
 * A line series. Set `fillOpacity` above zero to make it an area: area is a fill on a line rather
 * than a series type of its own, so every other input keeps working unchanged.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-line',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartLine }]
})
export class ChartLine<T = unknown> {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    /** A projected template that replaces each marker. SVG only. */
    readonly markerDef = contentChild(ChartMarkerDef);

    private readonly stack = inject(CHART_STACK, { optional: true });

    private readonly range = inject(CHART_RANGE, { optional: true });

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
     * X axis category field. Falls back to the array index when unset.
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Y axis numeric value field.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueYField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Line stroke and area fill colour. For per-point colouring use `pointBackgroundColor`.
     * @group Props
     */
    readonly color = input<FillValue | undefined>(undefined);
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
     * Stacking order. 0 is the bottom of the stack.
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
    /**
     * Line stroke thickness in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly lineStrokeWidth = input(2, { transform: numberAttribute });
    /**
     * How the ends of line segments are drawn.
     * @defaultValue 'round'
     * @group Props
     */
    readonly lineCapStyle = input<LineCapStyle>('round');
    /**
     * How path segments connect at data points.
     * @defaultValue 'round'
     * @group Props
     */
    readonly lineJoinStyle = input<BorderJoinStyle>('round');
    /**
     * Dash pattern, as `[dashLength, gapLength]`.
     * @group Props
     */
    readonly lineDash = input<number[] | undefined>(undefined);
    /**
     * Offset into the dash pattern.
     * @group Props
     */
    readonly lineDashOffset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Named shortcut for `lineDash`.
     * @defaultValue 'solid'
     * @group Props
     */
    readonly lineStyle = input<'solid' | 'dashed' | 'dotted'>('solid');
    /**
     * Interpolation between data points.
     * @defaultValue 'linear'
     * @group Props
     */
    readonly curve = input<CurveType>('linear');
    /**
     * Spline tightness, from 0 to 1. Only applies when `curve` is `'spline'`.
     * @defaultValue 0.5
     * @group Props
     */
    readonly tension = input(0.5, { transform: numberAttribute });
    /**
     * Area fill opacity beneath the line, from 0 to 1. At 0 only the line is drawn.
     * @defaultValue 0
     * @group Props
     */
    readonly fillOpacity = input(0, { transform: numberAttribute });
    /**
     * Halo stroke colour drawn behind the main stroke.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Halo stroke width.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Halo dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Halo dash phase offset.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Halo line cap style.
     * @defaultValue 'round'
     * @group Props
     */
    readonly borderCapStyle = input<LineCapStyle>('round');
    /**
     * Display point markers at each data vertex.
     * @defaultValue false
     * @group Props
     */
    readonly showMarkers = input(false, { transform: booleanAttribute });
    /**
     * Marker radius in pixels. Per-point through an array or a callback.
     * @defaultValue 4
     * @group Props
     */
    readonly markerSize = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * A built-in marker name, or any custom SVG path `d` string.
     * @defaultValue 'circle'
     * @group Props
     */
    readonly markerShape = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Marker rotation in degrees, where 0 is upright.
     * @group Props
     */
    readonly pointRotation = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Marker fill colour.
     * @group Props
     */
    readonly pointBackgroundColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Fill colour while the mark is hovered.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Border colour while the mark is hovered.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Marker border stroke colour.
     * @group Props
     */
    readonly pointBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Marker border stroke width in pixels.
     * @group Props
     */
    readonly pointBorderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Marker border dash pattern.
     * @group Props
     */
    readonly pointBorderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Marker border dash phase offset.
     * @group Props
     */
    readonly pointBorderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Marker border path join style.
     * @defaultValue 'miter'
     * @group Props
     */
    readonly pointBorderJoinStyle = input<BorderJoinStyle>('miter');
    /**
     * Invisible hover detection radius around each point.
     * @defaultValue 10
     * @group Props
     */
    readonly pointHitRadius = input(10, { transform: numberAttribute });
    /**
     * Marker radius while hovered, in pixels.
     * @group Props
     */
    readonly hoverPointRadius = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Marker fill colour on hover.
     * @group Props
     */
    readonly pointHoverBackgroundColor = input<FillValue | undefined>(undefined);
    /**
     * Marker border colour on hover.
     * @group Props
     */
    readonly pointHoverBorderColor = input<FillValue | undefined>(undefined);
    /**
     * Marker border width on hover, in pixels.
     * @group Props
     */
    readonly pointHoverBorderStrokeWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Null value handling. Only reach for `'zero'` where zero is a meaningful baseline.
     * @defaultValue 'gap'
     * @group Props
     */
    readonly connectNulls = input<ConnectNullsMode>('gap');
    /**
     * Per-segment stroke colour. Return `undefined` from the callback to keep the series default.
     * @group Props
     */
    readonly segmentColor = input<SegmentStyleValue<T, FillValue> | undefined>(undefined);
    /**
     * Per-segment stroke width.
     * @group Props
     */
    readonly segmentStrokeWidth = input<SegmentStyleValue<T, number> | undefined>(undefined);
    /**
     * Per-segment dash pattern.
     * @group Props
     */
    readonly segmentDash = input<SegmentStyleValue<T, number[]> | undefined>(undefined);
    /**
     * Per-segment area fill colour. Area mode only.
     * @group Props
     */
    readonly segmentFillColor = input<SegmentStyleValue<T, FillValue> | undefined>(undefined);
    /**
     * Custom marker renderer.
     * @group Props
     */
    readonly renderMarker = input<((context: PointRenderContext<T>) => unknown) | undefined>(undefined);
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

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('line');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<LineSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryXField: this.categoryXField(),
        valueYField: this.valueYField(),
        color: this.color() ?? this.items.overrides().color,
        name: this.name(),
        keyField: this.keyField(),
        id: this.datasetId,
        order: this.order(),
        animations: this.animations(),
        lineStrokeWidth: this.lineStrokeWidth(),
        lineCapStyle: this.lineCapStyle(),
        lineJoinStyle: this.lineJoinStyle(),
        lineDash: this.lineDash(),
        lineDashOffset: this.lineDashOffset(),
        lineStyle: this.lineStyle(),
        curve: this.curve(),
        tension: this.tension(),
        // A line inside a ChartRange is one edge of a band, so it fills to its sibling rather than
        // to the axis and the fill is on whether or not the author asked for it.
        fillOpacity: this.range ? Math.max(this.fillOpacity(), 0.2) : this.fillOpacity(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderCapStyle: this.borderCapStyle(),
        showMarkers: this.showMarkers(),
        markerSize: this.markerSize(),
        markerShape: this.markerShape(),
        pointRotation: this.pointRotation(),
        pointBackgroundColor: this.pointBackgroundColor(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        pointBorderColor: this.pointBorderColor(),
        pointBorderStrokeWidth: this.pointBorderStrokeWidth(),
        pointBorderDash: this.pointBorderDash(),
        pointBorderDashOffset: this.pointBorderDashOffset(),
        pointBorderJoinStyle: this.pointBorderJoinStyle(),
        pointHitRadius: this.pointHitRadius(),
        hoverPointRadius: this.hoverPointRadius(),
        pointHoverBackgroundColor: this.pointHoverBackgroundColor(),
        pointHoverBorderColor: this.pointHoverBorderColor(),
        pointHoverBorderStrokeWidth: this.pointHoverBorderStrokeWidth(),
        connectNulls: this.connectNulls(),
        segmentColor: this.segmentColor(),
        segmentStrokeWidth: this.segmentStrokeWidth(),
        segmentDash: this.segmentDash(),
        segmentFillColor: this.segmentFillColor(),
        renderMarker: this.renderMarker(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId()
    }));

    constructor() {
        // Registering outside a chart root is a no-op rather than an error: a template that is
        // briefly incomplete during a structural change is normal, and throwing there would turn a
        // transient state into a crash.
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ marker: this.markerDef()?.template ?? null })),
            id: this.datasetId,
            type: 'line',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId)),
            stackId: this.stack?.id,
            rangeId: this.range?.id
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
