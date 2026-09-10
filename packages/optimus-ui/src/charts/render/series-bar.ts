/**
 * The bar painter: column, bar, grouped, stacked, waterfall, floating and variwide.
 *
 * All of those are one painter because the differences arrive already resolved. Stacking and the
 * waterfall have turned into a base and a top per point; grouping is a matter of how the band is
 * divided; horizontal is a swap of which axis carries the category. What is left is drawing a
 * rectangle between two numbers.
 */
import type { BarSeriesProps, BorderRadius, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { roundedRectPath } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import type { ResolvedSeries } from '../charts-state';
import { baselineOn, isHovered, markOpacity, scaleFor, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One bar's resolved rectangle and state. */
export interface BarGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    base: number;
    category: string;
    dataIndex: number;
    isNegative: boolean;
    /**
     * Whether the bar is a waterfall summary rather than a step.
     */
    isTotal: boolean;
}

/** How a category band is divided between the series sharing it. */
export interface BandSlot {
    /**
     * Offset from the band's start to this series' slot.
     */
    offset: number;
    /**
     * Width of this series' slot.
     */
    size: number;
}

/**
 * Divides a category band between the series drawn side by side in it.
 *
 * Stacked and overlapped series all take the full band, because they occupy the same horizontal
 * space by definition; only grouped series split it.
 */
export function bandSlotFor(bandwidth: number, seriesCount: number, seriesPosition: number, props: BarSeriesProps, grouped: boolean): BandSlot {
    const categoryGap = props.categoryGap ?? 0.1;
    const barGap = props.barGap ?? 0.02;
    const usable = bandwidth * (1 - categoryGap);
    const inset = (bandwidth - usable) / 2;

    if (!grouped || seriesCount <= 1) {
        const size = clampThickness(usable, props);

        return { offset: inset + (usable - size) / 2, size };
    }

    const totalGap = usable * barGap * (seriesCount - 1);
    const slot = (usable - totalGap) / seriesCount;
    const size = clampThickness(slot, props);

    return { offset: inset + seriesPosition * (slot + usable * barGap) + (slot - size) / 2, size };
}

/** Applies the fixed and maximum thickness inputs. */
function clampThickness(size: number, props: BarSeriesProps): number {
    if (props.barThickness != null) return props.barThickness;
    if (props.maxBarThickness != null) return Math.min(size, props.maxBarThickness);

    return Math.max(size, 0);
}

/**
 * Projects a bar series into rectangles.
 *
 * `minBarLength` is applied after the geometry rather than to the value, so a tiny value stays
 * visible without the axis claiming it is larger than it is.
 */
export function projectBars(ctx: DrawContext, series: ResolvedSeries, props: BarSeriesProps, slot: BandSlot, horizontal: boolean): BarGeometry[] {
    const categoryScale = scaleFor(ctx, horizontal ? 'y' : 'x', horizontal ? series.yAxisId : series.xAxisId);
    const valueScale = scaleFor(ctx, horizontal ? 'x' : 'y', horizontal ? series.xAxisId : series.yAxisId);

    // A value scale that turned out to be categorical has no numbers to measure against, so
    // there is nothing to draw rather than something to draw at NaN.
    if (!categoryScale || categoryScale.type !== 'band' || !valueScale || valueScale.type === 'band') return [];

    const baseline = baselineOn(valueScale);
    const progress = ctx.progress;
    const bars: BarGeometry[] = [];

    for (const point of series.points) {
        if (point.value == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const bandStart = categoryScale.bandStart(point.category);

        if (!Number.isFinite(bandStart)) continue;

        const basePixel = point.base === 0 ? baseline : valueScale.scale(point.base);
        const valuePixel = valueScale.scale(point.value);

        if (!Number.isFinite(basePixel) || !Number.isFinite(valuePixel)) continue;

        // Growing out of the base rather than fading in keeps every on-screen bar at a real value
        // for the whole of the entrance animation.
        const animatedValue = basePixel + (valuePixel - basePixel) * progress;
        const from = Math.min(basePixel, animatedValue);
        const to = Math.max(basePixel, animatedValue);
        let extent = to - from;
        let start = from;

        if (props.minBarLength != null && extent < props.minBarLength && progress >= 1) {
            extent = props.minBarLength;
            // A negative bar grows the other way, so the minimum is applied on the correct side.
            start = valuePixel <= basePixel ? basePixel - extent : basePixel;
        }

        const shared = { value: point.value, base: point.base, category: point.category, dataIndex: point.dataIndex, isNegative: point.value < point.base, isTotal: point.isTotal === true };

        bars.push(horizontal ? { x: start, y: bandStart + slot.offset, width: extent, height: slot.size, ...shared } : { x: bandStart + slot.offset, y: start, width: slot.size, height: extent, ...shared });
    }

    return bars;
}

/**
 * The colour a bar falls back to when the series does not set one.
 *
 * On a waterfall this is the direction colour rather than the series colour: a waterfall exists to
 * show what went up and what came down, and painting every step the same defeats the chart. A
 * summary bar is neither, so it keeps the series colour.
 */
function fallbackColorFor(ctx: DrawContext, series: ResolvedSeries, bar: BarGeometry): string {
    if (!series.registration.waterfall || bar.isTotal) return ctx.seriesColor(series.seriesIndex);

    const directional = bar.isNegative ? ctx.theme.negative : ctx.theme.positive;

    return directional ?? ctx.seriesColor(series.seriesIndex);
}

/** Paints a bar series. */
export function paintBarSeries(ctx: DrawContext, series: ResolvedSeries, props: BarSeriesProps, slot: BandSlot, horizontal: boolean): SvgNode[] {
    const bars = projectBars(ctx, series, props, slot, horizontal);
    const data = props.data ?? [];
    const nodes: SvgNode[] = [];

    for (const bar of bars) {
        const context: ItemContext<unknown> = itemContext(data[bar.dataIndex], bar.dataIndex, series.seriesIndex, series.id, bar.value, bar.category);
        const hovered = isHovered(ctx, series.id, bar.dataIndex);
        const fallback = fallbackColorFor(ctx, series, bar);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const fill = hoverFill ?? (resolveColorAccessor(props.color, context, fallback) as string) ?? fallback;
        const stroke = hovered
            ? ((resolveColorAccessor(props.hoverBorderColor, context) as string | undefined) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined))
            : (resolveColorAccessor(props.borderColor, context) as string | undefined);
        const radius = resolveScalarAccessor(props.borderRadius, context, 0) as BorderRadius;
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;

        // Hover lift moves the bar rather than recolouring it, which is what `ChartHover.offset`
        // asks for: the bar rises out of the row.
        const lift = hovered && ctx.hoverEffect?.offset ? ctx.hoverEffect.offset : 0;
        const geometry = horizontal ? { ...bar, x: bar.x + lift } : { ...bar, y: bar.y - lift };

        const custom = props.renderShape?.({
            x: geometry.x,
            y: geometry.y,
            width: geometry.width,
            height: geometry.height,
            value: bar.value,
            category: bar.category,
            dataIndex: bar.dataIndex,
            isNegative: bar.isNegative
        });

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-bar ${seriesColorClass(series.seriesIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-bar',
                'data-series': series.id,
                'data-index': bar.dataIndex,
                'data-category': bar.category,
                'data-state': hovered ? 'hovered' : null,
                'data-direction': series.registration.waterfall ? (bar.isTotal ? 'total' : bar.isNegative ? 'negative' : 'positive') : null,
                d: custom ?? shapeFor(geometry, radius, props, bar.isNegative, horizontal),
                fill,
                'fill-opacity': opacity,
                /*
                 * A bar with no border still names a stroke, at zero width.
                 *
                 * That is what makes `stroke-width` alone enough to give the bars a border in their
                 * own colour from a stylesheet -- with `stroke: none` there is nothing for a width
                 * to draw, so the override would silently do nothing.
                 */
                stroke: stroke ?? (typeof fill === 'string' ? fill : null),
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? (stroke ? null : 0),
                'stroke-linejoin': props.borderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                'stroke-dashoffset': (resolveScalarAccessor(props.borderDashOffset, context) as number | undefined) ?? null,
                opacity: markOpacity(ctx, series.id, bar.dataIndex)
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-bar', 'data-series': series.id, 'data-series-type': 'bar' }, nodes)];
}

/**
 * Builds a bar's path.
 *
 * Corner rounding is applied only to the end away from the baseline. Rounding all four corners of a
 * stacked segment would put a visible notch between it and the segment below, and rounding the
 * baseline end of any bar lifts it off its own axis.
 */
function shapeFor(bar: BarGeometry, radius: BorderRadius, props: BarSeriesProps, isNegative: boolean, horizontal: boolean): string {
    if (!radius || radius === 0) {
        return roundedRectPath(bar.x, bar.y, bar.width, bar.height, 0);
    }

    if (typeof radius === 'object') {
        return roundedRectPath(bar.x, bar.y, bar.width, bar.height, radius);
    }

    const corners = horizontal
        ? isNegative
            ? { topLeft: radius, bottomLeft: radius, topRight: 0, bottomRight: 0 }
            : { topRight: radius, bottomRight: radius, topLeft: 0, bottomLeft: 0 }
        : isNegative
          ? { bottomLeft: radius, bottomRight: radius, topLeft: 0, topRight: 0 }
          : { topLeft: radius, topRight: radius, bottomLeft: 0, bottomRight: 0 };

    return roundedRectPath(bar.x, bar.y, bar.width, bar.height, corners);
}

/**
 * Whether a set of bar series should be grouped side by side.
 *
 * Bars are grouped by default and stacked only inside a `ChartStacked`, which is the documented
 * behaviour and the safer default: two overlapping bar series with no wrapper would hide one
 * behind the other, and grouping at least shows both.
 */
export function shouldGroup(series: readonly ResolvedSeries[]): boolean {
    const bars = series.filter((entry) => entry.type === 'bar' && entry.visible);

    if (bars.length <= 1) return false;

    return bars.some((entry) => entry.registration.stackId == null && entry.registration.overlapId == null);
}

/** The bar series that share a band, so each can be told its slot. */
export function groupedBars(series: readonly ResolvedSeries[]): ResolvedSeries[] {
    return series.filter((entry) => entry.type === 'bar' && entry.visible && entry.registration.stackId == null && entry.registration.overlapId == null);
}
