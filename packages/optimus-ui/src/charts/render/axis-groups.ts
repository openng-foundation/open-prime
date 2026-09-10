/**
 * Axis group headers.
 *
 * A second row of labels under the ticks, each spanning the categories it covers. The geometry is
 * entirely derived from the axis' own scale rather than restated: a group's band is the union of
 * its members' bands, so the header stays aligned with the ticks under it no matter how the plot is
 * resized or how the categories are padded.
 */
import type { AxisPosition, AxisScale, BracketStyle, ChartAxisGroupProps, PartitionFillStyle, SeparatorStyle, SvgNode } from '@openng/optimus-ui/types/charts';
import { resolveDashPattern } from '../core/accessor';
import { axisOfPosition } from './axis';
import { dashAttr } from './series-line';
import { slotGroup, type DrawContext } from './scene';

/** One group, resolved into pixels. */
interface GroupBand {
    label: string;
    from: number;
    to: number;
    depth: number;
    props: ChartAxisGroupProps;
}

/** How tall one level of group headers is. */
const LEVEL_HEIGHT = 20;

/** The space the group rows ask for on the axis' edge. */
export function axisGroupReservation(groups: readonly { props: Record<string, unknown>; depth: number }[] | undefined): number {
    if (!groups?.length) return 0;

    const deepest = Math.max(...groups.map((entry) => entry.depth));

    return (deepest + 1) * LEVEL_HEIGHT;
}

/**
 * Resolves each group into the pixel band it spans.
 *
 * A group whose members are not on the axis is dropped rather than drawn at zero width: a header
 * over nothing is a header that lies about what is below it.
 */
function bandsOf(scale: AxisScale, groups: readonly { props: Record<string, unknown>; depth: number }[]): GroupBand[] {
    const bands: GroupBand[] = [];

    for (const entry of groups) {
        const props = entry.props as ChartAxisGroupProps;
        const positions: number[] = [];

        if (props.range) {
            for (const bound of props.range) positions.push(scale.scale(bound));
        } else if (scale.type === 'band') {
            for (const category of props.categories ?? []) {
                const start = scale.bandStart(category);

                if (!Number.isFinite(start)) continue;

                positions.push(start, start + scale.bandwidth);
            }
        }

        const finite = positions.filter((value) => Number.isFinite(value));

        if (finite.length === 0) continue;

        bands.push({ label: props.label ?? '', from: Math.min(...finite), to: Math.max(...finite), depth: entry.depth, props });
    }

    return bands;
}

/**
 * Paints the group rows.
 *
 * The rows stack outward from the plot, deepest first, so the innermost grouping sits nearest the
 * ticks it groups -- which is the order a reader expects: months, then quarters, then years.
 */
