/**
 * The registry every chart part talks to.
 *
 * The compound API rests on one idea: a part is its own configuration. `<p-chart-legend />` renders
 * a legend and reserves space for it; removing the element removes both. There is no `showLegend`
 * flag anywhere, so a part's whole job is to register what it is on mount and deregister on
 * destroy. This file is the contract that makes that work, and it is deliberately free of any
 * rendering concern so a series can be tested without a root and vice versa.
 */
import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';
import type { AnyFeatureProps, AnySeriesProps, AxisScale, BoxArea, ChartExportOptions, ChartText, ChartTheme, FeatureType, HoverState, RendererType, ResponsiveTier, SeriesType } from '@openng/optimus-ui/types/charts';
import type { AxisDomain } from './charts-state';

/** Where a part asks the layout to reserve space. */
export type ReservationEdge = 'top' | 'right' | 'bottom' | 'left';

/**
 * A part's claim on the layout.
 *
 * Both the edge and the size are read from a signal. The edge has to be reactive rather than fixed
 * at registration: a part registers in its constructor, and Angular has not populated its inputs by
 * then, so a `position` read there would always be the default -- which silently reserved space on
 * the wrong side of the chart.
 */
export interface LayoutReservation {
    edge: ReservationEdge;
    size: number;
}

/** One registered series. */
export interface SeriesRegistration<P extends AnySeriesProps = AnySeriesProps> {
    /**
     * Dataset id. Generated when the series did not supply one.
     */
    id: string;
    /**
     * Series type, which tells the root how to draw and hit-test it.
     */
    type: SeriesType;
    /**
     * The series' current inputs, read as a signal so the root re-lays-out when they change.
     */
    props: Signal<P>;
    /**
     * Position among the registered series, which drives the palette and the z-order.
     */
    seriesIndex: Signal<number>;
    /**
     * Stack group this series belongs to, when a `ChartStacked` wraps it.
     */
    stackId?: string;
    /**
     * Overlap group this series belongs to, when a `ChartOverlap` wraps it.
     */
    overlapId?: string;
    /**
     * Whether the series is a waterfall, and the field that flags its summary bars.
     */
    waterfall?: { totalField?: string };
    /**
     * Whether the series pairs with a sibling to form a range band.
     */
    rangeId?: string;
    /**
     * The in-plot templates this series projected, keyed by the surface they replace.
     *
     * Carried on the registration because only the root can place them: a slice template has to be
     * stamped at the slice's own centre, and the series does not know where that is -- the scene
     * does.
     */
    templates?: Signal<Partial<Record<SceneSlot, TemplateRef<unknown> | null>>>;
}

/** An in-plot surface a template can replace. */
export type SceneSlot = 'slice' | 'marker' | 'heatmapCell' | 'treemapCell' | 'centerContent';

/** One registered feature. */
export interface FeatureRegistration<P extends AnyFeatureProps = AnyFeatureProps> {
    /**
     * Which feature this is. The template-literal forms of {@link FeatureType} let several
     * instances of one feature coexist.
     */
    type: FeatureType;
    /**
     * The feature's current inputs.
     */
    props: Signal<P>;
}

/** One registered axis. */
export interface AxisRegistration {
    /**
     * Axis id, matched by `xAxisId` and `yAxisId` on the series.
     */
    id: string;
    /**
     * Which of the two axes this is.
     */
    axis: 'x' | 'y';
    /**
     * The axis' current inputs.
     */
    props: Signal<Record<string, unknown>>;
}

/**
 * The state a chart root publishes to its children.
 *
 * Everything here is a signal, so a part reads what it needs and nothing more: an axis that only
 * cares about the plot area does not recompute when the hover moves.
 */
