/**
 *
 * Root and theme types. `ChartSvg` and `ChartCanvas` take the same inputs and expose the same
 * imperative surface; the only difference is what they paint onto.
 *
 * @module charts
 *
 */
import type { AnimationSpec, AnimationTransitions, NamedAnimationSpec, SyncConfig } from './charts-feature.types';
import type { AxisScale, BoxArea, ExportFormat, RendererType } from './charts.types';

/**
 * Theme object read by the Canvas renderer, which has no DOM to take CSS custom properties from.
 * Every field is optional and merges over the built-in defaults. Under SVG the same values arrive
 * as CSS custom properties instead.
 * @group Interface
 */
export interface ChartTheme {
    /**
     * Categorical series palette. It cycles once the series outnumber the colors.
     */
    series?: string[];
    /**
     * Axis line, tick mark and axis title colors, as `[x, y]`.
     */
    axes?: string[];
    /**
     * Major grid line color.
     */
    grid?: string;
    /**
     * Minor grid line color.
     */
    gridMinor?: string;
    /**
     * Axis tick label color.
     */
    tickLabel?: string;
    /**
     * Data label color.
     */
    dataLabel?: string;
    /**
     * Annotation and reference label color.
     */
    annotation?: string;
    /**
     * Chart title color.
     */
    titleColor?: string;
    /**
     * Chart caption color.
     */
    captionColor?: string;
    /**
     * Alternating band fill color.
     */
    bandFill?: string;
    /**
     * Tooltip card background.
     */
    tooltipBackground?: string;
    /**
     * Tooltip card border.
     */
    tooltipBorder?: string;
    /**
     * Tooltip text color.
     */
    tooltipColor?: string;
    /**
     * Legend label color.
     */
    legendColor?: string;
    /**
     * Crosshair line color.
     */
    crosshairColor?: string;
    /**
     * Chart background.
     */
    background?: string;
    /**
     * Chart border color.
     */
    border?: string;
    /**
     * Default text color.
     */
    color?: string;
    /**
     * Color for a rising candle or a positive waterfall step.
     */
    positive?: string;
    /**
     * Color for a falling candle or a negative waterfall step.
     */
    negative?: string;
    /**
     * Brightness multiplier applied to a hovered mark.
     */
    hoverBrightness?: number;
    /**
     * Opacity of the non-hovered marks while something is hovered.
     */
    dimOpacity?: number;
}

/**
 * Inputs shared by `ChartSvg` and `ChartCanvas`.
 * @group Interface
 */
export interface ChartRootProps {
    /**
     * Chart width in pixels, which is a maximum while responsive, or `'auto'` to size fully from
     * the container.
     */
    width?: number | 'auto';
    /**
     * Chart height in pixels, which is a maximum while responsive, or `'auto'`.
     */
    height?: number | 'auto';
    /**
     * Enable responsive sizing.
     */
    responsive?: boolean;
    /**
     * Aspect ratio to hold during a resize, as width over height.
     */
    aspectRatio?: number;
    /**
     * Resize debounce delay in milliseconds. Left unset the chart follows the animation frame.
     */
    debounceDelay?: number;
    /**
     * Text direction.
     */
    dir?: 'auto' | 'ltr' | 'rtl';
    /**
     * Global font family for every piece of chart text: axes, labels, title and data labels.
     */
    fontFamily?: string;
    /**
     * Global base font size in pixels for every piece of chart text.
     */
    fontSize?: number;
    /**
     * Scale the chart text with the user's root font size. Turn it off when the application already
     * derives `fontSize` from the root font, or the scale is applied twice.
     */
    scaleWithRootFont?: boolean;
    /**
     * BCP 47 locale string, which drives every number and date formatter in the chart.
     */
    locale?: string;
    /**
     * Sync configuration, read when the chart sits inside a `ChartGroup`.
     */
    sync?: boolean | SyncConfig;
    /**
     * Theme object. This is how a Canvas chart is themed, since it cannot read CSS custom
     * properties; an SVG chart accepts it too.
     */
    theme?: ChartTheme;
    /**
     * Animation configuration for the whole chart. Pass `false` to switch every animation off.
     */
    animation?: boolean | AnimationSpec;
    /**
     * Named animation entries, each driving a specific set of renderer inputs.
     */
    animations?: Record<string, NamedAnimationSpec>;
    /**
     * State-change transitions.
     */
    transitions?: AnimationTransitions;
    /**
     * Plugins to install when the chart mounts.
     */
    plugins?: ChartPluginEntry[];
    /**
     * Number formatting for every numeric surface: axis ticks, tooltips, data labels, the colour
     * legend and screen-reader prose. An axis `tickFormat` still wins over it.
     */
    numberFormat?: Intl.NumberFormatOptions;
    /**
     * Overrides individual catalogue strings, merged over the resolved language.
     */
    text?: Partial<ChartText>;
}

