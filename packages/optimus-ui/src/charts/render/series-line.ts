/**
 * The line and area painter.
 *
 * One painter covers both, because area is a fill on a line rather than a separate series type:
 * `fillOpacity` above zero turns the line into an area and nothing else changes. The same painter
 * also draws a stacked area and one edge of a range band, since stacking has already been resolved
 * into a base and a top per point by the time the painter sees them.
 */
import type { ComputedPoint, ItemContext, LineSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveDashAccessor, resolveDashPattern, resolveScalarAccessor } from '../core/accessor';
import { isGradient } from '../core/color';
import { areaPath, curvePath, isPlaced, splitAtGaps, type PathPoint } from '../core/curve';
import { isMarkerShapeName, markerPath } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import type { ResolvedSeries } from '../charts-state';
import { baselineOn, isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';

/** A line series projected into pixels. */
export interface LineGeometry {
    points: ComputedPoint[];
    /**
     * The lower edge, which a stacked area or a range band fills down to.
     */
    lower: PathPoint[];
    color: string;
    gradientId: string | null;
}

/** Projects a line series' points into pixel space. */
export function projectLine(ctx: DrawContext, series: ResolvedSeries, props: LineSeriesProps): LineGeometry {
    const xScale = scaleFor(ctx, 'x', series.xAxisId);
    const yScale = scaleFor(ctx, 'y', series.yAxisId);
    const baseline = baselineOn(yScale);
    const color = typeof props.color === 'string' ? props.color : ctx.seriesColor(series.seriesIndex);

    const points: ComputedPoint[] = series.points.map((point) => {
        const visible = ctx.isItemVisible(series.id, point.dataIndex);
        const value = visible ? point.value : null;

        return {
            x: xScale ? xScale.scale(point.category) : Number.NaN,
            y: value == null || !yScale ? Number.NaN : yScale.scale(value),
            value,
            category: point.category,
            dataIndex: point.dataIndex
        };
    });

    // The lower edge is the stack's base where there is one, and the axis baseline otherwise. Using
    // the base is what makes a stacked area sit on the series below it instead of on zero.
    const lower: PathPoint[] = series.points.map((point, i) => ({
        x: points[i].x,
        y: point.base !== 0 && yScale ? yScale.scale(point.base) : baseline
    }));

    return { points, lower, color, gradientId: isGradient(props.color) ? `line-area-${series.id}-grad` : null };
}

/**
 * Paints a line or area series.
 *
 * The entrance animation grows the marks out of the baseline rather than fading them in, because a
 * fade tells the reader nothing while a rise from the axis reads as the value it is arriving at.
 */
export function paintLineSeries(ctx: DrawContext, series: ResolvedSeries, props: LineSeriesProps): SvgNode[] {
    const xScale = scaleFor(ctx, 'x', series.xAxisId);
    const yScale = scaleFor(ctx, 'y', series.yAxisId);

    // Without both scales there is nowhere to put a point. Drawing nothing is the only honest
    // answer, and it is also what keeps a chart mid-construction from emitting NaN geometry.
    if (!xScale || !yScale || yScale.type === 'band') return [];

    const geometry = projectLine(ctx, series, props);
    const baseline = baselineOn(yScale);
    const curve = props.curve ?? 'linear';
    const tension = props.tension ?? 0.5;
    const fillOpacity = props.fillOpacity ?? 0;
    const strokeWidth = props.lineStrokeWidth ?? 2;
    const nodes: SvgNode[] = [];
    const progress = ctx.progress;

    // Animating the geometry rather than the opacity keeps a partially drawn chart honest: every
    // point that is on screen is at its real value.
    const grown = geometry.points.map((point) => ({
        ...point,
        y: Number.isFinite(point.y) && Number.isFinite(baseline) ? baseline + (point.y - baseline) * progress : point.y
    }));

    const runs = props.connectNulls === true || props.connectNulls === 'connect' ? [grown.filter(isPlaced)] : splitAtGaps(grown);

    const dash = resolveDashPattern(props.lineDash ?? props.lineStyle);

    for (const [runIndex, run] of runs.entries()) {
        if (run.length === 0) continue;

        const path = run.map((point) => ({ x: point.x, y: point.y }));

        if (fillOpacity > 0) {
            const lowerRun = run.map((point) => {
                const index = geometry.points.findIndex((candidate) => candidate.dataIndex === point.dataIndex);
                const target = geometry.lower[index] ?? { x: point.x, y: baseline };

                return { x: target.x, y: Number.isFinite(target.y) ? baseline + (target.y - baseline) * progress : baseline };
            });

            nodes.push({
                tag: 'path',
                attrs: {
                    class: `p-chart-area ${seriesColorClass(series.seriesIndex)}`,
                    'data-slot': 'chart-area',
                    'data-series': series.id,
                    d: areaPath(path, lowerRun, curve, tension),
                    fill: geometry.gradientId ? `url(#${geometry.gradientId})` : geometry.color,
                    'fill-opacity': fillOpacity,
                    stroke: 'none'
                },
                children: []
            });
        }

        // The halo is drawn first so the main stroke sits on top of it.
        if (props.borderColor != null && props.borderStrokeWidth != null) {
            const haloCtx = itemContext(series.points[0], 0, series.seriesIndex, series.id, null);

            nodes.push({
                tag: 'path',
                attrs: {
                    class: 'p-chart-line-border',
                    'data-slot': 'chart-line-border',
                    'data-series': series.id,
                    d: curvePath(path, curve, tension),
                    fill: 'none',
                    stroke: (resolveColorAccessor(props.borderColor, haloCtx) as string) ?? 'none',
                    'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, haloCtx) as number) ?? strokeWidth + 2,
                    'stroke-linecap': props.borderCapStyle ?? 'round',
                    'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, haloCtx)),
                    'stroke-dashoffset': (resolveScalarAccessor(props.borderDashOffset, haloCtx) as number) ?? null
                },
                children: []
            });
        }

        if (props.segmentColor || props.segmentStrokeWidth || props.segmentDash) {
            nodes.push(...paintSegments(ctx, series, props, run, curve, tension, geometry.color, strokeWidth));
        } else {
            nodes.push({
                tag: 'path',
                attrs: {
                    class: `p-chart-line ${seriesColorClass(series.seriesIndex)}`,
                    'data-slot': 'chart-line',
                    'data-series': series.id,
                    'data-run': runIndex,
                    d: curvePath(path, curve, tension),
                    fill: 'none',
                    stroke: geometry.gradientId ? `url(#${geometry.gradientId})` : geometry.color,
                    'stroke-width': strokeWidth,
                    'stroke-linecap': props.lineCapStyle ?? 'round',
                    'stroke-linejoin': props.lineJoinStyle ?? 'round',
                    'stroke-dasharray': dashAttr(dash),
                    'stroke-dashoffset': props.lineDashOffset ?? null,
                    opacity: markOpacity(ctx, series.id, -1, 1)
                },
                children: []
            });
        }
    }

    if (props.showMarkers) {
        nodes.push(...paintMarkers(ctx, series, props, grown, geometry.color));
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-line', 'data-series': series.id, 'data-series-type': 'line' }, nodes)];
}

/** Paints a line one segment at a time, which is what the per-segment callbacks need. */
function paintSegments(ctx: DrawContext, series: ResolvedSeries, props: LineSeriesProps, run: readonly ComputedPoint[], curve: LineSeriesProps['curve'], tension: number, fallbackColor: string, fallbackWidth: number): SvgNode[] {
    const data = props.data ?? [];
    const nodes: SvgNode[] = [];

    for (let i = 1; i < run.length; i++) {
        const p0 = run[i - 1];
        const p1 = run[i];
        const segment = {
            p0,
            p1,
            p0DataIndex: p0.dataIndex,
            p1DataIndex: p1.dataIndex,
            datum0: data[p0.dataIndex],
            datum1: data[p1.dataIndex],
            seriesId: series.id,
            seriesIndex: series.seriesIndex
        };

        const color = typeof props.segmentColor === 'function' ? props.segmentColor(segment) : props.segmentColor;
        const width = typeof props.segmentStrokeWidth === 'function' ? props.segmentStrokeWidth(segment) : props.segmentStrokeWidth;
        const dash = typeof props.segmentDash === 'function' ? props.segmentDash(segment) : props.segmentDash;

        nodes.push({
            tag: 'path',
            attrs: {
                class: 'p-chart-line-segment',
                'data-slot': 'chart-line-segment',
                'data-series': series.id,
                d: curvePath([p0, p1], curve, tension),
                fill: 'none',
                // A callback returning undefined means "use the series default", so the fallback is
                // applied here rather than treated as a missing stroke.
                stroke: typeof color === 'string' ? color : fallbackColor,
                'stroke-width': typeof width === 'number' ? width : fallbackWidth,
                'stroke-linecap': props.lineCapStyle ?? 'round',
                'stroke-dasharray': dashAttr(Array.isArray(dash) ? dash : [])
            },
            children: []
        });
    }

    return nodes;
}

/** Paints the point markers. */
export function paintMarkers(ctx: DrawContext, series: ResolvedSeries, props: LineSeriesProps, points: readonly ComputedPoint[], fallbackColor: string): SvgNode[] {
    const data = props.data ?? [];
    const nodes: SvgNode[] = [];
    const multiplier = ctx.hoverEffect?.radiusMultiplier ?? 1.3;

    for (const point of points) {
        if (!isPlaced(point)) continue;

        const context: ItemContext<unknown> = itemContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const hovered = isHovered(ctx, series.id, point.dataIndex);
        const baseSize = (resolveScalarAccessor(props.markerSize, context, 4) as number) ?? 4;
        const size = hovered ? (props.hoverPointRadius ?? baseSize * multiplier) : baseSize;

        context.size = size;

        const shape = (resolveScalarAccessor(props.markerShape, context, 'circle') as string) ?? 'circle';
        const fill = hovered && props.pointHoverBackgroundColor ? props.pointHoverBackgroundColor : ((resolveColorAccessor(props.pointBackgroundColor, context) as string) ?? fallbackColor);
        const stroke = hovered && props.pointHoverBorderColor ? props.pointHoverBorderColor : (resolveColorAccessor(props.pointBorderColor, context) as string | undefined);
        const strokeWidth = hovered && props.pointHoverBorderStrokeWidth != null ? props.pointHoverBorderStrokeWidth : (resolveScalarAccessor(props.pointBorderStrokeWidth, context) as number | undefined);
        const rotation = (resolveScalarAccessor(props.pointRotation, context, 0) as number) ?? 0;
        // An enum value resolves to a built-in shape; anything else is raw path data, which is what
        // lets an application pass an icon without a custom renderer.
        const d = isMarkerShapeName(shape) ? markerPath(shape, size) : shape;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-marker ${seriesColorClass(series.seriesIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-marker',
                'data-series': series.id,
                'data-index': point.dataIndex,
                'data-state': hovered ? 'hovered' : null,
                d,
                fill: typeof fill === 'string' ? fill : fallbackColor,
                /*
                 * A marker with no border still names a stroke, at zero width.
                 *
                 * That is what makes `stroke-width` alone enough to ring the markers in their own
                 * colour from a stylesheet: with `stroke: none` there is nothing for a width to
                 * draw, so the override would silently do nothing.
                 */
                stroke: typeof stroke === 'string' ? stroke : typeof fill === 'string' ? fill : fallbackColor,
                'stroke-width': strokeWidth ?? (typeof stroke === 'string' ? null : 0),
                'stroke-linejoin': props.pointBorderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.pointBorderDash, context)),
                opacity: markOpacity(ctx, series.id, point.dataIndex),
                transform: `translate(${point.x} ${point.y})${rotation ? ` rotate(${rotation})` : ''}`
            },
            children: []
        });
    }

    return nodes;
}

/** Turns a dash array into the attribute form, dropping an empty pattern. */
export function dashAttr(dash: readonly number[] | undefined): string | null {
    if (!dash || dash.length === 0) return null;

    return dash.join(' ');
}
