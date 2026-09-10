/**
 *
 * Charts is a unified chart system: SVG and Canvas rendering from the same compound API, with axes,
 * legends, tooltips, animation, decimation and fully replaceable surfaces.
 *
 * [Live Demo](https://optimus.openng.org/charts/)
 *
 * @module charts
 *
 */
import type { TemplateRef } from '@angular/core';

/* -------------------------------------------------------------------------------------------------
 * Primitives
 * ---------------------------------------------------------------------------------------------- */

/**
 * Rendering backend used by the chart.
 * @group Types
 */
export type RendererType = 'svg' | 'canvas';

/**
 * Edge position for chrome elements such as legend and title.
 * @group Types
 */
export type Position = 'top' | 'bottom' | 'left' | 'right';

/**
 * Alignment along an axis.
 * @group Types
 */
export type Alignment = 'start' | 'center' | 'end';

/**
 * Orientation of a layout flow.
 * @group Types
 */
export type LayoutDirection = 'horizontal' | 'vertical';

/**
 * Axis identifier.
 * @group Types
 */
export type AxisId = 'x' | 'y';

/**
 * Edge an axis is positioned on.
 * @group Types
 */
export type AxisPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Axis scale type.
 * @group Types
 */
export type AxisType = 'category' | 'linear' | 'logarithmic' | 'time';

/**
 * Possible values for axis ticks: category labels, numeric values or time-axis dates.
 * @group Types
 */
export type TickValue = string | number | Date;

/**
 * Granularity unit for a time axis or time interval.
 * @group Types
 */
export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Responsive size tier the chart currently falls into, from extra-small to large.
 * @group Types
 */
export type ResponsiveTier = 'xs' | 'sm' | 'md' | 'lg';

/**
 * String identifier for each supported series type.
 * @group Types
 */
export type SeriesType = 'pie' | 'donut' | 'pie3d' | 'bar' | 'line' | 'scatter' | 'radar' | 'polar' | 'candlestick' | 'treemap' | 'heatmap';

/**
 * Discriminator identifying a chart feature. The template-literal variants let more than one
 * instance of the same feature coexist, told apart by an id suffix.
 * @group Types
 */
export type FeatureType =
    | 'legend'
    | 'tooltip'
    | 'animation'
    | 'hover'
    | 'title'
    | 'caption'
    | 'dataLabels'
    | 'exportMenu'
    | 'stacking'
    | 'waterfall'
    | 'overlap'
    | 'decimation'
    | 'axisGroup'
    | 'zoom'
    | 'range'
    | 'referenceLine'
    | 'referenceBand'
    | 'responsive'
    | 'accessibility'
    | 'navigator'
    | 'breadcrumb'
    | 'colorLegend'
    | `range:${string}`
    | `referenceLine:${string}`
    | `referenceBand:${string}`
    | `axisGroup:${string}`
    | `zoom:${string}`;

/**
 * Identifier for the kind of customization slot a render function targets.
 * @group Types
 */
export type SlotType = 'centerContent' | 'tooltipContent' | 'legendItem' | 'annotation' | 'emptyState' | 'loadingState' | 'errorState';

/* -------------------------------------------------------------------------------------------------
 * Color
 * ---------------------------------------------------------------------------------------------- */

/**
 * One stop of a gradient definition.
 * @group Interface
 */
export interface GradientStop {
    /**
     * Position of the stop along the gradient, from 0 to 1.
     */
    offset: number;
    /**
     * Any CSS color string.
     */
    color: string;
    /**
     * Stop opacity, so a gradient can fade out as well as change colour.
     */
    opacity?: number;
}

/**
 * Axis-aligned linear gradient, expressed in the unit square of the shape it fills.
 * @group Interface
 */
export interface LinearGradientColor {
    /**
     * The gradient's axis.
     *
     * Either explicit unit coordinates, or a `direction` shorthand -- which is what most gradients
     * actually want, since "top to bottom" is the common case and spelling it as four numbers adds
     * nothing.
     */
    linearGradient: { x1: number; y1: number; x2: number; y2: number } | { direction: 'vertical' | 'horizontal' };
    stops: GradientStop[];
}

