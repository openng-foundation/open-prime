/**
 * Treemap tiling.
 *
 * The layout algorithms are the classic four. `slice` and `dice` split along one axis only, which
 * keeps the reading order obvious but produces slivers when the values are lopsided. `squarify`
 * chooses splits that keep each rectangle near square, which is what makes areas comparable: a
 * long thin rectangle and a square of the same area do not look the same size, so a treemap that
 * does not squarify is hard to read as a treemap.
 */

/** A node to lay out. */
export interface TreemapNode<T = unknown> {
    /**
     * Value, which becomes the cell's area.
     */
    value: number;
    /**
     * Display label.
     */
    label: string;
    /**
     * The datum behind the node.
     */
    datum?: T;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
    /**
     * Node id, for a flat adjacency-list hierarchy.
     */
    nodeId?: string;
    /**
     * Parent id, for a flat adjacency-list hierarchy.
     */
    parentId?: string;
    /**
     * Children, once the hierarchy has been built.
     */
    children?: TreemapNode<T>[];
}

/** A laid-out cell. */
export interface TreemapRect<T = unknown> {
    node: TreemapNode<T>;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    /**
     * Position of this cell's top-level ancestor.
     *
     * Carried down so a nested cell can be shaded from its group's colour rather than picking its
     * own palette slot -- which would make a child look unrelated to the parent it sits inside.
     */
    groupIndex: number;
}

/** The rectangle a layout pass fills. */
export interface TreemapBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Which way a slice-dice pass cuts at a given depth. */
export type TreemapLayout = 'squarify' | 'slice' | 'dice' | 'sliceDice';

/**
 * Builds a hierarchy from a flat adjacency list.
 *
 * A node whose parent is missing is attached to the root rather than dropped: losing a cell because
 * its parent id has a typo would hide data, and showing it at the top level at least keeps its area
 * in the total.
 */
export function buildHierarchy<T>(nodes: readonly TreemapNode<T>[]): TreemapNode<T>[] {
    const byId = new Map<string, TreemapNode<T>>();

    for (const node of nodes) {
        if (node.nodeId != null) byId.set(node.nodeId, { ...node, children: [] });
    }

    const roots: TreemapNode<T>[] = [];

    for (const node of nodes) {
        const entry = node.nodeId != null ? byId.get(node.nodeId)! : { ...node, children: [] };
        const parent = node.parentId != null ? byId.get(node.parentId) : undefined;

        if (parent && parent !== entry) parent.children!.push(entry);
        else roots.push(entry);
    }

    return roots;
}

/** Sums a node's value, using its children's total when it has no value of its own. */
export function totalValue<T>(node: TreemapNode<T>): number {
    if (node.children?.length) return node.children.reduce((sum, child) => sum + totalValue(child), 0);

    return Math.max(node.value, 0);
}

/**
 * A cell before its group is known.
 *
 * The tiling itself has no idea which top-level ancestor a cell belongs to -- that is settled by the
 * recursion in `layoutTreemap` -- so the internal passes produce everything but that.
 */
export type PlacedRect<T = unknown> = Omit<TreemapRect<T>, 'groupIndex'>;

/** Lays out one level of nodes inside a box. */
export function layoutLevel<T>(nodes: readonly TreemapNode<T>[], box: TreemapBox, layout: TreemapLayout, depth: number, spacing: number): PlacedRect<T>[] {
    const entries = nodes.map((node) => ({ node, value: totalValue(node) })).filter((entry) => entry.value > 0);

    if (entries.length === 0 || box.width <= 0 || box.height <= 0) return [];

    // Descending, which is what both algorithms assume: squarify's aspect-ratio heuristic only
    // works on a sorted run, and slice-dice reads better largest-first.
    entries.sort((a, b) => b.value - a.value);

    const rects = layout === 'squarify' ? squarify(entries, box) : sliceDice(entries, box, layout, depth);

    return rects.map((rect) => ({
        ...rect,
        depth,
        x: rect.x + spacing / 2,
        y: rect.y + spacing / 2,
        width: Math.max(rect.width - spacing, 0),
        height: Math.max(rect.height - spacing, 0)
    }));
}

/** A cut along a single axis. */
function sliceDice<T>(entries: readonly { node: TreemapNode<T>; value: number }[], box: TreemapBox, layout: TreemapLayout, depth: number): PlacedRect<T>[] {
    // sliceDice alternates by depth, which is what stops a deep hierarchy collapsing into slivers
    // all cut the same way.
    const horizontal = layout === 'dice' || (layout === 'sliceDice' && depth % 2 === 0);
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);
    const rects: PlacedRect<T>[] = [];
    let offset = 0;

    for (const entry of entries) {
        const fraction = entry.value / total;

        if (horizontal) {
            const width = box.width * fraction;

            rects.push({ node: entry.node, x: box.x + offset, y: box.y, width, height: box.height, depth });
            offset += width;
            continue;
        }

        const height = box.height * fraction;

        rects.push({ node: entry.node, x: box.x, y: box.y + offset, width: box.width, height, depth });
        offset += height;
    }

    return rects;
}

