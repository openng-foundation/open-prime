/**
 * The radar and polar painters, plus the concentric grid they share.
 *
 * Both are drawn around a centre against a radial value axis, and both take that axis' configuration
 * from `ChartYAxis` rather than from the series -- the rings *are* the axis, so putting `gridShape`
 * and `tickCount` on the series would be describing the axis from the wrong place.
 *
 * Where they differ is the mark: radar closes a polygon through one point per spoke, polar draws a
 * bar per sector.
 */
import type { BaseAxisProps, ItemContext, PolarSeriesProps, RadarSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveDashAccessor, resolveDashPattern, resolveScalarAccessor } from '../core/accessor';
import { formatNumberTick } from '../core/format';
import { arcPath, isMarkerShapeName, markerPath, polygonPath, polarToCartesian, spokeAngles } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import { linearTicks, niceStep } from '../core/ticks';
import { unionCategories } from '../core/scale';
import { centerOf } from '../core/layout';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';
import type { PieFrame } from './series-pie';

/** The radial value axis, resolved into rings. */
export interface RadialAxis {
    /**
     * The spoke labels, in order.
     */
    categories: string[];
    /**
     * The value at each concentric ring.
     */
    ticks: number[];
    /**
     * Largest value the outer ring stands for.
     */
    max: number;
    /**
     * Smallest value the centre stands for.
     */
    min: number;
}

/**
 * The circle a radial chart draws on, inset to leave room for its own spoke labels.
 *
 * A radial chart's labels sit outside the outer ring, so unlike a cartesian axis there is no edge to
 * reserve against -- the space has to come out of the radius. Measuring the widest label rather
 * than guessing is what keeps "100" from being clipped at the top of the box.
 */
export function radialFrame(ctx: DrawContext, categories: readonly string[]): PieFrame {
    const widest = categories.reduce((max, label) => Math.max(max, ctx.measureText(label, ctx.fontSize)), 0);
    // The vertical inset is a line height rather than the label width, since a label above or below
    // the circle costs height, not width.
    const inset = Math.max(widest + ctx.fontSize * 0.5, ctx.fontSize * 1.5);
    const radius = Math.max(Math.min(ctx.area.width - inset * 2, ctx.area.height - ctx.fontSize * 3) / 2, 0);

    return { center: centerOf(ctx.area), radius };
}

/** Builds the radial axis shared by every radial series in the chart. */
export function resolveRadialAxis(series: readonly ResolvedSeries[], props: BaseAxisProps | undefined, tickCount = 4): RadialAxis {
    const categories = unionCategories(series.map((entry) => entry.categories));
    let min = 0;
    let max = -Infinity;

    for (const entry of series) {
        for (const point of entry.points) {
            if (point.value == null) continue;
            max = Math.max(max, point.value);
            min = Math.min(min, point.value);
        }
    }

    if (!Number.isFinite(max)) max = 1;

    /*
     * A radial axis starts at the centre, and the centre is zero unless the data goes below it.
     * Cutting a radial axis is far more misleading than cutting a cartesian one: the reader is
     * comparing areas, and a non-zero centre inflates every one of them.
     *
     * The rings are equal fractions of a rounded rim rather than nice steps chosen independently.
     * On a cartesian axis those are the same thing; on a radial one they are not, because the rim
     * *is* the outermost ring -- so a nice step of 20 against a max of 95 put the rim at 100 and
     * then drew a fifth ring the reader had not asked for. Rounding the rim first and dividing it
     * gives the four rings that were asked for, at 25 apiece.
     */
    const rim = niceCeiling(max);
    const count = Math.max(props?.tickCount ?? tickCount, 1);
    const ticks = min < 0 ? linearTicks(min, rim, count) : Array.from({ length: count + 1 }, (_, i) => (rim * i) / count);

    return { categories, ticks, min: ticks[0] ?? min, max: ticks[ticks.length - 1] ?? max };
}

/** Maps a value onto a radius. */
export function radiusFor(axis: RadialAxis, value: number, frame: PieFrame, innerRadius = 0): number {
    const span = axis.max - axis.min || 1;
    const usable = frame.radius - innerRadius;

    return innerRadius + ((value - axis.min) / span) * usable;
}

/**
 * Rounds a maximum up to a readable rim.
 *
 * The same 1/2/5/10 ladder the tick generator uses, applied to the value itself rather than to a
 * step, so 95 becomes 100 and 47 becomes 50.
 */
function niceCeiling(max: number): number {
    if (!Number.isFinite(max) || max <= 0) return 1;

    const step = niceStep(max);

    return step * Math.ceil(max / step);
}

