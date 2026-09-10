/**
 *
 * Series props. Inputs typed as `FieldAccessor<T, R>` accept a static value, a per-item array, a
 * field name on the datum, or a callback. Color-family arrays cycle modulo their length; every
 * other accessor array clips and falls back to the series default.
 *
 * @module charts
 *
 */
import type { HeatmapCellContext, PointRenderContext, SliceRenderContext, TreemapCellContext } from './charts-context.types';
import type { BarEdge, BarShapeInfo, BorderAlign, BorderJoinStyle, BorderRadius, CategorySortOrder, ConnectNullsMode, CurveType, DashAccessor, FieldAccessor, FillValue, LineCapStyle, SegmentStyleValue, SliceSortOrder } from './charts.types';

/**
 * Inputs every series component shares.
 * @group Interface
 */
export interface BaseSeriesProps<T = unknown> {
    /**
     * Data array. Mutually exclusive with `ChartItem` children.
     */
    data?: T[];
    /**
     * Series name, used in the legend and the tooltip.
     */
    name?: string;
    /**
     * Field name giving each item a stable identity, so animations match up when the data is
     * reordered.
     */
    keyField?: string;
    /**
     * Unique dataset identifier. Generated when unset.
     */
    id?: string;
    /**
     * Stacking or rendering order. 0 is the bottom of the stack.
     */
    order?: number;
}

/**
 * Inputs shared by the cartesian series, which bind to a named axis.
 * @group Interface
 */
export interface CartesianSeriesProps<T = unknown> extends BaseSeriesProps<T> {
    /**
     * Bind to a specific x axis by id.
     */
    xAxisId?: string;
    /**
     * Bind to a specific y axis by id.
     */
    yAxisId?: string;
}

/**
 * Marker inputs shared by the series that draw point markers.
 * @group Interface
 */
export interface MarkerSeriesProps<T = unknown> {
    /**
     * Marker radius in pixels. Per-point through an array or a callback.
     */
    markerSize?: FieldAccessor<T, number>;
    /**
     * A built-in {@link PointStyle} name, or any custom SVG path `d` string. A per-item callback is
     * handed the item context extended with the resolved `size`.
     */
    markerShape?: FieldAccessor<T, string>;
    /**
     * Marker rotation in degrees, where 0 is upright.
     */
    pointRotation?: FieldAccessor<T, number>;
    /**
     * Marker fill color.
     */
    pointBackgroundColor?: FieldAccessor<T, FillValue>;
    /**
     * Marker border stroke color.
     */
    pointBorderColor?: FieldAccessor<T, FillValue>;
    /**
     * Marker border stroke width in pixels.
     */
    pointBorderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Marker border dash pattern.
     */
    pointBorderDash?: DashAccessor<T>;
    /**
     * Marker border dash phase offset.
     */
    pointBorderDashOffset?: FieldAccessor<T, number>;
    /**
     * Marker border path join style.
     */
    pointBorderJoinStyle?: BorderJoinStyle;
    /**
     * Custom marker renderer. Under SVG, project a `pChartMarkerDef` template; under Canvas, pass a
     * function that draws to `ctx` and returns `null`.
     */
    renderMarker?: (context: PointRenderContext<T>) => unknown;
    /**
     * Marker fill opacity, for reading an overplotted cloud.
     */
    pointFillOpacity?: FieldAccessor<T, number>;
}

/**
 * Hover inputs shared by the series that recolor a mark under the pointer.
 * @group Interface
 */
export interface HoverableSeriesProps<T = unknown> {
    /**
     * Per-item fill color on hover. Short-circuits the global `ChartHover` brightness cascade.
     */
    hoverColor?: FieldAccessor<T, FillValue>;
    /**
     * Per-item border color on hover.
     */
    hoverBorderColor?: FieldAccessor<T, FillValue>;
}

/**
 * Inputs of `ChartLine`, which covers line, area and stacked-area series. Area behaviour is driven
 * by `fillOpacity` above zero rather than by a separate series type.
 * @group Interface
 */
