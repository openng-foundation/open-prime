/**
 *
 * Feature props. Every visible feature of a chart is a child component you add or remove rather
 * than a flag on the root: adding `ChartLegend` renders a legend and reserves layout space for it,
 * removing it takes both away.
 *
 * @module charts
 *
 */
import type {
    AnnotationContext,
    AxisGroupRenderContext,
    AxisTickMarkRenderContext,
    AxisTickRenderContext,
    ColorLegendRenderContext,
    DataLabelContext,
    DataTableCellContext,
    LegendClickContext,
    LegendItemRenderContext,
    PointDescriptionContext,
    SeriesDescriptionContext,
    TooltipRenderContext,
    TooltipValueFormatter
} from './charts-context.types';
import type { Alignment, AxisType, DashPattern, DecimationAlgorithm, EasingFunctionName, ExportMenuItem, FieldAccessor, FillValue, ModifierKey, Position, TickValue, TimeUnit, ZoomMode } from './charts.types';

/**
 * Vertical padding around a chrome element, uniform or per edge.
 * @group Types
 */
export type BlockPadding = number | { top?: number; bottom?: number };

/**
 * Padding around a boxed element, uniform or per edge.
 * @group Types
 */
export type Padding = { top: number; right: number; bottom: number; left: number };

/**
 * Font weight accepted anywhere text is styled.
 * @group Types
 */
export type FontWeight = 'normal' | 'bold' | number;

/**
 * Dash style shorthand used by grid lines and strokes.
 * @group Types
 */
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

/* -------------------------------------------------------------------------------------------------
 * Title and caption
 * ---------------------------------------------------------------------------------------------- */

/**
 * Inputs of `ChartTitle`, the chart header. Leaving `fontSize` off opts into responsive scaling.
 * @group Interface
 */
export interface ChartTitleProps {
    /**
     * Title text.
     */
    text: string;
    /**
     * Placement relative to the chart.
     */
    position?: 'top' | 'bottom';
    /**
     * Horizontal alignment within the title area.
     */
    alignment?: Alignment;
    /**
     * Font size in pixels. Omit it to keep the responsive auto-scaling.
     */
    fontSize?: number;
    /**
     * Font weight.
     */
    fontWeight?: FontWeight;
    /**
     * Font family.
     */
    fontFamily?: string;
    /**
     * Font style.
     */
    fontStyle?: 'normal' | 'italic';
    /**
     * Line height multiplier applied to the font size.
     */
    lineHeight?: number;
    /**
     * Text color. Any CSS color value.
     */
    color?: string;
    /**
     * Space above and below the title.
     */
    padding?: BlockPadding;
    /**
     * Overlay the title on the chart without taking height from the plot area.
     */
    floating?: boolean;
    /**
     * Horizontal offset in pixels, applied after alignment.
     */
    offsetX?: number;
    /**
     * Vertical offset in pixels.
     */
    offsetY?: number;
}

/**
 * Inputs of `ChartCaption`, the chart footer. It stacks against `ChartTitle` unless `position`
 * sends it to the opposite edge.
 * @group Interface
 */
export interface ChartCaptionProps {
    /**
     * Caption text.
     */
    text: string;
    /**
     * Placement relative to the chart. Omit it to stack next to `ChartTitle`; set it to put the
     * caption on the opposite side, such as the title on top and the caption at the bottom.
     */
    position?: 'top' | 'bottom';
    /**
     * Horizontal alignment. Inherits the title's alignment when unset.
     */
    alignment?: Alignment;
    /**
     * Font size in pixels. Omit it to keep the responsive auto-scaling.
     */
    fontSize?: number;
    /**
     * Font weight.
     */
    fontWeight?: FontWeight;
    /**
     * Font family.
     */
    fontFamily?: string;
    /**
     * Font style.
     */
    fontStyle?: 'normal' | 'italic';
    /**
     * Line height multiplier.
     */
    lineHeight?: number;
    /**
     * Text color.
     */
    color?: string;
    /**
     * Space above and below the caption.
     */
    padding?: BlockPadding;
    /**
     * Horizontal offset in pixels, applied after alignment.
     */
    offsetX?: number;
    /**
     * Vertical offset in pixels.
     */
    offsetY?: number;
}

/* -------------------------------------------------------------------------------------------------
 * Axes
 * ---------------------------------------------------------------------------------------------- */

/**
 * Tick mark and label styling, given to `tickStyle` as an object or returned from a per-tick
 * function.
 * @group Interface
 */
export interface TickStyle {
    /**
     * Tick label font size.
     */
    fontSize?: number;
    /**
     * Tick label font family.
     */
    fontFamily?: string;
    /**
     * Tick label font weight.
     */
    fontWeight?: FontWeight;
    /**
     * Tick label text color.
     */
    color?: string;
    /**
     * Gap between the end of the tick mark and the label text.
     */
    padding?: number;
    /**
     * Tick mark length in pixels.
     */
    tickLength?: number;
    /**
     * Tick mark color.
     */
    tickColor?: string;
    /**
     * Tick mark stroke width.
     */
    tickStrokeWidth?: number;
}

/**
 * Aggregation of a large dataset by time interval on a time axis.
 * @group Interface
 */
export interface DataGroupingConfig {
    /**
     * Turn grouping on.
     */
    enabled?: boolean;
    /**
     * Time units the grouper may pick from, each with the multiples it may use.
     */
    units?: [TimeUnit, number[]][];
    /**
     * Point count above which grouping kicks in.
     */
    threshold?: number;
    /**
     * How values inside a group are combined.
     */
    aggregate?: 'average' | 'sum' | 'min' | 'max' | 'first' | 'last' | 'ohlc';
}

/**
 * Per-unit date format overrides for a time axis.
 * @group Types
 */
export type DateTimeFormatConfig = Partial<Record<TimeUnit, string | Intl.DateTimeFormatOptions>>;

/**
 * Time tick configuration: a forced interval, and the minimum spacing between ticks.
 * @group Interface
 */
export interface TimeTickConfig {
    /**
     * Force a specific unit rather than letting the axis pick one.
     */
    unit?: TimeUnit;
    /**
     * Multiple of `unit` between ticks.
     */
    step?: number;
    /**
     * Minimum pixel distance between ticks.
     */
    minSpacing?: number;
}

/**
 * Font and color of a group label on a partitioned axis.
 * @group Interface
 */
export interface PartitionLabelStyle {
    fontSize?: number;
    fontWeight?: FontWeight;
    fontFamily?: string;
    color?: string;
}

