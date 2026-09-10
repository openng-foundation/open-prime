/**
 * The pie painter: pie, donut, gauge and nightingale.
 *
 * All four are one shape with different parameters. A donut is a pie with an inner radius, a gauge
 * is a donut with a sweep under 360 degrees, and a nightingale is a pie whose slices have their own
 * outer radii. Treating them as one series with `innerRadius`, `sweepAngle` and `sliceRadiusValue`
 * rather than as four types is what keeps every other input — the labels, the hover, the slice
 * template — working across all of them.
 */
import type { ItemContext, PieSeriesProps, SliceRenderContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { arcPath, polarToCartesian } from '../core/geometry';
import { seriesColorClass } from '../core/palette';
import { sortCategories } from '../core/stack';
import type { ResolvedSeries } from '../charts-state';
import { centerOf, radiusOf } from '../core/layout';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** One slice, resolved into angles and radii. */
export interface SliceGeometry {
    label: string;
    value: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
    dataIndex: number;
    /**
     * Radial offset, which is what pulls a slice out of an exploded pie.
     */
    offset: number;
    /**
     * Width of the gap to the neighbouring slices, in pixels.
     *
     * A width rather than an angle: the painter insets each end by a different amount at each
     * radius to keep the gap constant, which an angle cannot express. The angles above are the
     * slice's real band, so a label centres on the slice and hit-testing covers the gap.
     */
    padWidth: number;
}

/** Where a pie is drawn and how big it is. */
export interface PieFrame {
    center: { x: number; y: number };
    radius: number;
}

/** Works out the circle a radial series is drawn on. */
export function pieFrame(ctx: DrawContext): PieFrame {
    return { center: centerOf(ctx.area), radius: radiusOf(ctx.area) };
}

/**
 * Projects a pie series into slices.
 *
 * Only the visible slices contribute to the total, so hiding one through the legend re-proportions
 * the rest into a full circle rather than leaving a wedge-shaped hole. That is the right behaviour
 * for a part-to-whole chart: the whole is whatever is currently shown.
 */
export function projectSlices(ctx: DrawContext, series: ResolvedSeries, props: PieSeriesProps, frame: PieFrame): SliceGeometry[] {
    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const valueField = typeof props.valueField === 'string' ? props.valueField : 'value';
    const categoryField = typeof props.categoryField === 'string' ? props.categoryField : 'category';

    const entries = data
        .map((datum, dataIndex) => {
            const raw = readPath(datum, valueField);
            const value = typeof raw === 'number' ? raw : Number(raw);

            return {
                dataIndex,
                datum,
                label: String(readPath(datum, categoryField) ?? dataIndex),
                // A negative value has no meaning in a part-to-whole chart, so its magnitude is
                // used rather than letting it subtract from the total and distort every other slice.
                value: Number.isFinite(value) ? Math.abs(value) : 0
            };
        })
        .filter((entry) => ctx.isItemVisible(series.id, entry.dataIndex));

    if (entries.length === 0) return [];

    /*
     * A series whose values are all zero -- or whose value field is absent entirely -- falls back to
     * equal sweeps rather than rendering nothing.
     *
     * That is not a defensive fudge: it is the nightingale idiom. A rose encodes its magnitude in
     * the radius, so `sliceRadiusValue` carries the data and the angles are deliberately uniform.
     * Requiring a second, meaningless value field just to get twelve equal wedges would be asking
     * the author to say the same thing twice.
     */
    const magnitude = entries.reduce((sum, entry) => sum + entry.value, 0);
    const measured = magnitude > 0 ? entries.filter((entry) => entry.value > 0) : entries.map((entry) => ({ ...entry, value: 1 }));

    if (measured.length === 0) return [];

    const ordered = props.sort ? sortBySlice(measured, props.sort) : measured;
    const total = ordered.reduce((sum, entry) => sum + entry.value, 0);

    if (total <= 0) return [];

    const innerRatio = clamp01(props.innerRadius ?? 0);
    const outerRatio = clamp01(props.outerRadius ?? 1);
    const startAngle = props.startAngle ?? -90;
    const sweep = props.sweepAngle ?? 360;
    const spacing = props.spacing ?? 0;

    const outerRadius = frame.radius * outerRatio;
    const innerRadius = outerRadius * innerRatio;

    /*
     * The gap between slices stays as a width in pixels rather than being converted to an angle
     * here.
     *
     * Trimming an angle off each end is the obvious move and it is wrong: an angular gap is
     * `angle × radius` wide, so it closes at the centre and fans out at the rim. The painter offsets
     * the two radial edges perpendicularly instead, which is a constant width the whole way along --
     * and which only it can do, since the inset depends on the radius being drawn.
     *
     * Keeping the angles unpadded here has a second benefit: a label is centred on the slice's real
     * band and hit-testing covers the gap, so there is no dead strip between two slices.
     */
    const padWidth = spacing > 0 ? spacing : 0;

    // The radius values are resolved up front because each one is scaled against the largest of
    // *them*. Scaling against the angle values instead was a real bug: on a rose chart the angles
    // are all equal, so every slice came out at the full radius and the encoding disappeared.
    const radiusValues =
        props.sliceRadiusValue == null ? null : ordered.map((entry) => resolveScalarAccessor(props.sliceRadiusValue, itemContext(entry.datum, entry.dataIndex, series.seriesIndex, series.id, entry.value, entry.label)) as number | undefined);
    const maxRadiusValue = radiusValues ? Math.max(...radiusValues.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)), 0) : 0;

    const slices: SliceGeometry[] = [];
    let cursor = startAngle;

    for (const [position, entry] of ordered.entries()) {
        const fraction = entry.value / total;
        // Progress sweeps the pie open rather than fading it in, so a partially drawn pie shows a
        // real fraction of the data instead of the whole thing at low opacity.
        const span = fraction * sweep * ctx.progress;
        const context: ItemContext<unknown> = itemContext(entry.datum, entry.dataIndex, series.seriesIndex, series.id, entry.value, entry.label);
        const sliceRadius = radiusValues?.[position];
        const hovered = isHovered(ctx, series.id, entry.dataIndex);
        const explode = (resolveScalarAccessor(props.offset, context, 0) as number) ?? 0;
        const hoverOffset = hovered && ctx.hoverEffect?.offset ? ctx.hoverEffect.offset : 0;

        // A nightingale scales each slice's radius by its own value, which is what encodes the
        // magnitude in the radius as well as in the angle.
        const sliceOuter = sliceRadius != null ? scaleSliceRadius(sliceRadius, maxRadiusValue, outerRadius, innerRadius) : outerRadius;

        slices.push({
            label: entry.label,
            value: entry.value,
            percentage: fraction * 100,
            startAngle: cursor,
            endAngle: cursor + span,
            padWidth,
            innerRadius,
            outerRadius: sliceOuter,
            dataIndex: entry.dataIndex,
            offset: explode + hoverOffset
        });

        cursor += span;
    }

    return slices;
}