export interface ChartContext {
    /**
     * Which renderer is painting. A seam that can only exist in one of them branches on this.
     */
    renderer: RendererType;
    /**
     * Plot area the series draw into.
     */
    chartArea: Signal<BoxArea>;
    /**
     * Total chart width in pixels.
     */
    width: Signal<number>;
    /**
     * Total chart height in pixels.
     */
    height: Signal<number>;
    /**
     * Registered scales, keyed by `${axis}:${id}`.
     */
    scales: Signal<Map<string, AxisScale>>;
    /**
     * Each axis' domain, keyed the same way but without a pixel range.
     *
     * An axis reads this rather than `scales` to work out how much room its labels need, because
     * its own reservation is what determines the plot area the scales are built from.
     */
    domains: Signal<Map<string, AxisDomain>>;
    /**
     * The x scale of the default axis, which is what most series want.
     */
    xScale: Signal<AxisScale | undefined>;
    /**
     * The y scale of the default axis.
     */
    yScale: Signal<AxisScale | undefined>;
    /**
     * Resolved theme, whether it came from the `theme` input or from the CSS custom properties.
     */
    theme: Signal<ChartTheme>;
    /**
     * Whether the active colour scheme is dark.
     */
    isDark: Signal<boolean>;
    /**
     * Theme-aware default text colour.
     */
    textColor: Signal<string>;
    /**
     * Resolved font family for every piece of chart text.
     */
    fontFamily: Signal<string>;
    /**
     * Resolved base font size.
     */
    fontSize: Signal<number>;
    /**
     * Text direction actually in force.
     */
    direction: Signal<'ltr' | 'rtl'>;
    /**
     * Resolved locale, which every formatter goes through.
     */
    locale: Signal<string | undefined>;
    /**
     * Current animation progress, from 0 to 1.
     */
    progress: Signal<number>;
    /**
     * The point under the pointer, or `null`.
     */
    hover: Signal<HoverState | null>;
    /**
     * Datasets the legend has toggled off.
     */
    hiddenDatasets: Signal<ReadonlySet<string>>;
    /**
     * Individual items the legend has toggled off, keyed by dataset.
     */
    hiddenItems: Signal<ReadonlyMap<string, ReadonlySet<number>>>;
    /**
     * Registers a series and returns the function that deregisters it.
     */
    registerSeries: (registration: SeriesRegistration) => () => void;
    /**
     * Registers a feature and returns the function that deregisters it.
     */
    registerFeature: (registration: FeatureRegistration) => () => void;
    /**
     * Registers an axis and returns the function that deregisters it.
     */
    registerAxis: (registration: AxisRegistration) => () => void;
    /**
     * Reserves layout space and returns the function that releases it.
     */
    reserve: (reservation: Signal<LayoutReservation>) => () => void;
    /**
     * The registered series, in render order.
     */
    series: Signal<readonly SeriesRegistration[]>;
    /**
     * The registered features.
     */
    features: Signal<readonly FeatureRegistration[]>;
    /**
     * The registered axes.
     */
    axes: Signal<readonly AxisRegistration[]>;
    /**
     * Looks up one feature's registration, for the parts that need to know whether a sibling is
     * present -- a series asking whether a `ChartHover` exists, say.
     */
    feature: <P extends AnyFeatureProps>(type: FeatureType) => Signal<FeatureRegistration<P> | undefined>;
    /**
     * Whether a dataset is currently visible.
     */
    isDatasetVisible: (datasetId: string) => boolean;
    /**
     * Whether one item of a dataset is currently visible.
     */
    isItemVisible: (datasetId: string, index: number) => boolean;
    /**
     * Flips a dataset's visibility.
     */
    toggleDataset: (datasetId: string) => void;
    /**
     * Flips the visibility of specific items of a dataset.
     */
    toggleItems: (datasetId: string, indices: readonly number[]) => void;
    /**
     * Sets or clears the hover.
     */
    setHover: (hover: HoverState | null) => void;
    /**
     * Asks for a repaint on the next frame. Calling it many times in one tick still costs one
     * frame, which is what lets five series update together without five layout passes.
     */
    requestRender: () => void;
    /**
     * The visible window on each axis, or `null` for the full domain.
     *
     * Zoom, pan, the navigator and a synced sibling all write the same window, which is why it is
     * one piece of state rather than one per part: two of them disagreeing about what is visible
     * would be two different charts.
     */
    zoomWindow: Signal<{ x: { min: number; max: number } | null; y: { min: number; max: number } | null }>;
    /**
     * Sets the visible window.
     */
    setZoomWindow: (window: { x: { min: number; max: number } | null; y: { min: number; max: number } | null }) => void;
    /**
     * The chart's container element, for a part that has to attach its own pointer handlers.
     *
     * Zoom and the navigator both need the element the pointer actually moves over, and neither can
     * get it from its own host: they render into the overlay layer, which does not take the
     * pointer.
     */
    container: () => HTMLElement | null;
    /**
     * The resolved prose catalogue.
     */
    text: Signal<ChartText>;
    /**
     * Chart-wide number formatting, which every numeric surface goes through.
     */
    numberFormat: Signal<Intl.NumberFormatOptions | undefined>;
    /**
     * The responsive tier the container currently falls into.
     */
    tier: Signal<ResponsiveTier>;
    /**
     * Exports the chart, so an export menu does not have to know which renderer it is in.
     */
    exportChart: (options: ChartExportOptions) => Promise<void>;
    /**
     * The chart's data as CSV, for the download entry and the screen-reader table.
     */
    toCsv: () => string;
}

