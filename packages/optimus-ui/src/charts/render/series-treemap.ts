/**
 * The treemap painter.
 *
 * A treemap has no axes at all: position carries nothing and area carries the value. That makes the
 * tiling algorithm the whole of the geometry, and it is why `squarify` is the default -- a long
 * thin rectangle and a square of the same area do not read as the same size, so a treemap that does
 * not squarify is hard to read as a treemap.
 */
import type { ItemContext, SvgNode, TreemapCellContext, TreemapLevelConfig, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { itemContext, readPath, resolveColorAccessor, resolveDashAccessor, resolveScalarAccessor } from '../core/accessor';
import { contrastingTextColor, interpolateScale, resolveColorScale, withOpacity } from '../core/color';
import { roundedRectPath } from '../core/geometry';
import { DEFAULT_HEAT_RANGE } from '../core/palette';
import { buildHierarchy, layoutTreemap, type TreemapNode, type TreemapRect } from '../core/treemap';
import type { ResolvedSeries } from '../charts-state';
import { isHovered, markOpacity, slotGroup, type DrawContext } from './scene';
import { dashAttr } from './series-line';

/** Builds the nodes a treemap lays out, flat or hierarchical. */
export function treemapNodes(series: ResolvedSeries, props: TreemapSeriesProps): TreemapNode[] {
    const data = (props.data as Record<string, unknown>[] | undefined) ?? [];
    const labelField = typeof props.categoryField === 'string' ? props.categoryField : 'category';
    const valueField = typeof props.valueField === 'string' ? props.valueField : 'value';

    const nodes: TreemapNode[] = data.map((datum, dataIndex) => {
        const raw = readPath(datum, valueField);
        const value = typeof raw === 'number' ? raw : Number(raw);

        return {
            value: Number.isFinite(value) ? Math.max(value, 0) : 0,
            label: String(readPath(datum, labelField) ?? dataIndex),
            datum,
            dataIndex,
            nodeId: props.nodeId ? String(readPath(datum, props.nodeId) ?? '') : undefined,
            parentId: props.parentField ? String(readPath(datum, props.parentField) ?? '') || undefined : undefined
        };
    });

    // A hierarchy only exists when the author said how to find it. Without both fields the data is
    // a flat list, and inferring nesting from a shared label would be guessing.
    return props.nodeId && props.parentField ? buildHierarchy(nodes) : nodes;
}

/** Lays a treemap out into cells. */
export function projectTreemap(ctx: DrawContext, series: ResolvedSeries, props: TreemapSeriesProps): TreemapRect[] {
    const nodes = treemapNodes(series, props);

    if (nodes.length === 0 || ctx.area.width <= 0 || ctx.area.height <= 0) return [];

    return layoutTreemap(nodes, ctx.area, {
        layout: props.layout ?? 'squarify',
        spacing: props.spacing ?? 2,
        groupPadding: props.groupPadding ?? 3,
        headerHeight: props.groupLabelHeight ?? 18,
        showHeader: props.showGroupLabel ?? props.parentField != null
    });
}

/** The per-depth override for a cell, when the series supplied one. */
function levelFor(props: TreemapSeriesProps, depth: number): TreemapLevelConfig | undefined {
    return props.levels?.find((level) => level.depth === depth);
}

/** Paints a treemap series. */
export function paintTreemapSeries(ctx: DrawContext, series: ResolvedSeries, props: TreemapSeriesProps): SvgNode[] {
    const cells = projectTreemap(ctx, series, props);

    if (cells.length === 0) return [];

    const colorScale = props.colorValueField ? valueColorScale(props, cells) : null;
    const labelMinSize = props.labelMinSize ?? 30;
    const nodes: SvgNode[] = [];

    for (const cell of cells) {
        if (cell.width <= 0 || cell.height <= 0) continue;

        const level = levelFor(props, cell.depth);
        const dataIndex = cell.node.dataIndex;
        const context: ItemContext<unknown> = itemContext(cell.node.datum, dataIndex, series.seriesIndex, series.id, cell.node.value, cell.node.label);
        const hovered = isHovered(ctx, series.id, dataIndex);
        const fill = resolveCellColor(ctx, series, props, cell, context, colorScale, hovered);
        const opacity = (resolveScalarAccessor(props.opacity, context, 1) as number) ?? 1;
        const hasChildren = (cell.node.children?.length ?? 0) > 0;

        nodes.push({
            tag: 'path',
            attrs: {
                class: `p-chart-treemap-cell${hovered ? ' p-chart-point-hover' : ''}`,
                'data-slot': 'chart-treemap-cell',
                'data-series': series.id,
                'data-index': dataIndex,
                'data-depth': cell.depth,
                'data-state': hovered ? 'hovered' : null,
                d: roundedRectPath(cell.x, cell.y, cell.width, cell.height, props.borderRadius ?? 2),
                fill,
                'fill-opacity': opacity,
                stroke: level?.borderColor ?? (resolveColorAccessor(props.borderColor, context) as string | undefined) ?? null,
                'stroke-width': level?.borderStrokeWidth ?? (resolveScalarAccessor(props.borderStrokeWidth, context) as number | undefined) ?? null,
                'stroke-dasharray': dashAttr(resolveDashAccessor(props.borderDash, context)),
                opacity: markOpacity(ctx, series.id, dataIndex)
            },
            children: []
        });

        // A label is drawn only where it fits. Clipping one to a cell that cannot hold it produces
        // a fragment of a word, which is worse than no label at all.
        if (cell.width < labelMinSize || cell.height < labelMinSize) continue;

        const labelColor = (resolveColorAccessor(props.labelColor, context) as string | undefined) ?? contrastingTextColor(fill);

        /*
         * A parent's label is a header and a leaf's is a caption for the whole cell.
         *
         * So the two are placed differently: a header sits in the strip reserved for it at the top
         * left, above the children it names, while a leaf's name is centred in the area it stands
         * for. Putting a leaf's label at the top left too made every cell look like a header for
         * something that was not there.
         */
        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-treemap-label',
                'data-slot': 'chart-treemap-label',
                x: hasChildren ? cell.x + 6 : cell.x + cell.width / 2,
                y: hasChildren ? cell.y + (props.groupLabelHeight ?? 18) / 2 + 1 : cell.y + cell.height / 2,
                fill: labelColor,
                'font-size': Math.max(ctx.fontSize - 1, 9),
                'font-family': ctx.fontFamily,
                'font-weight': 600,
                'text-anchor': hasChildren ? 'start' : 'middle',
                'dominant-baseline': 'central'
            },
            children: [cell.node.label]
        });
    }

    return [slotGroup('chart-series', { class: 'p-chart-series p-chart-series-treemap', 'data-series': series.id, 'data-series-type': 'treemap' }, nodes)];
}

