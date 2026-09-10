/**
 * ChartCandlestick: candlestick, hollow candle and OHLC bar.
 *
 * All three read the same four prices and sit on the same time machinery as line and area. In
 * hollow mode "up" is measured against the previous close rather than this candle's own open, which
 * is the distinction between a candle that rose today and one that closed above yesterday.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import type { BorderAlign, BorderJoinStyle, BorderRadius, CandlestickSeriesProps, DashAccessor, FieldAccessor, FillValue } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';

/**
 * A candlestick series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-candlestick',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [{ provide: CHART_ITEM_HOST, useExisting: ChartCandlestick }]
})
export class ChartCandlestick<T = unknown> {
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

    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Category or date field for the x axis.
     * @group Props
     */
    readonly categoryXField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Category field for the y axis, for horizontal candlesticks.
     * @group Props
     */
    readonly categoryYField = input<FieldAccessor<T, string> | undefined>(undefined);
    /**
     * Opening price field.
     * @defaultValue 'open'
     * @group Props
     */
    readonly openField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Highest price field.
     * @defaultValue 'high'
     * @group Props
     */
    readonly highField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Lowest price field.
     * @defaultValue 'low'
     * @group Props
     */
    readonly lowField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Closing price field.
     * @defaultValue 'close'
     * @group Props
     */
    readonly closeField = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Visual rendering style.
     * @defaultValue 'candlestick'
     * @group Props
     */
    readonly variant = input<'candlestick' | 'hollow' | 'ohlc'>('candlestick');
    /**
     * Per-candle colour override, which wins over the direction colour for that candle.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Candle colour when the price rose. In hollow mode, when the close beat the previous close.
     * @group Props
     */
    readonly upColor = input<FillValue | undefined>(undefined);
    /**
     * Candle colour when the price fell.
     * @group Props
     */
    readonly downColor = input<FillValue | undefined>(undefined);
    /**
     * Candle colour for a doji, where open equals close.
     * @group Props
     */
    readonly neutralColor = input<FillValue | undefined>(undefined);
    /**
     * Per-candle fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-candle border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Candle body border colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Candle body border stroke width in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Candle body border dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Offset into the border dash pattern.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Candle body corner radius.
     * @group Props
     */
    readonly borderRadius = input<FieldAccessor<T, BorderRadius> | undefined>(undefined);
    /**
     * Border alignment relative to the candle body edge.
     * @defaultValue 'center'
     * @group Props
     */
    readonly borderAlign = input<BorderAlign>('center');
    /**
     * How border segments connect at candle body corners.
     * @defaultValue 'miter'
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle>('miter');
    /**
     * Border colour override when the price rose.
     * @group Props
     */
    readonly borderUpColor = input<FillValue | undefined>(undefined);
    /**
     * Border colour override when the price fell.
     * @group Props
     */
    readonly borderDownColor = input<FillValue | undefined>(undefined);
    /**
     * Border colour override for a doji.
     * @group Props
     */
    readonly borderNeutralColor = input<FillValue | undefined>(undefined);
    /**
     * Candle body width as a fraction of the available category space, from 0 to 1.
     * @defaultValue 0.7
     * @group Props
     */
    readonly barWidthRatio = input(0.7, { transform: numberAttribute });
    /**
     * Wick and shadow line thickness in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly wickStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Series name, used in the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
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
     * Rendering z-order.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Field that identifies a datum across updates, so an animation can follow a row rather than a
     * position.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('candlestick');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<CandlestickSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryXField: this.categoryXField(),
        categoryYField: this.categoryYField(),
        openField: this.openField(),
        highField: this.highField(),
        lowField: this.lowField(),
        closeField: this.closeField(),
        variant: this.variant(),
        color: this.color() ?? this.items.overrides().color,
        upColor: this.upColor(),
        downColor: this.downColor(),
        neutralColor: this.neutralColor(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        borderRadius: this.borderRadius(),
        borderAlign: this.borderAlign(),
        borderJoinStyle: this.borderJoinStyle(),
        borderUpColor: this.borderUpColor(),
        borderDownColor: this.borderDownColor(),
        borderNeutralColor: this.borderNeutralColor(),
        barWidthRatio: this.barWidthRatio(),
        wickStrokeWidth: this.wickStrokeWidth(),
        name: this.name(),
        id: this.datasetId,
        xAxisId: this.xAxisId(),
        yAxisId: this.yAxisId(),
        order: this.order(),
        keyField: this.keyField()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            id: this.datasetId,
            type: 'candlestick',
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