/**
 * Bracket line drawn below an axis group label.
 * @group Interface
 */
export interface BracketStyle {
    color?: string;
    strokeWidth?: number;
    /**
     * Length of the downturned ends of the bracket, in pixels.
     */
    tickLength?: number;
    /**
     * Gap between the label and the bracket, in pixels.
     */
    offset?: number;
}

/**
 * Separator line drawn at an axis group boundary.
 * @group Interface
 */
export interface SeparatorStyle {
    color?: string;
    strokeWidth?: number;
    dash?: DashPattern;
    opacity?: number;
}

/**
 * Alternating background fill behind an axis group's region.
 * @group Interface
 */
export interface PartitionFillStyle {
    color?: string;
    opacity?: number;
}

/**
 * Inputs shared by `ChartXAxis` and `ChartYAxis`.
 * @group Interface
 */
export interface BaseAxisProps {
    /**
     * Unique axis identifier, matched by `xAxisId` and `yAxisId` on the datasets.
     */
    id?: string;
    /**
     * Axis scale type.
     */
    type?: AxisType;
    /**
     * Fixed axis minimum. A time axis also accepts a `Date` or an ISO string.
     */
    min?: number | Date | string | 'auto';
    /**
     * Fixed axis maximum.
     */
    max?: number | Date | string | 'auto';
    /**
     * Force the domain to include zero. On by default for bar, off for line.
     */
    startFromZero?: boolean;
    /**
     * Soft minimum: it extends the domain only when the data minimum sits above this value.
     */
    softMin?: number;
    /**
     * Soft maximum: it extends the domain only when the data maximum sits below this value.
     */
    softMax?: number;
    /**
     * Flip the axis direction.
     */
    reversed?: boolean;
    /**
     * Axis title, displayed alongside the axis.
     */
    label?: string;
    /**
     * Tick label formatter. An options object merges over the axis default; a function replaces the
     * formatting outright.
     */
    tickFormat?: Intl.NumberFormatOptions | ((value: TickValue, index?: number) => string);
    /**
     * Approximate number of ticks.
     */
    tickCount?: number;
    /**
     * Explicit tick step, which bypasses the automatic tick algorithm.
     */
    tickInterval?: number;
    /**
     * Tick label rotation in degrees.
     */
    tickRotation?: number;
    /**
     * Draw the tick marks inside or outside the chart area.
     */
    tickPosition?: 'inside' | 'outside';
    /**
     * Tick mark and label styling: an object for a uniform style, a function for per-tick.
     */
    tickStyle?: TickStyle | ((value: TickValue, index: number) => TickStyle);
    /**
     * Auto-rotate the labels when they would overlap. X axes only.
     */
    autoRotate?: boolean;
    /**
     * Angle used when auto-rotation kicks in.
     */
    autoRotateAngle?: number;
    /**
     * Auto-skip labels to avoid overlap. Set it false to force every label visible.
     */
    autoSkip?: boolean;
    /**
     * Minimum pixel distance between ticks while `autoSkip` is on. Computed from the rendered label
     * size when unset; a number forces fixed spacing.
     */
    minGridDistance?: number;
    /**
     * Minimum pixel gap between adjacent labels after collision resolution.
     */
    labelMinSpacing?: number;
    /**
     * Show the first tick label.
     */
    showFirstLabel?: boolean;
    /**
     * Show the last tick label.
     */
    showLastLabel?: boolean;
    /**
     * Show the axis line.
     */
    showLine?: boolean;
    /**
     * Show the tick marks.
     */
    showTicks?: boolean;
    /**
     * Show the tick labels.
     */
    showLabels?: boolean;
    /**
     * Show the whole axis: line, ticks, labels and grid lines.
     */
    visible?: boolean;
    /**
     * Axis line, tick mark, title and label color, unless `tickStyle.color` overrides it.
     */
    color?: string;
    /**
     * Category scale type, read only when `type` is `'category'`. `'band'` is the bar-chart style
     * with gaps, `'point'` the line-chart style with equal spacing.
     */
    scale?: 'band' | 'point';
    /**
     * Show the major grid lines. On by default on the primary value axis.
     */
    gridLines?: boolean;
    /**
     * Major grid line color.
     */
    gridColor?: string;
    /**
     * Major grid line dash style.
     */
    gridStyle?: StrokeStyle;
    /**
     * Major grid line stroke width.
     */
    gridStrokeWidth?: number;
    /**
     * Major grid line opacity, from 0 to 1.
     */
    gridOpacity?: number;
    /**
     * Show minor grid lines between the major ticks.
     */
    minorGridLines?: boolean;
    /**
     * Minor grid line color. Follows `gridColor` when unset.
     */
    minorGridColor?: string;
    /**
     * Minor grid line stroke width.
     */
    minorGridStrokeWidth?: number;
    /**
     * Minor grid line opacity, from 0 to 1.
     */
    minorGridOpacity?: number;
    /**
     * Number of minor subdivisions between major ticks.
     */
    minorGridCount?: number;
    /**
     * Minor grid line dash style.
     */
    minorGridStyle?: StrokeStyle;
    /**
     * Show minor tick marks at the minor grid positions.
     */
    minorTicks?: boolean;
    /**
     * Minor tick mark length in pixels.
     */
    minorTickLength?: number;
    /**
     * Minor tick mark color. Follows the axis color when unset.
     */
    minorTickColor?: string;
    /**
     * Minor tick mark stroke width.
     */
    minorTickStrokeWidth?: number;
    /**
     * Fill color for the alternating bands between grid lines.
     */
    alternateGridColor?: string;
    /**
     * Opacity of the alternating band fill, from 0 to 1.
     */
    alternateGridOpacity?: number;
    /**
     * Ordinal mode: maps time data onto ordinal indices, skipping the gaps. This is what financial
     * series want, so a weekend does not open a hole in the plot.
     */
    gapless?: boolean;
    /**
     * Aggregate a large dataset by time interval.
     */
    grouping?: DataGroupingConfig;
    /**
     * IANA timezone for the time axis labels.
     */
    timezone?: string;
    /**
     * Per-unit date format overrides for a time axis.
     */
    dateTimeFormats?: DateTimeFormatConfig;
    /**
     * Time tick configuration: forced interval and minimum spacing.
     */
    tickConfig?: TimeTickConfig;
    /**
     * Minimum time unit, which caps how far a zoom can descend.
     */
    minUnit?: TimeUnit;
    /**
     * Edge padding at the axis minimum, as a fraction of the pixel range from -1 to 1. A positive
     * value adds breathing room; a negative one clips the data at the edge.
     */
    chartPaddingMin?: number;
    /**
     * Edge padding at the axis maximum, as a fraction of the pixel range from -1 to 1.
     */
    chartPaddingMax?: number;
    /**
     * Custom tick label renderer.
     */
    render?: (context: AxisTickRenderContext) => unknown;
    /**
     * Custom tick mark renderer.
     */
    renderTick?: (context: AxisTickMarkRenderContext) => unknown;
}

