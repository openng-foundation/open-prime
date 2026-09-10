/**
 * Where each family puts its labels.
 *
 * The rules differ because the marks differ, and each one here is the answer to a question about
 * that mark rather than a style preference. A bar's value belongs just past its end, so the label
 * never sits on the fill -- except in a stack, where there *is* no free end and the segment is the
 * only place left. A slice's label belongs outside the circle on a leader line, because a pie's
 * outer slices are thin and its labels are not. A heatmap cell's belongs in the middle, in whatever
 * colour contrasts with the cell it is sitting on.
 *
 * Collection is separate from painting so that one layout pass sees every label at once: collision
 * detection cannot work on a per-series view, and the per-label font size has to be resolved before
 * any box can be compared.
 */
import type { BarSeriesProps, CandlestickSeriesProps, ChartDataLabelsProps, HeatmapSeriesProps, LineSeriesProps, PieSeriesProps, PolarSeriesProps, RadarSeriesProps, ScatterSeriesProps, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import { resolveColorAccessor } from '../core/accessor';
import { polarToCartesian } from '../core/geometry';
import type { ResolvedSeries } from '../charts-state';
import { labelContext, labelStyle, labelText, magnitudeTotal, shareOf, type LabelInput } from './data-labels';
import type { DrawContext } from './scene';
import { projectBars, type BandSlot } from './series-bar';
import { projectCandles } from './series-candlestick';
import { projectHeatmap, resolveHeatmapScale } from './series-heatmap';
import { projectLine } from './series-line';
import { projectSlices, sliceColor, type PieFrame } from './series-pie';
import { radiusFor, type RadialAxis } from './series-radial';
import { projectScatter } from './series-scatter';
import { projectTreemap } from './series-treemap';

/** What build-scene hands over for one series, once it knows the geometry that series was drawn with. */
export type LabelSource =
    | { kind: 'bar'; series: ResolvedSeries; slot: BandSlot; horizontal: boolean; stacked: boolean }
    | { kind: 'line'; series: ResolvedSeries }
    | { kind: 'scatter'; series: ResolvedSeries }
    | { kind: 'pie'; series: ResolvedSeries; frame: PieFrame }
    | { kind: 'radar'; series: ResolvedSeries; axis: RadialAxis; frame: PieFrame }
    | { kind: 'polar'; series: ResolvedSeries; axis: RadialAxis; frame: PieFrame; sectorCount: number; sectorIndex: number }
    | { kind: 'heatmap'; series: ResolvedSeries }
    | { kind: 'treemap'; series: ResolvedSeries }
    | { kind: 'candlestick'; series: ResolvedSeries };

/** Collects the labels for every source. */
export function collectLabels(ctx: DrawContext, props: ChartDataLabelsProps, sources: readonly LabelSource[]): LabelInput[] {
    const labels: LabelInput[] = [];

    for (const source of sources) {
        switch (source.kind) {
            case 'bar':
                labels.push(...barLabels(ctx, props, source.series, source.slot, source.horizontal, source.stacked));
                break;
            case 'line':
                labels.push(...lineLabels(ctx, props, source.series));
                break;
            case 'scatter':
                labels.push(...scatterLabels(ctx, props, source.series));
                break;
            case 'pie':
                labels.push(...sliceLabels(ctx, props, source.series, source.frame));
                break;
            case 'radar':
                labels.push(...radarLabels(ctx, props, source.series, source.axis, source.frame));
                break;
            case 'polar':
                labels.push(...polarLabels(ctx, props, source.series, source.axis, source.frame, source.sectorCount, source.sectorIndex));
                break;
            case 'heatmap':
                labels.push(...heatmapLabels(ctx, props, source.series));
                break;
            case 'treemap':
                labels.push(...treemapLabels(ctx, props, source.series));
                break;
            case 'candlestick':
                labels.push(...candleLabels(ctx, props, source.series));
                break;
        }
    }

    return labels;
}

/** The colour a mark was painted, which a label sitting on it contrasts against. */
function markColor(ctx: DrawContext, series: ResolvedSeries, dataIndex: number, category: string, value: number): string {
    const props = series.registration.props() as { color?: unknown };
    const context = labelContext(undefined, dataIndex, series.seriesIndex, series.id, value, category);
    const resolved = resolveColorAccessor(props.color as never, context);

    return typeof resolved === 'string' ? resolved : ctx.seriesColor(series.seriesIndex);
}

/**
 * Bar labels.
 *
 * Outside the end when there is a free end, centred in the segment when there is not. A stacked
 * segment has a neighbour immediately past its end, so a label placed there would sit on the next
 * series' fill and read as belonging to it.
 */
function barLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries, slot: BandSlot, horizontal: boolean, stacked: boolean): LabelInput[] {
    const seriesProps = series.registration.props() as BarSeriesProps;
    const bars = projectBars(ctx, series, seriesProps, slot, horizontal);
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const total = magnitudeTotal(series.points.map((point) => point.value));
    const gap = 4;
    const labels: LabelInput[] = [];

    for (const bar of bars) {
        const fill = stacked ? markColor(ctx, series, bar.dataIndex, bar.category, bar.value) : undefined;
        const context = labelContext(data[bar.dataIndex], bar.dataIndex, series.seriesIndex, series.id, bar.value, bar.category);
        const percentage = shareOf(bar.value, total);
        const style = labelStyle(ctx, props, context, fill);
        const text = labelText(props, bar.value, percentage, bar.category, data[bar.dataIndex], ctx.locale);
        const shared = {
            datasetId: series.id,
            dataIndex: bar.dataIndex,
            text,
            fontSize: style.fontSize,
            color: style.color,
            value: bar.value,
            percentage,
            label: bar.category,
            datum: data[bar.dataIndex]
        };

        if (stacked) {
            labels.push({
                ...shared,
                x: bar.x + bar.width / 2,
                y: bar.y + bar.height / 2,
                anchor: 'middle',
                baseline: 'middle',
                fitBox: { width: bar.width, height: bar.height }
            });

            continue;
        }

        if (horizontal) {
            labels.push({
                ...shared,
                x: bar.isNegative ? bar.x - gap : bar.x + bar.width + gap,
                y: bar.y + bar.height / 2,
                anchor: bar.isNegative ? 'end' : 'start',
                baseline: 'middle'
            });

            continue;
        }

        labels.push({
            ...shared,
            x: bar.x + bar.width / 2,
            y: bar.isNegative ? bar.y + bar.height + gap : bar.y - gap,
            anchor: 'middle',
            baseline: bar.isNegative ? 'hanging' : 'auto'
        });
    }

    return labels;
}