/** Paints the concentric grid, the spokes and the value labels. */
export function paintRadialGrid(ctx: DrawContext, axis: RadialAxis, props: BaseAxisProps & { gridShape?: 'polygon' | 'circle' }, frame: PieFrame, defaultShape: 'polygon' | 'circle'): SvgNode[] {
    if (props.visible === false) return [];

    const shape = props.gridShape ?? defaultShape;
    const sides = axis.categories.length;
    const angles = spokeAngles(sides);
    const nodes: SvgNode[] = [];

    if (props.gridLines !== false) {
        for (const tick of axis.ticks) {
            const radius = radiusFor(axis, tick, frame);

            if (radius <= 0) continue;

            nodes.push({
                tag: 'path',
                attrs: {
                    class: 'p-chart-grid-line',
                    'data-slot': 'chart-radial-grid',
                    d: shape === 'polygon' && sides >= 3 ? polygonPath(frame.center.x, frame.center.y, radius, sides) : circleOutline(frame.center.x, frame.center.y, radius),
                    fill: 'none',
                    stroke: props.gridColor ?? ctx.theme.grid ?? 'currentColor',
                    'stroke-width': props.gridStrokeWidth ?? 0.5,
                    'stroke-opacity': props.gridOpacity ?? 0.6,
                    'stroke-dasharray': dashAttr(resolveDashPattern(props.gridStyle))
                },
                children: []
            });
        }
    }

    if (props.showLine !== false) {
        for (const angle of angles) {
            const end = polarToCartesian(frame.center.x, frame.center.y, frame.radius, angle);

            nodes.push({
                tag: 'line',
                attrs: {
                    /*
                     * A spoke's own class, not the axis line's.
                     *
                     * Sharing `p-chart-axis-line` meant the stylesheet's axis colour won over the
                     * grid colour set here -- CSS beats a presentation attribute -- so the spokes
                     * came out as dark as an axis instead of as faint as the rings they divide.
                     */
                    class: 'p-chart-radial-spoke',
                    'data-slot': 'chart-radial-spoke',
                    x1: frame.center.x,
                    y1: frame.center.y,
                    x2: end.x,
                    y2: end.y,
                    stroke: props.gridColor ?? ctx.theme.grid ?? 'currentColor',
                    'stroke-width': props.gridStrokeWidth ?? 0.5,
                    'stroke-opacity': props.gridOpacity ?? 0.6
                },
                children: []
            });
        }
    }

    // The spoke labels sit outside the outer ring, anchored by which side of the circle they are on
    // so they read outward rather than overlapping the plot.
    for (const [index, angle] of angles.entries()) {
        const label = axis.categories[index];

        if (label == null) continue;

        const point = polarToCartesian(frame.center.x, frame.center.y, frame.radius + ctx.fontSize, angle);
        const cos = Math.cos((angle * Math.PI) / 180);

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-tick-label',
                'data-slot': 'chart-radial-label',
                x: point.x,
                y: point.y,
                fill: ctx.theme.tickLabel ?? 'currentColor',
                'font-size': ctx.fontSize,
                'font-family': ctx.fontFamily,
                'text-anchor': Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end',
                'dominant-baseline': 'central'
            },
            children: [label]
        });
    }

    if (props.showLabels !== false) {
        /*
         * The value labels run up the vertical spoke, nudged to its right and anchored at their
         * start rather than centred on it -- centred, they would straddle the spoke line and sit
         * under the marks.
         *
         * The first and last ticks are skipped. The centre is a point rather than a ring, so a
         * label there annotates nothing and collides with every spoke meeting it; the outermost
         * would land on top of the topmost spoke label.
         */
        const gap = 4;

        for (const [index, tick] of axis.ticks.entries()) {
            if (index === 0 || index === axis.ticks.length - 1) continue;

            const radius = radiusFor(axis, tick, frame);

            if (radius <= 0) continue;

            nodes.push({
                tag: 'text',
                attrs: {
                    class: 'p-chart-tick-label',
                    'data-slot': 'chart-radial-value',
                    x: frame.center.x + gap,
                    y: frame.center.y - radius,
                    fill: ctx.theme.tickLabel ?? 'currentColor',
                    'font-size': Math.max(ctx.fontSize - 1, 9),
                    'font-family': ctx.fontFamily,
                    'text-anchor': 'start',
                    'dominant-baseline': 'central'
                },
                children: [formatNumberTick(tick, ctx.locale)]
            });
        }
    }

    return [slotGroup('chart-radial-axis', { class: 'p-chart-radial-axis' }, nodes)];
}