/**
 * Radial gradient, expressed in the unit square of the shape it fills.
 * @group Interface
 */
export interface RadialGradientColor {
    /**
     * Centre and radius in unit coordinates. Every field is optional; the default is a gradient
     * centred on the shape and reaching its edge.
     */
    radialGradient: { cx?: number; cy?: number; r?: number };
    stops: GradientStop[];
}

/**
 * A gradient definition, linear or radial.
 * @group Types
 */
export type GradientColor = LinearGradientColor | RadialGradientColor;

/**
 * A color value: either a solid CSS color string or a gradient definition.
 * @group Types
 */
export type ColorValue = string | GradientColor;

/**
 * Anything accepted where a fill or stroke is expected.
 * @group Types
 */
export type FillValue = ColorValue;

/* -------------------------------------------------------------------------------------------------
 * Accessors
 * ---------------------------------------------------------------------------------------------- */

/**
 * Context handed to every per-item accessor callback. Returning `undefined` falls back to the
 * series-level default for that item.
 * @group Interface
 */
export interface ItemContext<T = unknown> {
    /**
     * Original data row.
     */
    datum: T;
    /**
     * Resolved numeric value, where one applies.
     */
    value: number | null;
    /**
     * Position within the dataset.
     */
    index: number;
    /**
     * Order of this series within the chart.
     */
    seriesIndex: number;
    /**
     * Dataset id.
     */
    seriesId: string;
    /**
     * Resolved category label, when applicable.
     */
    category?: string;
    /**
     * Current marker pixel size. Populated for marker accessors only.
     */
    size?: number;
    /**
     * Resolved cell fill color, on heatmap accessors. Read it from a data-label color callback to
     * work out the contrasting text color.
     */
    fillColor?: string;
}

/**
 * Flexible per-item value union. Every styling prop accepts a single value, a field name or path on
 * the datum, an array, or a callback. Whether an array cycles or clips is decided at the call site
 * by the resolver, not by this type.
 * @group Types
 */
export type FieldAccessor<T, R> = R | R[] | keyof T | string | ((ctx: ItemContext<T>) => R | undefined);

/**
 * Custom marker shape function. A returned value that is not a built-in {@link PointStyle} is read
 * as raw SVG path data centered on the origin; translation, rotation and renderer dispatch are the
 * renderer's job.
 * @group Types
 */
export type MarkerShapeFunction<T = unknown> = (ctx: ItemContext<T> & { size: number }) => string | undefined;

/**
 * Built-in marker shapes for scatter, line and radar charts. Anything else coming out of a
 * `markerShape` accessor is treated as a custom SVG path.
 * @group Types
 */
export type PointStyle = 'circle' | 'square' | 'triangle' | 'cross' | 'star';

/**
 * Custom shape function for bar charts. Under SVG, `ctx` is absent and the function returns an SVG
 * path `d` string; under Canvas, `ctx` is present, the function draws imperatively and its return
 * value is ignored.
 * @group Types
 */
export type BarShapeFunction = (bar: BarShapeInfo) => string | undefined;

/* -------------------------------------------------------------------------------------------------
 * Strokes and borders
 * ---------------------------------------------------------------------------------------------- */

/**
 * Named dash pattern shortcuts, so common cases do not require counting pixels.
 * @group Types
 */
export type DashPatternName = 'solid' | 'dashed' | 'dotted' | 'dashdot' | 'longdash';

/**
 * Resolved dash pattern: a number array, or a named shortcut.
 * @group Types
 */
export type DashPattern = number[] | DashPatternName;

/**
 * Per-item dash accessor. It deliberately leaves out the array-cycle form of {@link FieldAccessor},
 * because the scalar pattern is itself a number array and `[5, 5]` would be ambiguous. Per-item
 * variation goes through a callback or a field name.
 * @group Types
 */
export type DashAccessor<T> = DashPattern | keyof T | ((ctx: ItemContext<T>) => DashPattern | undefined);