/** Line and area labels, above each vertex. */
function lineLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries): LabelInput[] {
    const seriesProps = series.registration.props() as LineSeriesProps;
    const geometry = projectLine(ctx, series, seriesProps);
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const total = magnitudeTotal(series.points.map((point) => point.value));
    const labels: LabelInput[] = [];

    for (const point of geometry.points) {
        if (point.value == null || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;

        const context = labelContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const percentage = shareOf(point.value, total);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex: point.dataIndex,
            x: point.x,
            y: point.y - 8,
            anchor: 'middle',
            baseline: 'auto',
            text: labelText(props, point.value, percentage, point.category, data[point.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            value: point.value,
            percentage,
            label: point.category,
            datum: data[point.dataIndex]
        });
    }

    return labels;
}

/** Scatter and bubble labels, clear of the marker's own radius. */
function scatterLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries): LabelInput[] {
    const seriesProps = series.registration.props() as ScatterSeriesProps;
    const points = projectScatter(ctx, series, seriesProps);
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const total = magnitudeTotal(points.map((point) => point.yValue));
    const labels: LabelInput[] = [];

    for (const point of points) {
        const category = series.points.find((entry) => entry.dataIndex === point.dataIndex)?.category ?? String(point.dataIndex);
        const context = labelContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.yValue, category);
        const percentage = shareOf(point.yValue, total);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex: point.dataIndex,
            x: point.x,
            y: point.y - point.radius - 4,
            anchor: 'middle',
            baseline: 'auto',
            text: labelText(props, point.yValue, percentage, category, data[point.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            value: point.yValue,
            percentage,
            label: category,
            datum: data[point.dataIndex]
        });
    }

    return labels;
}

/**
 * Pie and donut labels, outside the circle on a leader line.
 *
 * The line has three points: it leaves the slice radially, elbows horizontally, and the text sits
 * past the elbow. Leaving radially is what keeps a label attributable to its own slice -- a line
 * that went straight sideways from the centre would cross its neighbours.
 */
function sliceLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries, frame: PieFrame): LabelInput[] {
    const seriesProps = series.registration.props() as PieSeriesProps;
    const slices = projectSlices(ctx, series, seriesProps, frame);
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const minPercentage = props.minPercentage ?? 5;
    const lineStyle = props.lineStyle ?? 'angled';
    const distance = props.distance ?? 10;
    const textGap = props.textGap ?? 4;
    const horizontalOffset = props.horizontalOffset ?? 15;
    const alignTo = props.alignTo ?? 'labelLine';
    const labels: LabelInput[] = [];

    for (const slice of slices) {
        // A slice too thin to hold a label would get one anyway, and a pie's worth of them would
        // pile into an unreadable fan. The threshold is what stops that.
        if (slice.percentage < minPercentage) continue;

        const mid = (slice.startAngle + slice.endAngle) / 2;
        const context = labelContext(data[slice.dataIndex], slice.dataIndex, series.seriesIndex, series.id, slice.value, slice.label);
        const style = labelStyle(ctx, props, context);
        /*
         * The line leaves the slice's own rim but elbows on a ring common to every label.
         *
         * Elbowing at each slice's own radius put a short petal's label right next to the centre
         * while a long petal's sat at the edge -- on a rose, where the radii differ by design, the
         * labels ended up scattered at a dozen different distances instead of reading as one ring
         * around the chart.
         */
        const start = polarToCartesian(frame.center.x, frame.center.y, slice.outerRadius + slice.offset + distance / 2, mid);
        const elbow = polarToCartesian(frame.center.x, frame.center.y, frame.radius + distance + textGap, mid);
        const side: 'left' | 'right' = Math.cos((mid * Math.PI) / 180) < 0 ? 'left' : 'right';
        const direction = side === 'left' ? -1 : 1;
        const end = lineStyle === 'straight' ? elbow : { x: elbow.x + direction * horizontalOffset, y: elbow.y };
        const anchorX = alignTo === 'edge' ? (side === 'left' ? ctx.area.x : ctx.area.x + ctx.area.width) : end.x + direction * textGap;
        const connectorColor = resolveColorAccessor(props.connectorColor, context);

        labels.push({
            datasetId: series.id,
            dataIndex: slice.dataIndex,
            x: anchorX,
            y: end.y,
            anchor: side === 'left' ? 'end' : 'start',
            baseline: 'middle',
            text: labelText(props, slice.value, slice.percentage, slice.label, data[slice.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            side,
            leaderLine: lineStyle === 'none' ? undefined : { x1: start.x, y1: start.y, x2: elbow.x, y2: elbow.y, x3: end.x, y3: end.y },
            connector:
                lineStyle === 'none'
                    ? undefined
                    : {
                          // The slice's own colour, resolved the way the painter resolves it: a
                          // leader line has to match the slice it points at, and the palette slot
                          // is not that colour whenever the series was given one.
                          color: typeof connectorColor === 'string' ? connectorColor : sliceColor(ctx, series, slice, seriesProps, data),
                          width: (props.connectorWidth as number | undefined) ?? 1
                      },
            center: frame.center,
            value: slice.value,
            percentage: slice.percentage,
            label: slice.label,
            datum: data[slice.dataIndex]
        });
    }

    return labels;
}

/** Radar labels, just outside each vertex. */
function radarLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries, axis: RadialAxis, frame: PieFrame): LabelInput[] {
    const seriesProps = series.registration.props() as RadarSeriesProps;
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const step = axis.categories.length > 0 ? 360 / axis.categories.length : 0;
    const total = magnitudeTotal(series.points.map((point) => point.value));
    const minPercentage = props.minPercentage ?? 0;
    const labels: LabelInput[] = [];

    for (const point of series.points) {
        if (point.value == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const index = axis.categories.indexOf(point.category);

        if (index < 0) continue;

        const percentage = shareOf(point.value, total);

        if (percentage < minPercentage) continue;

        const angle = -90 + index * step;
        const at = polarToCartesian(frame.center.x, frame.center.y, radiusFor(axis, point.value, frame) + 10, angle);
        const context = labelContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex: point.dataIndex,
            x: at.x,
            y: at.y,
            anchor: 'middle',
            baseline: 'middle',
            text: labelText(props, point.value, percentage, point.category, data[point.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            center: frame.center,
            value: point.value,
            percentage,
            label: point.category,
            datum: data[point.dataIndex]
        });
    }

    return labels;
}

/** Polar labels, centred in each sector just inside its outer edge. */
function polarLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries, axis: RadialAxis, frame: PieFrame, sectorCount: number, sectorIndex: number): LabelInput[] {
    const seriesProps = series.registration.props() as PolarSeriesProps;
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const sectors = axis.categories.length;

    if (sectors === 0) return [];

    const step = 360 / sectors;
    const slot = step / Math.max(sectorCount, 1);
    const innerRadius = frame.radius * Math.min(Math.max(seriesProps.innerRadius ?? 0, 0), 1);
    const total = magnitudeTotal(series.points.map((point) => point.value));
    const minPercentage = props.minPercentage ?? 0;
    const labels: LabelInput[] = [];

    for (const point of series.points) {
        if (point.value == null || !ctx.isItemVisible(series.id, point.dataIndex)) continue;

        const index = axis.categories.indexOf(point.category);

        if (index < 0) continue;

        const percentage = shareOf(point.value, total);

        if (percentage < minPercentage) continue;

        const angle = -90 + index * step + sectorIndex * slot + slot / 2;
        const outer = radiusFor(axis, point.value, frame, innerRadius);
        const at = polarToCartesian(frame.center.x, frame.center.y, outer + 10, angle);
        const context = labelContext(data[point.dataIndex], point.dataIndex, series.seriesIndex, series.id, point.value, point.category);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex: point.dataIndex,
            x: at.x,
            y: at.y,
            anchor: 'middle',
            baseline: 'middle',
            text: labelText(props, point.value, percentage, point.category, data[point.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            center: frame.center,
            value: point.value,
            percentage,
            label: point.category,
            datum: data[point.dataIndex]
        });
    }

    return labels;
}

/**
 * Heatmap labels, in the middle of each cell.
 *
 * The percentage is the cell's share of the *non-empty* total, because a matrix with holes has no
 * meaningful total that includes them, and the auto-contrast colour comes from the cell's own fill
 * rather than the palette -- the whole point of a heatmap is that each cell has a different one.
 */
function heatmapLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries): LabelInput[] {
    const seriesProps = series.registration.props() as HeatmapSeriesProps;
    const cells = projectHeatmap(ctx, series, seriesProps, resolveHeatmapScale(series, seriesProps));
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const total = magnitudeTotal(cells.map((cell) => cell.value));
    const labels: LabelInput[] = [];

    for (const cell of cells) {
        if (cell.isEmpty || cell.value == null) continue;

        const context = labelContext(data[cell.dataIndex], cell.dataIndex, series.seriesIndex, series.id, cell.value, cell.xLabel);
        const percentage = shareOf(cell.value, total);
        const style = labelStyle(ctx, props, context, cell.color);

        labels.push({
            datasetId: series.id,
            dataIndex: cell.dataIndex,
            x: cell.x + cell.width / 2,
            y: cell.y + cell.height / 2,
            anchor: 'middle',
            baseline: 'middle',
            text: labelText(props, cell.value, percentage, cell.xLabel, data[cell.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            fitBox: { width: cell.width, height: cell.height },
            value: cell.value,
            percentage,
            label: cell.xLabel,
            datum: data[cell.dataIndex]
        });
    }

    return labels;
}

/**
 * Treemap labels: a value line under the leaf's name.
 *
 * Only the leaves get one. A parent's own rectangle is the sum of its children, so labelling it
 * with a value would put the same number on screen twice at two different sizes.
 */
function treemapLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries): LabelInput[] {
    const seriesProps = series.registration.props() as TreemapSeriesProps;
    const cells = projectTreemap(ctx, series, seriesProps);
    const leaves = cells.filter((cell) => (cell.node.children?.length ?? 0) === 0);
    const total = magnitudeTotal(leaves.map((cell) => cell.node.value));
    const labels: LabelInput[] = [];

    for (const cell of leaves) {
        if (cell.width <= 0 || cell.height <= 0) continue;

        const dataIndex = cell.node.dataIndex;
        const context = labelContext(cell.node.datum, dataIndex, series.seriesIndex, series.id, cell.node.value, cell.node.label);
        const percentage = shareOf(cell.node.value, total);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex,
            // The cell's name is already drawn by the treemap painter, centred, so the value line
            // sits directly under it rather than repeating it.
            x: cell.x + cell.width / 2,
            y: cell.y + cell.height / 2 + style.fontSize + 2,
            anchor: 'middle',
            baseline: 'middle',
            text: labelText(props, cell.node.value, percentage, cell.node.label, cell.node.datum, ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            fitBox: { width: cell.width - 8, height: cell.height - 12 },
            value: cell.node.value,
            percentage,
            label: cell.node.label,
            datum: cell.node.datum
        });
    }

    return labels;
}