/** The colour scale a value-coloured treemap resolved for itself. */
function valueColorScale(props: TreemapSeriesProps, cells: readonly TreemapRect[]): { scale: number[]; range: string[]; opacityMapped: boolean } {
    let min = Infinity;
    let max = -Infinity;

    for (const cell of cells) {
        const raw = props.colorValueField ? readPath(cell.node.datum, props.colorValueField) : undefined;
        const value = typeof raw === 'number' ? raw : Number(raw);

        if (!Number.isFinite(value)) continue;

        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return resolveColorScale({
        colorScale: props.colorScale,
        colorRange: props.colorRange,
        min: Number.isFinite(min) ? min : 0,
        max: Number.isFinite(max) ? max : 1,
        fallbackRange: DEFAULT_HEAT_RANGE
    });
}

/**
 * The colour a cell takes, following the documented priority.
 *
 * A value-driven gradient wins where `colorValueField` is set, then an explicit colour or palette
 * cycle, and finally the group palette -- keyed on the top-level ancestor rather than on the cell,
 * so a parent's children read as belonging to it.
 */
function resolveCellColor(
    ctx: DrawContext,
    series: ResolvedSeries,
    props: TreemapSeriesProps,
    cell: TreemapRect,
    context: ItemContext<unknown>,
    colorScale: { scale: number[]; range: string[]; opacityMapped: boolean } | null,
    hovered: boolean
): string {
    if (hovered) {
        const hover = resolveColorAccessor(props.hoverColor, context);

        if (typeof hover === 'string') return hover;
    }

    if (colorScale && props.colorValueField) {
        const raw = readPath(cell.node.datum, props.colorValueField);
        const value = typeof raw === 'number' ? raw : Number(raw);

        if (Number.isFinite(value)) {
            const color = interpolateScale(value, colorScale.scale, colorScale.range);

            return colorScale.opacityMapped ? withOpacity(color, 0.9) : color;
        }
    }

    const explicit = resolveColorAccessor(props.color, context);

    if (typeof explicit === 'string') return explicit;

    // Shaded from the group's colour rather than from a slot of its own, so a nested cell is
    // visibly a child of the parent it sits inside instead of an unrelated block that happens to
    // land there.
    const group = ctx.seriesColor(cell.groupIndex);

    return cell.depth === 0 ? group : withOpacity(group, Math.max(1 - cell.depth * 0.25, 0.45));
}

/** Builds the context a cell template or render function receives. */
export function treemapCellContext(cell: TreemapRect, drilldownParentId: string | null): TreemapCellContext {
    return {
        data: cell.node.datum,
        index: cell.node.dataIndex,
        label: cell.node.label,
        value: cell.node.value,
        color: '',
        x: cell.x,
        y: cell.y,
        width: cell.width,
        height: cell.height,
        nodeId: cell.node.nodeId,
        parentId: cell.node.parentId,
        hasChildren: (cell.node.children?.length ?? 0) > 0,
        depth: cell.depth,
        drilldownParentId
    };
}

/** Finds the cell under the pointer, deepest first so a child wins over its parent. */
export function hitTestTreemap(cells: readonly TreemapRect[], x: number, y: number): TreemapRect | null {
    let best: TreemapRect | null = null;

    for (const cell of cells) {
        if (x < cell.x || x > cell.x + cell.width || y < cell.y || y > cell.y + cell.height) continue;
        if (!best || cell.depth >= best.depth) best = cell;
    }

    return best;
}