/**
 * Squarified tiling.
 *
 * Rows are accumulated while adding the next node improves the row's worst aspect ratio, and closed
 * when it would make it worse. That greedy rule is what keeps the cells near square without needing
 * to search the whole space.
 */
function squarify<T>(entries: readonly { node: TreemapNode<T>; value: number }[], box: TreemapBox): PlacedRect<T>[] {
    const total = entries.reduce((sum, entry) => sum + entry.value, 0);

    if (total <= 0) return [];

    const rects: PlacedRect<T>[] = [];
    const area = box.width * box.height;
    const scale = area / total;
    let remaining = { ...box };
    let index = 0;

    while (index < entries.length) {
        const shortSide = Math.min(remaining.width, remaining.height);
        const row: { node: TreemapNode<T>; value: number }[] = [];
        let rowArea = 0;
        let worst = Infinity;

        while (index < entries.length) {
            const candidateArea = rowArea + entries[index].value * scale;
            const candidate = [...row, entries[index]];
            const candidateWorst = worstAspect(candidate, candidateArea, shortSide, scale);

            if (row.length > 0 && candidateWorst > worst) break;

            row.push(entries[index]);
            rowArea = candidateArea;
            worst = candidateWorst;
            index++;
        }

        const rowThickness = shortSide > 0 ? rowArea / shortSide : 0;
        const horizontal = remaining.width >= remaining.height;
        let offset = 0;

        for (const entry of row) {
            const entryArea = entry.value * scale;
            const extent = rowThickness > 0 ? entryArea / rowThickness : 0;

            if (horizontal) {
                rects.push({ node: entry.node, x: remaining.x, y: remaining.y + offset, width: rowThickness, height: extent, depth: 0 });
            } else {
                rects.push({ node: entry.node, x: remaining.x + offset, y: remaining.y, width: extent, height: rowThickness, depth: 0 });
            }

            offset += extent;
        }

        remaining = horizontal
            ? { x: remaining.x + rowThickness, y: remaining.y, width: Math.max(remaining.width - rowThickness, 0), height: remaining.height }
            : { x: remaining.x, y: remaining.y + rowThickness, width: remaining.width, height: Math.max(remaining.height - rowThickness, 0) };

        if (remaining.width <= 0 || remaining.height <= 0) break;
    }

    return rects;
}

/** The worst aspect ratio in a candidate row, which is what the greedy rule minimises. */
function worstAspect<T>(row: readonly { value: number }[], rowArea: number, shortSide: number, scale: number): number {
    if (rowArea <= 0 || shortSide <= 0) return Infinity;

    const thickness = rowArea / shortSide;
    let worst = 0;

    for (const entry of row) {
        const extent = (entry.value * scale) / thickness;
        const ratio = Math.max(thickness / extent, extent / thickness);

        worst = Math.max(worst, ratio);
    }

    return worst;
}

/** Lays out a whole hierarchy, recursing into the nodes that have children. */
export function layoutTreemap<T>(roots: readonly TreemapNode<T>[], box: TreemapBox, options: { layout: TreemapLayout; spacing: number; groupPadding: number; headerHeight: number; showHeader: boolean }): TreemapRect<T>[] {
    const rects: TreemapRect<T>[] = [];

    const walk = (nodes: readonly TreemapNode<T>[], area: TreemapBox, depth: number, groupIndex?: number) => {
        for (const [position, rect] of layoutLevel(nodes, area, options.layout, depth, options.spacing).entries()) {
            // A top-level cell defines the group; everything below inherits it.
            const group = groupIndex ?? position;

            rects.push({ ...rect, groupIndex: group });

            const children = rect.node.children;

            if (!children?.length) continue;

            // A parent keeps a header strip and a padded interior, so its own label has somewhere to
            // live and its children read as being inside it rather than beside it.
            const header = options.showHeader ? options.headerHeight : 0;
            const inner: TreemapBox = {
                x: rect.x + options.groupPadding,
                y: rect.y + header + options.groupPadding,
                width: Math.max(rect.width - options.groupPadding * 2, 0),
                height: Math.max(rect.height - header - options.groupPadding * 2, 0)
            };

            if (inner.width <= 0 || inner.height <= 0) continue;

            walk(children, inner, depth + 1, group);
        }
    };

    walk(roots, box, 0);

    return rects;
}
