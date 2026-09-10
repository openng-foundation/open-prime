/**
 *
 * Render contexts. Every replaceable surface — a marker, a tick, a legend row, a tooltip body, an
 * annotation — is handed one of these. The shape is the same under both renderers; the Canvas-only
 * fields are simply absent under SVG.
 *
 * @module charts
 *
 */
import type { AxisPosition, BoxArea, CanvasPainter, ColorValue, GradientColor, ResponsiveTier, ScaleFunction, TickValue } from './charts.types';

/**
 * The responsive tier a render context is being called at, and the picker that goes with it.
 *
 * A custom surface has to scale with the chart the same way the chart's own text does, and it has
 * no other way to know how small the container currently is. `pick` falls back down the tiers, so
 * `{ xs: 9, md: 13 }` gives `9` at `sm` rather than nothing at all -- an omitted tier means "keep
 * what the smaller one said", which is what makes a two-entry map usable.
 * @group Interface
 */
export interface ResponsiveContext {
    /**
     * Tier the container currently falls into.
     */
    tier: ResponsiveTier;
    /**
     * Picks the value for the current tier, falling back to the nearest smaller one that was given.
     */
    pick: <T>(values: Partial<Record<ResponsiveTier, T>>) => T;
}

/**
 * Draws an image from a URL at a position relative to the current origin, handling loading and
 * caching. Canvas mode only.
 * @group Types
 */
export type DrawImageFn = (url: string, x: number, y: number, width: number, height: number) => void;

/**
 * Registers a continuous animation for a Canvas-painted surface, returning the current value.
 * @group Types
 */
export type OverlayAnimateFn = (config: OverlayAnimateConfig) => number;

/**
 * One continuous overlay animation.
 * @group Interface
 */
export interface OverlayAnimateConfig {
    /**
     * Stable key so repeated frames drive the same animation rather than restarting it.
     */
    key: string;
    /**
     * Value the animation starts from.
     */
    from: number;
    /**
     * Value the animation runs to.
     */
    to: number;
    /**
     * Duration in milliseconds.
     */
    duration: number;
    /**
     * Easing preset name, or a function.
     */
    easing?: string | ((t: number) => number);
    /**
     * Repeat indefinitely.
     */
    loop?: boolean;
    /**
     * Reverse direction on each cycle. Only meaningful with `loop`.
     */
    alternate?: boolean;
}

/**
 * Factory producing an animate function scoped to one series item.
 * @group Types
 */
export type CreateAnimateFn = (seriesId: string, itemIndex: number) => OverlayAnimateFn;

/**
 * Fields every Canvas-capable render context carries. Under SVG they are all absent, which is what
 * tells a shared callback which renderer it is running in.
 * @group Interface
 */
export interface CanvasRenderCapabilities {
    /**
     * Canvas 2D context. Present in Canvas mode only.
     */
    ctx?: CanvasRenderingContext2D;
    /**
     * Draws a URL-sourced image. Canvas mode only.
     */
    drawImage?: DrawImageFn;
    /**
     * Registers a continuous animation. Canvas mode only.
     */
    animate?: OverlayAnimateFn;
}

/**
 * Context passed to `renderMarker` for each data point of a line, area, scatter or radar series.
 * @group Interface
 */
export interface PointRenderContext<T = unknown> extends CanvasRenderCapabilities {
    /**
     * Pixel x coordinate of the point.
     */
    x: number;
    /**
     * Pixel y coordinate of the point.
     */
    y: number;
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * Raw data value.
     */
    value: number | null;
    /**
     * Category label.
     */
    category: string;
    /**
     * Original data item.
     */
    data: T;
    /**
     * Resolved series color.
     */
    color: string;
    /**
     * Current marker radius in pixels. Larger while hovered.
     */
    size: number;
    /**
     * Whether this point is currently hovered.
     */
    isHovered: boolean;
    /**
     * Opacity computed from the hover dim effect, from 0 to 1. Apply it so the custom marker
     * respects `dimOpacity` like the built-in one does.
     */
    opacity: number;
}

/**
 * Context passed to the `render` callback for each tick label of an axis.
 * @group Interface
 */