export interface LineSeriesProps<T = unknown> extends CartesianSeriesProps<T>, MarkerSeriesProps<T> {
    /**
     * X axis category field. Falls back to the array index when unset.
     */
    categoryXField?: FieldAccessor<T, string>;
    /**
     * Y axis numeric value field.
     */
    valueYField?: FieldAccessor<T, number>;
    /**
     * Line stroke and area fill color, at series level. For per-point coloring use
     * `pointBackgroundColor` and `pointBorderColor`.
     */
    color?: FillValue;
    /**
     * Line stroke thickness in pixels.
     */
    lineStrokeWidth?: number;
    /**
     * How the ends of line segments are drawn.
     */
    lineCapStyle?: LineCapStyle;
    /**
     * How path segments connect at data points.
     */
    lineJoinStyle?: BorderJoinStyle;
    /**
     * Dash pattern, as `[dashLength, gapLength]`.
     */
    lineDash?: number[];
    /**
     * Offset into the dash pattern.
     */
    lineDashOffset?: number;
    /**
     * Named shortcut for `lineDash`.
     */
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    /**
     * Interpolation between data points.
     */
    curve?: CurveType;
    /**
     * Spline tightness, from 0 to 1. Only applies when `curve` is `'spline'`: 0 gives straight
     * lines, 0.5 gives Catmull-Rom.
     */
    tension?: number;
    /**
     * Area fill opacity beneath the line, from 0 to 1. At 0 only the line is drawn.
     */
    fillOpacity?: number;
    /**
     * Halo stroke color drawn behind the main stroke.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Halo stroke width.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Halo dash pattern. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Halo dash phase offset.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * Halo line cap style.
     */
    borderCapStyle?: LineCapStyle;
    /**
     * Display point markers at each data vertex.
     */
    showMarkers?: boolean;
    /**
     * Invisible hover detection radius around each point.
     */
    pointHitRadius?: number;
    /**
     * Marker radius while hovered, in pixels.
     */
    hoverPointRadius?: number;
    /**
     * Marker fill color on hover.
     */
    pointHoverBackgroundColor?: FillValue;
    /**
     * Marker border color on hover.
     */
    pointHoverBorderColor?: FillValue;
    /**
     * Marker border width on hover, in pixels.
     */
    pointHoverBorderStrokeWidth?: number;
    /**
     * Null value handling. Only reach for `'zero'` where zero is a meaningful baseline.
     */
    connectNulls?: ConnectNullsMode;
    /**
     * Per-segment stroke color. Return `undefined` from the callback to keep the series default.
     */
    segmentColor?: SegmentStyleValue<T, FillValue>;
    /**
     * Per-segment stroke width.
     */
    segmentStrokeWidth?: SegmentStyleValue<T, number>;
    /**
     * Per-segment dash pattern.
     */
    segmentDash?: SegmentStyleValue<T, number[]>;
    /**
     * Per-segment area fill color. Area mode only.
     */
    segmentFillColor?: SegmentStyleValue<T, FillValue>;
}

/**
 * Area series props. An alias of {@link LineSeriesProps}, since area is a fill on a line rather
 * than a series type of its own.
 * @group Types
 */
export type AreaSeriesProps<T = unknown> = LineSeriesProps<T>;

/**
 * Inputs of `ChartBar`, which covers column, bar, grouped, stacked, waterfall, floating and
 * variwide series.
 * @group Interface
 */
