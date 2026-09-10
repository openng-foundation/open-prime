/**
 * The scatter painter, which also covers bubble.
 *
 * Bubble is not a separate type: binding `sizeField` turns the marker radius into a third encoded
 * dimension, scaled between `minSize` and `maxSize`. Everything else -- the shapes, the hover, the
 * custom marker renderer -- is the same series.
 */
import type { ItemContext, ScatterSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { isMarkerShapeName, markerPath } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One point, projected into pixels with its resolved radius. */
export interface ScatterPoint {
    x: number;
    y: number;
    radius: number;
    xValue: number;
    yValue: number;
    sizeValue: number | null;
    dataIndex: number;
}

/**
 * The point count past which the boost path takes over.
 *
 * At this scale the per-point work -- resolving each accessor, building each path -- costs more than
 * the drawing does, so the boost path collapses the cloud into one path of uniform marks. It is a
 * different picture in exchange for being a picture at all.
 */
const BOOST_THRESHOLD = 50_000;

/** Whether the boost path should be used. */
export function shouldBoost(props: ScatterSeriesProps, pointCount: number): boolean {
    if (props.boost === true) return true;
    if (props.boost === false) return false;

    return pointCount > BOOST_THRESHOLD;
}

/**
 * Projects a scatter series into points.
 *
 * The bubble radius is scaled against the series' own size extent rather than an absolute scale, so
 * the largest bubble reaches `maxSize` and the rest are read against it. Radius is mapped linearly
 * here for predictability; area-proportional sizing would be more perceptually honest but would not
 * match what `minSize` and `maxSize` are documented to mean.
 */
export function projectScatter(ctx: DrawContext, series: ResolvedSeries, props: ScatterSeriesProps): ScatterPoint[] {
    const xScale = scaleFor(ctx, 'x', series.xAxisId);
    const yScale = scaleFor(ctx, 'y', series.yAxisId);

    if (!xScale || !yScale || xScale.type === 'band' || yScale.type === 'band') return [];

    const data = (props.data as unknown[] | undefined) ?? [];
    const bubble = props.sizeField != null;
    const minSize = props.minSize ?? 4;
    const maxSize = props.maxSize ?? 40;
    const defaultSize = props.markerSize;

    const sizeValues = bubble
        ? series.points.map((point) => {
              const context = itemContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);

              return resolveScalarAccessor(props.sizeField, context) as number | undefined;
          })
        : null;

    const sizeExtent = sizeValues ? sizeValues.reduce<[number, number]>((extent, value) => (typeof value === 'number' && Number.isFinite(value) ? [Math.min(extent[0], value), Math.max(extent[1], value)] : extent), [Infinity, -Infinity]) : null;

    const points: ScatterPoint[] = [];

    for (const [position, point] of series.points.entries()) {
        if (point.value == null || point.xValue == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const x = xScale.scale(point.xValue);
        const y = yScale.scale(point.value);

        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

        const context: ItemContext<unknown> = itemContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const sizeValue = sizeValues?.[position] ?? null;
        const hovered = isHovered(ctx, series.id, point.dataIndex);
        const base = bubble && sizeExtent ? bubbleRadius(sizeValue, sizeExtent, minSize, maxSize) : ((resolveScalarAccessor(defaultSize, context, 6) as number) ?? 6);
        const radius = hovered ? (props.hoverPointRadius ?? base * (ctx.hoverEffect?.radiusMultiplier ?? 1.3)) : base;

        points.push({ x, y, radius, xValue: point.xValue, yValue: point.value, sizeValue, dataIndex: point.dataIndex });
    }

    return points;
}

/** Maps a size value onto the bubble radius band. */
function bubbleRadius(value: number | null, extent: [number, number], minSize: number, maxSize: number): number {
    if (value == null || !Number.isFinite(value)) return minSize;

    const [min, max] = extent;

    // A series where every bubble is the same size has no ratio to read, so they all take the
    // smallest radius rather than all taking the largest.
    if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return minSize;

    return minSize + ((value - min) / (max - min)) * (maxSize - minSize);
}

/** Paints a scatter or bubble series. */
export function paintScatterSeries(ctx: DrawContext, series: ResolvedSeries, props: ScatterSeriesProps): SvgNode[] {
    const points = projectScatter(ctx, series, props);

    if (points.length === 0) return [];

    const data = (props.data as unknown[] | undefined) ?? [];
    const fallback = ctx.seriesColor(series.seriesIndex);

    if (shouldBoost(props, points.length)) {
        return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-scatter', 'data-series': series.id, 'data-series-type': 'scatter', 'data-boost': '' }, [boostPath(points, fallback, props)])];
    }

    const nodes: SvgNode[] = [];

    for (const point of points) {
        const context: ItemContext<unknown> = itemContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.yValue, undefined, { size: point.radius });
        const hovered = isHovered(ctx, series.id, point.dataIndex);
        // A gradient object cannot go into an attribute; the gradient path resolves to a url()
        // reference elsewhere, so anything non-string falls back to the palette colour here.
        const hoverFill = typeof props.pointHoverBackgroundColor === 'string' ? props.pointHoverBackgroundColor : undefined;
        const hoverStroke = typeof props.pointHoverBorderColor === 'string' ? props.pointHoverBorderColor : undefined;
        const resolvedFill = resolveColorAccessor(props.color, context, fallback);
        const resolvedStroke = resolveColorAccessor(props.pointBorderColor, context);
        const fill = (hovered ? hoverFill : undefined) ?? (typeof resolvedFill === 'string' ? resolvedFill : fallback);
        const stroke = (hovered ? hoverStroke : undefined) ?? (typeof resolvedStroke === 'string' ? resolvedStroke : undefined);
        const shape = (resolveScalarAccessor(props.markerShape, context, 'circle') as string) ?? 'circle';
        const rotation = (resolveScalarAccessor(props.pointRotation, context, 0) as number) ?? 0;
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-marker ${seriesColorClass(series.seriesIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-marker',
                'data-series': series.id,
                'data-index': point.dataIndex,
                'data-state': hovered ? 'hovered' : null,
                d: isMarkerShapeName(shape) ? markerPath(shape, point.radius * ctx.progress) : shape,
                fill,
                'fill-opacity': opacity,
                stroke: stroke ?? null,
                'stroke-width': (hovered ? props.pointHoverBorderStrokeWidth : undefined) ?? (resolveScalarAccessor(props.pointBorderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-linejoin': props.pointBorderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.pointBorderDash, context)),
                opacity: markOpacity(ctx, series.id, point.dataIndex),
                transform: `translate(${point.x} ${point.y})${rotation ? ` rotate(${rotation})` : ''}`
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-scatter', 'data-series': series.id, 'data-series-type': 'scatter' }, nodes)];
}

/**
 * The boost path: every point in one path, uniform size and colour.
 *
 * Per-point styling is deliberately dropped rather than approximated. At a hundred thousand points
 * an individual marker's colour is not readable anyway, and the honest trade is to say the boost
 * path draws density rather than to pretend it still draws each point faithfully.
 */
function boostPath(points: readonly ScatterPoint[], color: string, props: ScatterSeriesProps): SvgNode {
    const radius = props.markerSize != null && typeof props.markerSize === 'number' ? props.markerSize : 1.5;
    let d = '';

    for (const point of points) {
        d += `M ${point.x - radius} ${point.y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0 `;
    }

    return { tag: 'path', attrs: { class: 'p-chart-marker', 'data-slot': 'chart-marker-boost', d, fill: color, stroke: 'none' }, children: [] };
}
