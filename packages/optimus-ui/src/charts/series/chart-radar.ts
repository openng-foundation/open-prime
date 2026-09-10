/**
 * ChartRadar: one closed polygon per series across shared spokes.
 *
 * The concentric grid is configured on `ChartYAxis` rather than here, because the rings *are* the
 * value axis -- putting `gridShape` and `tickCount` on the series would be describing the axis from
 * the wrong place.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { BorderAlign, BorderJoinStyle, DashAccessor, FieldAccessor, FillValue, PointRenderContext, RadarSeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, CHART_STACK, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';
import { ChartMarkerDef } from '../features/chart-defs';

/**
 * A radar series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-radar',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartRadar }]
})
export class ChartRadar<T = unknown> {
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

    /** A projected template that replaces each vertex marker. */
    readonly markerDef = contentChild(ChartMarkerDef);

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Spoke label field.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Radial value field.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueYField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Polygon stroke and fill colour, at series level. A radar polygon is one closed shape, so
     * per-vertex colouring has nowhere to go; use `pointBackgroundColor` for the markers.
     * @group Props
     */
    readonly color = input<FillValue | undefined>(undefined);
    /**
     * Series name, used in the legend and the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Field name giving each item a stable identity, used for animation matching.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Stacking order inside `ChartStacked`. 0 is the innermost ring.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Polygon area fill opacity, from 0 to 1. At 0 only the stroke is drawn.
     * @defaultValue 0.2
     * @group Props
     */
    readonly fillOpacity = input(0.2, { transform: numberAttribute });
    /**
     * Polygon stroke thickness in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly lineStrokeWidth = input(2, { transform: numberAttribute });
    /**
     * Polygon stroke dash style.
     * @defaultValue 'solid'
     * @group Props
     */
    readonly lineStyle = input<'solid' | 'dashed' | 'dotted'>('solid');
    /**
     * Dash pattern for the polygon stroke.
     * @group Props
     */
    readonly lineDash = input<number[] | undefined>(undefined);
    /**
     * Edge interpolation: straight polygon edges, or Bezier curves between vertices.
     * @defaultValue 'linear'
     * @group Props
     */
    readonly curve = input<'linear' | 'smooth'>('linear');
    /**
     * Display point markers at the spoke vertices.
     *
     * Off by default, matching how the reference renders a radar: it reads as a filled profile, and
     * a dot at every vertex of every overlaid series clutters it. (The reference's own prop table
     * lists the default as `true`, but its charts draw none.)
     * @defaultValue false
     * @group Props
     */
    readonly showMarkers = input(false, { transform: booleanAttribute });
    /**
     * Vertex marker radius in pixels.
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
     * Polygon halo border colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Polygon halo border width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Polygon halo border dash pattern.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Polygon halo border dash phase offset.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Polygon halo border join style.
     * @defaultValue 'round'
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle>('round');
    /**
     * Polygon halo border alignment.
     * @defaultValue 'center'
     * @group Props
     */
    readonly borderAlign = input<BorderAlign>('center');
    /**
     * Per-vertex fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-vertex border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Binds the series to a named `ChartYAxis` for independent scaling.
     * @group Props
     */
    readonly yAxisId = input<string | undefined>(undefined);
    /**
     * Custom vertex marker renderer.
     * @group Props
     */
    readonly renderMarker = input<((context: PointRenderContext<T>) => unknown) | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('radar');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<RadarSeriesProps<T>>(() => ({
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
        fillOpacity: this.fillOpacity(),
        lineStrokeWidth: this.lineStrokeWidth(),
        lineStyle: this.lineStyle(),
        lineDash: this.lineDash(),
        curve: this.curve(),
        showMarkers: this.showMarkers(),
        markerSize: this.markerSize(),
        markerShape: this.markerShape(),
        pointRotation: this.pointRotation(),
        pointBackgroundColor: this.pointBackgroundColor(),
        pointBorderColor: this.pointBorderColor(),
        pointBorderStrokeWidth: this.pointBorderStrokeWidth(),
        pointBorderDash: this.pointBorderDash(),
        pointBorderDashOffset: this.pointBorderDashOffset(),
        pointBorderJoinStyle: this.pointBorderJoinStyle(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderJoinStyle: this.borderJoinStyle(),
        borderAlign: this.borderAlign(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        yAxisId: this.yAxisId(),
        renderMarker: this.renderMarker()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ marker: this.markerDef()?.template ?? null })),
            id: this.datasetId,
            type: 'radar',
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
