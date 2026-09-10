/**
 * Hit-testing: working out what the pointer is over.
 *
 * This runs against the resolved geometry rather than against the DOM, for two reasons. Canvas has
 * no elements to hit at all, so it is the only option there. And even under SVG the nearest mark is
 * often not the one under the cursor: a line chart wants the nearest point along the x axis so the
 * tooltip follows the series between vertices, which no `elementFromPoint` can tell you.
 *
 * Both roots share this, so hover behaves identically in the two renderers.
 */
import type { BarSeriesProps, CandlestickSeriesProps, HeatmapSeriesProps, HoverState, PieSeriesProps, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { isRadial, type ResolvedSeries } from '../charts-state';
import type { ChartContext } from '../charts-registry';
import { containsPoint } from '../core/layout';
import type { DrawContext } from './scene';
import { scaleFor } from './scene';
import { bandSlotFor, groupedBars, projectBars, shouldGroup } from './series-bar';
import { projectCandles } from './series-candlestick';
import { hitTestHeatmap, projectHeatmap, resolveHeatmapScale } from './series-heatmap';
import { hitTestSlices, pieFrame, projectSlices } from './series-pie';
import { hitTestTreemap, projectTreemap } from './series-treemap';

/** A hit, with the pixel position of the mark that was hit. */
export type ChartHit = HoverState;

/**
 * Finds what the pointer is over, or `null`.
 *
 * The pointer has to be inside the plot area for a cartesian chart. A radial chart is tested
 * against its slices instead, since its marks are not bounded by the axes.
 */
export function hitTest(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    const radial = series.filter((entry) => entry.visible && isRadial(entry.type));

    if (radial.length > 0) {
        const hit = hitTestRadial(radial, drawContext, x, y);

        if (hit) return hit;
    }

    if (!containsPoint(drawContext.area, x, y)) return null;

    return hitTestCartesian(context, series, drawContext, x, y);
}

/**
 * Finds the nearest cartesian mark.
 *
 * Distance is measured along x alone, which is what makes a tooltip snap to the category the cursor
 * is over rather than to whichever series happens to pass closest to the cursor's height. That is
 * the documented default for line, area and bar; scatter overrides it because a scatter plot has no
 * category to snap to.
 */
/**
 * One series' answer to "is the pointer on me".
 *
 * `inside` is the important field. A mark the pointer is actually within always wins over one it is
 * merely near, which is what makes a heatmap cell and a bar hover the mark under the cursor rather
 * than the nearest column centre.
 */
interface Candidate {
    hit: ChartHit;
    inside: boolean;
    dx: number;
    dy: number;
}

/** Whether a candidate beats the best so far. */
function better(candidate: Candidate, best: Candidate | null): boolean {
    if (!best) return true;
    if (candidate.inside !== best.inside) return candidate.inside;
    if (candidate.dx !== best.dx) return candidate.dx < best.dx;

    return candidate.dy < best.dy;
}

/**
 * Finds the cartesian mark under the pointer.
 *
 * Distance alone is not enough, and measuring only the x distance -- which is what this used to
 * do -- is wrong in two ways that show up immediately. Every cell in a heatmap column shares an x,
 * so the whole column tied and the first cell always won, whatever row the pointer was on. And in a
 * combo chart the nearest point in x wins even when its series is at the other end of the plot, so
 * the highlight landed on a series the pointer was nowhere near.
 *
 * So each family is asked the question its own geometry answers: a cell, a bar and a treemap
 * rectangle test containment; a scatter point measures a real distance; a line measures x and then
 * breaks the tie on y, which is what keeps a tooltip following one series between its vertices.
 */
function hitTestCartesian(context: ChartContext, series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    let best: Candidate | null = null;
    const grouped = shouldGroup(series);
    const groupMembers = grouped ? groupedBars(series) : [];

    for (const entry of series) {
        if (!entry.visible || isRadial(entry.type)) continue;

        const props = entry.registration.props() as Record<string, unknown>;
        let candidate: Candidate | null = null;

        switch (entry.type) {
            case 'heatmap': {
                const heatmapProps = props as unknown as HeatmapSeriesProps;
                const cell = hitTestHeatmap(projectHeatmap(drawContext, entry, heatmapProps, resolveHeatmapScale(entry, heatmapProps)), x, y);

                if (cell) candidate = { hit: { datasetId: entry.id, index: cell.dataIndex, x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'treemap': {
                const cell = hitTestTreemap(projectTreemap(drawContext, entry, props as unknown as TreemapSeriesProps), x, y);

                if (cell) candidate = { hit: { datasetId: entry.id, index: cell.node.dataIndex, x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }, inside: true, dx: 0, dy: 0 };

                break;
            }
            case 'bar': {
                const barProps = props as unknown as BarSeriesProps;
                const horizontal = barProps.categoryYField != null;
                const categoryScale = scaleFor(drawContext, horizontal ? 'y' : 'x', horizontal ? entry.yAxisId : entry.xAxisId);
                const bandwidth = categoryScale?.type === 'band' ? categoryScale.bandwidth : 0;
                const position = groupMembers.indexOf(entry);
                const slot = bandSlotFor(bandwidth, groupMembers.length || 1, position < 0 ? 0 : position, barProps, grouped && position >= 0);

                for (const bar of projectBars(drawContext, entry, barProps, slot, horizontal)) {
                    // A bar's band is the whole column, so a pointer above a short bar still hovers
                    // it: that is what `snap: 'category'` means, and it is why the cross-axis test
                    // is generous while the along-axis one is exact.
                    const withinBand = horizontal ? y >= bar.y && y <= bar.y + bar.height : x >= bar.x && x <= bar.x + bar.width;

                    if (!withinBand) continue;

                    const centre = { x: bar.x + bar.width / 2, y: bar.y + (bar.isNegative ? bar.height : 0) };
                    const inside = x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height;
                    const next: Candidate = { hit: { datasetId: entry.id, index: bar.dataIndex, x: centre.x, y: centre.y }, inside, dx: 0, dy: inside ? 0 : Math.abs(centre.y - y) };

                    if (better(next, candidate)) candidate = next;
                }

                break;
            }
            case 'candlestick': {
                for (const candle of projectCandles(drawContext, entry, props as unknown as CandlestickSeriesProps)) {
                    const half = Math.max(candle.width / 2, 2);

                    if (Math.abs(candle.x - x) > half) continue;

                    const inside = y >= Math.min(candle.highY, candle.lowY) && y <= Math.max(candle.highY, candle.lowY);

                    candidate = { hit: { datasetId: entry.id, index: candle.dataIndex, x: candle.x, y: candle.closeY }, inside, dx: Math.abs(candle.x - x), dy: inside ? 0 : Math.abs(candle.closeY - y) };
                    break;
                }

                break;
            }
            default: {
                const xScale = scaleFor(drawContext, 'x', entry.xAxisId);
                const yScale = scaleFor(drawContext, 'y', entry.yAxisId);

                if (!xScale) break;

                const continuous = entry.continuousX;

                for (const point of entry.points) {
                    if (point.value == null || !context.isItemVisible(entry.id, point.dataIndex)) continue;

                    const px = continuous ? xScale.scale(point.xValue) : xScale.scale(point.category);

                    if (!Number.isFinite(px)) continue;

                    const py = yScale && yScale.type !== 'band' ? yScale.scale(point.value) : Number.NaN;
                    // A scatter point is placed by two numbers, so both count. A line is placed by
                    // one, so x decides and y only breaks a tie between series.
                    const dx = entry.type === 'scatter' && Number.isFinite(py) ? Math.hypot(px - x, py - y) : Math.abs(px - x);
                    const dy = Number.isFinite(py) ? Math.abs(py - y) : 0;
                    const next: Candidate = { hit: { datasetId: entry.id, index: point.dataIndex, x: px, y: Number.isFinite(py) ? py : y }, inside: false, dx, dy };

                    if (better(next, candidate)) candidate = next;
                }
            }
        }

        if (candidate && better(candidate, best)) best = candidate;
    }

    return best?.hit ?? null;
}

/** Finds the slice under the pointer, testing the topmost ring first. */
function hitTestRadial(series: readonly ResolvedSeries[], drawContext: DrawContext, x: number, y: number): ChartHit | null {
    const frame = pieFrame(drawContext);

    // Reversed so the last-drawn series wins, matching what the reader sees where rings overlap.
    for (const entry of [...series].reverse()) {
        const slices = projectSlices(drawContext, entry, entry.registration.props() as PieSeriesProps, frame);
        const slice = hitTestSlices(slices, frame, x, y);

        if (slice) return { datasetId: entry.id, index: slice.dataIndex, x, y };
    }

    return null;
}