/**
 * Inputs of `ChartXAxis`.
 * @group Interface
 */
export interface ChartXAxisProps extends BaseAxisProps {
    /**
     * Edge the axis sits on.
     */
    position?: 'top' | 'bottom';
}

/**
 * Inputs of `ChartYAxis`. The radial charts configure their concentric grid here rather than on the
 * series, and the ring count follows `tickCount`.
 * @group Interface
 */
export interface ChartYAxisProps extends BaseAxisProps {
    /**
     * Edge the axis sits on.
     */
    position?: 'left' | 'right';
    /**
     * Concentric grid shape on a radial chart: smooth circles, or an angular polygon.
     */
    gridShape?: 'polygon' | 'circle';
}

/**
 * Inputs of `ChartAxisGroup`, which adds group headers to a category axis. Declare membership with
 * `categories` or `range`, or with nested `ChartAxisCategory` children; the input wins when both
 * are present.
 * @group Interface
 */
export interface ChartAxisGroupProps {
    /**
     * Group header label.
     */
    label?: string;
    /**
     * Category values this group spans.
     */
    categories?: string[];
    /**
     * Value range `[from, to]` this group spans on a value axis.
     */
    range?: [number, number];
    /**
     * Font size, weight, family and color of this group's label.
     */
    labelStyle?: PartitionLabelStyle;
    /**
     * Bracket line below the group label. `true` takes the defaults.
     */
    bracket?: boolean | BracketStyle;
    /**
     * Vertical separator line at the group boundaries. `true` takes the defaults.
     */
    separator?: boolean | SeparatorStyle;
    /**
     * Alternating background fill for this group's region. `true` takes the defaults.
     */
    fill?: boolean | PartitionFillStyle;
    /**
     * Separator lines between the individual ticks inside this group.
     */
    tickSeparator?: boolean | SeparatorStyle;
    /**
     * Custom group label renderer.
     */
    render?: (context: AxisGroupRenderContext) => unknown;
}

/**
 * Inputs of `ChartAxisCategory`, which declares one category of an axis group and draws nothing on
 * its own. Two numeric siblings instead define a `[from, to]` range for the group.
 * @group Interface
 */
export interface ChartAxisCategoryProps {
    /**
     * Category name to include in the group.
     */
    value?: string | number;
}

/* -------------------------------------------------------------------------------------------------
 * Legend
 * ---------------------------------------------------------------------------------------------- */

/**
 * Inputs of `ChartLegend`.
 * @group Interface
 */
export interface ChartLegendProps {
    /**
     * Legend placement relative to the chart.
     */
    position?: Position;
    /**
     * Horizontal placement, which is the control that matters for a top or bottom legend. Defaults
     * to `'start'` at the left and right positions.
     */
    align?: Alignment;
    /**
     * Vertical alignment of the legend within the chart area. Applies to a left or right legend.
     */
    verticalAlign?: 'top' | 'middle' | 'bottom';
    /**
     * Stack the items horizontally or vertically. Defaults to `'vertical'` at the left and right
     * positions.
     */
    layout?: 'horizontal' | 'vertical';
    /**
     * Enable click-to-toggle series visibility.
     */
    interactive?: boolean;
    /**
     * Maximum legend width, for left and right legends only. Content past it scrolls.
     */
    maxWidth?: number;
    /**
     * Maximum legend height, for top and bottom legends only. Content past it scrolls.
     */
    maxHeight?: number;
    /**
     * Legend container width, for left and right legends only. Locking it keeps the chart area from
     * shifting as the items change.
     */
    width?: number;
    /**
     * Legend container height, for top and bottom legends only. Fixes the height whatever the item
     * count.
     */
    height?: number;
    /**
     * Label font size in pixels.
     */
    fontSize?: number;
    /**
     * Label font family.
     */
    fontFamily?: string;
    /**
     * Label font weight.
     */
    fontWeight?: FontWeight;
    /**
     * Label text color.
     */
    color?: string;
    /**
     * Legend icon marker size in pixels.
     */
    iconSize?: number;
    /**
     * Legend icon shape. `'auto'` follows the mark: a line for line and area, a dot for scatter,
     * bubble, pie and donut, a box otherwise.
     */
    iconShape?: 'circle' | 'square' | 'line' | 'auto';
    /**
     * Spacing between legend entries in pixels.
     */
    itemGap?: number;
    /**
     * Shared legend mode. Only read when the legend sits inside a `ChartGroup` rather than inside a
     * single chart.
     */
    mode?: 'dataset' | 'category' | 'both';
    /**
     * Custom item renderer, called once per legend item. It replaces each item independently rather
     * than the legend's whole layout.
     */
    render?: (context: LegendItemRenderContext) => unknown;
    /**
     * Click handler. Setting it takes over from the default show/hide toggle.
     */
    onClick?: (context: LegendClickContext) => void;
}

/**
 * Inputs of `ChartColorLegend`, which renders a value-to-color scale from a heatmap, a
 * value-colored treemap, or an explicit scale. With no scale to resolve it renders nothing.
 * @group Interface
 */
export interface ChartColorLegendProps {
    /**
     * Legend placement relative to the chart.
     */
    position?: Position;
    /**
     * Value breakpoints for the gradient. Detected from a heatmap or a value-colored treemap, and
     * falling back to a 0-to-100 domain when only `colorRange` is set.
     */
    colorScale?: number[];
    /**
     * Colors mapped onto the breakpoints, overriding the chart's color range.
     */
    colorRange?: string[];
    /**
     * Number of value labels along the gradient bar.
     */
    ticks?: number;
    /**
     * Custom formatter for the tick labels.
     */
    formatLabel?: (value: number) => string;
    /**
     * Number of discrete color blocks. Omit it for a smooth continuous gradient.
     */
    steps?: number;
    /**
     * Width of the gradient bar in pixels.
     */
    width?: number;
    /**
     * Height of the gradient bar in pixels.
     */
    height?: number;
    /**
     * Corner radius of the gradient bar in pixels.
     */
    borderRadius?: number;
    /**
     * Font size of the tick labels in pixels.
     */
    labelSize?: number;
    /**
     * Color of the tick labels.
     */
    labelColor?: string;
    /**
     * Show a value indicator that follows the hovered cell.
     */
    showIndicator?: boolean;
    /**
     * Color of the hover indicator.
     */
    indicatorColor?: string;
    /**
     * Space reserved for the color legend in the chart layout, in pixels.
     */
    reservedSize?: number;
}