/**
 * Border join style for path connections.
 * @group Types
 */
export type BorderJoinStyle = 'round' | 'bevel' | 'miter';

/**
 * Border alignment relative to the element.
 * @group Types
 */
export type BorderAlign = 'center' | 'inner';

/**
 * Line cap style.
 * @group Types
 */
export type LineCapStyle = 'butt' | 'round' | 'square';

/**
 * Per-corner radius configuration.
 * @group Interface
 */
export interface BorderRadiusConfig {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
}

/**
 * Border radius value: either uniform or per-corner.
 * @group Types
 */
export type BorderRadius = number | BorderRadiusConfig;

/**
 * Identifies one edge of a bar rectangle.
 * @group Types
 */
export type BarEdge = 'top' | 'right' | 'bottom' | 'left';

/* -------------------------------------------------------------------------------------------------
 * Series shape
 * ---------------------------------------------------------------------------------------------- */

/**
 * Curve interpolation type for line and area series.
 * @group Types
 */
export type CurveType = 'linear' | 'smooth' | 'spline' | 'step' | 'step-before' | 'step-after';

/**
 * How null, undefined and NaN values are handled in a series.
 *
 * - `false` / `'gap'` — the category keeps its x-space but nothing is drawn (the default)
 * - `true` / `'connect'` — bridge over the null (line and area only; read as `'zero'` on bar)
 * - `'zero'` — treat the null as 0 and draw at the baseline
 * @group Types
 */
export type ConnectNullsMode = boolean | 'gap' | 'connect' | 'zero';

/**
 * Stacking mode for a series group.
 * @group Types
 */
export type StackingMode = 'none' | 'normal' | 'percent';

/**
 * Sort order for a category axis.
 * @group Types
 */
export type CategorySortOrder = 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc';

/**
 * Sort order for slice and segment series (pie, donut, polar).
 * @group Types
 */
export type SliceSortOrder = 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc';

/**
 * Aggregation function applied when downsampling or grouping data points.
 * @group Types
 */
export type AggregationMethod = 'average' | 'sum' | 'min' | 'max' | 'first' | 'last' | 'ohlc';

/**
 * Rendering strategy chosen for an arc based on its geometry.
 * @group Types
 */
export type ArcRenderType = 'fullCircle' | 'simple' | 'rounded';

/**
 * Kind of line-series update, which selects the transition behaviour.
 * @group Types
 */
export type LineUpdateKind = 'append' | 'scroll' | 'update';

/**
 * A single computed vertex of a cartesian series, in pixel space.
 * @group Interface
 */
export interface ComputedPoint {
    /**
     * Pixel x coordinate.
     */
    x: number;
    /**
     * Pixel y coordinate.
     */
    y: number;
    /**
     * Raw data value. `null` marks a gap point.
     */
    value: number | null;
    /**
     * Category label.
     */
    category: string;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
}

/**
 * Context passed to the per-segment callbacks of a line or area series.
 * @group Interface
 */
export interface SegmentContext<T = unknown> {
    /**
     * Start point of the segment.
     */
    p0: ComputedPoint;
    /**
     * End point of the segment.
     */
    p1: ComputedPoint;
    /**
     * Data index of the start point.
     */
    p0DataIndex: number;
    /**
     * Data index of the end point.
     */
    p1DataIndex: number;
    /**
     * Datum behind the start point, when the series was given a data array.
     */
    datum0?: T;
    /**
     * Datum behind the end point, when the series was given a data array.
     */
    datum1?: T;
    /**
     * Series this segment belongs to.
     */
    seriesId?: string;
    /**
     * Series order index.
     */
    seriesIndex?: number;
}

/**
 * A segment style value: either a static value or a callback deriving it from segment context.
 * @group Types
 */
export type SegmentStyleValue<T, V> = V | ((ctx: SegmentContext<T>) => V | undefined);

/**
 * Geometry of one bar, handed to a custom bar shape function.
 * @group Interface
 */