export interface AxisTickRenderContext extends CanvasRenderCapabilities {
    /**
     * The raw tick value.
     */
    value: TickValue;
    /**
     * Formatted label text, from `tickFormat` or the automatic formatter.
     */
    label: string;
    /**
     * Zero-based tick index.
     */
    index: number;
    /**
     * Edge the axis sits on.
     */
    position: AxisPosition;
    /**
     * Pixel x coordinate of the tick.
     */
    x: number;
    /**
     * Pixel y coordinate of the tick.
     */
    y: number;
}

/**
 * Alias for {@link AxisTickRenderContext}, used by `renderTick`. Same shape, kept as its own name
 * for clarity at the call site.
 * @group Types
 */
export type AxisTickMarkRenderContext = AxisTickRenderContext;

/**
 * Context passed to the `render` callback on each axis group header.
 * @group Interface
 */
export interface AxisGroupRenderContext {
    /**
     * Group label text.
     */
    label: string;
    /**
     * Pixel x coordinate of the label center.
     */
    x: number;
    /**
     * Pixel y coordinate of the label center.
     */
    y: number;
    /**
     * Category values in this group.
     */
    categories: string[];
    /**
     * Nesting depth: 0 is the outermost parent, higher is closer to the axis.
     */
    depth: number;
    /**
     * Canvas context, pre-translated to `(x, y)` so drawing happens at the origin. Canvas only.
     */
    ctx?: CanvasRenderingContext2D;
}

/**
 * Context passed to the annotation `render` callback. The shape is the same across every chart
 * type; fields that do not apply to a given type are `null` rather than missing.
 * @group Interface
 */
export interface AnnotationContext extends CanvasRenderCapabilities {
    /**
     * Total chart width in pixels.
     */
    width: number;
    /**
     * Total chart height in pixels.
     */
    height: number;
    /**
     * Bounding rectangle of the plot area, in pixels.
     */
    chartArea: BoxArea;
    /**
     * Center point in pixels: the circle center on radial charts, the plot-area midpoint otherwise.
     */
    center: { x: number; y: number };
    /**
     * Converts an x data value to a pixel x coordinate. `null` on radial and treemap charts.
     */
    xScale: ScaleFunction | null;
    /**
     * Converts a y data value to a pixel y coordinate. `null` on radial and treemap charts.
     */
    yScale: ScaleFunction | null;
    /**
     * Looks up any axis scale by its registered id, for multi-axis charts. `null` on radial and
     * treemap charts.
     */
    getScale: ((axisId: string) => ScaleFunction | undefined) | null;
    /**
     * Chart font family, so annotation text can match the chart.
     */
    fontFamily: string;
    /**
     * Theme-aware text color matching the chart's default label color.
     */
    textColor: string;
    /**
     * Whether a specific data point is currently visible, rather than filtered out by the legend.
     */
    isItemVisible: (datasetId: string, index: number) => boolean;
    /**
     * Whether a dataset is currently visible.
     */
    isDatasetVisible: (datasetId: string) => boolean;
    /**
     * The currently hovered data point, or `null` when nothing is hovered.
     */
    hoveredItem: { datasetId: string; index: number } | null;
    /**
     * The tier the chart is at, and the picker for tier-scaled values.
     */
    responsive: ResponsiveContext;
}

/**
 * Context passed to the data-label `render` callback for each label.
 * @group Interface
 */
export interface DataLabelContext<T = unknown> extends CanvasRenderCapabilities {
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * Raw numeric value.
     */
    value: number;
    /**
     * Raw data row. Absent when the source data is not available.
     */
    datum?: T;
    /**
     * Percentage of the total, from 0 to 100.
     */
    percentage: number;
    /**
     * Pre-formatted label text from `formatter` or the `display` mode. Use this rather than
     * re-deriving the text.
     */
    formattedText: string;
    /**
     * Category or slice label.
     */
    label: string;
    /**
     * Resolved label color.
     */
    color: string;
    /**
     * Label x position in pixels.
     */
    x: number;
    /**
     * Label y position in pixels.
     */
    y: number;
    /**
     * Which side of the chart the label sits on. Outside circular labels only.
     */
    side?: 'left' | 'right';
    /**
     * Leader-line geometry in absolute coordinates. Pie and donut outside labels only.
     */
    leaderLine?: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };
    /**
     * Chart center point. Pie and donut only.
     */
    center?: { x: number; y: number };
}

/**
 * Context passed to a legend item template or render function.
 * @group Interface
 */
