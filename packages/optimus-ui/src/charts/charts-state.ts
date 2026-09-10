/**
 * The chart's computed state.
 *
 * This is the whole of what a root knows, expressed as signals and with no rendering in it. The
 * roots differ only in what they paint; the domains, the scales and the layout are computed here
 * once and read by both, which is what keeps an SVG chart and a Canvas chart of the same data
 * geometrically identical.
 */
import { computed, signal, type Signal, type WritableSignal } from '@angular/core';
import type { AxisScale, AxisType, BoxArea, ChartDecimationProps, ChartExportOptions, ChartText, ChartTheme, FeatureType, HoverState, RendererType, SeriesType, StackingMode, TickValue } from '@openng/optimus-ui/types/charts';
import { readCategory, readNumeric, readPath } from './core/accessor';
import { decimate, type Sample } from './core/decimate';
import { computeLayout, responsiveTier, type EdgeReservation } from './core/layout';
import { resolveTheme } from './core/palette';
import { registeredLocales, resolveChartText } from './core/text';
import { bandScale, linearScale, logScale, timeScale, toNumber, unionCategories } from './core/scale';
import { sortCategories, stackedDomain, stackSeries, waterfallDomain, waterfallSteps, type StackInput } from './core/stack';
import { niceDomain } from './core/ticks';
import { tickCountForLength } from './render/axis';
import { type AxisRegistration, type ChartContext, type FeatureRegistration, type LayoutReservation, type SeriesRegistration, scaleKey } from './charts-registry';

/**
 * An axis' domain, before it is given a pixel range.
 *
 * Splitting this out of the scale is what lets an axis measure its own labels and reserve layout
 * space without needing the plot area that its reservation will go on to determine.
 */
export type AxisDomain =
    | {
          kind: 'category';
          categories: string[];
          banded: boolean;
          /**
           * Whether the bands fill the axis with no padding between them, which is what a matrix
           * wants: its own cell spacing is the only gap there should be.
           */
          tiled?: boolean;
          padding?: number;
      }
    | {
          kind: 'value';
          type: AxisType;
          extent: [number, number];
          /**
           * Edge padding at the axis minimum, as a fraction of the pixel range.
           */
          paddingMin?: number;
          /**
           * Edge padding at the axis maximum, as a fraction of the pixel range.
           */
          paddingMax?: number;
      };

/** A resolved value of one series at one category. */
export interface SeriesPoint {
    category: string;
    value: number | null;
    /**
     * Where the mark starts, which stacking and waterfall move away from zero.
     */
    base: number;
    /**
     * Index into the original data array.
     */
    dataIndex: number;
    /**
     * The x value, on a series whose x axis is continuous rather than categorical.
     *
     * A scatter point has two numbers and no category; a category-based series leaves this unset and
     * is placed by `category` instead.
     */
    xValue?: number | null;
    /**
     * The extent this point spans on the value axis, where it is wider than the value itself.
     *
     * A candle's wick runs from its low to its high, so the axis has to cover both even though the
     * point's own value is the close.
     */
    extent?: [number, number];
    /**
     * Whether this point is a waterfall summary rather than a delta.
     *
     * A summary spans from zero to the running total, so it is neither a rise nor a fall and must
     * not be coloured as one.
     */
    isTotal?: boolean;
}

/** One series, resolved from its props into values the renderers can place. */
export interface ResolvedSeries {
    id: string;
    type: SeriesType;
    seriesIndex: number;
    /**
     * The series' points, in category order.
     */
    points: SeriesPoint[];
    /**
     * Categories the series contributes to its x axis.
     */
    categories: string[];
    /**
     * Categories the series contributes to its y axis.
     *
     * Only a heatmap has these: it is the one cartesian series whose *both* axes are categorical,
     * with the value carried by colour rather than by either position.
     */
    yCategories: string[];
    /**
     * Axis this series is bound to.
     */
    xAxisId: string;
    yAxisId: string;
    /**
     * Which axis this series puts its categories on, or `null` when it has none.
     *
     * A horizontal bar binds `categoryYField`, so its category axis is y and its value axis is x. A
     * scatter series binds two numbers and no category at all, so neither of its axes is
     * categorical. Recording it here is what lets an axis with no explicit `type` work out its own
     * role from what is actually bound to it.
     */
    categoryAxis: 'x' | 'y' | null;
    /**
     * Whether the series is placed on x by a number rather than by a category.
     */
    continuousX: boolean;
    /**
     * Whether the legend has switched this series off.
     */
    visible: boolean;
    /**
     * Registration this was resolved from, so a renderer can still reach the raw props.
     */
    registration: SeriesRegistration;
}

