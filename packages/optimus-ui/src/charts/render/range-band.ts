/**
 * The range band: the area between two line series.
 *
 * A high/low range or a confidence interval is one thing to a reader, not two lines that happen to
 * be near each other, so the fill is what carries it. Two modes, and the difference matters: one
 * colour says "this is the band", while dual colour says "which of the two is on top here", which
 * is what a forecast-versus-actual pair needs.
 *
 * Dual colour is why the crossings have to be solved rather than approximated. Filling each half
 * with a clip would leave a hairline at every crossing; splitting the polygon at the exact
 * intersection does not.
 */
import type { ChartRangeProps, ComputedPoint, CurveType, LineSeriesProps, SvgNode } from '@openng/optimus-ui/types/charts';
import { areaPath } from '../core/curve';
import { isGradient } from '../core/color';
import type { ResolvedSeries } from '../charts-state';
import { slotGroup, type DrawContext } from './scene';
import { projectLine } from './series-line';

/** One run of the band, where a single series is on top throughout. */
interface Run {
    upper: ComputedPoint[];
    lower: ComputedPoint[];
    /**
     * Which of the pair is on top in this run: `0` for the first series, `1` for the second.
     */
    owner: 0 | 1;
}

/**
 * Paints the band between a pair of series.
 *
 * The pair is taken in registration order, which is document order: the first `ChartLine` inside
 * the `ChartRange` is the one whose colour fills where it leads.
 */
export function paintRangeBand(ctx: DrawContext, pair: readonly [ResolvedSeries, ResolvedSeries], props: ChartRangeProps): SvgNode[] {
    const [first, second] = pair;
    const firstProps = first.registration.props() as LineSeriesProps;
    const secondProps = second.registration.props() as LineSeriesProps;
    const a = projectLine(ctx, first, firstProps).points;
    const b = projectLine(ctx, second, secondProps).points;

    if (a.length === 0 || b.length === 0) return [];

    const single = props.color;
    const opacity = props.fillOpacity ?? 0.3;
    const curve: CurveType = firstProps.curve ?? 'linear';
    const tension = firstProps.tension ?? 0.5;
    const colors: [string, string] = [colorOf(ctx, first, firstProps), colorOf(ctx, second, secondProps)];
    const nodes: SvgNode[] = [];

    // One colour is one polygon: there is nothing to split, because the band is not saying which
    // series is on top.
    const runs = single != null && typeof single === 'string' ? [{ upper: a, lower: b, owner: 0 as const }] : splitAtCrossings(a, b);

    for (const [index, run] of runs.entries()) {
        if (run.upper.length < 2) continue;

        nodes.push({
            tag: 'path',
            attrs: {
                class: 'p-chart-range-band',
                'data-slot': 'chart-range-band',
                'data-series': run.owner === 0 ? first.id : second.id,
                'data-run': index,
                d: areaPath(run.upper, run.lower, curve, tension),
                fill: typeof single === 'string' ? single : colors[run.owner],
                'fill-opacity': opacity,
                stroke: 'none'
            },
            children: []
        });
    }

    if (nodes.length === 0) return [];

    return [slotGroup('chart-range', { class: 'p-chart-range', 'data-range': props.id ?? '' }, nodes)];
}

/** The colour one edge of the band contributes in dual-colour mode. */
function colorOf(ctx: DrawContext, series: ResolvedSeries, props: LineSeriesProps): string {
    const color = props.color;

    // A gradient cannot be a flat fill for half a band, so the palette slot stands in for it.
    return typeof color === 'string' && !isGradient(color) ? color : ctx.seriesColor(series.seriesIndex);
}

/**
 * Splits the band into runs, each one owned by whichever series is on top.
 *
 * The crossing is interpolated rather than snapped to the nearer vertex, so the two runs meet at a
 * point instead of overlapping by half a segment -- which would show as a notch exactly where the
 * reader is looking.
 */
function splitAtCrossings(a: readonly ComputedPoint[], b: readonly ComputedPoint[]): Run[] {
    const count = Math.min(a.length, b.length);

    if (count < 2) return [];

    const runs: Run[] = [];
    // Screen y grows downward, so the series with the *smaller* y is the one drawn on top.
    let owner: 0 | 1 = a[0].y <= b[0].y ? 0 : 1;
    let upper: ComputedPoint[] = [a[0]];
    let lower: ComputedPoint[] = [b[0]];

    for (let i = 1; i < count; i++) {
        const previousDelta = a[i - 1].y - b[i - 1].y;
        const delta = a[i].y - b[i].y;
        const crossed = previousDelta !== 0 && delta !== 0 && Math.sign(previousDelta) !== Math.sign(delta);

        if (crossed) {
            const t = previousDelta / (previousDelta - delta);
            const meeting: ComputedPoint = {
                x: a[i - 1].x + (a[i].x - a[i - 1].x) * t,
                y: a[i - 1].y + (a[i].y - a[i - 1].y) * t,
                value: null,
                category: a[i].category,
                dataIndex: a[i].dataIndex
            };

            upper.push(meeting);
            lower.push(meeting);
            runs.push({ upper, lower, owner });

            owner = delta < 0 ? 0 : 1;
            upper = [meeting];
            lower = [meeting];
        }

        upper.push(a[i]);
        lower.push(b[i]);
    }

    runs.push({ upper, lower, owner });

    return runs;
}