export interface LegendItemRenderContext {
    /**
     * Whether this entry stands for a full series or a single item such as a pie slice.
     */
    type: 'dataset' | 'item';
    /**
     * The series identifier.
     */
    datasetId: string;
    /**
     * Item index. Populated on per-item entries such as pie slices.
     */
    index?: number;
    /**
     * Display label.
     */
    label: string;
    /**
     * Series or slice color.
     */
    color: string;
    /**
     * Whether this series is currently visible.
     */
    visible: boolean;
    /**
     * Swatch border color. Per-chart mode only.
     */
    borderColor?: string;
    /**
     * Whether the swatch has a border. Per-chart mode only.
     */
    hasBorder?: boolean;
    /**
     * Swatch border radius. Per-chart mode only.
     */
    borderRadius?: number;
    /**
     * Whether this item is currently hovered.
     */
    isHovered: boolean;
    /**
     * Triggers the built-in toggle. Respects `interactive`, so it does nothing when interaction is
     * switched off.
     */
    onClick: () => void;
    /**
     * Puts this item into the hovered state.
     */
    onMouseEnter: () => void;
    /**
     * Clears the hovered state for this item.
     */
    onMouseLeave: () => void;
}

/**
 * Context passed to the legend `onClick` callback.
 * @group Interface
 */
export interface LegendClickContext {
    /**
     * The series identifier.
     */
    datasetId: string;
    /**
     * Slice index. Populated on pie and donut charts.
     */
    index?: number;
    /**
     * Legend item label.
     */
    label: string;
    /**
     * Series type identifier.
     */
    type: string;
}

/**
 * Action a wrapper dispatches in response to a legend item click.
 *
 * - `toggleDataset` — flip dataset visibility; the wrapper must also clear hover, because a
 *   cartesian or radial dataset toggle drops the hovered point
 * - `toggleItems` — flip visibility of the listed data points; the wrapper must not touch hover
 * - `noop` — nothing to change, such as an empty dataset or a missing index
 * @group Types
 */
export type LegendClickAction = { kind: 'toggleDataset'; datasetId: string } | { kind: 'toggleItems'; datasetId: string; indices: number[] } | { kind: 'noop' };

/**
 * One row of a custom tooltip body.
 * @group Interface
 */
export interface TooltipRow {
    /**
     * Row label.
     */
    label: string;
    /**
     * Row value, already formatted or left to the default formatter.
     */
    value: string | number;
    /**
     * Optional swatch color for the row.
     */
    color?: string;
}

/**
 * One open-high-low-close row of a tooltip body.
 * @group Interface
 */
export interface TooltipOhlcRow extends TooltipRow {
    /**
     * Which OHLC field the row reports.
     */
    field: 'open' | 'high' | 'low' | 'close';
}

/**
 * One series entry of a shared tooltip.
 * @group Interface
 */
export interface TooltipSeriesRow {
    /**
     * Series name.
     */
    label: string;
    /**
     * Formatted value.
     */
    value: string | number;
    /**
     * Swatch color.
     */
    color: string;
    /**
     * Swatch gradient, when the series is filled with one.
     */
    colorGradient?: GradientColor;
    /**
     * Dataset the entry stands for.
     */
    datasetId: string;
}

/**
 * Open-high-low-close prices, reported on candlestick hits.
 * @group Interface
 */
export interface OhlcValues {
    open: number;
    high: number;
    low: number;
    close: number;
}

/**
 * One entry of {@link TooltipRenderContext.allSeries}.
 * @group Interface
 */
export interface TooltipItem {
    /**
     * Dataset identifier. A stable key for list rendering.
     */
    datasetId: string;
    /**
     * Human-readable series name, from the series component's `name` input.
     */
    name?: string;
    /**
     * Category label at the hovered position. The same for every item in the list.
     */
    label: string;
    /**
     * Series color.
     */
    color: string;
    /**
     * Raw numeric value.
     */
    value: number;
    /**
     * Pre-formatted value string, which respects the axis tick format, the stacking mode and the
     * display units. Show this rather than `value`.
     */
    formattedValue: string;
    /**
     * Percentage of the total, from 0 to 100. Populated on percent-stacked bar charts.
     */
    percentage?: number;
    /**
     * OHLC prices. Populated on candlestick series.
     */
    ohlc?: OhlcValues;
    /**
     * Rows a `valueFormatter` returned for this series, which replace its single line in the card.
     */
    rows?: TooltipRow[];
}