/** Everything a root needs to build its state. */
export interface ChartStateOptions {
    renderer: RendererType;
    width: Signal<number>;
    height: Signal<number>;
    theme: Signal<ChartTheme | undefined>;
    isDark: Signal<boolean>;
    fontFamily: Signal<string>;
    fontSize: Signal<number>;
    direction: Signal<'ltr' | 'rtl'>;
    locale: Signal<string | undefined>;
    numberFormat: Signal<Intl.NumberFormatOptions | undefined>;
    text: Signal<Partial<ChartText> | undefined>;
    /**
     * The container element, for the parts that attach their own pointer handlers.
     */
    container: () => HTMLElement | null;
    /**
     * Exports the chart. Only the root knows how, so it hands the ability down.
     */
    exportChart: (options: ChartExportOptions) => Promise<void>;
    /**
     * Asks the host for a repaint. The state itself never paints.
     */
    requestRender: () => void;
}

/** The default axis id, used by every series that does not name one. */
const DEFAULT_AXIS = 'default';

/** The series types that place their marks against a category and a value axis. */
const CARTESIAN_TYPES: readonly SeriesType[] = ['line', 'bar', 'scatter', 'candlestick', 'heatmap'];

/** The series types that have no cartesian axes at all. */
const RADIAL_TYPES: readonly SeriesType[] = ['pie', 'donut', 'pie3d', 'radar', 'polar'];

/** True when a series type places its marks against cartesian scales. */
export function isCartesian(type: SeriesType): boolean {
    return CARTESIAN_TYPES.includes(type);
}

/** True when a series type is drawn around a centre rather than against axes. */
export function isRadial(type: SeriesType): boolean {
    return RADIAL_TYPES.includes(type);
}

/**
 * Builds the chart state.
 *
 * The returned object is the {@link ChartContext} the parts inject, plus the resolved series and
 * layout the renderers read.
 */
