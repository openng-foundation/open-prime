/**
 * The heatmap painter.
 *
 * A heatmap is a grid of two categorical dimensions with the value carried by colour, so unlike
 * every other cartesian series both of its axes are band scales and neither measures the value. The
 * value axis, in effect, is the colour scale -- which is why `ChartColorLegend` rather than
 * `ChartLegend` is what makes one readable.
 */
import type { HeatmapCellContext, HeatmapSeriesProps, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { interpolateScale, resolveColorScale, withOpacity } from '../core/color';
import { roundedRectPath } from '../core/geometry';
import { DEFAULT_HEAT_RANGE } from '../core/palette';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One cell, resolved into a rectangle and a colour. */
export interface HeatmapCell {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number | null;
    xLabel: string;
    yLabel: string;
    row: number;
    col: number;
    color: string;
    dataIndex: number;
    isEmpty: boolean;
}

/** The colour scale a heatmap resolved for itself, which the colour legend also reads. */
export interface HeatmapScale {
    scale: number[];
    range: string[];
    opacityMapped: boolean;
    min: number;
    max: number;
}

/**
 * Resolves the colour scale.
 *
 * The priority is the documented one: an explicit scale with an explicit range, then a range with
 * breakpoints taken from the data, then a single colour mapped by opacity, and finally the built-in
 * heat ramp.
 */
export function resolveHeatmapScale(series: ResolvedSeries, props: HeatmapSeriesProps): HeatmapScale {
    let min = props.min ?? Infinity;
    let max = props.max ?? -Infinity;

    if (props.min == null || props.max == null) {
        for (const point of series.points) {
            if (point.value == null) continue;
            if (props.min == null) min = Math.min(min, point.value);
            if (props.max == null) max = Math.max(max, point.value);
        }
    }

    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1;

    const resolved = resolveColorScale({
        colorScale: props.colorScale,
        colorRange: props.colorRange,
        color: typeof props.color === 'string' ? props.color : undefined,
        min,
        max,
        fallbackRange: DEFAULT_HEAT_RANGE
    });

    return { ...resolved, min, max };
}

/**
 * Projects a heatmap into cells.
 *
 * The grid comes from the two axes rather than from the data, so a combination absent from the data
 * still occupies its slot. That is the point of a matrix: a hole has to be visible as a hole, not
 * closed up as if the row were shorter.
 */
export function projectHeatmap(ctx: DrawContext, series: ResolvedSeries, props: HeatmapSeriesProps, scale: HeatmapScale): HeatmapCell[] {
    const xScale = scaleFor(ctx, 'x', series.xAxisId);
    const yScale = scaleFor(ctx, 'y', series.yAxisId);

    if (xScale?.type !== 'band' || yScale?.type !== 'band') return [];

    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const yField = typeof props.categoryYField === 'string' ? props.categoryYField : 'row';
    const spacing = props.spacing ?? 1;
    const cells: HeatmapCell[] = [];

    for (const point of series.points) {
        if (!ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const datum = data[point.dataIndex];
        const yLabel = String(readPath(datum, yField) ?? '');
        const left = xScale.bandStart(point.category);
        const top = yScale.bandStart(yLabel);

        if (!Number.isFinite(left) || !Number.isFinite(top)) continue;

        const context: ItemContext<unknown> = itemContext(datum, point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const isEmpty = point.value == null;
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;
        const color = isEmpty ? (props.nullColor ?? 'transparent') : cellColor(point.value as number, scale, opacity);

        context.fillColor = color;

        const explicit = resolveColorAccessor(props.color, context);

        cells.push({
            x: left + spacing / 2,
            y: top + spacing / 2,
            width: Math.max(xScale.bandwidth - spacing, 0),
            height: Math.max(yScale.bandwidth - spacing, 0),
            value: point.value,
            xLabel: point.category,
            yLabel,
            row: yScale.domain.indexOf(yLabel),
            col: xScale.domain.indexOf(point.category),
            // An explicit per-cell colour wins over the scale; the scale is the default, not a rule.
            color: typeof explicit === 'string' && !scale.opacityMapped ? explicit : color,
            dataIndex: point.dataIndex,
            isEmpty
        });
    }

    return cells;
}

/** The colour a value maps to, whether through a gradient or through opacity. */
function cellColor(value: number, scale: HeatmapScale, opacity: number): string {
    if (scale.opacityMapped) {
        const span = scale.max - scale.min || 1;
        const ratio = Math.min(Math.max((value - scale.min) / span, 0), 1);

        // A single colour encodes the value in its alpha, so the floor keeps the lightest cell
        // visible rather than letting it vanish into the background.
        return withOpacity(scale.range[0], (0.15 + ratio * 0.85) * opacity);
    }

    const color = interpolateScale(value, scale.scale, scale.range);

    return opacity >= 1 ? color : withOpacity(color, opacity);
}

/** Paints a heatmap series. */
export function paintHeatmapSeries(ctx: DrawContext, series: ResolvedSeries, props: HeatmapSeriesProps, scale: HeatmapScale): SvgNode[] {
    const cells = projectHeatmap(ctx, series, props, scale);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];

    for (const cell of cells) {
        if (cell.isEmpty && props.showEmptyCells === false) continue;

        const context: ItemContext<unknown> = itemContext(data[cell.dataIndex], cell.dataIndex, series.seriesIndex, series.id, cell.value, cell.xLabel, { fillColor: cell.color });
        const hovered = isHovered(ctx, series.id, cell.dataIndex);
        const stroke = hovered
            ? ((resolveColorAccessor(props.hoverBorderColor, context) as string | undefined) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined))
            : (resolveColorAccessor(props.borderColor, context) as string | undefined);
        const fill = hovered ? ((resolveColorAccessor(props.hoverColor, context) as string | undefined) ?? cell.color) : cell.color;
        // Progress grows each cell out of its own centre, so a partially drawn heatmap reads as a
        // grid coming into focus rather than as a wall fading in.
        const inset = ((1 - ctx.progress) * Math.min(cell.width, cell.height)) / 2;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-heatmap-cell${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-heatmap-cell',
                'data-series': series.id,
                'data-index': cell.dataIndex,
                'data-category': cell.xLabel,
                'data-row': cell.yLabel,
                'data-state': hovered ? 'hovered' : null,
                'data-empty': cell.isEmpty ? '' : null,
                d: roundedRectPath(cell.x + inset, cell.y + inset, cell.width - inset * 2, cell.height - inset * 2, props.borderRadius ?? 0),
                fill: cell.isEmpty ? 'none' : fill,
                stroke: cell.isEmpty ? (stroke ?? props.nullColor ?? 'currentColor') : (stroke ?? null),
                // An empty cell is outlined in a dash rather than filled, so it reads as "no
                // reading" instead of as a reading of zero.
                'stroke-dasharray': cell.isEmpty ? '3 3' : dashAttr(resolveDashAccessor(props.borderDash, context)),
                'stroke-width': cell.isEmpty ? 1 : ((resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null),
                'stroke-linejoin': props.borderJoinStyle ?? null,
                opacity: markOpacity(ctx, series.id, cell.dataIndex)
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-heatmap', 'data-series': series.id, 'data-series-type': 'heatmap' }, nodes)];
}

/** Builds the context a cell template or render function receives. */
export function heatmapCellContext(cell: HeatmapCell, data: readonly unknown[]): HeatmapCellContext {
    return {
        data: data[cell.dataIndex],
        index: cell.dataIndex,
        value: cell.value,
        xLabel: cell.xLabel,
        yLabel: cell.yLabel,
        color: cell.color,
        x: cell.x,
        y: cell.y,
        width: cell.width,
        height: cell.height,
        row: cell.row,
        col: cell.col,
        isEmpty: cell.isEmpty
    };
}

/** Finds the cell under the pointer. */
export function hitTestHeatmap(cells: readonly HeatmapCell[], x: number, y: number): HeatmapCell | null {
    for (const cell of cells) {
        if (x >= cell.x && x <= cell.x + cell.width && y >= cell.y && y <= cell.y + cell.height) return cell;
    }

    return null;
}