/**
 * Discriminated union describing the resolved body of the default tooltip card. The `type` tag
 * selects the layout: a single value, custom rows, multiple series, OHLC, or scatter.
 * @group Types
 */
export type TooltipContent =
    | { type: 'simple'; label: string; value: string | number; percentage: number; color: string; colorGradient?: GradientColor; swatchColor: string }
    | { type: 'rows'; label: string; rows: TooltipRow[]; color: string; colorGradient?: GradientColor; swatchColor: string }
    | { type: 'multi-series'; label: string; series: TooltipSeriesRow[] }
    | { type: 'ohlc'; label: string; rows: TooltipOhlcRow[]; color: string; colorGradient?: GradientColor; swatchColor: string }
    | { type: 'scatter'; label: string; xValue: number; yValue: number; bubbleValue?: number; color: string; colorGradient?: GradientColor; swatchColor: string };

/**
 * Context passed to a tooltip template or render function.
 * @group Interface
 */
export interface TooltipRenderContext extends CanvasRenderCapabilities {
    /**
     * The series identifier of the primary hovered item.
     */
    datasetId: string;
    /**
     * Data index of the hovered element.
     */
    index: number;
    /**
     * Category or data point label.
     */
    label: string;
    /**
     * Raw data value.
     */
    value: number;
    /**
     * Percentage of the total. Populated on pie, donut and polar charts.
     */
    percentage?: number;
    /**
     * Series color.
     */
    color: string;
    /**
     * Pixel x coordinate of the hovered point.
     */
    x?: number;
    /**
     * Pixel y coordinate of the hovered point.
     */
    y?: number;
    /**
     * OHLC prices. Populated on candlestick charts.
     */
    ohlc?: OhlcValues;
    /**
     * Every series value at the hovered position. This is what a multi-series tooltip in
     * `mode="shared"` reads.
     */
    allSeries: TooltipItem[];
}

/**
 * Context passed to the tooltip value formatter.
 * @group Interface
 */
export interface TooltipValueContext<T = unknown> {
    /**
     * Dataset the hovered value belongs to.
     */
    datasetId: string;
    /**
     * Series name, as the tooltip shows it.
     */
    seriesName: string;
    /**
     * Order of the series within the chart.
     */
    seriesIndex: number;
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * The hovered point's category or slice label.
     */
    label: string;
    /**
     * The raw data row.
     */
    datum?: T;
    /**
     * Share of the total, where the chart has one.
     */
    percentage?: number;
    /**
     * The colour the mark was drawn in.
     */
    color?: string;
}

/**
 * Formats a tooltip's value. Return a string to format the single value, or an array of rows to
 * render a custom multi-row body inside the default card. Ignored when a custom `render` is given.
 * @group Types
 */
export type TooltipValueFormatter<T = unknown> = (value: number, context: TooltipValueContext<T>) => string | TooltipRow[];

/**
 * Context passed to the center-content seam of a donut or gauge.
 * @group Interface
 */
export interface CenterContentContext extends CanvasRenderCapabilities {
    /**
     * Sum of the visible slice values.
     */
    total: number;
    /**
     * Formatted total.
     */
    formattedTotal: string;
    /**
     * The hovered slice, when one is hovered.
     */
    hovered?: { label: string; value: number; percentage: number; index: number; color: string };
    /**
     * Center point in pixels.
     */
    center: { x: number; y: number };
    /**
     * The tier the chart is at, and the picker for tier-scaled values.
     */
    responsive: ResponsiveContext;
    /**
     * Inner radius of the ring in pixels, which bounds the available space.
     */
    innerRadius: number;
}

/**
 * Context passed to a slice render function on a pie, donut or polar series.
 * @group Interface
 */