/** Candlestick labels, clear of the high wick and dropped on a candle too narrow to hold one. */
function candleLabels(ctx: DrawContext, props: ChartDataLabelsProps, series: ResolvedSeries): LabelInput[] {
    const seriesProps = series.registration.props() as CandlestickSeriesProps;
    const candles = projectCandles(ctx, series, seriesProps);
    const data = (seriesProps.data as unknown[] | undefined) ?? [];
    const total = magnitudeTotal(candles.map((candle) => candle.close));
    const labels: LabelInput[] = [];

    for (const candle of candles) {
        const context = labelContext(data[candle.dataIndex], candle.dataIndex, series.seriesIndex, series.id, candle.close, candle.category);
        const percentage = shareOf(candle.close, total);
        const style = labelStyle(ctx, props, context);

        labels.push({
            datasetId: series.id,
            dataIndex: candle.dataIndex,
            x: candle.x,
            y: candle.highY - 6,
            anchor: 'middle',
            baseline: 'auto',
            text: labelText(props, candle.close, percentage, candle.category, data[candle.dataIndex], ctx.locale),
            fontSize: style.fontSize,
            color: style.color,
            // Wider than its own candle and the labels would run into each other, which on a price
            // series is unreadable at any density.
            fitBox: { width: candle.width * 2, height: Number.POSITIVE_INFINITY },
            value: candle.close,
            percentage,
            label: candle.category,
            datum: data[candle.dataIndex]
        });
    }

    return labels;
}