/** A circle drawn as an outline path, so it goes down the same code path as the polygon. */
function circleOutline(cx: number, cy: number, r: number): string {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

/** Paints a radar series: one closed polygon through the spoke values. */
export function paintRadarSeries(ctx: DrawContext, series: ResolvedSeries, props: RadarSeriesProps, axis: RadialAxis, frame: PieFrame): SvgNode[] {
    const angles = spokeAngles(axis.categories.length);
    const color = typeof props.color === 'string' ? props.color : ctx.seriesColor(series.seriesIndex);
    const data = (props.data as unknown[] | undefined) ?? [];
    const vertices: { x: number; y: number; dataIndex: number; value: number }[] = [];

    for (const point of series.points) {
        if (point.value == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const index = axis.categories.indexOf(point.category);

        if (index < 0) continue;

        // Growing the radius with progress opens the polygon out of the centre, so a partially
        // drawn radar shows a real, smaller profile rather than the final one faded in.
        const radius = radiusFor(axis, point.value, frame) * ctx.progress;
        const position = polarToCartesian(frame.center.x, frame.center.y, radius, angles[index]);

        vertices.push({ ...position, dataIndex: point.dataIndex, value: point.value });
    }

    if (vertices.length === 0) return [];

    const closed = `${vertices.map((vertex, i) => `${i === 0 ? 'M' : 'L'} ${vertex.x} ${vertex.y}`).join(' ')} Z`;
    const nodes: SvgNode[] = [
        {
            tag: 'path',
            attrs: {
                class: `p-chart-radar ${seriesColorClass(series.seriesIndex)}`,
                'data-slot': 'chart-radar',
                'data-series': series.id,
                d: closed,
                fill: color,
                'fill-opacity': props.fillOpacity ?? 0.2,
                stroke: color,
                'stroke-width': props.lineStrokeWidth ?? 2,
                'stroke-linejoin': props.borderJoinStyle ?? 'round',
                'stroke-dasharray': dashAttr(resolveDashPattern(props.lineDash ?? props.lineStyle))
            },
            children: []
        }
    ];

    // Markers are off unless asked for. The reference's prop table lists the default as true, but
    // its own basic radar renders none -- and the render is what a 1:1 port has to match. A radar
    // reads as a filled profile, and a dot at every vertex of every overlaid series clutters it.
    if (props.showMarkers === true) {
        for (const vertex of vertices) {
            const context: ItemContext<unknown> = itemContext(data[vertex.dataIndex], vertex.dataIndex, series.seriesIndex, series.id, vertex.value);
            const hovered = isHovered(ctx, series.id, vertex.dataIndex);
            const size = (resolveScalarAccessor(props.markerSize, context, 4) as number) ?? 4;

            context.size = size;

            const shape = (resolveScalarAccessor(props.markerShape, context, 'circle') as string) ?? 'circle';

            nodes.push({
                tag: 'path',
                attrs: {
                    class: `p-chart-marker ${seriesColorClass(series.seriesIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                    'data-slot': 'chart-marker',
                    'data-series': series.id,
                    'data-index': vertex.dataIndex,
                    d: isMarkerShapeName(shape) ? markerPath(shape, hovered ? size * (ctx.hoverEffect?.radiusMultiplier ?? 1.3) : size) : shape,
                    fill: (resolveColorAccessor(props.pointBackgroundColor, context, color) as string) ?? color,
                    stroke: (resolveColorAccessor(props.pointBorderColor, context) as string | undefined) ?? null,
                    'stroke-width': (resolveScalarAccessor(props.pointBorderStrokeWidth, context) as number | undefined) ?? null,
                    opacity: markOpacity(ctx, series.id, vertex.dataIndex),
                    transform: `translate(${vertex.x} ${vertex.y})`
                },
                children: []
            });
        }
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-radar', 'data-series': series.id, 'data-series-type': 'radar' }, nodes)];
}

/** Paints a polar series: one radial bar per sector. */
export function paintPolarSeries(ctx: DrawContext, series: ResolvedSeries, props: PolarSeriesProps, axis: RadialAxis, frame: PieFrame, sectorCount: number, sectorIndex: number): SvgNode[] {
    const sectors = axis.categories.length;

    if (sectors === 0) return [];

    const step = 360 / sectors;
    const spacingDegrees = props.spacing != null && frame.radius > 0 ? Math.min((props.spacing / (2 * Math.PI * frame.radius)) * 360, step / 3) : 0;
    const slot = (step - spacingDegrees) / Math.max(sectorCount, 1);
    const innerRadius = frame.radius * Math.min(Math.max(props.innerRadius ?? 0, 0), 1);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];

    for (const point of series.points) {
        if (point.value == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const index = axis.categories.indexOf(point.category);

        if (index < 0) continue;

        const context: ItemContext<unknown> = itemContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const hovered = isHovered(ctx, series.id, point.dataIndex);
        const fallback = ctx.seriesColor(series.seriesIndex);
        const fill = (hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined) ?? (resolveColorAccessor(props.color, context, fallback) as string) ?? fallback;
        const base = -90 + index * step + spacingDegrees / 2;
        const start = base + sectorIndex * slot;
        const outer = innerRadius + (radiusFor(axis, point.value, frame, innerRadius) - innerRadius) * ctx.progress;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-polar-bar ${seriesColorClass(series.seriesIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-polar-bar',
                'data-series': series.id,
                'data-index': point.dataIndex,
                'data-category': point.category,
                d: arcPath(frame.center.x, frame.center.y, innerRadius, outer, start, start + slot, (resolveScalarAccessor(props.borderRadius, context, 0) as number) ?? 0),
                fill,
                'fill-opacity': (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1,
                stroke: (resolveColorAccessor(props.borderColor, context) as string | undefined) ?? null,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity: markOpacity(ctx, series.id, point.dataIndex)
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-polar', 'data-series': series.id, 'data-series-type': 'polar' }, nodes)];
}