export interface SliceRenderContext<T = unknown> extends CanvasRenderCapabilities {
    /**
     * Slice index in the data array.
     */
    index: number;
    /**
     * Original data item.
     */
    data: T;
    /**
     * Numeric slice value.
     */
    value: number;
    /**
     * Percentage of the total, from 0 to 100.
     */
    percentage: number;
    /**
     * Slice label.
     */
    label: string;
    /**
     * Resolved fill color.
     */
    color: string;
    /**
     * Center of the circle in absolute coordinates. Use it to position content relative to the
     * chart center, such as a donut hole label. Not the same as `x` and `y`.
     */
    center: { x: number; y: number };
    /**
     * Midpoint of this slice's arc in absolute coordinates. Use it to position content inside the
     * slice. Not the same as `center`.
     */
    x: number;
    /**
     * Midpoint of this slice's arc in absolute coordinates. See `x`.
     */
    y: number;
    /**
     * Midpoint angle in degrees.
     */
    angle: number;
    /**
     * Whether the slice is currently hovered.
     */
    isHovered: boolean;
    /**
     * Whether the slice is visible, rather than toggled off through the legend.
     */
    isVisible: boolean;
    /**
     * Resolved font family for text rendering.
     */
    fontFamily: string;
}

/**
 * Context passed to a heatmap cell render function.
 * @group Interface
 */
export interface HeatmapCellContext<T = unknown> extends CanvasRenderCapabilities {
    /**
     * Original data item.
     */
    data: T;
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * Cell value. `null` for an empty cell.
     */
    value: number | null;
    /**
     * X axis category label.
     */
    xLabel: string;
    /**
     * Y axis category label.
     */
    yLabel: string;
    /**
     * Resolved fill color.
     */
    color: string;
    /**
     * Cell x position in pixels.
     */
    x: number;
    /**
     * Cell y position in pixels.
     */
    y: number;
    /**
     * Cell width in pixels.
     */
    width: number;
    /**
     * Cell height in pixels.
     */
    height: number;
    /**
     * Row index in the grid.
     */
    row: number;
    /**
     * Column index in the grid.
     */
    col: number;
    /**
     * Whether this is a null or empty cell.
     */
    isEmpty: boolean;
}

/**
 * Context passed to a treemap cell render function.
 * @group Interface
 */
export interface TreemapCellContext<T = unknown> extends CanvasRenderCapabilities {
    /**
     * Original data item.
     */
    data: T;
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * Primary label text.
     */
    label: string;
    /**
     * Secondary label text.
     */
    secondaryLabel?: string;
    /**
     * Numeric value that determines the cell area.
     */
    value: number;
    /**
     * Resolved fill color.
     */
    color: string;
    /**
     * Cell x position in pixels.
     */
    x: number;
    /**
     * Cell y position in pixels.
     */
    y: number;
    /**
     * Cell width in pixels.
     */
    width: number;
    /**
     * Cell height in pixels.
     */
    height: number;
    /**
     * Node id, on hierarchical data.
     */
    nodeId?: string;
    /**
     * Parent node id, on hierarchical data.
     */
    parentId?: string;
    /**
     * Whether this cell can be drilled into.
     */
    hasChildren?: boolean;
    /**
     * Depth in the hierarchy, where 0 is the root level.
     */
    depth: number;
    /**
     * Parent id currently drilled into. `null` at the root level.
     */
    drilldownParentId: string | null;
}

/**
 * Context passed to the color-legend seam.
 * @group Interface
 */
export interface ColorLegendRenderContext {
    /**
     * Value breakpoints of the scale.
     */
    colorScale: number[];
    /**
     * Colors matching the breakpoints.
     */
    colorRange: string[];
    /**
     * Formatted tick labels along the bar.
     */
    labels: string[];
    /**
     * Bar rectangle in pixels.
     */
    rect: BoxArea;
    /**
     * Whether the bar runs horizontally.
     */
    horizontal: boolean;
}

/**
 * Context passed to a point description callback for screen readers.
 * @group Interface
 */
export interface PointDescriptionContext {
    /**
     * Category label.
     */
    category: string;
    /**
     * Data value.
     */
    value: number;
    /**
     * Series name.
     */
    seriesName: string;
    /**
     * Index within the series.
     */
    index: number;
    /**
     * Sum of every value. Pie charts only.
     */
    total?: number;
    /**
     * Percentage of the total. Pie charts only.
     */
    percentage?: number;
}

/**
 * Context passed to `seriesDescriptionFormatter`.
 * @group Interface
 */
export interface SeriesDescriptionContext {
    /**
     * Series name.
     */
    name: string;
    /**
     * Chart type identifier.
     */
    type: string;
    /**
     * Number of data points in the series.
     */
    pointCount: number;
}

/**
 * Context passed to `dataTableCellFormatter`. The same formatter drives the screen-reader data
 * table and the CSV export, so the two never disagree.
 * @group Interface
 */