/* -------------------------------------------------------------------------------------------------
 * Tooltip and hover
 * ---------------------------------------------------------------------------------------------- */

/**
 * Fine-grained control over the crosshair drawn at the hovered position.
 * @group Interface
 */
export interface CrosshairConfig {
    /**
     * Show the vertical reference line, at the x position.
     */
    x?: boolean;
    /**
     * Show the horizontal reference line, at the y position.
     */
    y?: boolean;
    /**
     * Dash pattern, as `[dashLength, gapLength]`.
     */
    dashArray?: number[];
    /**
     * Crosshair line color.
     */
    color?: string;
    /**
     * Crosshair line width in pixels.
     */
    width?: number;
}

/**
 * Inputs of `ChartTooltip`.
 * @group Interface
 */
export interface ChartTooltipProps {
    /**
     * `'item'` shows the specific hovered element; `'shared'` shows every series at the snapped
     * anchor.
     */
    mode?: 'item' | 'shared';
    /**
     * Point selection strategy. Left unset, each chart type picks its natural default: `xy` for
     * scatter, `x` for line and area, `category` for bar and column. A heatmap snaps to the cell
     * whose band holds the cursor unless this is `'none'`.
     */
    snap?: 'x' | 'y' | 'xy' | 'category' | 'none';
    /**
     * Show a reference line or band at the hovered position. `true` takes the defaults.
     */
    crosshair?: boolean | CrosshairConfig;
    /**
     * Tooltip placement relative to the chart.
     */
    position?: 'cursor' | 'top' | 'bottom' | 'left' | 'right';
    /**
     * Horizontal offset in pixels, applied after `position`.
     */
    offsetX?: number;
    /**
     * Vertical offset in pixels, applied after `position`.
     */
    offsetY?: number;
    /**
     * Track the cursor while `position` is `'cursor'`.
     */
    followCursor?: boolean;
    /**
     * Milliseconds to wait before showing. Raise it to hold the tooltip back while the cursor
     * sweeps across dense hit targets.
     */
    showDelay?: number;
    /**
     * Milliseconds the tooltip lingers after the cursor leaves a point. The crosshair and the
     * color-legend indicator linger with it, so the three never disagree.
     */
    hideDelay?: number;
    /**
     * Custom tooltip renderer, which replaces the default layout outright.
     */
    render?: (context: TooltipRenderContext) => unknown;
    /**
     * Formats the value. A string reformats the single value; an array of rows renders a custom
     * multi-row body inside the default card. Ignored when `render` is supplied.
     */
    valueFormatter?: TooltipValueFormatter;
}

/**
 * Context handed to the `ChartHover` click handler.
 * @group Interface
 */
export interface HoverClickContext {
    /**
     * The series identifier.
     */
    datasetId: string;
    /**
     * Data index of the clicked element.
     */
    index: number;
    /**
     * Category or slice label.
     */
    label: string;
    /**
     * Data value.
     */
    value: number;
    /**
     * Resolved element color.
     */
    color: string;
}

/**
 * Inputs of `ChartHover`, the shared hover treatment. Dimming is opt-in: by default the hovered
 * mark brightens and the rest are left alone.
 * @group Interface
 */
export interface ChartHoverProps {
    /**
     * Brightness multiplier on the hovered item, where 1 is no change. Ignored once
     * `backgroundColor` is set.
     */
    brightness?: number;
    /**
     * Opacity of the non-hovered items while something is hovered, from 0 to 1. At 1 nothing fades.
     */
    dimOpacity?: number;
    /**
     * Pop-out distance in pixels: it slides pie slices out of the center and lifts bars upward.
     */
    offset?: number;
    /**
     * Scale multiplier on the hovered item.
     */
    scale?: number;
    /**
     * Marker radius multiplier on hover, for line, scatter and radar points. A per-series
     * `hoverPointRadius`, being absolute pixels, overrides it.
     */
    radiusMultiplier?: number;
    /**
     * Override fill color on hover, replacing the item's color rather than adjusting brightness.
     */
    backgroundColor?: string;
    /**
     * Border stroke color on hover.
     */
    borderColor?: string;
    /**
     * Border stroke width on hover.
     */
    borderStrokeWidth?: number;
    /**
     * Border dash pattern on hover.
     */
    borderDash?: number[];
    /**
     * Offset into the border dash pattern.
     */
    borderDashOffset?: number;
    /**
     * Click handler for the data elements. Left unset, a click does nothing; use the legend to
     * toggle visibility.
     */
    onClick?: (context: HoverClickContext) => void;
}

/* -------------------------------------------------------------------------------------------------
 * Data labels
 * ---------------------------------------------------------------------------------------------- */

/**
 * Inputs of `ChartDataLabels`. `fontSize` and `color` are layout-aware accessors: a per-label size
 * is honoured during collision detection, not applied after the fact. On a combo chart, branch on
 * `seriesId` inside the callback to vary the styling per series.
 * @group Interface
 */
export interface ChartDataLabelsProps<T = unknown> {
    /**
     * What to put in each label.
     */
    display?: 'value' | 'percentage' | 'both' | 'none' | 'label' | 'label-percentage';
    /**
     * Custom label text, which overrides `display`. It receives the value, the percentage from 0 to
     * 100, the category label and the row datum.
     */
    formatter?: (value: number, percentage?: number, label?: string, datum?: T) => string;
    /**
     * Label font size in pixels.
     */
    fontSize?: FieldAccessor<T, number>;
    /**
     * Label font family.
     */
    fontFamily?: string;
    /**
     * Label font weight.
     */
    fontWeight?: FontWeight;
    /**
     * Label text color. Defaults to an automatically contrasting color.
     */
    color?: FieldAccessor<T, FillValue>;
    /**
     * Line height multiplier.
     */
    lineHeight?: number;
    /**
     * Custom label renderer, which replaces the default layout outright.
     */
    render?: (context: DataLabelContext<T>) => unknown;
    /**
     * Hide the labels on slices or segments below this percentage. Pie, donut, polar and radar.
     */
    minPercentage?: number;
    /**
     * Leader line style for the outside labels.
     */
    lineStyle?: 'angled' | 'straight' | 'none';
    /**
     * Outside label alignment: `'labelLine'` puts the label at the line's end, `'edge'` aligns it
     * flush to the chart boundary.
     */
    alignTo?: 'labelLine' | 'edge';
    /**
     * Gap between the slice edge and the start of the leader line. Also accepted as `leaderOffset`.
     */
    distance?: number;
    /**
     * Gap between the end of the leader line and the label text. Also accepted as `textOffset`.
     */
    textGap?: number;
    /**
     * Horizontal distance from the leader line's elbow to the text anchor.
     */
    horizontalOffset?: number;
    /**
     * Outside-label connector stroke color.
     */
    connectorColor?: FieldAccessor<T, FillValue>;
    /**
     * Outside-label connector stroke width in pixels.
     */
    connectorWidth?: FieldAccessor<T, number>;
}