export interface BarSeriesProps<T = unknown> extends CartesianSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Category field for the x axis, for vertical bars.
     */
    categoryXField?: FieldAccessor<T, string>;
    /**
     * Category field for the y axis. Use this instead of `categoryXField` to draw bars horizontally.
     */
    categoryYField?: FieldAccessor<T, string>;
    /**
     * Value field for the y axis, for vertical bars.
     */
    valueYField?: FieldAccessor<T, number>;
    /**
     * Value field for the x axis, for horizontal bars. Pair it with `categoryYField`.
     */
    valueXField?: FieldAccessor<T, number>;
    /**
     * Bar fill color.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Bar fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Fixed bar thickness in pixels, overriding the computed width.
     */
    barThickness?: number;
    /**
     * Maximum bar width in pixels. Ignored when `barThickness` is set.
     */
    maxBarThickness?: number;
    /**
     * Minimum bar length in pixels, so very small values stay visible.
     */
    minBarLength?: number;
    /**
     * Gap between bars within a group, as a fraction of the category band width.
     */
    barGap?: number;
    /**
     * Gap between category groups, as a fraction of the category band width.
     */
    categoryGap?: number;
    /**
     * Bar ordering applied before render.
     */
    sort?: CategorySortOrder;
    /**
     * How multi-series values are combined when sorting by value. Only read when `sort` is set.
     */
    sortAggregate?: 'sum' | 'max' | 'min' | 'first';
    /**
     * Corner radius, uniform or per corner.
     */
    borderRadius?: FieldAccessor<T, BorderRadius>;
    /**
     * Border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Border stroke color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Dash pattern, as `[dashLength, gapLength]`. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Offset into the dash pattern.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * How border segments connect at bar corners.
     */
    borderJoinStyle?: BorderJoinStyle;
    /**
     * Border alignment relative to the bar edge.
     */
    borderAlign?: BorderAlign;
    /**
     * Which bar edges skip the border stroke. Orientation-aware: `'start'` is always the baseline
     * edge. A per-bar array or callback is what makes floating-bar and waterfall effects possible.
     */
    borderSkipped?: FieldAccessor<T, false | 'start' | 'end' | BarEdge>;
    /**
     * Start value for floating and range bars: the bar spans from `openField` to `valueYField`.
     * Named to match the shared `ChartItem` interface, where the same field carries the candlestick
     * open price, but it means "bar base value" here.
     */
    openField?: FieldAccessor<T, number>;
    /**
     * Proportional bar width field, which is what makes a variwide or Marimekko chart.
     */
    weightField?: FieldAccessor<T, number>;
    /**
     * Custom shape per bar. Receives the computed geometry and returns an SVG path `d` string,
     * which both renderers honour through `Path2D`.
     */
    renderShape?: (bar: BarShapeInfo) => string | undefined;
    /**
     * Null value handling. `'gap'` keeps the category slot but draws no bar; `'zero'`, `'connect'`
     * and `true` all draw at the baseline.
     */
    connectNulls?: ConnectNullsMode;
}

/**
 * Inputs of `ChartPie`, which covers pie, donut, gauge and nightingale series.
 * @group Interface
 */
export interface PieSeriesProps<T = unknown> extends BaseSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Numeric value field, which sets the slice angle.
     */
    valueField?: FieldAccessor<T, number>;
    /**
     * Slice label field.
     */
    categoryField?: FieldAccessor<T, string>;
    /**
     * Per-slice colors. Accepts hex, RGB, CSS variables and radial gradient objects.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Slice fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Per-slice radial offset in pixels, which pulls slices out of the center for an exploded pie.
     */
    offset?: FieldAccessor<T, number>;
    /**
     * Donut hole ratio, from 0 to 1. At 0 the chart is a solid pie.
     */
    innerRadius?: number;
    /**
     * Outer radius ratio, from 0 to 1. At 1 the chart fills the available space.
     */
    outerRadius?: number;
    /**
     * Where slices begin, in degrees. -90 is twelve o'clock, 0 is three o'clock.
     */
    startAngle?: number;
    /**
     * Arc span in degrees. 360 is a full circle, 180 a half-circle gauge.
     */
    sweepAngle?: number;
    /**
     * Gap between slices in pixels.
     */
    spacing?: number;
    /**
     * Per-slice variable outer radius, which is what makes a nightingale chart.
     */
    sliceRadiusValue?: FieldAccessor<T, number>;
    /**
     * Slice ordering applied before render.
     */
    sort?: SliceSortOrder;
    /**
     * Rounded slice corners.
     */
    borderRadius?: FieldAccessor<T, BorderRadius>;
    /**
     * Slice border stroke color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Slice border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Dash pattern, as `[dashLength, gapLength]`. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Offset into the dash pattern.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * How border segments connect at slice corners.
     */
    borderJoinStyle?: BorderJoinStyle;
    /**
     * Border alignment relative to the slice edge.
     */
    borderAlign?: BorderAlign;
    /**
     * Custom content inside each slice. Under SVG, project a `pChartSliceDef` template; under
     * Canvas, draw to `ctx` and return `null`.
     */
    renderContent?: (context: SliceRenderContext<T>) => unknown;
}

/**
 * Inputs of `ChartPolar`, which draws radial bars proportional to value.
 * @group Interface
 */