export interface BarShapeInfo {
    /**
     * Bar x position.
     */
    x: number;
    /**
     * Bar y position. The top of the bar for positive values.
     */
    y: number;
    /**
     * Bar width in pixels.
     */
    width: number;
    /**
     * Bar height in pixels.
     */
    height: number;
    /**
     * Data value.
     */
    value: number;
    /**
     * Category label.
     */
    category: string;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
    /**
     * Whether the value is negative.
     */
    isNegative: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Scales
 * ---------------------------------------------------------------------------------------------- */

/**
 * Scale function: converts a data value to a pixel position.
 * @group Types
 */
export type ScaleFunction = (value: unknown) => number;

/**
 * A categorical band scale: one band per category.
 * @group Interface
 */
export interface BandScale {
    type: 'band';
    /**
     * Ordered categories the scale covers.
     */
    domain: string[];
    /**
     * Pixel range the scale projects onto.
     */
    range: [number, number];
    /**
     * Drawable width of one band.
     */
    bandwidth: number;
    /**
     * Distance from one band's start to the next.
     */
    step: number;
    /**
     * Pixel center of a category's band.
     */
    scale: ScaleFunction;
    /**
     * Pixel start of a category's band.
     */
    bandStart: ScaleFunction;
    /**
     * Category index nearest to a pixel position.
     */
    indexAt: (pixel: number) => number;
    /**
     * Category nearest to a pixel position.
     */
    invert: (pixel: number) => string | undefined;
}

/**
 * A continuous scale: linear, logarithmic or time.
 * @group Interface
 */
export interface LinearScale {
    type: 'linear' | 'logarithmic' | 'time';
    /**
     * Numeric bounds the scale covers.
     */
    domain: [number, number];
    /**
     * Pixel range the scale projects onto.
     */
    range: [number, number];
    /**
     * Pixel position of a data value.
     */
    scale: ScaleFunction;
    /**
     * Data value at a pixel position.
     */
    invert: (pixel: number) => number;
}

/**
 * Either a categorical band scale or a continuous scale.
 * @group Types
 */
export type AxisScale = BandScale | LinearScale;

/**
 * A rectangle in pixel space.
 * @group Interface
 */
export interface BoxArea {
    /**
     * Pixel x of the left edge.
     */
    x: number;
    /**
     * Pixel y of the top edge.
     */
    y: number;
    /**
     * Width in pixels.
     */
    width: number;
    /**
     * Height in pixels.
     */
    height: number;
}

/**
 * Reserved width of the axes on each side, used to keep synced charts aligned.
 * @group Interface
 */
export interface AxisWidths {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * Callback notified with the new maximum axis widths across all synced charts.
 * @group Types
 */
export type AxisWidthsCallback = (max: AxisWidths) => void;

/* -------------------------------------------------------------------------------------------------
 * Animation
 * ---------------------------------------------------------------------------------------------- */

/**
 * Phase of the orchestrated animation lifecycle.
 * @group Types
 */
export type AnimationPhase = 'entrance' | 'update' | 'static';

/**
 * Easing function mapping linear progress in `[0, 1]` to eased progress.
 * @group Types
 */
export type EasingFunction = (t: number) => number;

/**
 * Names of the built-in easing presets.
 * @group Types
 */
export type EasingPreset = 'linear' | 'easeOutQuad' | 'easeOutCubic' | 'easeOutQuart' | 'easeOutQuint' | 'easeOutExpo' | 'easeInOutCubic' | 'easeInOutQuart' | 'easeOutBack' | 'easeOutElastic' | 'easeOutBounce' | 'easeInBounce' | 'easeInOutBounce';

/**
 * Names of the built-in easing functions selectable through the public animation props.
 * @group Types
 */
export type EasingFunctionName = EasingPreset;

/**
 * Callback invoked each frame with eased progress and the current phase.
 * @group Types
 */
export type FrameListener = (progress: number, phase: AnimationPhase) => void;

/**
 * Per-category interpolation progress, used when categories are lerped between renders.
 * @group Types
 */
export type CategoryLerpState = Map<string, number>;

/* -------------------------------------------------------------------------------------------------
 * Interaction
 * ---------------------------------------------------------------------------------------------- */

/**
 * Which axes a zoom or pan gesture acts on.
 * @group Types
 */
export type ZoomMode = 'x' | 'y' | 'xy';

/**
 * Keyboard modifier that must be held to arm a zoom or pan gesture.
 * @group Types
 */
export type ModifierKey = 'shift' | 'ctrl' | 'alt' | 'meta';

/**
 * Presentation mode of the tooltip: `item` shows a single series hit, `shared` groups every series
 * at the snap anchor.
 * @group Types
 */
export type TooltipMode = 'item' | 'shared';

/**
 * Point selection strategy for hover and tooltip.
 *
 * - `x` — nearest on the x axis (the line and area default)
 * - `y` — nearest on the y axis
 * - `xy` — Euclidean nearest (the scatter and bubble default)
 * - `category` — snap to the nearest category (the bar and candlestick default)
 * - `none` — exact shape hover only, with no neighbourhood search
 * @group Types
 */
export type TooltipSnap = 'x' | 'y' | 'xy' | 'category' | 'none';

/**
 * The kind of navigator drag in progress: a pan, or one of the four resize edges.
 * @group Types
 */
export type DragType = 'pan' | 'resize-left' | 'resize-right' | 'resize-top' | 'resize-bottom';

/**
 * The interactive zone under the pointer within the navigator.
 * @group Types
 */
export type NavigatorHitZone = 'resize-left' | 'resize-right' | 'resize-top' | 'resize-bottom' | 'pan' | 'background';

/**
 * Identifier for a supported data decimation algorithm.
 * @group Types
 */
export type DecimationAlgorithm = 'lttb' | 'min-max' | 'k-means';

/**
 * Axis specifier for sync operations.
 * @group Types
 */
export type SyncAxis = 'x' | 'y' | 'xy';

/**
 * Display mode for a shared legend: list datasets, categories, or both.
 * @group Types
 */
export type SharedLegendMode = 'dataset' | 'category' | 'both';

/**
 * Supported image and document export formats.
 * @group Types
 */
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf';

/**
 * Identifier for a single entry in the export menu. Each download value maps to an export format;
 * `'separator'` renders a divider between groups of items.
 * @group Types
 */
export type ExportMenuItem = 'downloadPNG' | 'downloadJPEG' | 'downloadSVG' | 'downloadPDF' | 'downloadPNGTransparent' | 'downloadSVGTransparent' | 'separator';

/**
 * Alignment mode for outside data labels on circular charts.
 * @group Types
 */
export type DataLabelAlignTo = 'none' | 'labelLine' | 'edge';

/**
 * Leader-line style for outside data labels on circular charts.
 * @group Types
 */
export type DataLabelLineStyle = 'angled' | 'straight' | 'none';

/* -------------------------------------------------------------------------------------------------
 * SVG descriptors
 * ---------------------------------------------------------------------------------------------- */

/**
 * A declarative SVG element descriptor. Render functions return one of these so the same callback
 * can serve the SVG renderer, which stamps it into the DOM, and the Canvas renderer, which paints it.
 * @group Interface
 */
export interface SvgNode {
    /**
     * SVG tag name.
     */
    tag: string;
    /**
     * Attributes to set on the element.
     */
    attrs: Record<string, string | number | boolean | null | undefined>;
    /**
     * Child nodes, or text content.
     */
    children: (SvgNode | string)[];
}

/**
 * A function that paints directly into a canvas context.
 * @group Types
 */
export type CanvasPainter = (ctx: CanvasRenderingContext2D) => void;

/**
 * A single parsed SVG path command, used when rasterizing paths to canvas.
 * @group Types
 */
export type ParsedPathCommand = { type: 'M' | 'L'; x: number; y: number } | { type: 'Z' };

/**
 * A template or a render function, whichever a given seam accepts. Where both are supplied the
 * template wins under SVG.
 * @group Types
 */
export type SlotContent<C> = TemplateRef<C> | ((context: C) => SvgNode | string | null | void);
