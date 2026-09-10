/**
 * ChartScatter: scatter and bubble.
 *
 * Binding `sizeField` turns the marker radius into a third encoded dimension, which is all a bubble
 * chart is. Both axes are numeric here, so this is the one cartesian series with no category at
 * all -- which is why a bare axis under it resolves to a value axis on both sides.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { BorderJoinStyle, ConnectNullsMode, DashAccessor, FieldAccessor, FillValue, PointRenderContext, ScatterSeriesProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';
import { ChartMarkerDef } from '../features/chart-defs';

/**
 * A scatter series. Give it `sizeField` for a bubble chart.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-scatter',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartScatter }]
})
export class ChartScatter<T = unknown> {
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

    /** A projected template that replaces each marker. */
    readonly markerDef = contentChild(ChartMarkerDef);

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * X axis numeric field.
     * @defaultValue 'x'
     * @group Props
     */
    readonly valueXField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Y axis numeric field.
     * @defaultValue 'y'
     * @group Props
     */
    readonly valueYField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Bubble radius field. Setting it turns on bubble mode, where the radius scales between
     * `minSize` and `maxSize`.
     * @group Props
     */
    readonly sizeField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * High-performance point rendering. `'auto'` turns it on past 50,000 visible points.
     * @defaultValue 'auto'
     * @group Props
     */
    readonly boost = input<boolean | 'auto'>('auto');
    /**
     * Point fill colour.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Marker fill opacity, from 0 to 1.
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
     * Field name giving each item a stable identity across data updates.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Per-point fill colour.
     * @group Props
     */
    readonly pointBackgroundColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Marker fill opacity, which is how an overplotted cloud is made readable: a thousand points at
     * 0.4 show where they pile up, where the same points at full opacity show only the last one
     * drawn.
     * @group Props
     */
    readonly pointFillOpacity = input<FieldAccessor<T, number> | undefined>(undefined);
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
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Rendering z-order. 0 is the bottom.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Marker radius in pixels, in scatter mode. Ignored in bubble mode.
     * @defaultValue 6
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
     * Minimum bubble radius in bubble mode, in pixels.
     * @defaultValue 4
     * @group Props
     */
    readonly minSize = input(4, { transform: numberAttribute });
    /**
     * Maximum bubble radius in bubble mode, in pixels.
     * @defaultValue 40
     * @group Props
     */
    readonly maxSize = input(40, { transform: numberAttribute });
    /**
     * Marker border stroke colour.
     * @group Props
     */
    readonly pointBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Marker border stroke width in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly pointBorderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Marker border dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly pointBorderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Phase offset of the marker border dash pattern.
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
     * Invisible hover detection radius. Hit-testing measures 2D distance here, since a scatter plot
     * has no category to snap to.
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
     * Null value handling. `'connect'` behaves as `'gap'` here, since there is no line to bridge.
     * @defaultValue 'gap'
     * @group Props
     */
    readonly connectNulls = input<ConnectNullsMode>('gap');
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
    readonly datasetId = this.id() ?? nextDatasetId('scatter');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<ScatterSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        valueXField: this.valueXField(),
        valueYField: this.valueYField(),
        sizeField: this.sizeField(),
        boost: this.boost(),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        name: this.name(),
        keyField: this.keyField(),
        pointBackgroundColor: this.pointBackgroundColor(),
        pointFillOpacity: this.pointFillOpacity(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        id: this.datasetId,
        order: this.order(),
        markerSize: this.markerSize(),
        markerShape: this.markerShape(),
        pointRotation: this.pointRotation(),
        minSize: this.minSize(),
        maxSize: this.maxSize(),
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
        renderMarker: this.renderMarker(),
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ marker: this.markerDef()?.template ?? null })),
            id: this.datasetId,
            type: 'scatter',
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
