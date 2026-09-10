/**
 * The candlestick painter: candlestick, hollow candle and OHLC bar.
 *
 * All three read the same four prices and share the same time machinery as line and area. What
 * differs is the mark and, in hollow mode, what "up" is measured against -- the previous close
 * rather than this candle's own open, which is the distinction between a candle that rose today and
 * one that closed above yesterday.
 */
import type { CandlestickSeriesProps, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { roundedRectPath } from '../core/geometry';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One candle, resolved into pixels. */
export interface Candle {
    /**
     * Centre of the candle body.
     */
    x: number;
    /**
     * Body width in pixels.
     */
    width: number;
    open: number;
    high: number;
    low: number;
    close: number;
    /**
     * Pixel positions of the four prices.
     */
    openY: number;
    highY: number;
    lowY: number;
    closeY: number;
    category: string;
    dataIndex: number;
    /**
     * Which direction colour applies.
     */
    direction: 'up' | 'down' | 'neutral';
}

/** Reads the four prices out of a datum. */ function priceOf(datum: unknown, accessor: unknown, fallbackField: string, context: ItemContext<unknown>): number | null {
    const resolved = accessor == null ? undefined : (resolveScalarAccessor(accessor as never, context) as number | undefined);

    if (typeof resolved === 'number' && Number.isFinite(resolved)) return resolved;

    const read = readPath(datum, fallbackField);

    return typeof read === 'number' && Number.isFinite(read) ? read : null;
}

/**
 * Projects a candlestick series.
 *
 * The direction is what drives the colour, and in hollow mode it is measured against the previous
 * close rather than this candle's own open. The first candle has no previous close, so it falls back
 * to its own open -- which is the only defensible answer, since there is nothing earlier to compare
 * it to.
 */
export function projectCandles(ctx: DrawContext, series: ResolvedSeries, props: CandlestickSeriesProps): Candle[] {
    const categoryScale = scaleFor(ctx, 'x', series.xAxisId);
    const valueScale = scaleFor(ctx, 'y', series.yAxisId);

    if (!categoryScale || categoryScale.type !== 'band' || !valueScale || valueScale.type === 'band') return [];

    const data = (props.data as unknown[] | undefined) ?? [];
    const ratio = props.barWidthRatio ?? 0.7;
    const width = Math.max(categoryScale.bandwidth * ratio, 1);
    const hollow = props.variant === 'hollow';
    const candles: Candle[] = [];
    let previousClose: number | null = null;

    for (const point of series.points) {
        const datum = data[point.dataIndex];
        const context: ItemContext<unknown> = itemContext(datum, point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const open = priceOf(datum, props.openField, 'open', context);
        const high = priceOf(datum, props.highField, 'high', context);
        const low = priceOf(datum, props.lowField, 'low', context);
        const close = priceOf(datum, props.closeField, 'close', context);

        if (open == null || high == null || low == null || close == null) continue;
        if (!ctx.isItemVisible(series.id, point.dataIndex)) {
            previousClose = close;
            continue;
        }

        const centre = categoryScale.scale(point.category);

        if (!Number.isFinite(centre)) {
            previousClose = close;
            continue;
        }

        const reference = hollow ? (previousClose ?? open) : open;
        const direction = close > reference ? 'up' : close < reference ? 'down' : 'neutral';

        candles.push({
            x: centre,
            width,
            open,
            high,
            low,
            close,
            openY: valueScale.scale(open),
            highY: valueScale.scale(high),
            lowY: valueScale.scale(low),
            closeY: valueScale.scale(close),
            category: point.category,
            dataIndex: point.dataIndex,
            direction
        });

        previousClose = close;
    }

    return candles;
}

/** Paints a candlestick, hollow candle or OHLC series. */
export function paintCandlestickSeries(ctx: DrawContext, series: ResolvedSeries, props: CandlestickSeriesProps): SvgNode[] {
    const candles = projectCandles(ctx, series, props);
    const data = (props.data as unknown[] | undefined) ?? [];
    const variant = props.variant ?? 'candlestick';
    const nodes: SvgNode[] = [];

    for (const candle of candles) {
        const context: ItemContext<unknown> = itemContext(data[candle.dataIndex], candle.dataIndex, series.seriesIndex, series.id, candle.close, candle.category);
        const hovered = isHovered(ctx, series.id, candle.dataIndex);
        const directional = directionColor(ctx, props, candle.direction);
        // A per-candle colour overrides the direction colour for that candle, across every variant.
        const explicit = resolveColorAccessor(props.color, context);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const color = hoverFill ?? (typeof explicit === 'string' ? explicit : directional);
        const borderColor = directionBorder(ctx, props, candle.direction) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined) ?? color;
        const wickWidth = (resolveScalarAccessor(props.wickStrokeWidth, context, 1) as number) ?? 1;
        const opacity = markOpacity(ctx, series.id, candle.dataIndex);

        // The wick spans the full high-to-low range in every variant; it is the body that differs.
        nodes.push({
            tag: 'line',
            attrs: {
                class: 'p-chart-candle-wick',
                'data-slot': 'chart-candle-wick',
                'data-series': series.id,
                'data-index': candle.dataIndex,
                x1: candle.x,
                y1: candle.highY,
                x2: candle.x,
                y2: candle.lowY,
                stroke: color,
                'stroke-width': wickWidth,
                opacity
            },
            children: []
        });

        if (variant === 'ohlc') {
            const tick = candle.width / 2;

            // An OHLC bar has no body: the open is a tick to the left and the close one to the
            // right, which is the whole notation.
            nodes.push(
                { tag: 'line', attrs: { class: 'p-chart-candle-tick', 'data-slot': 'chart-candle-open', x1: candle.x - tick, y1: candle.openY, x2: candle.x, y2: candle.openY, stroke: color, 'stroke-width': wickWidth, opacity }, children: [] },
                { tag: 'line', attrs: { class: 'p-chart-candle-tick', 'data-slot': 'chart-candle-close', x1: candle.x, y1: candle.closeY, x2: candle.x + tick, y2: candle.closeY, stroke: color, 'stroke-width': wickWidth, opacity }, children: [] }
            );

            continue;
        }

        const top = Math.min(candle.openY, candle.closeY);
        const height = Math.max(Math.abs(candle.closeY - candle.openY), 1);
        // A hollow candle is stroke-only when it rose and filled when it fell, which is what makes
        // a run of gains read as an outline.
        const filled = variant !== 'hollow' || candle.direction === 'down';

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-candle${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-candle',
                'data-series': series.id,
                'data-index': candle.dataIndex,
                'data-category': candle.category,
                'data-direction': candle.direction,
                'data-state': hovered ? 'hovered' : null,
                d: roundedRectPath(candle.x - candle.width / 2, top, candle.width, height, (resolveScalarAccessor(props.borderRadius, context, 0) as number) ?? 0),
                fill: filled ? color : 'none',
                stroke: borderColor,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context, 1) as number) ?? 1,
                'stroke-linejoin': props.borderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: `p-chart-series p-chart-series-candlestick`, 'data-series': series.id, 'data-series-type': 'candlestick', 'data-variant': variant }, nodes)];
}

/** The colour a direction resolves to, falling back to the theme's positive and negative. */
function directionColor(ctx: DrawContext, props: CandlestickSeriesProps, direction: Candle['direction']): string {
    const explicit = direction === 'up' ? props.upColor : direction === 'down' ? props.downColor : props.neutralColor;

    if (typeof explicit === 'string') return explicit;

    const themed = direction === 'up' ? ctx.theme.positive : direction === 'down' ? ctx.theme.negative : ctx.theme.tickLabel;

    return themed ?? ctx.seriesColor(0);
}

/** The border colour override for a direction, when one was given. */
function directionBorder(ctx: DrawContext, props: CandlestickSeriesProps, direction: Candle['direction']): string | undefined {
    const explicit = direction === 'up' ? props.borderUpColor : direction === 'down' ? props.borderDownColor : props.borderNeutralColor;

    return typeof explicit === 'string' ? explicit : undefined;
}