/**
 * The colour one slice is painted.
 *
 * Exported because the data labels need the same answer: a leader line takes its slice's colour, and
 * deriving it a second time from the palette alone ignored an explicit `color` array -- so the line
 * pointing at an amber slice came out green.
 */
export function sliceColor(ctx: DrawContext, series: ResolvedSeries, slice: SliceGeometry, props: PieSeriesProps, data: readonly unknown[]): string {
    const context: ItemContext<unknown> = itemContext(data[slice.dataIndex], slice.dataIndex, series.seriesIndex, series.id, slice.value, slice.label);
    // A pie's slices are the categories, so the palette varies per slice rather than per series.
    const fallback = ctx.seriesColor(slice.dataIndex);

    return (resolveColorAccessor(props.color, context, fallback) as string) ?? fallback;
}

/** Sorts the slices before they are laid out. */
function sortBySlice<T extends { label: string; value: number }>(entries: T[], order: NonNullable<PieSeriesProps['sort']>): T[] {
    const byLabel = new Map(entries.map((entry) => [entry.label, entry]));
    const labels = sortCategories(
        entries.map((entry) => entry.label),
        (label) => byLabel.get(label)?.value ?? 0,
        order
    );

    return labels.map((label) => byLabel.get(label)!).filter(Boolean);
}

/**
 * Maps a nightingale radius value onto the available radial band.
 *
 * Scaled against the largest radius value in the series, so the biggest slice reaches the outer
 * edge and the rest are read against it.
 */
function scaleSliceRadius(value: number, maxValue: number, outerRadius: number, innerRadius: number): number {
    if (maxValue <= 0) return outerRadius;

    return innerRadius + (outerRadius - innerRadius) * Math.min(Math.max(value / maxValue, 0), 1);
}