export function createChartState(options: ChartStateOptions) {
    const seriesRegistry = signal<readonly SeriesRegistration[]>([]);
    const featureRegistry = signal<readonly FeatureRegistration[]>([]);
    const axisRegistry = signal<readonly AxisRegistration[]>([]);
    const reservations = signal<readonly Signal<LayoutReservation>[]>([]);

    const hover = signal<HoverState | null>(null);
    const hiddenDatasets = signal<ReadonlySet<string>>(new Set());
    const hiddenItems = signal<ReadonlyMap<string, ReadonlySet<number>>>(new Map());
    const progress = signal(1);
    const zoomWindow = signal<{ x: { min: number; max: number } | null; y: { min: number; max: number } | null }>({ x: null, y: null });

    const theme = computed(() => resolveTheme(options.theme(), options.isDark()));
    // Reads `registeredLocales` so a catalogue registered after this chart mounted still reaches it.
    const chartText = computed(() => {
        registeredLocales();

        return resolveChartText(options.locale(), options.text());
    });
    const tier = computed(() => responsiveTier(options.width()));
    const textColor = computed(() => theme().color ?? '#0f172a');

    /* --- Layout ------------------------------------------------------------------------------- */

    const layout = computed(() => {
        const edges: EdgeReservation[] = reservations().map((entry) => {
            const claim = entry();

            return { position: claim.edge, size: claim.size };
        });

        return computeLayout({ width: options.width(), height: options.height(), reservations: edges });
    });

    const chartArea = computed<BoxArea>(() => layout().chartArea);

    /* --- Series resolution -------------------------------------------------------------------- */

    /** Reads one series' props into points, before any stacking is applied. */
    const rawSeries = computed(() =>
        seriesRegistry().map((registration, index) => {
            const props = registration.props() as Record<string, unknown>;
            const data = (props['data'] as unknown[] | undefined) ?? [];
            // A heatmap's rows are its second category axis, read per datum like the columns. It
            // binds `categoryYField` the way a horizontal bar does, but it means a second category
            // axis rather than a flipped orientation -- so the flip has to exclude it, or the
            // columns end up reading from the row field.
            const gridded = registration.type === 'heatmap';
            const flipped = props['categoryYField'] != null && !gridded;
            const categoryAccessor = (flipped ? props['categoryYField'] : props['categoryXField']) as never;
            const openAccessor = props['openField'] as never;
            // A scatter series is placed by two numbers, so it has no category axis at all. Its x
            // comes from `valueXField` rather than from a category lookup.
            const continuousX = registration.type === 'scatter';
            const xValueAccessor = props['valueXField'] as never;
            const rowField = typeof props['categoryYField'] === 'string' ? (props['categoryYField'] as string) : 'row';
            // A candlestick's value is its close, and its axis has to reach its low and high.
            const ohlc = registration.type === 'candlestick';
            /*
             * Which prop carries the measured value, which differs by family:
             *  - a heatmap has a single `valueField`, since neither axis measures it
             *  - a scatter's y is `valueYField`, its x being read separately
             *  - a horizontal bar measures along x, so `valueXField`
             */
            const valueAccessor = (gridded ? props['valueField'] : continuousX ? props['valueYField'] : flipped ? props['valueXField'] : props['valueYField']) as never;
            const valueFallback = gridded ? 'value' : continuousX ? 'y' : 'value';

            const points: SeriesPoint[] = data.map((datum, dataIndex) => {
                const category = readCategory(categoryAccessor, datum, dataIndex, index, registration.id);
                const value = readNumeric(valueAccessor, datum, dataIndex, index, registration.id, valueFallback);
                // A floating bar starts at its open value rather than at zero.
                const base = openAccessor == null ? 0 : (readNumeric(openAccessor, datum, dataIndex, index, registration.id) ?? 0);
                const xValue = continuousX ? readNumeric(xValueAccessor, datum, dataIndex, index, registration.id, 'x') : undefined;

                if (ohlc) {
                    const close = readNumeric(props['closeField'] as never, datum, dataIndex, index, registration.id, 'close');
                    const high = readNumeric(props['highField'] as never, datum, dataIndex, index, registration.id, 'high');
                    const low = readNumeric(props['lowField'] as never, datum, dataIndex, index, registration.id, 'low');
                    const extent: [number, number] | undefined = high != null && low != null ? [low, high] : undefined;

                    return { category, value: close, base: 0, dataIndex, extent };
                }

                return { category, value, base, dataIndex, xValue };
            });

            return {
                registration,
                seriesIndex: index,
                horizontal: flipped,
                continuousX,
                rows: gridded ? data.map((datum) => String(readPath(datum, rowField) ?? '')) : [],
                points: decimated(points, continuousX),
                xAxisId: (props['xAxisId'] as string | undefined) ?? DEFAULT_AXIS,
                yAxisId: (props['yAxisId'] as string | undefined) ?? DEFAULT_AXIS
            };
        })
    );

    /**
     * Applies stacking and the waterfall running total.
     *
     * Both are transforms on the base and top of each mark rather than rendering modes, so the bar,
     * area and polar renderers all just draw between two numbers and none of them needs to know
     * which transform produced them.
     */
    const resolvedSeries = computed<ResolvedSeries[]>(() => {
        const raw = rawSeries();
        const hidden = hiddenDatasets();
        const byStack = new Map<string, typeof raw>();
        const standalone: typeof raw = [];

        for (const entry of raw) {
            const stackId = entry.registration.stackId;

            if (stackId == null) {
                standalone.push(entry);
                continue;
            }

            const group = byStack.get(stackId) ?? [];

            group.push(entry);
            byStack.set(stackId, group);
        }

        const result = new Map<string, ResolvedSeries>();

        const toResolved = (entry: (typeof raw)[number], points: SeriesPoint[]): ResolvedSeries => ({
            id: entry.registration.id,
            type: entry.registration.type,
            seriesIndex: entry.seriesIndex,
            points,
            categories: points.map((point) => point.category),
            yCategories: entry.rows,
            xAxisId: entry.xAxisId,
            yAxisId: entry.yAxisId,
            categoryAxis: entry.continuousX ? null : entry.horizontal ? 'y' : 'x',
            continuousX: entry.continuousX,
            visible: !hidden.has(entry.registration.id),
            registration: entry.registration
        });

        for (const entry of standalone) {
            const waterfall = entry.registration.waterfall;

            if (!waterfall) {
                result.set(entry.registration.id, toResolved(entry, entry.points));
                continue;
            }

            const data = (entry.registration.props() as Record<string, unknown>)['data'] as unknown[] | undefined;
            const totals = entry.points.map((_, i) => {
                if (!waterfall.totalField || !data) return false;

                return Boolean(readPath(data[i], waterfall.totalField));
            });
            const steps = waterfallSteps(
                entry.points.map((point) => point.value),
                totals
            );

            result.set(
                entry.registration.id,
                toResolved(
                    entry,
                    entry.points.map((point, i) => ({ ...point, base: steps[i].base, value: steps[i].top, isTotal: steps[i].isTotal }))
                )
            );
        }

        for (const [, group] of byStack) {
            // A hidden series is excluded from the stack rather than stacked at zero, so switching
            // one off in the legend closes the gap instead of leaving a hole in the bar.
            const visible = group.filter((entry) => !hidden.has(entry.registration.id));
            const categories = unionCategories(visible.map((entry) => entry.points.map((point) => point.category)));
            const mode = stackModeOf(group[0].registration.stackId);
            const inputs: StackInput[] = visible.map((entry, order) => ({
                id: entry.registration.id,
                order: ((entry.registration.props() as Record<string, unknown>)['order'] as number | undefined) ?? order,
                values: new Map(entry.points.map((point) => [point.category, point.value]))
            }));
            const stacked = stackSeries(inputs, categories, mode);

            for (const entry of group) {
                const spans = stacked.get(entry.registration.id);

                if (!spans) {
                    result.set(entry.registration.id, toResolved(entry, entry.points));
                    continue;
                }

                result.set(
                    entry.registration.id,
                    toResolved(
                        entry,
                        entry.points.map((point) => {
                            const span = spans.get(point.category);

                            return span ? { ...point, base: span.base, value: span.top } : { ...point, value: null };
                        })
                    )
                );
            }
        }

        // Registration order is render order, so the map is walked back in that order rather than
        // in whichever order the stacking loop happened to visit.
        return raw.map((entry) => result.get(entry.registration.id)!).filter(Boolean);
    });

    /** Reads a stack group's mode off its registered feature. */
    function stackModeOf(stackId: string | undefined): StackingMode {
        if (!stackId) return 'none';

        const registration = featureRegistry().find((entry) => entry.type === 'stacking' || entry.type.startsWith('stacking:'));
        const mode = registration ? ((registration.props() as Record<string, unknown>)['mode'] as StackingMode | undefined) : undefined;

        return mode ?? 'normal';
    }

    /* --- Domains and scales ------------------------------------------------------------------- */

    /** The axes actually in play, whether registered explicitly or implied by a series. */
    const activeAxes = computed(() => {
        const registered = axisRegistry();
        const byKey = new Map<string, AxisRegistration>();

        for (const axis of registered) byKey.set(scaleKey(axis.axis, axis.id), axis);

        return byKey;
    });

    /**
     * Every axis' domain, computed without reference to the plot area.
     *
     * Keeping the domain separate from the scale breaks a real circularity: an axis reserves space
     * for its labels, the reservation sets the plot area, and the area sets the scale. If the
     * labels could only be known from the scale, that loop would never close. The label *text*
     * depends only on the domain, so an axis can measure and reserve from this while the scale
     * -- which is the domain plus a pixel range -- is built afterwards.
     *
     * A category axis takes the union of its series' categories, so two series with different but
     * overlapping categories share one domain instead of one silently winning. A value axis takes
     * the extremes of whatever the stacking left behind, which is why this runs after resolution
     * rather than off the raw props.
     */
    const domains = computed<Map<string, AxisDomain>>(() => {
        const series = resolvedSeries().filter((entry) => entry.visible && isCartesian(entry.type));
        const axes = activeAxes();
        const result = new Map<string, AxisDomain>();

        for (const [key, axis] of axes) {
            const props = axis.props();
            const bound = series.filter((entry) => (axis.axis === 'x' ? entry.xAxisId : entry.yAxisId) === axis.id);
            const type = resolveAxisType(props['type'] as AxisType | undefined, axis.axis, bound);

            if (type === 'category') {
                const categories = unionCategories(bound.filter((entry) => !entry.continuousX).map((entry) => (axis.axis === 'y' && entry.yCategories.length > 0 ? entry.yCategories : entry.categories)));
                const sort = props['sort'] as 'value-asc' | 'value-desc' | 'label-asc' | 'label-desc' | undefined;
                const ordered = sort ? sortCategories(categories, (category) => sumAt(bound, category), sort) : categories;

                /*
                 * A heatmap is a matrix, and both of its axes behave like a table's rather than a
                 * bar chart's.
                 *
                 * Its cells tile: the gap between them is the series' own `spacing`, so band
                 * padding on top of that leaves a second, larger gap nobody asked for. And its rows
                 * read downward from the first, like every table -- a value axis runs bottom to top
                 * because it measures, but a row axis only lists.
                 */
                const gridded = bound.some((entry) => entry.type === 'heatmap');
                const rows = gridded && axis.axis === 'y' && props['reversed'] !== true ? [...ordered].reverse() : ordered;

                result.set(key, { kind: 'category', categories: rows, banded: seriesUsesBands(bound), tiled: gridded, padding: numberProp(props['chartPaddingMin']) ?? undefined });
                continue;
            }

            result.set(key, {
                kind: 'value',
                type,
                extent: valueDomain(bound, props, type, axis.axis),
                paddingMin: numberProp(props['chartPaddingMin']) ?? undefined,
                paddingMax: numberProp(props['chartPaddingMax']) ?? undefined
            });
        }

        return result;
    });

    /** Turns each domain into a scale by giving it the pixel range the layout settled on. */
    const scales = computed<Map<string, AxisScale>>(() => {
        const area = chartArea();
        const result = new Map<string, AxisScale>();

        if (area.width <= 0 || area.height <= 0) return result;

        const rtl = options.direction() === 'rtl';

        for (const [key, domain] of domains()) {
            const horizontal = key.startsWith('x:');

            // RTL flips the x range rather than the data, so every downstream position, tooltip
            // placement and zoom direction follows the document without its own special case.
            const range = horizontal ? (rtl ? { start: area.x + area.width, end: area.x } : { start: area.x, end: area.x + area.width }) : { start: area.y + area.height, end: area.y };

            if (domain.kind === 'category') {
                const inner = domain.tiled ? 0 : domain.banded ? 0.2 : 0;
                const outer = domain.padding ?? (domain.tiled ? 0 : domain.banded ? 0.1 : 0.05);

                result.set(key, bandScale(domain.categories, range, inner, outer));
                continue;
            }

            const [min, max] = domain.extent;
            const padded = padRange(range, domain.paddingMin, domain.paddingMax);

            if (domain.type === 'time') {
                result.set(key, timeScale(min, max, padded));
                continue;
            }

            if (domain.type === 'logarithmic') {
                result.set(key, logScale(min, max, padded));
                continue;
            }

            result.set(key, linearScale(min, max, padded));
        }

        return result;
    });

    /**
     * Works out what kind of scale an axis carries.
     *
     * An explicit `type` always wins. Otherwise the role is read from the series bound to the axis:
     * whichever axis they put their categories on is the category axis, and the other is the value
     * axis. That is what makes a bare `<p-chart-y-axis />` a numeric axis on a column chart and a
     * category axis on a horizontal bar chart, without the author restating what the field bindings
     * already said.
     *
     * With nothing bound yet -- the first frame, or a chart mid-construction -- x falls back to
     * category and y to linear, which is the common shape and keeps the empty case harmless.
     */
    function resolveAxisType(explicit: AxisType | undefined, axis: 'x' | 'y', bound: readonly ResolvedSeries[]): AxisType {
        if (explicit) return explicit;
        if (bound.length === 0) return axis === 'x' ? 'category' : 'linear';

        // A heatmap's rows make its y axis categorical too, which is the one case where both axes
        // are categories and neither carries the value.
        if (axis === 'y' && bound.some((entry) => entry.yCategories.length > 0)) return 'category';

        return bound.some((entry) => entry.categoryAxis === axis) ? 'category' : 'linear';
    }

    /**
     * Insets a continuous axis' pixel range by the edge padding.
     *
     * Expressed as a fraction of the pixel range rather than of the domain, which is what the
     * padding props are documented to mean, and the useful definition: it gives a mark near the
     * edge room to be drawn whole regardless of what the data's units happen to be. A negative
     * fraction pushes outward instead, deliberately clipping the data at the edge.
     *
     * Both endpoints move toward each other, so this works unchanged for an inverted y range and
     * for the flipped x range of an RTL chart.
     */
    function padRange(range: { start: number; end: number }, paddingMin: number | undefined, paddingMax: number | undefined): { start: number; end: number } {
        if (!paddingMin && !paddingMax) return range;

        const span = range.end - range.start;
        const direction = Math.sign(span) || 1;
        const length = Math.abs(span);

        return {
            start: range.start + direction * (paddingMin ?? 0) * length,
            end: range.end - direction * (paddingMax ?? 0) * length
        };
    }

    /** Sums what every bound series contributes to one category, for value sorting. */
    function sumAt(series: readonly ResolvedSeries[], category: string): number {
        let total = 0;

        for (const entry of series) {
            for (const point of entry.points) {
                if (point.category === category && point.value != null) total += point.value;
            }
        }

        return total;
    }

    /** Whether the bound series want banded categories, which bars do and lines do not. */
    function seriesUsesBands(series: readonly ResolvedSeries[]): boolean {
        return series.some((entry) => entry.type === 'bar' || entry.type === 'candlestick' || entry.type === 'heatmap');
    }

    /**
     * Works out a value axis' domain.
     *
     * `startFromZero` defaults per series type rather than globally: a bar measures area from a
     * baseline, so cutting its axis exaggerates the differences between bars, whereas a line
     * measures slope and a forced zero flattens the very trend the chart exists to show.
     */
    function valueDomain(series: readonly ResolvedSeries[], props: Record<string, unknown>, type: AxisType, axis: 'x' | 'y'): [number, number] {
        // Which number of a point this axis measures. Only a continuous-x series contributes an x
        // value; everything else is placed on x by its category and measured on y by its value.
        const readAt = (point: SeriesPoint, entry: ResolvedSeries): number | null => {
            // A heatmap encodes its value in colour, so it contributes to no positional domain.
            if (entry.type === 'heatmap') return null;
            if (axis === 'y') return entry.categoryAxis === 'y' ? null : point.value;

            return entry.continuousX ? (point.xValue ?? null) : null;
        };

        let min = Infinity;
        let max = -Infinity;

        for (const entry of series) {
            for (const point of entry.points) {
                const measured = readAt(point, entry);

                if (measured == null) continue;

                min = Math.min(min, measured);
                max = Math.max(max, measured);

                if (axis === 'y' && point.extent) {
                    min = Math.min(min, point.extent[0]);
                    max = Math.max(max, point.extent[1]);
                }

                // A base is only part of the domain when it is a position the mark actually spans
                // from -- a stack's floor, a floating bar's start. A base of 0 is the default every
                // unstacked series carries, and folding that in would drag the minimum of every
                // line chart down to zero. Whether zero belongs there is `startFromZero`'s call.
                if (axis === 'y' && point.base !== 0) {
                    min = Math.min(min, point.base);
                    max = Math.max(max, point.base);
                }
            }
        }

        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            min = 0;
            max = 1;
        }

        const fixedMin = boundProp(props['min']);
        const fixedMax = boundProp(props['max']);
        const softMin = numberProp(props['softMin']);
        const softMax = numberProp(props['softMax']);
        const startFromZero = (props['startFromZero'] as boolean | undefined) ?? series.some((entry) => entry.type === 'bar');

        if (softMin != null) min = Math.min(min, softMin);
        if (softMax != null) max = Math.max(max, softMax);

        if (startFromZero) {
            min = Math.min(min, 0);
            max = Math.max(max, 0);
        }

        if (fixedMin != null) min = fixedMin;
        if (fixedMax != null) max = fixedMax;

        const window = zoomWindow();
        const axisWindow = type === 'time' || type === 'linear' || type === 'logarithmic' ? window.x : null;

        if (axisWindow && fixedMin == null && fixedMax == null) {
            min = axisWindow.min;
            max = axisWindow.max;
        }

        // A fixed bound is honoured exactly; only an automatic domain is rounded out to a tick, so
        // asking for max: 100 does not silently become 120.
        if (fixedMin == null && fixedMax == null && type === 'linear') {
            /*
             * The tick density comes from the axis' own length, the same way the tick generator
             * gets it.
             *
             * The length used here is the chart's, not the plot's: the plot is not known yet, since
             * this domain is what the axis measures its reservation against. It over-estimates by
             * the reservations, which moves the count by at most a tick or two and never reopens
             * the circularity.
             */
            const length = axis === 'y' ? options.height() : options.width();
            const tickCount = numberProp(props['tickCount']) ?? tickCountForLength(length);

            return niceDomain(min, max, tickCount);
        }

        return [min, max];
    }

    /**
     * Downsamples a series when a `ChartDecimation` is present and the series is over its threshold.
     *
     * The samples carry their original index, so a decimated point still finds its own datum for a
     * tooltip -- which is what keeps decimation a rendering decision rather than a data one. A
     * gridded or categorical series is left alone: dropping a category does not summarise it, it
     * hides it.
     */
    function decimated(points: SeriesPoint[], continuousX: boolean): SeriesPoint[] {
        const feature = featureRegistry().find((entry) => entry.type === 'decimation');

        if (!feature) return points;

        const props = feature.props() as ChartDecimationProps;
        const threshold = props.threshold ?? 1000;

        if (points.length <= threshold) return points;

        const samples: Sample[] = [];

        for (const point of points) {
            if (point.value == null) continue;

            samples.push({ x: point.xValue ?? point.dataIndex, y: point.value, index: point.dataIndex });
        }

        if (samples.length === 0) return points;

        const kept = decimate(samples, props.algorithm ?? 'lttb', props.samples ?? 500);
        const keptIndices = new Set(kept.map((sample) => sample.index));

        return points.filter((point) => keptIndices.has(point.dataIndex));
    }

    /** Reads a numeric prop, ignoring `'auto'` and anything unparseable. */
    function numberProp(value: unknown): number | null {
        return typeof value === 'number' && Number.isFinite(value) ? value : null;
    }

    /** Reads an axis bound, which may be a number, a `Date` or an ISO string. */
    function boundProp(value: unknown): number | null {
        if (value === 'auto' || value == null) return null;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (value instanceof Date) return value.getTime();

        if (typeof value === 'string') {
            const parsed = Date.parse(value);

            if (Number.isFinite(parsed)) return parsed;

            return toNumber(value);
        }

        return null;
    }

    const xScale = computed(() => scales().get(scaleKey('x', DEFAULT_AXIS)) ?? [...scales().entries()].find(([key]) => key.startsWith('x:'))?.[1]);
    const yScale = computed(() => scales().get(scaleKey('y', DEFAULT_AXIS)) ?? [...scales().entries()].find(([key]) => key.startsWith('y:'))?.[1]);

    /* --- Visibility --------------------------------------------------------------------------- */

    function isDatasetVisible(datasetId: string): boolean {
        return !hiddenDatasets().has(datasetId);
    }

    function isItemVisible(datasetId: string, index: number): boolean {
        if (!isDatasetVisible(datasetId)) return false;

        return !hiddenItems().get(datasetId)?.has(index);
    }

    function toggleDataset(datasetId: string): void {
        const next = new Set(hiddenDatasets());

        if (next.has(datasetId)) next.delete(datasetId);
        else next.add(datasetId);

        hiddenDatasets.set(next);
        // A dataset toggle drops the hovered point with it: the mark it referred to may no longer
        // be on screen, and a tooltip pinned to a hidden series is worse than no tooltip.
        hover.set(null);
        options.requestRender();
    }

    function toggleItems(datasetId: string, indices: readonly number[]): void {
        const next = new Map(hiddenItems());
        const current = new Set(next.get(datasetId) ?? []);

        for (const index of indices) {
            if (current.has(index)) current.delete(index);
            else current.add(index);
        }

        next.set(datasetId, current);
        hiddenItems.set(next);
        // An item toggle leaves hover alone, unlike a dataset toggle.
        options.requestRender();
    }

    /* --- Registration ------------------------------------------------------------------------- */

    function registerSeries(registration: SeriesRegistration): () => void {
        seriesRegistry.update((list) => [...list, registration]);
        options.requestRender();

        return () => {
            seriesRegistry.update((list) => list.filter((entry) => entry !== registration));
            options.requestRender();
        };
    }

    function registerFeature(registration: FeatureRegistration): () => void {
        featureRegistry.update((list) => [...list, registration]);
        options.requestRender();

        return () => {
            featureRegistry.update((list) => list.filter((entry) => entry !== registration));
            options.requestRender();
        };
    }

    function registerAxis(registration: AxisRegistration): () => void {
        axisRegistry.update((list) => [...list, registration]);
        options.requestRender();

        return () => {
            axisRegistry.update((list) => list.filter((entry) => entry !== registration));
            options.requestRender();
        };
    }

    function reserve(reservation: Signal<LayoutReservation>): () => void {
        reservations.update((list) => [...list, reservation]);

        return () => reservations.update((list) => list.filter((item) => item !== reservation));
    }

    const featureCache = new Map<string, Signal<FeatureRegistration | undefined>>();

    function feature<P>(type: FeatureType): Signal<FeatureRegistration<never> | undefined> {
        const cached = featureCache.get(type);

        if (cached) return cached as never;

        const lookup = computed(() => featureRegistry().find((entry) => entry.type === type));

        featureCache.set(type, lookup);

        return lookup as never;
    }

    /**
     * The chart's data as CSV.
     *
     * One row per category and one column per series, which is the shape both consumers want: the
     * download entry writes it to a file and the screen-reader table renders it. Deriving them from
     * one function is what keeps the announced table and the downloaded file from disagreeing.
     */
    function toCsv(): string {
        const series = resolvedSeries().filter((entry) => entry.visible);

        if (series.length === 0) return '';

        const categories = unionCategories(series.map((entry) => entry.categories));
        const escape = (cell: string) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);
        // An unnamed series is numbered rather than exposing its generated id: `line-2` is an
        // internal handle, and it is the one thing in this table a reader cannot interpret.
        const label = chartText();
        const header = [label.category, ...series.map((entry, index) => String((entry.registration.props() as Record<string, unknown>)['name'] ?? `${label.series} ${index + 1}`))];
        const rows = categories.map((category) => [category, ...series.map((entry) => String(entry.points.find((point) => point.category === category)?.value ?? ''))]);

        return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    }

    const context: ChartContext = {
        renderer: options.renderer,
        chartArea,
        width: options.width,
        height: options.height,
        scales,
        domains,
        xScale,
        yScale,
        theme,
        isDark: options.isDark,
        textColor,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        direction: options.direction,
        locale: options.locale,
        numberFormat: options.numberFormat,
        text: chartText,
        tier,
        container: options.container,
        exportChart: options.exportChart,
        toCsv: () => toCsv(),
        zoomWindow: zoomWindow.asReadonly(),
        setZoomWindow: (window) => {
            zoomWindow.set(window);
            options.requestRender();
        },
        progress,
        hover,
        hiddenDatasets,
        hiddenItems,
        registerSeries,
        registerFeature,
        registerAxis,
        reserve,
        series: seriesRegistry,
        features: featureRegistry,
        axes: axisRegistry,
        feature: feature as ChartContext['feature'],
        isDatasetVisible,
        isItemVisible,
        toggleDataset,
        toggleItems,
        setHover: (next) => {
            hover.set(next);
            options.requestRender();
        },
        requestRender: options.requestRender
    };

    return {
        context,
        layout,
        resolvedSeries,
        domains,
        /**
         * Writable handles the root keeps to itself: a part reads these through the context, but
         * only the root drives them.
         */
        progress: progress as WritableSignal<number>,
        zoomWindow,
        /**
         * The domain a stacked or waterfall group needs, exposed for the axis to reserve against.
         */
        valueExtent: computed<[number, number]>(() => {
            const series = resolvedSeries().filter((entry) => entry.visible);
            const stackGroups = series.filter((entry) => entry.registration.stackId != null);

            if (stackGroups.length) {
                const inputs = new Map<string, Map<string, { base: number; top: number }>>();

                for (const entry of stackGroups) {
                    inputs.set(entry.id, new Map(entry.points.filter((point) => point.value != null).map((point) => [point.category, { base: point.base, top: point.value as number }])));
                }

                return stackedDomain(inputs);
            }

            const waterfalls = series.filter((entry) => entry.registration.waterfall);

            if (waterfalls.length) {
                return waterfallDomain(waterfalls.flatMap((entry) => entry.points.map((point) => ({ base: point.base, top: point.value ?? point.base, isTotal: false, isNegative: false }))));
            }

            let min = Infinity;
            let max = -Infinity;

            for (const entry of series) {
                for (const point of entry.points) {
                    if (point.value == null) continue;

                    min = Math.min(min, point.value);
                    max = Math.max(max, point.value);

                    if (point.base !== 0) {
                        min = Math.min(min, point.base);
                        max = Math.max(max, point.base);
                    }
                }
            }

            return Number.isFinite(min) && Number.isFinite(max) ? [min, max] : [0, 1];
        })
    };
}

/** What {@link createChartState} returns. */
export type ChartStateHandle = ReturnType<typeof createChartState>;

/** Reads the tick values a scale should label. */
export function domainTicks(scale: AxisScale): TickValue[] {
    if (scale.type === 'band') return [...scale.domain];

    return [...scale.domain];
}