export interface DataTableCellContext {
    /**
     * Raw cell value, before formatting.
     */
    value: string | number;
    /**
     * Column header, such as `'Category'`, `'Value'`, `'Open'` or `'Close'`.
     */
    column: string;
    /**
     * Zero-based column index within the row.
     */
    columnIndex: number;
    /**
     * Zero-based row index within the data-table body.
     */
    rowIndex: number;
    /**
     * `true` when the underlying cell value is numeric rather than a label.
     */
    isNumeric: boolean;
}

/**
 * Context passed to the export-menu icon seam.
 * @group Interface
 */
export interface ExportMenuIconContext {
    /**
     * Whether the menu is open.
     */
    open: boolean;
}

/**
 * Context passed to the export-menu item seam.
 * @group Interface
 */
export interface ExportMenuItemContext {
    /**
     * The menu entry this row stands for.
     */
    item: string;
    /**
     * Human-readable label.
     */
    label: string;
    /**
     * Position within the menu.
     */
    index: number;
}

/**
 * Annotation render function, kept framework-agnostic so the same callback serves both renderers.
 * @group Types
 */
export type AnnotationRender<T = unknown> = (context: AnnotationContext) => T;

/**
 * Center-content render function.
 * @group Types
 */
export type CenterContentRender<T = unknown> = (context: CenterContentContext) => T;

/**
 * Legend item render function.
 * @group Types
 */
export type LegendItemRender<T = unknown> = (context: LegendItemRenderContext) => T;

/**
 * Tooltip content render function.
 * @group Types
 */
export type TooltipContentRender<T = unknown> = (context: TooltipRenderContext) => T;

/**
 * Empty state render function.
 * @group Types
 */
export type EmptyStateRender<T = unknown> = () => T;

/**
 * Loading state render function.
 * @group Types
 */
export type LoadingStateRender<T = unknown> = () => T;

/**
 * Error state render function, handed the thrown error.
 * @group Types
 */
export type ErrorStateRender<T = unknown> = (error: Error) => T;

/**
 * A hit-test result on a cartesian chart.
 * @group Interface
 */
export interface CartesianHitTestResult {
    kind: 'cartesian';
    /**
     * Dataset that was hit.
     */
    datasetId: string;
    /**
     * Series order index.
     */
    seriesIndex: number;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
    /**
     * Pixel position of the hit mark.
     */
    x: number;
    /**
     * Pixel position of the hit mark.
     */
    y: number;
    /**
     * Distance in pixels from the pointer to the mark.
     */
    distance: number;
}

/**
 * A hit-test result on a radial chart.
 * @group Interface
 */
export interface RadialHitTestResult {
    kind: 'radial';
    /**
     * Dataset that was hit.
     */
    datasetId: string;
    /**
     * Series order index.
     */
    seriesIndex: number;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
    /**
     * Angle of the pointer in radians.
     */
    angle: number;
    /**
     * Distance of the pointer from the center in pixels.
     */
    radius: number;
}

/**
 * A hit-test result from either a cartesian or a radial chart.
 * @group Types
 */
export type ChartHitTestResult = CartesianHitTestResult | RadialHitTestResult;

/**
 * Action produced by the keyboard navigation reducer, describing the focus state to apply next.
 * @group Types
 */
export type KeyNavAction = { type: 'navigate'; datasetId: string; index: number } | { type: 'reset' } | { type: 'none' };

/**
 * A painter queued by a Canvas-mode seam, kept so the frame loop can replay it.
 * @group Types
 */
export type QueuedPainter = { key: string; paint: CanvasPainter };

/**
 * The hover, as the chart root emits it.
 *
 * `null` when nothing is hovered, which is why the event is nullable rather than only firing on
 * entry: a listener that only heard about arrivals could never clear its own highlight.
 * @group Interface
 */
export interface ChartPointEvent<T = unknown> {
    /**
     * Dataset the hovered mark belongs to.
     */
    datasetId: string;
    /**
     * Index into the original data array.
     */
    index: number;
    /**
     * The hovered value.
     */
    value: number | null;
    /**
     * The hovered point's category or slice label.
     */
    label: string;
    /**
     * The raw data row.
     */
    datum?: T;
    /**
     * Pointer position within the chart, in pixels.
     */
    x: number;
    y: number;
}