/**
 * The chart context, provided by `ChartSvg` and `ChartCanvas` and injected by every part.
 *
 * A part injects it optionally: a series used outside a chart root should render nothing rather
 * than throw, because a template that is briefly incomplete during a structural change is normal.
 */
export const CHART_CONTEXT = new InjectionToken<ChartContext>('CHART_CONTEXT');

/** The bus a `ChartGroup` provides so its charts can sync. */
export interface ChartGroupContext {
    /**
     * Registers a chart with the group and returns the function that removes it.
     */
    join: (member: ChartGroupMember) => () => void;
    /**
     * Broadcasts a zoom or pan change to the other members.
     */
    publishExtremes: (sourceId: string, state: { x: { min: number; max: number } | null; y: { min: number; max: number } | null }) => void;
    /**
     * Broadcasts a cursor position to the other members.
     */
    publishHighlight: (sourceId: string, payload: { category?: string; value?: number; cleared?: boolean }) => void;
    /**
     * Broadcasts a series visibility change to the other members.
     */
    publishVisibility: (sourceId: string, datasetId: string, visible: boolean) => void;
    /**
     * The members currently in the group, which a shared legend reads to build its rows.
     */
    members: Signal<readonly ChartGroupMember[]>;
}

/** One chart inside a group. */
export interface ChartGroupMember {
    /**
     * Identifier unique within the group.
     */
    id: string;
    /**
     * The chart's own context, so a shared legend can reach its datasets.
     */
    context: ChartContext;
    /**
     * Applies an extremes event from another member.
     */
    applyExtremes: (state: { x: { min: number; max: number } | null; y: { min: number; max: number } | null }) => void;
    /**
     * Applies a highlight event from another member.
     */
    applyHighlight: (payload: { category?: string; value?: number; cleared?: boolean }) => void;
    /**
     * Applies a visibility event from another member.
     */
    applyVisibility: (datasetId: string, visible: boolean) => void;
}

/**
 * The group bus. It is optional on purpose: a chart with `sync` set but no `ChartGroup` above it
 * simply works on its own rather than failing.
 */
export const CHART_GROUP = new InjectionToken<ChartGroupContext>('CHART_GROUP');

/** The stack a `ChartStacked` provides to the series it wraps. */
export interface StackContext {
    /**
     * Stack group identifier.
     */
    id: string;
    /**
     * How the values are combined.
     */
    mode: Signal<'normal' | 'percent'>;
    /**
     * Pixel gap between the segments.
     */
    gap: Signal<number>;
}