/* -------------------------------------------------------------------------------------------------
 * Annotations and references
 * ---------------------------------------------------------------------------------------------- */

/**
 * Inputs of `ChartAnnotation`. There are no positioning inputs: an annotation is drawn by its own
 * template or render function, which is handed the scales it needs.
 * @group Interface
 */
export interface ChartAnnotationProps {
    /**
     * Canvas renderer function: draw to `ctx` and return `null`. Under SVG the same function may
     * instead return an `SvgNode`.
     */
    render?: (context: AnnotationContext) => unknown;
}

/**
 * Z-order of a reference mark relative to the data series.
 * @group Types
 */
export type ReferencePlacement = 'beforeData' | 'afterData';

/**
 * Inputs of `ChartReferenceLine`, which marks a threshold on either axis.
 * @group Interface
 */
export interface ChartReferenceLineProps {
    /**
     * Horizontal position: a category string, a timestamp or a numeric value. It draws a vertical
     * line at this x position.
     */
    x?: string | number;
    /**
     * Vertical position: a numeric value on a value axis, or a category string on a band axis. It
     * draws a horizontal line at this y value.
     */
    y?: string | number;
    /**
     * Y axis to position `y` against. Only needed on a multi-axis chart.
     */
    yAxisId?: string;
    /**
     * Label text displayed alongside the line.
     */
    label?: string;
    /**
     * Placement of the label along the line.
     */
    labelPosition?: Alignment;
    /**
     * Label text color. It follows the stroke color when that is set explicitly, and the theme text
     * color otherwise.
     */
    labelColor?: string;
    /**
     * Label font size in pixels.
     */
    labelFontSize?: number;
    /**
     * Label font weight.
     */
    labelFontWeight?: FontWeight;
    /**
     * Background fill behind the label, which renders a rounded pill once set.
     */
    labelBackground?: string;
    /**
     * Opacity of the label background fill, from 0 to 1.
     */
    labelBackgroundOpacity?: number;
    /**
     * Padding in pixels between the label text and the background edges.
     */
    labelPadding?: number;
    /**
     * Corner radius of the label background pill.
     */
    labelBorderRadius?: number;
    /**
     * Line color.
     */
    stroke?: string;
    /**
     * Line stroke width in pixels.
     */
    lineStrokeWidth?: number;
    /**
     * Dash pattern, such as `[6, 4]` for 6px dashes with 4px gaps.
     */
    lineDash?: number[];
    /**
     * Z-order relative to the data series.
     */
    placement?: ReferencePlacement;
    /**
     * Custom line renderer, which replaces the default line outright.
     */
    render?: (context: AnnotationContext) => unknown;
}

/**
 * Band fill, either a color or a color with its own opacity.
 * @group Types
 */
export type BandFill = string | { color: string; opacity?: number };

/**
 * Inputs of `ChartReferenceBand`, which marks a range on either axis.
 * @group Interface
 */
export interface ChartReferenceBandProps {
    /**
     * Band start on the x axis: a category string, a timestamp or a numeric value.
     */
    x1?: string | number;
    /**
     * Band end on the x axis.
     */
    x2?: string | number;
    /**
     * Band start on the y axis: a numeric value on a value axis, or a category string on a band
     * axis.
     */
    y1?: string | number;
    /**
     * Band end on the y axis.
     */
    y2?: string | number;
    /**
     * Y axis to position `y1` and `y2` against. Only needed on a multi-axis chart.
     */
    yAxisId?: string;
    /**
     * Label text displayed inside the band.
     */
    label?: string;
    /**
     * Placement of the label along the band.
     */
    labelPosition?: Alignment;
    /**
     * Label text color.
     */
    labelColor?: string;
    /**
     * Label font size in pixels.
     */
    labelFontSize?: number;
    /**
     * Label font weight.
     */
    labelFontWeight?: FontWeight;
    /**
     * Band fill color. A string pairs with `fillOpacity`; an object carries its own opacity.
     */
    fill?: BandFill;
    /**
     * Band fill opacity, from 0 to 1.
     */
    fillOpacity?: number;
    /**
     * Border stroke color drawn around the band rectangle.
     */
    stroke?: string;
    /**
     * Z-order relative to the data series.
     */
    placement?: ReferencePlacement;
}

/* -------------------------------------------------------------------------------------------------
 * Zoom, pan and navigator
 * ---------------------------------------------------------------------------------------------- */

/**
 * Wheel zoom configuration.
 * @group Interface
 */
export interface ZoomWheelConfig {
    /**
     * Enable wheel zoom.
     */
    enabled?: boolean;
    /**
     * Zoom speed per scroll tick. Higher is faster.
     */
    speed?: number;
    /**
     * Require this key to be held for wheel zoom.
     */
    modifierKey?: ModifierKey;
}

/**
 * Drag-to-zoom configuration.
 * @group Interface
 */
export interface ZoomDragConfig {
    /**
     * Enable drag-to-zoom.
     */
    enabled?: boolean;
    /**
     * Require this key to be held for drag zoom.
     */
    modifierKey?: ModifierKey;
}

/**
 * Drag-to-pan configuration.
 * @group Interface
 */
export interface ZoomPanConfig {
    /**
     * Enable panning.
     */
    enabled?: boolean;
    /**
     * Modifier key to hold while dragging to pan.
     */
    modifierKey?: ModifierKey;
}

/**
 * Pinch-to-zoom configuration.
 * @group Interface
 */
export interface ZoomPinchConfig {
    /**
     * Enable touch pinch-to-zoom.
     */
    enabled?: boolean;
}

/**
 * Zoom and pan button cluster configuration.
 * @group Interface
 */
export interface ZoomButtonsConfig {
    /**
     * Zoom step per press. It is proportional, so the number of presses does not depend on how long
     * the series is.
     */
    factor?: number;
    /**
     * Pan step per press, as a fraction of the visible window.
     */
    panStride?: number;
    /**
     * Extra CSS class applied to every button in the cluster.
     */
    className?: string;
}