export interface PolarSeriesProps<T = unknown> extends BaseSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Category label for each angular sector.
     */
    categoryXField?: FieldAccessor<T, string>;
    /**
     * Radial value field.
     */
    valueYField?: FieldAccessor<T, number>;
    /**
     * Bar fill color.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Bar fill opacity, from 0 to 1.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Hollow center ratio, from 0 to 1. At 0 bars run from the center.
     */
    innerRadius?: number;
    /**
     * Gap between bars in pixels.
     */
    spacing?: number;
    /**
     * Bar ordering applied before render.
     */
    sort?: SliceSortOrder;
    /**
     * Bar arc corner radius.
     */
    borderRadius?: FieldAccessor<T, BorderRadius>;
    /**
     * Bar border stroke color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Bar border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Dash pattern, as `[dashLength, gapLength]`. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Offset into the dash pattern.
     */
    borderDashOffset?: FieldAccessor<T, number>;
}

/**
 * Inputs of `ChartRadar`, which draws a closed polygon per series across shared spokes.
 * @group Interface
 */
export interface RadarSeriesProps<T = unknown> extends BaseSeriesProps<T>, MarkerSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Spoke label field.
     */
    categoryXField?: FieldAccessor<T, string>;
    /**
     * Radial value field.
     */
    valueYField?: FieldAccessor<T, number>;
    /**
     * Polygon stroke and fill color, at series level rather than per item: a radar polygon is one
     * closed shape, so per-vertex coloring has nowhere to go. For per-vertex markers use
     * `pointBackgroundColor` and `pointBorderColor`.
     */
    color?: FillValue;
    /**
     * Polygon area fill opacity, from 0 to 1. At 0 only the stroke is drawn.
     */
    fillOpacity?: number;
    /**
     * Polygon stroke thickness in pixels.
     */
    lineStrokeWidth?: number;
    /**
     * Polygon stroke dash style.
     */
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    /**
     * Dash pattern for the polygon stroke.
     */
    lineDash?: number[];
    /**
     * Edge interpolation: straight polygon edges, or Bezier curves between vertices.
     */
    curve?: 'linear' | 'smooth';
    /**
     * Display point markers at the spoke vertices.
     */
    showMarkers?: boolean;
    /**
     * Polygon halo border color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Polygon halo border width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Polygon halo border dash pattern.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Polygon halo border dash phase offset.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * Polygon halo border join style.
     */
    borderJoinStyle?: BorderJoinStyle;
    /**
     * Polygon halo border alignment: `'center'` straddles the polygon edge, `'inner'` sits fully
     * inside it.
     */
    borderAlign?: BorderAlign;
    /**
     * Binds the series to a named `ChartYAxis` for independent scaling. Left off, the series feeds
     * the shared automatic domain.
     */
    yAxisId?: string;
}

/**
 * Inputs of `ChartScatter`, which covers scatter and bubble series.
 * @group Interface
 */
export interface ScatterSeriesProps<T = unknown> extends CartesianSeriesProps<T>, MarkerSeriesProps<T> {
    /**
     * X axis numeric field.
     */
    valueXField?: FieldAccessor<T, number>;
    /**
     * Y axis numeric field.
     */
    valueYField?: FieldAccessor<T, number>;
    /**
     * Bubble radius field. Setting it turns on bubble mode, where the radius scales between
     * `minSize` and `maxSize`.
     */
    sizeField?: FieldAccessor<T, number>;
    /**
     * High-performance point rendering. `'auto'` turns it on past 50,000 visible points; `true` and
     * `false` force it either way.
     */
    boost?: boolean | 'auto';
    /**
     * Point fill color.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Marker fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Minimum bubble radius in bubble mode, in pixels.
     */
    minSize?: number;
    /**
     * Maximum bubble radius in bubble mode, in pixels.
     */
    maxSize?: number;
    /**
     * Invisible hover detection radius. Hit-testing measures 2D distance and takes the nearest
     * point inside this radius.
     */
    pointHitRadius?: number;
    /**
     * Marker radius while hovered, in pixels.
     */
    hoverPointRadius?: number;
    /**
     * Marker fill color on hover.
     */
    pointHoverBackgroundColor?: FillValue;
    /**
     * Marker border color on hover.
     */
    pointHoverBorderColor?: FillValue;
    /**
     * Marker border width on hover, in pixels.
     */
    pointHoverBorderStrokeWidth?: number;
    /**
     * Null value handling. `'gap'` skips the point; `'zero'` plots a null x or y at 0 so the point
     * stays visible against the axis. `'connect'` behaves as `'gap'` here, since there is no line
     * to bridge.
     */
    connectNulls?: ConnectNullsMode;
}