/**
 * The chart's prose, as a catalogue.
 *
 * `locale` handles numbers and dates on its own, because `Intl` does. Prose is different: screen
 * reader descriptions, data-table headers, export menu entries and keyboard hints are written
 * sentences, so they have to come from somewhere. Everything here is either announced or drawn as
 * chrome -- never a data value, which always comes from the data.
 * @group Interface
 */
export interface ChartText {
    /**
     * Accessible name for the chart figure, used when no description was given.
     */
    chart: string;
    /**
     * Export menu button label.
     */
    exportMenu: string;
    /**
     * Export menu entries, one per format.
     */
    downloadPNG: string;
    downloadJPEG: string;
    downloadSVG: string;
    downloadPDF: string;
    downloadPNGTransparent: string;
    downloadSVGTransparent: string;
    downloadCSV: string;
    /**
     * Zoom and pan controls.
     */
    zoomIn: string;
    zoomOut: string;
    panLeft: string;
    panRight: string;
    resetZoom: string;
    /**
     * The navigator's selection window, for the screen reader.
     */
    navigator: string;
    /**
     * Screen-reader data table.
     */
    dataTable: string;
    category: string;
    value: string;
    series: string;
    /**
     * Keyboard hint announced when the chart takes focus.
     */
    keyboardHint: string;
    /**
     * Breadcrumb root, for a treemap drilldown.
     */
    all: string;
}

/**
 * Options accepted by the imperative image export.
 * @group Interface
 */
export interface ChartExportOptions {
    /**
     * Output format.
     */
    format?: ExportFormat;
    /**
     * Filename, without the extension.
     */
    filename?: string;
    /**
     * Pixel density multiplier for a raster export.
     */
    scale?: number;
    /**
     * Background color. `'auto'` matches the current chart background.
     */
    backgroundColor?: string | 'auto' | 'transparent';
}

/**
 * Options accepted by the imperative data update.
 * @group Interface
 */
export interface ChartUpdateDataOptions {
    /**
     * Animate the transition to the new data.
     */
    animate?: boolean;
}

/**
 * The imperative surface of a chart root. Charts are declarative, so reach for this only in the two
 * cases inputs cannot cover: a theme toggled by a class on `<html>`, which leaves the Canvas pixel
 * buffer none the wiser, and a function-valued input swapped for another named function, which is
 * compared by reference rather than by value.
 * @group Interface
 */
export interface ChartRootApi {
    /**
     * Re-read every child's current inputs and repaint in a single pass.
     */
    redraw: () => void;
    /**
     * The underlying SVG or Canvas element.
     */
    getElement: () => SVGSVGElement | HTMLCanvasElement | null;
    /**
     * The chart as a data URL.
     */
    toDataURL: (options?: ChartExportOptions) => Promise<string>;
    /**
     * The chart as a `Blob`.
     */
    toBlob: (options?: ChartExportOptions) => Promise<Blob | null>;
    /**
     * Export the chart as an image file, which downloads it.
     */
    toImage: (options?: ChartExportOptions) => Promise<void>;
    /**
     * Replace the data, optionally without animating.
     */
    updateData: (options?: ChartUpdateDataOptions) => void;
}

/**
 * Computed chart state, as a plugin sees it.
 * @group Interface
 */
export interface ChartState {
    /**
     * Plot area rectangle in pixels.
     */
    chartArea: BoxArea;
    /**
     * Total chart width in pixels.
     */
    width: number;
    /**
     * Total chart height in pixels.
     */
    height: number;
    /**
     * Registered axis scales, keyed by axis id.
     */
    scales: Map<string, AxisScale>;
    /**
     * Which renderer is painting.
     */
    renderer: RendererType;
    /**
     * Whether the active theme is dark.
     */
    isDark: boolean;
    /**
     * Theme-aware default text color.
     */
    textColor: string;
    /**
     * Resolved font family.
     */
    fontFamily: string;
    /**
     * Generated chart and series descriptions, as the accessibility layer computed them.
     */
    descriptions: { chart: string; series: string[] };
}