/**
 * Per-axis zoom limits.
 * @group Interface
 */
export interface ZoomLimits {
    /**
     * Minimum allowed domain start. `'original'` pins the boundary to the initial data domain, so
     * the user cannot pan before the first data point.
     */
    min?: number | 'original';
    /**
     * Maximum allowed domain end. `'original'` pins the boundary to the initial data domain.
     */
    max?: number | 'original';
    /**
     * Minimum visible window size, which is what stops an over-zoom. Left unset it is computed as
     * five times the smallest data interval, so the user cannot zoom into the empty space between
     * points.
     */
    minRange?: number;
}

/**
 * Current zoom window per axis. `null` on an axis means it is not zoomed.
 * @group Interface
 */
/**
 * The visible window on one axis.
 *
 * Named on its own because a caller usually handles one axis at a time -- a handler that reacts to
 * a time range has no use for a `{ x, y }` wrapper it then has to unwrap.
 * @group Interface
 */
export interface ZoomAxisWindow {
    min: number;
    max: number;
}

export interface ZoomState {
    x: { min: number; max: number } | null;
    y: { min: number; max: number } | null;
}

/**
 * Imperative zoom handle, reached through `zoomRef.current`.
 * @group Interface
 */
export interface ZoomHandle {
    /**
     * Jump to a specific zoom range. Pass `{ x: null, y: null }` to reset.
     */
    setZoomState: (state: ZoomState) => void;
    /**
     * Reset to the original unzoomed view.
     */
    resetZoom: () => void;
    /**
     * Read the current zoom state. Always current, never stale.
     */
    getZoomState: () => ZoomState;
}

/**
 * Inputs of `ChartZoom`.
 * @group Interface
 */
export interface ChartZoomProps {
    /**
     * Which axes to zoom.
     */
    mode?: ZoomMode;
    /**
     * Mouse wheel zoom.
     */
    wheel?: boolean | ZoomWheelConfig;
    /**
     * Drag-to-select zoom.
     */
    drag?: boolean | ZoomDragConfig;
    /**
     * Drag-to-pan.
     */
    pan?: boolean | ZoomPanConfig;
    /**
     * Touch pinch-to-zoom.
     */
    pinch?: boolean | ZoomPinchConfig;
    /**
     * Per-axis zoom limits.
     */
    limits?: { x?: ZoomLimits; y?: ZoomLimits };
    /**
     * Fires when the zoom range changes.
     */
    onZoomChange?: (state: ZoomState) => void;
    /**
     * Holder object that receives the imperative zoom handle.
     */
    zoomRef?: { current: ZoomHandle | null };
    /**
     * Reset button shown once the chart is zoomed. An object customizes the label and the class.
     */
    resetButton?: boolean | { text?: string; className?: string };
    /**
     * Zoom and pan buttons rendered beside the reset button. `true` renders the cluster.
     */
    zoomButtons?: boolean | ZoomButtonsConfig;
}

/**
 * Inputs of `ChartNavigator`, which pairs the main chart with a context strip and a draggable
 * window.
 * @group Interface
 */