/**
 * Inputs of `ChartCandlestick`, which covers candlestick, hollow candle and OHLC bar series.
 * @group Interface
 */
export interface CandlestickSeriesProps<T = unknown> extends CartesianSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Category or date field for the x axis. Use `categoryYField` for horizontal candlesticks.
     */
    categoryXField?: FieldAccessor<T, string>;
    /**
     * Category field for the y axis, for horizontal candlesticks.
     */
    categoryYField?: FieldAccessor<T, string>;
    /**
     * Opening price field.
     */
    openField?: FieldAccessor<T, number>;
    /**
     * Highest price field.
     */
    highField?: FieldAccessor<T, number>;
    /**
     * Lowest price field.
     */
    lowField?: FieldAccessor<T, number>;
    /**
     * Closing price field.
     */
    closeField?: FieldAccessor<T, number>;
    /**
     * Visual rendering style.
     */
    variant?: 'candlestick' | 'hollow' | 'ohlc';
    /**
     * Per-candle color override, which wins over the direction color for that candle.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Candle color when the price rose. In hollow mode, when the close beat the previous close.
     */
    upColor?: FillValue;
    /**
     * Candle color when the price fell. In hollow mode, when the close missed the previous close.
     */
    downColor?: FillValue;
    /**
     * Candle color for a doji, where open equals close.
     */
    neutralColor?: FillValue;
    /**
     * Candle body border color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Candle body border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Candle body border dash pattern. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Offset into the border dash pattern.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * Candle body corner radius.
     */
    borderRadius?: FieldAccessor<T, BorderRadius>;
    /**
     * Border alignment relative to the candle body edge.
     */
    borderAlign?: BorderAlign;
    /**
     * How border segments connect at candle body corners.
     */
    borderJoinStyle?: BorderJoinStyle;
    /**
     * Border color override when the price rose.
     */
    borderUpColor?: FillValue;
    /**
     * Border color override when the price fell.
     */
    borderDownColor?: FillValue;
    /**
     * Border color override for a doji.
     */
    borderNeutralColor?: FillValue;
    /**
     * Candle body width as a fraction of the available category space, from 0 to 1.
     */
    barWidthRatio?: number;
    /**
     * Wick and shadow line thickness in pixels.
     */
    wickStrokeWidth?: FieldAccessor<T, number>;
}

/**
 * Inputs of `ChartHeatmap`, which draws a value-colored grid over two categorical dimensions.
 * @group Interface
 */
export interface HeatmapSeriesProps<T = unknown> extends BaseSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Field name for the x axis category.
     */
    categoryXField?: string;
    /**
     * Field name for the y axis category.
     */
    categoryYField?: string;
    /**
     * Field name for the numeric value that drives the cell color.
     */
    valueField?: string;
    /**
     * A single color whose opacity is mapped to the value. Used when no `colorRange` is set.
     */
    color?: FillValue;
    /**
     * Multi-stop color gradient. Without `colorScale`, the breakpoints come from the data extremes.
     */
    colorRange?: string[];
    /**
     * Explicit breakpoints for the color interpolation, one per `colorRange` stop.
     */
    colorScale?: number[];
    /**
     * Fill color for null or missing cells.
     */
    nullColor?: string;
    /**
     * Override the minimum value used for color mapping.
     */
    min?: number;
    /**
     * Override the maximum value used for color mapping.
     */
    max?: number;
    /**
     * Cell fill opacity, from 0 to 1. Multiplies into the hover and dim effects.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Gap between cells in pixels.
     */
    spacing?: number;
    /**
     * Corner radius of the cells in pixels.
     */
    borderRadius?: number;
    /**
     * Cell border stroke color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Cell border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Cell border dash pattern. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Cell border dash phase offset.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * Cell border path join style.
     */
    borderJoinStyle?: BorderJoinStyle;
    /**
     * Border alignment relative to the cell edge.
     */
    borderAlign?: BorderAlign;
    /**
     * Show null cells with a dashed border background.
     */
    showEmptyCells?: boolean;
    /**
     * Custom cell content renderer. Under SVG, project a `pChartHeatmapCellDef` template; under
     * Canvas, the context arrives clipped to the cell bounds, so draw directly and return `null`.
     */
    renderContent?: (context: HeatmapCellContext<T>) => unknown;
}