export function paintAxisGroups(ctx: DrawContext, scale: AxisScale, groups: readonly { props: Record<string, unknown>; depth: number }[] | undefined, position: AxisPosition, tickRowHeight: number): SvgNode[] {
    if (!groups?.length) return [];

    const bands = bandsOf(scale, groups);

    if (bands.length === 0) return [];

    const horizontal = axisOfPosition(position) === 'x';
    const nodes: SvgNode[] = [];
    const deepest = Math.max(...bands.map((band) => band.depth));

    for (const band of bands) {
        // Depth counts inward from the outermost group, so the row offset counts back from the
        // deepest: the innermost grouping is the one that sits against the ticks.
        const level = deepest - band.depth;
        const offset = tickRowHeight + level * LEVEL_HEIGHT;
        const rowStart = rowEdge(ctx, position, offset);
        const centre = (band.from + band.to) / 2;
        const style = band.props.labelStyle ?? {};
        const fill = band.props.fill;

        if (fill) {
            const options: PartitionFillStyle = fill === true ? {} : fill;

            nodes.push({
                tag: 'rect',
                attrs: {
                    class: 'p-chart-axis-group-fill',
                    'data-slot': 'chart-axis-group-fill',
                    x: horizontal ? band.from : rowStart,
                    y: horizontal ? rowStart : band.from,
                    width: horizontal ? band.to - band.from : LEVEL_HEIGHT,
                    height: horizontal ? LEVEL_HEIGHT : band.to - band.from,
                    fill: options.color ?? ctx.theme.bandFill ?? 'currentColor',
                    'fill-opacity': options.opacity ?? 0.06
                },
                children: []
            });
        }

        if (band.props.bracket) {
            const options: BracketStyle = band.props.bracket === true ? {} : band.props.bracket;
            const tick = options.tickLength ?? 4;
            const line = rowStart + (position === 'top' || position === 'left' ? LEVEL_HEIGHT : 0);
            // The bracket's ends turn towards the ticks, which is what makes it read as "these
            // ones" rather than as a stray rule.
            const inward = position === 'top' || position === 'left' ? -tick : tick;

            nodes.push({
                tag: 'path',
                attrs: {
                    class: 'p-chart-axis-group-bracket',
                    'data-slot': 'chart-axis-group-bracket',
                    d: horizontal
                        ? `M ${band.from} ${line + inward} L ${band.from} ${line} L ${band.to} ${line} L ${band.to} ${line + inward}`
                        : `M ${line + inward} ${band.from} L ${line} ${band.from} L ${line} ${band.to} L ${line + inward} ${band.to}`,
                    fill: 'none',
                    stroke: options.color ?? ctx.theme.axes?.[0] ?? 'currentColor',
                    'stroke-width': options.strokeWidth ?? 1
                },
                children: []
            });
        }

        if (band.props.separator) {
            const options: SeparatorStyle = band.props.separator === true ? {} : band.props.separator;

            for (const at of [band.from, band.to]) {
                nodes.push({
                    tag: 'line',
                    attrs: {
                        class: 'p-chart-axis-group-separator',
                        'data-slot': 'chart-axis-group-separator',
                        x1: horizontal ? at : rowStart,
                        y1: horizontal ? rowStart : at,
                        x2: horizontal ? at : rowStart + LEVEL_HEIGHT,
                        y2: horizontal ? rowStart + LEVEL_HEIGHT : at,
                        stroke: options.color ?? ctx.theme.grid ?? 'currentColor',
                        'stroke-width': options.strokeWidth ?? 1,
                        'stroke-dasharray': dashAttr(resolveDashPattern(options.dash))
                    },
                    children: []
                });
            }
        }

        if (band.label === '') continue;

        const fontSize = style.fontSize ?? Math.max(ctx.fontSize - 1, 9);
        const width = ctx.measureText(band.label, fontSize, style.fontFamily ?? ctx.fontFamily);

        // A label wider than its own band would run into its neighbours, so it is dropped -- the
        // bracket and the fill still say where the group is.
        if (horizontal && width > band.to - band.from) continue;

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-axis-group-label',
                'data-slot': 'chart-axis-group-label',
                x: horizontal ? centre : rowStart + LEVEL_HEIGHT / 2,
                y: horizontal ? rowStart + LEVEL_HEIGHT / 2 : centre,
                fill: style.color ?? ctx.theme.tickLabel ?? 'currentColor',
                'font-size': fontSize,
                'font-family': style.fontFamily ?? ctx.fontFamily,
                'font-weight': String(style.fontWeight ?? 600),
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                transform: horizontal ? null : `rotate(-90 ${rowStart + LEVEL_HEIGHT / 2} ${centre})`
            },
            children: [band.label]
        });
    }

    return [slotGroup('chart-axis-groups', { class: 'p-chart-axis-groups' }, nodes)];
}

/** Where one group row starts, measured out from the plot's edge. */
function rowEdge(ctx: DrawContext, position: AxisPosition, offset: number): number {
    switch (position) {
        case 'top':
            return ctx.area.y - offset - LEVEL_HEIGHT;
        case 'bottom':
            return ctx.area.y + ctx.area.height + offset;
        case 'left':
            return ctx.area.x - offset - LEVEL_HEIGHT;
        default:
            return ctx.area.x + ctx.area.width + offset;
    }
}