export interface ChartNavigatorProps {
    /**
     * Dataset id, or ids, to show in the mini chart. The first drives the x axis and the rest render
     * as extra lines. Defaults to the first registered series.
     */
    series?: string | string[];
    /**
     * Height of the navigator area in pixels.
     */
    height?: number;
    /**
     * Gap between the main chart and the navigator in pixels.
     */
    gap?: number;
    /**
     * Fill color for the mini area chart's line and area.
     */
    color?: string;
    /**
     * Fill opacity for the area under the line, from 0 to 1.
     */
    opacity?: number;
    /**
     * Border color of the selection window.
     */
    selectionColor?: string;
    /**
     * Fill color of the selection window's interior.
     */
    selectionFill?: string;
    /**
     * Color of the dimmed regions outside the selection window.
     */
    maskColor?: string;
    /**
     * Background color of the navigator area.
     */
    backgroundColor?: string;
    /**
     * Grid line color.
     */
    gridColor?: string;
    /**
     * Time tick label color.
     */
    labelColor?: string;
    /**
     * Width of the drag handles on the selection window's edges, in pixels.
     */
    handleWidth?: number;
    /**
     * Spacing between the grip lines drawn on each handle, in pixels.
     */
    gripLineGap?: number;
    /**
     * Inner padding around the navigator's chart area. A number applies uniformly.
     */
    padding?: number | Partial<Padding>;
    /**
     * Animate the x-domain transitions as new data arrives. `true` uses a 200ms `easeOutCubic`
     * transition; `false` repaints instantly.
     */
    animation?: boolean | { duration?: number; easing?: EasingFunctionName };
    /**
     * Show or hide the navigator.
     */
    enabled?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Export
 * ---------------------------------------------------------------------------------------------- */

/**
 * Export button positioning.
 * @group Interface
 */
export interface ExportMenuButtonOptions {
    /**
     * Horizontal button placement. It flips to `'left'` in an RTL layout.
     */
    align?: 'left' | 'right';
    /**
     * Vertical button placement.
     */
    verticalAlign?: 'top' | 'bottom';
    /**
     * Horizontal offset in pixels from the aligned edge.
     */
    x?: number;
    /**
     * Vertical offset in pixels from the aligned edge.
     */
    y?: number;
}

/**
 * Inputs of `ChartExportMenu`. Every format works under both renderers.
 * @group Interface
 */
export interface ChartExportMenuProps {
    /**
     * Show or hide the export menu button.
     */
    enabled?: boolean;
    /**
     * Default filename for the downloads. The extension is appended for you.
     */
    filename?: string;
    /**
     * Menu items to display.
     */
    menuItems?: (ExportMenuItem | 'downloadCSV')[];
    /**
     * Pixel density multiplier for the raster exports, where 2 is retina quality.
     */
    scale?: number;
    /**
     * Export background color. `'auto'` matches the current chart background.
     */
    backgroundColor?: string | 'auto' | 'transparent';
    /**
     * Export button positioning.
     */
    buttons?: ExportMenuButtonOptions;
    /**
     * Additional CSS class applied to the export button element.
     */
    buttonClass?: string;
    /**
     * Additional CSS class applied to the dropdown menu container.
     */
    menuClass?: string;
}

/* -------------------------------------------------------------------------------------------------
 * Accessibility
 * ---------------------------------------------------------------------------------------------- */

/**
 * Built-in texture patterns, for colorblind-safe encoding.
 * @group Types
 */
export type PatternName = 'dots' | 'lines-horizontal' | 'lines-vertical' | 'diagonal' | 'diagonal-reverse' | 'grid' | 'crosshatch' | 'zigzag';

/**
 * A texture fill, assignable anywhere a solid color is accepted, including a per-item color
 * accessor.
 * @group Interface
 */
export interface PatternFill {
    /**
     * Built-in pattern to use.
     */
    pattern: PatternName;
    /**
     * Solid fill color of the shape.
     */
    color?: string;
    /**
     * Texture color. Left transparent, the texture is knocked out as grooves; set it for a two-tone
     * pattern.
     */
    backgroundColor?: string;
    /**
     * Tile size in pixels.
     */
    size?: number;
    /**
     * Texture line weight in pixels.
     */
    strokeWidth?: number;
}

/**
 * Focus ring drawn around the keyboard-focused element.
 * @group Interface
 */
export interface FocusBorderConfig {
    /**
     * Show a focus ring.
     */
    enabled?: boolean;
    /**
     * Hide the browser's native focus outline.
     */
    hideBrowserFocusOutline?: boolean;
    /**
     * Padding around the focused element in pixels.
     */
    margin?: number;
    /**
     * Focus ring appearance.
     */
    style?: {
        color?: string;
        width?: number;
        lineStyle?: StrokeStyle;
        borderRadius?: number;
    };
}

/**
 * How keyboard focus moves between series and points.
 * @group Interface
 */
export interface SeriesNavigationConfig {
    /**
     * `'normal'` navigates within one series at a time; `'serialize'` walks every point as one flat
     * list across all series.
     */
    mode?: 'normal' | 'serialize';
    /**
     * Turn off per-point navigation once a series passes this point count.
     */
    pointNavigationEnabledThreshold?: number;
    /**
     * Remember the last focused point index when switching between series.
     */
    rememberPointFocus?: boolean;
    /**
     * Skip null or empty points while navigating.
     */
    skipNullPoints?: boolean;
}

/**
 * Keyboard navigation configuration.
 * @group Interface
 */
export interface KeyboardNavigationConfig {
    /**
     * Enable keyboard navigation between data points.
     */
    enabled?: boolean;
    /**
     * Cycle from the last element back to the first when navigating past the end.
     */
    wrapAround?: boolean;
    /**
     * Focus ring configuration.
     */
    focusBorder?: FocusBorderConfig;
    /**
     * Series navigation configuration.
     */
    seriesNavigation?: SeriesNavigationConfig;
}

/**
 * Inputs of `ChartAccessibility`. Canvas has no element tree for a screen reader to walk, so this
 * is what gives a Canvas chart keyboard navigation and ARIA.
 * @group Interface
 */
export interface ChartAccessibilityProps {
    /**
     * Enable or disable every accessibility feature.
     */
    enabled?: boolean;
    /**
     * Apply colorblind-safe encodings: cycled texture patterns on the filled marks, distinct dashes
     * on the lines, and a colorblind-safe scale on a heatmap.
     */
    patterns?: boolean;
    /**
     * Custom chart description for screen readers. Generated when unset.
     */
    description?: string;
    /**
     * Override the chart type label, such as `'Grouped bar chart'`.
     */
    typeDescription?: string;
    /**
     * Heading level for the screen reader info section.
     */
    headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    /**
     * Drop the per-point `aria-label`s once a series passes this point count.
     */
    pointDescriptionThreshold?: number;
    /**
     * Maximum rows rendered in the visually hidden data table before a truncation summary takes
     * over.
     */
    dataTableMaxRows?: number;
    /**
     * Format each cell of the screen reader data table. The CSV export uses the same formatter, so
     * the two never disagree.
     */
    dataTableCellFormatter?: (context: DataTableCellContext) => string;
    /**
     * Custom point description formatter.
     */
    pointDescriptionFormatter?: (context: PointDescriptionContext) => string;
    /**
     * Custom series description formatter.
     */
    seriesDescriptionFormatter?: (context: SeriesDescriptionContext) => string;
    /**
     * ARIA landmark verbosity: `'all'` adds per-series landmarks, `'chart'` only a chart-level one,
     * `'disabled'` none.
     */
    landmarkVerbosity?: 'all' | 'chart' | 'disabled';
    /**
     * Keyboard navigation configuration.
     */
    keyboardNavigation?: KeyboardNavigationConfig;
}

/* -------------------------------------------------------------------------------------------------
 * Responsive
 * ---------------------------------------------------------------------------------------------- */

/**
 * Container width thresholds, in pixels, for the auto-adaptive tier system. Override any subset;
 * the rest keep their defaults.
 * @group Interface
 */
export interface ResponsiveBreakpoints {
    /**
     * Below this width the chart is in the `xs` tier.
     */
    xs: number;
    /**
     * Below this width the chart is in the `sm` tier.
     */
    sm: number;
    /**
     * Below this width the chart is in the `md` tier; at or above it, `lg`.
     */
    md: number;
}

/**
 * One condition-based override. Every condition is optional and they are ANDed together, so a rule
 * applies only when all of the ones it names are met. Where several rules match, all are applied
 * and the last one wins a key conflict.
 * @group Interface
 */
export interface ResponsiveRule {
    /**
     * Apply when the container width is at or below this value.
     */
    maxWidth?: number;
    /**
     * Apply when the container width is at or above this value.
     */
    minWidth?: number;
    /**
     * Apply when the container height is at or below this value.
     */
    maxHeight?: number;
    /**
     * Apply when the container height is at or above this value.
     */
    minHeight?: number;
    /**
     * Per-feature overrides. The keys are feature names such as `'legend'` or `'title'`, and the
     * values are that feature's inputs. Only a documented subset is wired; other keys are accepted
     * without error but do nothing.
     */
    props?: Record<string, Record<string, unknown>>;
}

/**
 * Inputs of `ChartResponsive`.
 * @group Interface
 */
export interface ChartResponsiveProps {
    /**
     * Condition-based overrides, evaluated against the chart container's dimensions.
     */
    rules?: ResponsiveRule[];
    /**
     * Override the tier thresholds used by the auto-adaptive system.
     */
    breakpoints?: Partial<ResponsiveBreakpoints>;
    /**
     * Disable the font and layout scaling, locking the chart to the `lg` tier defaults.
     */
    disableAutoAdaptive?: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Decimation and animation
 * ---------------------------------------------------------------------------------------------- */

/**
 * Inputs of `ChartDecimation`, which applies to `ChartLine`, `ChartBar` and `ChartScatter` and does
 * nothing on the other types. Bar and line series share a category index and are decimated
 * together; scatter takes its own 2D path.
 * @group Interface
 */
export interface ChartDecimationProps {
    /**
     * Visual-summary strategy. An ordered series wants `'lttb'` or `'min-max'`; scatter takes the
     * k-means centroid path.
     */
    algorithm?: DecimationAlgorithm;
    /**
     * Target output size. `'min-max'` can emit up to twice this count, because it keeps both
     * extremes of every bucket.
     */
    samples?: number;
    /**
     * Only decimate once the dataset passes this point count. Below it the full dataset renders.
     */
    threshold?: number;
}

/**
 * A single animation specification.
 * @group Interface
 */
export interface AnimationSpec {
    /**
     * Duration in milliseconds.
     */
    duration?: number;
    /**
     * Easing curve: a preset name, a registered name, or a function.
     */
    easing?: EasingFunctionName | ((t: number) => number);
    /**
     * Delay in milliseconds before the animation begins.
     */
    delay?: number;
    /**
     * Repeat indefinitely.
     */
    loop?: boolean;
    /**
     * Auto-disable animation once the total point count passes this. Set it to `Infinity` to always
     * animate.
     */
    limit?: number;
}

/**
 * One named animation entry, which drives specific renderer inputs.
 * @group Interface
 */
export interface NamedAnimationSpec {
    /**
     * Renderer input names this entry animates.
     */
    properties: string[];
    /**
     * Interpolation strategy. Inferred from the property when unset.
     */
    type?: 'number' | 'color';
    /**
     * Start value.
     */
    from?: number | string;
    /**
     * End value.
     */
    to?: number | string;
    /**
     * Duration in milliseconds. Inherits from the root spec when unset.
     */
    duration?: number;
    /**
     * Easing curve. Inherits from the root spec when unset.
     */
    easing?: EasingFunctionName | ((t: number) => number);
    /**
     * Delay before the entry starts.
     */
    delay?: number;
    /**
     * Repeat the entry indefinitely.
     */
    loop?: boolean;
    /**
     * Ping-pong the direction on each cycle. Only meaningful with `loop`.
     */
    alternate?: boolean;
}

/**
 * State-change transitions, each with its own timing.
 * @group Interface
 */
export interface AnimationTransitions {
    /**
     * Hover on and off.
     */
    active?: { animation: AnimationSpec };
    /**
     * A dataset becoming visible.
     */
    show?: { animation: AnimationSpec; animations?: Record<string, NamedAnimationSpec> };
    /**
     * A dataset becoming hidden.
     */
    hide?: { animation: AnimationSpec; animations?: Record<string, NamedAnimationSpec> };
    /**
     * A container resize.
     */
    resize?: { animation: AnimationSpec };
}

/* -------------------------------------------------------------------------------------------------
 * Sync and breadcrumb
 * ---------------------------------------------------------------------------------------------- */

/**
 * Fine-grained sync control for a chart inside a `ChartGroup`.
 * @group Interface
 */
export interface SyncConfig {
    /**
     * Sync the zoom and pan ranges. `'x'` syncs only the category or time axis.
     */
    extremes?: boolean | 'x' | 'y' | 'xy';
    /**
     * Sync the crosshair and hover position across the charts.
     */
    highlight?: boolean | 'x' | 'y' | 'xy';
    /**
     * Sync the series visibility, so a legend toggle reaches every chart.
     */
    visibility?: boolean;
}

/**
 * Zoom or pan event received over the sync bus.
 * @group Interface
 */
export interface SyncExtremesEvent {
    /**
     * Chart the event came from.
     */
    sourceId: string;
    /**
     * The new window per axis.
     */
    state: ZoomState;
}

/**
 * Cursor event received over the sync bus.
 * @group Interface
 */
export interface SyncHighlightEvent {
    /**
     * Chart the event came from.
     */
    sourceId: string;
    /**
     * Category under the cursor, where the charts share a category axis.
     */
    category?: string;
    /**
     * Data value under the cursor on a continuous axis.
     */
    value?: number;
    /**
     * `null` when the cursor left the source chart.
     */
    cleared?: boolean;
}

/**
 * Series visibility event received over the sync bus.
 * @group Interface
 */
export interface SyncVisibilityEvent {
    /**
     * Chart the event came from.
     */
    sourceId: string;
    /**
     * Dataset whose visibility changed.
     */
    datasetId: string;
    /**
     * The dataset's new visibility.
     */
    visible: boolean;
}

/**
 * Callback invoked when an extremes event is received.
 * @group Types
 */
export type SyncExtremesCallback = (event: SyncExtremesEvent) => void;

/**
 * Callback invoked when a highlight event is received.
 * @group Types
 */
export type SyncHighlightCallback = (event: SyncHighlightEvent) => void;

/**
 * Callback invoked when a visibility event is received.
 * @group Types
 */
export type SyncVisibilityCallback = (event: SyncVisibilityEvent) => void;

/**
 * Inputs of `ChartBreadcrumb`, the drilldown trail that sits alongside a treemap.
 * @group Interface
 */
export interface ChartBreadcrumbProps {
    /**
     * Text separator rendered between the breadcrumb items.
     */
    separator?: string;
}

/**
 * Maps each feature to its props, so a feature registers into context under the right shape.
 * @group Interface
 */
export interface FeaturePropsMap {
    legend: ChartLegendProps;
    colorLegend: ChartColorLegendProps;
    tooltip: ChartTooltipProps;
    hover: ChartHoverProps;
    title: ChartTitleProps;
    caption: ChartCaptionProps;
    dataLabels: ChartDataLabelsProps;
    annotation: ChartAnnotationProps;
    referenceLine: ChartReferenceLineProps;
    referenceBand: ChartReferenceBandProps;
    zoom: ChartZoomProps;
    navigator: ChartNavigatorProps;
    exportMenu: ChartExportMenuProps;
    accessibility: ChartAccessibilityProps;
    responsive: ChartResponsiveProps;
    decimation: ChartDecimationProps;
    breadcrumb: ChartBreadcrumbProps;
    axisGroup: ChartAxisGroupProps;
}

/**
 * Union of every feature props type.
 * @group Types
 */
export type AnyFeatureProps = FeaturePropsMap[keyof FeaturePropsMap];

/**
 * Maps each axis identifier to its props type.
 * @group Interface
 */
export interface AxisPropsMap {
    x: ChartXAxisProps;
    y: ChartYAxisProps;
}