/** The stack context, provided by `ChartStacked`. */
export const CHART_STACK = new InjectionToken<StackContext>('CHART_STACK');

/** The waterfall a `ChartWaterfall` provides to the bar series it wraps. */
export interface WaterfallContext {
    /**
     * Field that flags the summary bars.
     */
    totalField: Signal<string | undefined>;
}

/** The waterfall context, provided by `ChartWaterfall`. */
export const CHART_WATERFALL = new InjectionToken<WaterfallContext>('CHART_WATERFALL');

/** The overlap group a `ChartOverlap` provides. */
export interface OverlapContext {
    /**
     * Overlap group identifier.
     */
    id: string;
    /**
     * Claims a depth in the group. The first child registered draws widest, the last narrowest.
     */
    claimDepth: () => Signal<{ depth: number; total: number }>;
}

/** The overlap context, provided by `ChartOverlap`. */
export const CHART_OVERLAP = new InjectionToken<OverlapContext>('CHART_OVERLAP');

/** The band a `ChartRange` provides to the two line series it pairs. */
export interface RangeContext {
    /**
     * Range group identifier.
     */
    id: string;
    /**
     * Claims an edge of the band. The first series registered is the upper edge.
     */
    claimEdge: () => 'upper' | 'lower';
}

/** The range context, provided by `ChartRange`. */
export const CHART_RANGE = new InjectionToken<RangeContext>('CHART_RANGE');

/** The parent a `ChartItem` reports itself to. */
export interface ItemHost {
    /**
     * Registers a declarative item and returns the function that removes it.
     */
    registerItem: (props: Signal<Record<string, unknown>>) => () => void;
}

/** The item host, provided by every series that accepts `ChartItem` children. */
export const CHART_ITEM_HOST = new InjectionToken<ItemHost>('CHART_ITEM_HOST');

/**
 * The drilldown a treemap owns and a breadcrumb reads.
 *
 * The state lives with the treemap because the treemap is what has a hierarchy; the breadcrumb only
 * renders the trail and asks to move along it. Putting the path on the chart context instead would
 * give every chart a drilldown, most of which have no hierarchy to drill.
 */
export interface DrilldownContext {
    /**
     * The levels drilled into, root excluded.
     */
    path: Signal<readonly { id: string; label: string }[]>;
    /**
     * What the root level is called.
     *
     * Named apart from the `rootLabel` input it derives from, because the treemap implements this
     * interface on itself and one name cannot be both an input and a resolved value.
     */
    rootLabel$: Signal<string>;
    /**
     * Drills to a level, or back to the root with `null`.
     */
    drillTo: (id: string | null) => void;
}

/** The drilldown context, provided by `ChartTreemap`. */
export const CHART_DRILLDOWN = new InjectionToken<DrilldownContext>('CHART_DRILLDOWN');

/** The axis a `ChartAxisGroup` reports itself to. */
export interface AxisGroupHost {
    /**
     * Registers a group and returns the function that removes it.
     */
    registerGroup: (props: Signal<Record<string, unknown>>, depth: number) => () => void;
}

/** The axis group host, provided by `ChartXAxis` and `ChartYAxis`. */
export const CHART_AXIS_GROUP_HOST = new InjectionToken<AxisGroupHost>('CHART_AXIS_GROUP_HOST');

/** Builds the key a scale is registered under. */
export function scaleKey(axis: 'x' | 'y', id = 'default'): string {
    return `${axis}:${id}`;
}

/**
 * Generates a dataset id for a series that did not supply one.
 *
 * The counter is module-scoped rather than per chart, so two charts on a page never mint the same
 * id -- which matters because a `ChartGroup` addresses datasets by id across its members.
 */
let datasetCounter = 0;

export function nextDatasetId(type: string): string {
    datasetCounter += 1;

    return `${type}-${datasetCounter}`;
}

/** Generates a stack, overlap or range group id. */
export function nextGroupId(kind: string): string {
    datasetCounter += 1;

    return `${kind}-${datasetCounter}`;
}