/** Paints a pie, donut, gauge or nightingale series. */
export function paintPieSeries(ctx: DrawContext, series: ResolvedSeries, props: PieSeriesProps, frame: PieFrame): SvgNode[] {
    const slices = projectSlices(ctx, series, props, frame);
    const data = (props.data as unknown[] | undefined) ?? [];
    const nodes: SvgNode[] = [];

    for (const slice of slices) {
        const context: ItemContext<unknown> = itemContext(data[slice.dataIndex], slice.dataIndex, series.seriesIndex, series.id, slice.value, slice.label);
        const hovered = isHovered(ctx, series.id, slice.dataIndex);
        // A slice's colour comes from its own index, not the series' -- a pie is one series whose
        // slices are the categories, so the palette has to vary per slice.
        const fallback = ctx.seriesColor(slice.dataIndex);
        const hoverFill = hovered ? (resolveColorAccessor(props.hoverColor, context) as string | undefined) : undefined;
        const fill = hoverFill ?? sliceColor(ctx, series, slice, props, data);
        const stroke = hovered
            ? ((resolveColorAccessor(props.hoverBorderColor, context) as string | undefined) ?? (resolveColorAccessor(props.borderColor, context) as string | undefined))
            : (resolveColorAccessor(props.borderColor, context) as string | undefined);
        const radius = (resolveScalarAccessor(props.borderRadius, context, 0) as number) ?? 0;
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;
        const mid = (slice.startAngle + slice.endAngle) / 2;
        const shift = slice.offset > 0 ? polarToCartesian(0, 0, slice.offset, mid) : { x: 0, y: 0 };
        const scale = hovered && ctx.hoverEffect?.scale && ctx.hoverEffect.scale !== 1 ? ctx.hoverEffect.scale : 1;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-slice ${seriesColorClass(slice.dataIndex)}${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-slice',
                'data-series': series.id,
                'data-index': slice.dataIndex,
                'data-category': slice.label,
                'data-state': hovered ? 'hovered' : null,
                d: arcPath(frame.center.x, frame.center.y, slice.innerRadius, slice.outerRadius, slice.startAngle, slice.endAngle, typeof radius === 'number' ? radius : 0, slice.padWidth),
                fill,
                'fill-opacity': opacity,
                stroke: stroke ?? null,
                'stroke-width': (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-linejoin': props.borderJoinStyle ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity: markOpacity(ctx, series.id, slice.dataIndex),
                transform: shift.x || shift.y || scale !== 1 ? `translate(${shift.x} ${shift.y})${scale !== 1 ? ` scale(${scale})` : ''}` : null
            },
            children: []
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-pie', 'data-series': series.id, 'data-series-type': 'pie' }, nodes)];
}

/** Builds the context a slice template or render function receives. */
export function sliceRenderContext(ctx: DrawContext, series: ResolvedSeries, slice: SliceGeometry, frame: PieFrame, color: string, data: readonly unknown[]): SliceRenderContext {
    const mid = (slice.startAngle + slice.endAngle) / 2;
    const midRadius = (slice.innerRadius + slice.outerRadius) / 2;
    const point = polarToCartesian(frame.center.x, frame.center.y, midRadius, mid);

    return {
        index: slice.dataIndex,
        data: data[slice.dataIndex],
        value: slice.value,
        percentage: slice.percentage,
        label: slice.label,
        color,
        center: frame.center,
        // x and y are the arc's midpoint, deliberately distinct from `center`: content inside a
        // slice anchors here, while a donut-hole label anchors at the centre.
        x: point.x,
        y: point.y,
        angle: mid,
        isHovered: isHovered(ctx, series.id, slice.dataIndex),
        isVisible: ctx.isItemVisible(series.id, slice.dataIndex),
        fontFamily: ctx.fontFamily
    };
}

/** Clamps a ratio into 0 to 1. */
function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1);
}

/** Whether the pointer is over a slice, and which one. */
export function hitTestSlices(slices: readonly SliceGeometry[], frame: PieFrame, x: number, y: number): SliceGeometry | null {
    const dx = x - frame.center.x;
    const dy = y - frame.center.y;
    const distance = Math.hypot(dx, dy);
    const angle = ((((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360) + 360) % 360;

    for (const slice of slices) {
        if (distance < slice.innerRadius || distance > slice.outerRadius) continue;

        const start = ((slice.startAngle % 360) + 360) % 360;
        const end = ((slice.endAngle % 360) + 360) % 360;
        const inside = start <= end ? angle >= start && angle <= end : angle >= start || angle <= end;

        if (inside) return slice;
    }

    return null;
}