/**
 * Per-depth styling override for a treemap.
 * @group Interface
 */
export interface TreemapLevelConfig {
    /**
     * Depth this config applies to, where 0 is the top-level groups.
     */
    depth: number;
    /**
     * Layout algorithm for this depth.
     */
    layout?: 'squarify' | 'slice' | 'dice' | 'sliceDice';
    /**
     * Gap between cells at this depth, in pixels.
     */
    spacing?: number;
    /**
     * Cell border width at this depth, in pixels.
     */
    borderStrokeWidth?: number;
    /**
     * Cell border color at this depth.
     */
    borderColor?: string;
    /**
     * Show the group header strip at this depth.
     */
    showHeader?: boolean;
    /**
     * Header strip height at this depth, in pixels.
     */
    headerHeight?: number;
    /**
     * Color each cell at this depth individually.
     */
    colorByPoint?: boolean;
}

/**
 * Inputs of `ChartTreemap`, which draws nested rectangles sized by value.
 * @group Interface
 */
export interface TreemapSeriesProps<T = unknown> extends BaseSeriesProps<T>, HoverableSeriesProps<T> {
    /**
     * Field name for the cell display label.
     */
    categoryField?: string;
    /**
     * Field name for the numeric value that determines the cell area.
     */
    valueField?: string;
    /**
     * Field name holding each item's own unique id. Pair it with `parentField` for a flat
     * adjacency-list hierarchy.
     */
    nodeId?: string;
    /**
     * Field name holding each item's parent id. Pair it with `nodeId`.
     */
    parentField?: string;
    /**
     * Cell fill color. An array cycles by group index.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Cell fill opacity, from 0 to 1.
     */
    opacity?: FieldAccessor<T, number>;
    /**
     * Field name for the numeric value that maps cells onto a color gradient.
     */
    colorValueField?: string;
    /**
     * Multi-stop color array. Without `colorScale`, the breakpoints come from the data extremes.
     */
    colorRange?: string[];
    /**
     * Explicit breakpoints for the color interpolation, one per `colorRange` stop.
     */
    colorScale?: number[];
    /**
     * Cell border stroke color.
     */
    borderColor?: FieldAccessor<T, FillValue>;
    /**
     * Cell border stroke width in pixels.
     */
    borderStrokeWidth?: FieldAccessor<T, number>;
    /**
     * Cell border dash pattern. Also accepts the named shortcuts.
     */
    borderDash?: DashAccessor<T>;
    /**
     * Cell border dash phase offset.
     */
    borderDashOffset?: FieldAccessor<T, number>;
    /**
     * Label text color.
     */
    labelColor?: FieldAccessor<T, FillValue>;
    /**
     * Tiling algorithm.
     */
    layout?: 'squarify' | 'slice' | 'dice' | 'sliceDice';
    /**
     * Gap between sibling cells in pixels.
     */
    spacing?: number;
    /**
     * Padding around parent container regions, in pixels.
     */
    groupPadding?: number;
    /**
     * Per-depth styling overrides.
     */
    levels?: TreemapLevelConfig[];
    /**
     * Corner radius of the cells, in pixels.
     */
    borderRadius?: number;
    /**
     * Minimum cell dimension, in pixels, for the label to be drawn at all.
     */
    labelMinSize?: number;
    /**
     * Show the parent header labels. On by default once `parentField` is set.
     */
    showGroupLabel?: boolean;
    /**
     * Height of the parent header labels, in pixels.
     */
    groupLabelHeight?: number;
    /**
     * Enable click-to-drill navigation into the parent groups.
     */
    drilldown?: boolean;
    /**
     * `'nested'` keeps parent headers visible with children inside; `'flat'` draws parents as solid
     * cells you click to drill into.
     */
    drilldownMode?: 'nested' | 'flat';
    /**
     * Top-level breadcrumb label.
     */
    rootLabel?: string;
    /**
     * In nested mode, hovering a leaf's label reports the leaf while hovering its background
     * reports the parent.
     */
    interactByLeaf?: boolean;
    /**
     * Custom cell content renderer. Under SVG, project a `pChartTreemapCellDef` template; under
     * Canvas, the context arrives clipped to the cell bounds, so draw directly and return `null`.
     */
    renderContent?: (context: TreemapCellContext<T>) => unknown;
    /**
     * Border alignment relative to the cell edge.
     */
    borderAlign?: BorderAlign;
    /**
     * How border segments meet at a cell's corners.
     */
    borderJoinStyle?: BorderJoinStyle;
}

