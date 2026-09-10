/**
 * The scene: the one description of a chart that both renderers draw.
 *
 * Every painter here returns {@link SvgNode} descriptors rather than touching a surface. The SVG
 * root materializes them into elements; the Canvas root paints them with `paintSvgNode`. That is
 * what makes "swap the root, keep the children" hold geometrically — a bar's corner radius and a
 * tick's position are computed once, so the two renderers cannot disagree about them.
 *
 * The exception is the HTML layer. The legend, tooltip, title, breadcrumb and export menu are real
 * DOM in both renderers, because they are interactive chrome rather than marks: they need focus,
 * text selection and hit targets, and painting them into a canvas would take all three away.
 */
import type { AxisScale, BoxArea, ChartTheme, SvgNode } from '@openng/optimus-ui/types/charts';
import type { ResolvedSeries } from '../charts-state';

/** Everything a painter needs that is not its own series' props. */
export interface DrawContext {
    /**
     * Plot area the marks are clipped to.
     */
    area: BoxArea;
    /**
     * Resolved scales, keyed by `${axis}:${id}`.
     */
    scales: Map<string, AxisScale>;
    /**
     * Resolved theme.
     */
    theme: ChartTheme;
    /**
     * Whether the active colour scheme is dark.
     */
    isDark: boolean;
    /**
     * Resolved font family for chart text.
     */
    fontFamily: string;
    /**
     * Resolved base font size.
     */
    fontSize: number;
    /**
     * Text direction in force.
     */
    direction: 'ltr' | 'rtl';
    /**
     * Locale every formatter goes through.
     */
    locale: string | undefined;
    /**
     * Animation progress, from 0 to 1. A painter reads it to grow a mark in.
     */
    progress: number;
    /**
     * The point under the pointer, or `null`.
     */
    hover: { datasetId: string; index: number } | null;
    /**
     * Hover treatment, when a `ChartHover` is present.
     */
    hoverEffect: { brightness: number; dimOpacity: number; offset: number; scale: number; radiusMultiplier: number; backgroundColor?: string } | null;
    /**
     * Whether one item of a dataset is visible.
     */
    isItemVisible: (datasetId: string, index: number) => boolean;
    /**
     * Identifier unique to this chart, used to namespace the generated element ids.
     */
    chartId: string;
    /**
     * Resolves a series' palette colour into something this renderer can use.
     *
     * The two renderers need different things from the same palette slot. SVG wants
     * `var(--p-chart-color-3, #4ecdc4)`, so an application overriding that custom property restyles
     * the chart with no re-render, as the theming docs promise. Canvas has no DOM to resolve a
     * `var()` against and needs the literal. One painter, one call, two answers.
     */
    seriesColor: (seriesIndex: number) => string;
    /**
     * Measures text, so a painter can place a label it has not drawn yet.
     */
    measureText: (text: string, fontSize: number, fontFamily?: string) => number;
}

/** One layer of the scene, drawn in order. */
export interface SceneLayer {
    /**
     * Stable key, used as the group's `data-slot`.
     */
    key: string;
    /**
     * The nodes in the layer.
     */
    nodes: SvgNode[];
}

/**
 * The layer order, which is the z-order of the whole chart.
 *
 * Reference bands sit under the marks and reference lines over them, matching their documented
 * defaults: a band is context for the data, while a line is a threshold the data is read against
 * and has to stay visible on top of it.
 */
export const LAYER_ORDER = ['background', 'grid', 'bandsBelow', 'axes', 'marks', 'bandsAbove', 'references', 'annotations', 'dataLabels', 'crosshair', 'focus'] as const;

/** A key of {@link LAYER_ORDER}. */
export type LayerKey = (typeof LAYER_ORDER)[number];

/** Collects nodes into the ordered layers. */
export function createScene() {
    const layers = new Map<LayerKey, SvgNode[]>();

    for (const key of LAYER_ORDER) layers.set(key, []);

    return {
        /** Adds nodes to a layer. */
        add(layer: LayerKey, ...nodes: (SvgNode | null | undefined)[]): void {
            const bucket = layers.get(layer)!;

            for (const node of nodes) {
                if (node) bucket.push(node);
            }
        },
        /** The populated layers, in draw order. */
        toLayers(): SceneLayer[] {
            return LAYER_ORDER.map((key) => ({ key, nodes: layers.get(key)! })).filter((layer) => layer.nodes.length > 0);
        }
    };
}

/** What {@link createScene} returns. */
export type Scene = ReturnType<typeof createScene>;

/** Reads the scale a series is bound to, falling back to the chart's default axis. */
export function scaleFor(ctx: DrawContext, axis: 'x' | 'y', id: string): AxisScale | undefined {
    return ctx.scales.get(`${axis}:${id}`) ?? ctx.scales.get(`${axis}:default`) ?? [...ctx.scales.entries()].find(([key]) => key.startsWith(`${axis}:`))?.[1];
}

/** Places a value on a scale, whether it is a category or a number. */
export function positionOn(scale: AxisScale | undefined, value: unknown): number {
    return scale ? scale.scale(value) : Number.NaN;
}

/** The pixel position of zero on a value scale, which is the baseline bars and areas close to. */
export function baselineOn(scale: AxisScale | undefined): number {
    if (!scale || scale.type === 'band') return Number.NaN;

    const [min, max] = scale.domain;
    // A domain that never reaches zero has no zero line, so the baseline is the nearer edge --
    // otherwise a bar chart of values from 40 to 60 would draw its bars off the plot.
    const clamped = Math.min(Math.max(0, min), max);

    return scale.scale(clamped);
}

/** Whether a series should be drawn at all. */
export function isSeriesDrawable(series: ResolvedSeries): boolean {
    return series.visible && series.points.length > 0;
}

/**
 * The opacity a mark carries once the hover treatment is applied.
 *
 * Dimming is opt-in: with no `dimOpacity` set, hovering brightens the hovered mark and leaves the
 * rest alone. That is the documented default, and the right one — fading everything else on every
 * pointer move makes a dense chart flicker.
 */
export function markOpacity(ctx: DrawContext, datasetId: string, index: number, base = 1): number {
    if (!ctx.hoverEffect || !ctx.hover) return base;

    const dim = ctx.hoverEffect.dimOpacity;

    if (dim >= 1) return base;

    const isHovered = ctx.hover.datasetId === datasetId && ctx.hover.index === index;

    return isHovered ? base : base * dim;
}

/** Whether a given mark is the hovered one. */
export function isHovered(ctx: DrawContext, datasetId: string, index: number): boolean {
    return ctx.hover?.datasetId === datasetId && ctx.hover.index === index;
}

/** Builds a clip path that keeps the marks inside the plot area. */
export function plotClip(ctx: DrawContext): SvgNode {
    return {
        tag: 'clipPath',
        attrs: { id: `plot-clip-${ctx.chartId}` },
        children: [{ tag: 'rect', attrs: { x: ctx.area.x, y: ctx.area.y, width: ctx.area.width, height: ctx.area.height }, children: [] }]
    };
}

/** The `clip-path` reference a marks group carries. */
export function plotClipRef(ctx: DrawContext): string {
    return `url(#plot-clip-${ctx.chartId})`;
}

/** Groups nodes under a `data-slot`, which is the public styling and testing hook. */
export function slotGroup(slot: string, attrs: SvgNode['attrs'], children: SvgNode[]): SvgNode {
    return { tag: 'g', attrs: { 'data-slot': slot, ...attrs }, children };
}