/**
 * One registered dataset, as a plugin sees it.
 * @group Interface
 */
export interface DatasetRegistration {
    /**
     * Dataset id.
     */
    id: string;
    /**
     * Series type.
     */
    type: string;
    /**
     * Series name.
     */
    name?: string;
    /**
     * Series order index.
     */
    seriesIndex: number;
    /**
     * Resolved series color.
     */
    color: string;
    /**
     * Whether the series is currently visible.
     */
    visible: boolean;
    /**
     * The data rows the series was given.
     */
    data: readonly unknown[];
    /**
     * The series' resolved inputs.
     *
     * A plugin reads this to reach a field the registration does not name -- a candlestick's
     * `closeField`, say. It is deliberately untyped: a plugin is written against a specific chart
     * and knows what it bound, while the registration itself has to describe every family.
     */
    props: Record<string, unknown>;
}

/**
 * The current hover state.
 * @group Interface
 */
export interface HoverState {
    /**
     * Dataset under the pointer.
     */
    datasetId: string;
    /**
     * Data index under the pointer.
     */
    index: number;
    /**
     * Pointer x position in pixels.
     */
    x: number;
    /**
     * Pointer y position in pixels.
     */
    y: number;
}

/**
 * Surface handed to an overlay painter. Under SVG it carries a fresh `<g>` to append into; under
 * Canvas it carries the live 2D context. Always check which one is present.
 * @group Interface
 */
export interface ChartOverlaySurface {
    /**
     * A fresh SVG group to append into. Present under SVG only.
     */
    svg?: SVGGElement;
    /**
     * The live canvas 2D context. Present under Canvas only.
     */
    ctx?: CanvasRenderingContext2D;
    /**
     * Plot area rectangle to draw within.
     */
    area: BoxArea;
}

/**
 * Everything a plugin's install function is handed.
 * @group Interface
 */
export interface ChartPluginContext<TOptions = unknown> {
    /**
     * Current computed chart state: plot area, scales and descriptions.
     */
    getState: () => ChartState;
    /**
     * The registered datasets, keyed by id.
     */
    getDatasets: () => Map<string, DatasetRegistration>;
    /**
     * The current hover state, or `null` when nothing is hovered.
     */
    getHover: () => HoverState | null;
    /**
     * Subscribe to every render frame. Returns an unsubscribe function.
     */
    onFrame: (cb: () => void) => () => void;
    /**
     * Subscribe to hover-state changes. Returns an unsubscribe function.
     */
    onHover: (cb: (hover: HoverState | null) => void) => () => void;
    /**
     * Register an overlay painter layered above the chart. Returns a remover.
     */
    registerOverlay: (render: (surface: ChartOverlaySurface) => void) => () => void;
    /**
     * The chart's container element, or `null` before mount.
     */
    getContainer: () => HTMLElement | null;
    /**
     * Options passed at registration time.
     */
    options: TOptions;
    /**
     * Register a cleanup callback, run when the chart unmounts.
     */
    onUnmounted: (fn: () => void) => void;
}

/**
 * A chart plugin, as returned by `defineChartPlugin`.
 * @group Interface
 */
export interface ChartPlugin<TOptions = unknown, TApi = unknown> {
    /**
     * Plugin name, which is the key it appears under on the chart's `$plugins` getter.
     */
    name: string;
    /**
     * Installs the plugin. Returning `{ api }` publishes that API on `$plugins`; a plugin that only
     * paints an overlay can return nothing.
     */
    install: (ctx: ChartPluginContext<TOptions>) => { api: TApi } | void;
    /**
     * Default options, merged under whatever is passed at registration.
     */
    options?: TOptions;
}

/**
 * A plugin entry in the root's `plugins` input: either a plugin, or a `[plugin, options]` tuple.
 * The tuple carries no type information for the options, so a plugin that takes configuration is
 * better written as a function returning `defineChartPlugin(...)`.
 * @group Types
 */
export type ChartPluginEntry = ChartPlugin<never, unknown> | ChartPlugin<unknown, unknown> | [ChartPlugin<unknown, unknown>, unknown];

/**
 * An installed plugin, as the chart's `$plugins` getter reports it.
 * @group Interface
 */
export interface InstalledChartPlugin<TApi = unknown> {
    /**
     * Plugin name.
     */
    name: string;
    /**
     * The public API the plugin returned, when it returned one.
     */
    api?: TApi;
}