/**
 * Maps each series type to its props, so a dataset registers into context under the right shape.
 * @group Interface
 */
export interface SeriesPropsMap {
    line: LineSeriesProps;
    bar: BarSeriesProps;
    pie: PieSeriesProps;
    donut: PieSeriesProps;
    pie3d: PieSeriesProps;
    polar: PolarSeriesProps;
    radar: RadarSeriesProps;
    scatter: ScatterSeriesProps;
    candlestick: CandlestickSeriesProps;
    heatmap: HeatmapSeriesProps;
    treemap: TreemapSeriesProps;
}

/**
 * Union of every series props type.
 * @group Types
 */
export type AnySeriesProps = SeriesPropsMap[keyof SeriesPropsMap];

/**
 * Inputs of `ChartItem`, the declarative alternative to a data array. Only the fields the parent
 * series understands are read; the rest are ignored.
 * @group Interface
 */
export interface ChartItemProps {
    /**
     * X axis category.
     */
    categoryX?: string;
    /**
     * Y axis category.
     */
    categoryY?: string;
    /**
     * X axis value.
     */
    valueX?: number;
    /**
     * Y axis value.
     */
    valueY?: number;
    /**
     * Slice, cell or heatmap value.
     */
    value?: number;
    /**
     * Slice, cell or treemap label.
     */
    category?: string;
    /**
     * Bar base value, or the candlestick open price.
     */
    open?: number;
    /**
     * Candlestick high price.
     */
    high?: number;
    /**
     * Candlestick low price.
     */
    low?: number;
    /**
     * Candlestick close price.
     */
    close?: number;
    /**
     * Bubble radius value, which turns on bubble mode for this item.
     */
    size?: number;
    /**
     * Override color for this item.
     */
    color?: string;
    /**
     * Item opacity, from 0 to 1.
     */
    opacity?: number;
    /**
     * Per-item corner radius.
     */
    borderRadius?: BorderRadius;
    /**
     * Per-item border color.
     */
    borderColor?: string;
    /**
     * Per-item border width.
     */
    borderStrokeWidth?: number;
}

/**
 * Inputs of `ChartStacked`, which turns overlapping siblings into a stack. On pie and radar series
 * the same wrapper produces concentric rings, where only `gap` and `id` apply.
 * @group Interface
 */
/**
 * `ChartRange` inputs.
 *
 * Wrap exactly two `ChartLine` components to fill the area between them. Fewer than two renders
 * nothing; more than two uses only the first pair.
 * @group Interface
 */
export interface ChartRangeProps {
    /**
     * A single fill colour for the band. Omit for dual-colour mode, where each child's own line
     * colour fills the region in which that series is on top.
     */
    color?: FillValue;
    /**
     * Fill opacity for the band.
     */
    fillOpacity?: number;
    /**
     * Range group identifier.
     */
    id?: string;
}

export interface StackedProps {
    /**
     * `'normal'` stacks absolute values, with negatives stacking downward; `'percent'` normalizes
     * each category to 100%.
     */
    mode?: 'normal' | 'percent';
    /**
     * Pixel gap between stacked segments.
     */
    gap?: number;
    /**
     * Stack group identifier.
     */
    id?: string;
}

/**
 * Inputs of `ChartWaterfall`, which turns a bar series into a running total.
 * @group Interface
 */
export interface WaterfallProps {
    /**
     * Field name that resolves truthy on the summary bars. A total bar resets from zero and shows
     * the cumulative sum.
     */
    totalField?: string;
}

/**
 * Inputs of `ChartTreemapGroup`, the declarative parent container of a treemap hierarchy.
 * @group Interface
 */
export interface TreemapGroupProps {
    /**
     * Group header label.
     */
    label?: string;
    /**
     * Group color, used for the header and to tint the child cells.
     */
    color?: string;
    /**
     * Group opacity, from 0 to 1.
     */
    opacity?: number;
}
