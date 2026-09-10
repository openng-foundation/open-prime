/**
 *
 * Pass-through options. Each chart part exposes the elements it owns, so an application can reach
 * any of them without depending on the generated DOM structure.
 *
 * @module charts
 *
 */
import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Custom pass-through options of a chart root.
 * @group Interface
 */
export interface ChartsPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the sizing container element.
     */
    container?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the SVG or canvas surface element.
     */
    surface?: PassThroughOption<SVGSVGElement | HTMLCanvasElement, I>;
    /**
     * Used to pass attributes to the plot area group element.
     */
    plot?: PassThroughOption<SVGGElement | HTMLElement, I>;
    /**
     * Used to pass attributes to the visually hidden screen reader region.
     */
    screenReader?: PassThroughOption<HTMLElement, I>;
}

/**
 * Pass-through options of a chart root.
 * @see {@link ChartsPassThroughOptions}
 * @group Interface
 */
export type ChartsPassThrough<I = unknown> = PassThrough<I, ChartsPassThroughOptions<I>>;

/**
 * Custom pass-through options of a series.
 * @group Interface
 */
export interface ChartSeriesPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the series group element.
     */
    root?: PassThroughOption<SVGGElement | HTMLElement, I>;
    /**
     * Used to pass attributes to each mark drawn by the series.
     */
    mark?: PassThroughOption<SVGElement, I>;
    /**
     * Used to pass attributes to each point marker.
     */
    marker?: PassThroughOption<SVGElement, I>;
}

/**
 * Pass-through options of a series.
 * @see {@link ChartSeriesPassThroughOptions}
 * @group Interface
 */
export type ChartSeriesPassThrough<I = unknown> = PassThrough<I, ChartSeriesPassThroughOptions<I>>;

/**
 * Custom pass-through options of an axis.
 * @group Interface
 */
export interface ChartAxisPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the axis group element.
     */
    root?: PassThroughOption<SVGGElement | HTMLElement, I>;
    /**
     * Used to pass attributes to the axis line element.
     */
    line?: PassThroughOption<SVGElement, I>;
    /**
     * Used to pass attributes to each tick mark element.
     */
    tick?: PassThroughOption<SVGElement, I>;
    /**
     * Used to pass attributes to each tick label element.
     */
    tickLabel?: PassThroughOption<SVGElement, I>;
    /**
     * Used to pass attributes to each grid line element.
     */
    gridLine?: PassThroughOption<SVGElement, I>;
    /**
     * Used to pass attributes to the axis title element.
     */
    title?: PassThroughOption<SVGElement, I>;
}

/**
 * Pass-through options of an axis.
 * @see {@link ChartAxisPassThroughOptions}
 * @group Interface
 */
export type ChartAxisPassThrough<I = unknown> = PassThrough<I, ChartAxisPassThroughOptions<I>>;

/**
 * Custom pass-through options of the legend.
 * @group Interface
 */
export interface ChartLegendPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the legend root element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to each legend item element.
     */
    item?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to each legend swatch element.
     */
    swatch?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to each legend label element.
     */
    label?: PassThroughOption<HTMLElement, I>;
}

/**
 * Pass-through options of the legend.
 * @see {@link ChartLegendPassThroughOptions}
 * @group Interface
 */
export type ChartLegendPassThrough<I = unknown> = PassThrough<I, ChartLegendPassThroughOptions<I>>;

/**
 * Custom pass-through options of the tooltip.
 * @group Interface
 */
export interface ChartTooltipPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the tooltip card element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the tooltip header element.
     */
    header?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the tooltip body element.
     */
    body?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to each tooltip row element.
     */
    row?: PassThroughOption<HTMLElement, I>;
}

/**
 * Pass-through options of the tooltip.
 * @see {@link ChartTooltipPassThroughOptions}
 * @group Interface
 */
export type ChartTooltipPassThrough<I = unknown> = PassThrough<I, ChartTooltipPassThroughOptions<I>>;

/**
 * Custom pass-through options of a chart overlay: the title, caption, breadcrumb, color legend,
 * export menu and zoom controls all sit in the same HTML layer above the chart.
 * @group Interface
 */
export interface ChartOverlayPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the overlay root element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the overlay content element.
     */
    content?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to each interactive control in the overlay.
     */
    control?: PassThroughOption<HTMLElement, I>;
}

/**
 * Pass-through options of a chart overlay.
 * @see {@link ChartOverlayPassThroughOptions}
 * @group Interface
 */
export type ChartOverlayPassThrough<I = unknown> = PassThrough<I, ChartOverlayPassThroughOptions<I>>;

/**
 * Custom pass-through options of a chart group.
 * @group Interface
 */
export interface ChartGroupPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the group root element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Pass-through options of a chart group.
 * @see {@link ChartGroupPassThroughOptions}
 * @group Interface
 */
export type ChartGroupPassThrough<I = unknown> = PassThrough<I, ChartGroupPassThroughOptions<I>>;
