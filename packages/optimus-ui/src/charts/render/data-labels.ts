/**
 * The data-label painter.
 *
 * Labels are the one piece of a chart that has to know about every family at once: a bar labels its
 * end, a slice labels itself from outside on a leader line, a heatmap cell labels its middle in a
 * colour that contrasts with its own fill. Rather than let each painter grow its own labelling
 * code -- and its own answer to "does this collide with the last one" -- every family projects its
 * marks into the same {@link LabelInput}, and one layout pass decides what actually gets drawn.
 *
 * That single pass is the point. Collision detection only works if it sees all the labels, and the
 * per-label font size has to be known before the boxes can be compared, which is why the size
 * accessor is resolved during collection rather than at paint time.
 */
import type { ChartDataLabelsProps, DataLabelContext, FillValue, ItemContext, SvgNode } from '@openng/optimus-ui/types/charts';
import { itemContext, resolveColorAccessor, resolveScalarAccessor } from '../core/accessor';
import { contrastingTextColor } from '../core/color';
import { formatNumberTick } from '../core/format';
import { roundedRectPath } from '../core/geometry';
import type { DrawContext } from './scene';
import { slotGroup } from './scene';

/** One label, resolved but not yet laid out. */
export interface LabelInput {
    datasetId: string;
    dataIndex: number;
    /**
     * Anchor point. The `anchor` and `baseline` say how the text sits against it.
     */
    x: number;
    y: number;
    anchor: 'start' | 'middle' | 'end';
    baseline: 'auto' | 'middle' | 'hanging';
    /**
     * The text, already through `formatter` or `display`.
     */
    text: string;
    /**
     * A second line, drawn under the first. Treemap uses it for the value under the cell name.
     */
    secondLine?: string;
    fontSize: number;
    color: string;
    /**
     * The box the label must fit inside, when it sits on a mark rather than beside one. A label
     * wider than its cell is worse than no label, so it is dropped rather than clipped.
     */
    fitBox?: { width: number; height: number };
    /**
     * Which side of a circular chart the label is on.
     */
    side?: 'left' | 'right';
    /**
     * Leader-line geometry for an outside circular label.
     */
    leaderLine?: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };
    /**
     * Leader-line stroke, when there is one.
     */
    connector?: { color: string; width: number };
    /**
     * Centre of the circle, for the render context.
     */
    center?: { x: number; y: number };
    /**
     * The values the render context carries.
     */
    value: number;
    percentage: number;
    label: string;
    datum: unknown;
    /**
     * Labels that must never be dropped by collision resolution, because dropping one would leave
     * the chart looking as if a mark had no value. Outside circular labels are pushed apart
     * instead.
     */
    pinned?: boolean;
}

/** The text a label shows, following `formatter` then `display`. */
export function labelText(props: ChartDataLabelsProps, value: number, percentage: number, label: string, datum: unknown, locale: string | undefined): string {
    if (props.formatter) return props.formatter(value, percentage, label, datum);

    switch (props.display ?? 'value') {
        case 'none':
            return '';
        case 'percentage':
            return `${formatNumberTick(percentage, locale, { maximumFractionDigits: 1 })}%`;
        case 'both':
            return `${formatNumberTick(value, locale)} (${formatNumberTick(percentage, locale, { maximumFractionDigits: 1 })}%)`;
        case 'label':
            return label;
        case 'label-percentage':
            return `${label} ${formatNumberTick(percentage, locale, { maximumFractionDigits: 1 })}%`;
        default:
            return formatNumberTick(value, locale);
    }
}

/**
 * Resolves the font size and colour for one label.
 *
 * `onFill` is the mark's own colour, and it is what makes the default colour auto-contrasting: a
 * label sitting inside a dark bar has to be light and one inside a pale cell has to be dark, so the
 * fallback is computed from the fill rather than fixed. A label sitting *beside* a mark passes no
 * fill and falls back to the theme's text colour, which is the right answer there.
 */
export function labelStyle(ctx: DrawContext, props: ChartDataLabelsProps, context: ItemContext<unknown>, onFill?: string): { fontSize: number; color: string } {
    const fontSize = (resolveScalarAccessor(props.fontSize, context, Math.max(ctx.fontSize - 1, 9)) as number) ?? Math.max(ctx.fontSize - 1, 9);

    if (onFill) context.fillColor = onFill;

    const resolved = resolveColorAccessor(props.color as FillValue | undefined, context);
    const color = typeof resolved === 'string' ? resolved : onFill ? contrastingTextColor(onFill) : (ctx.theme.dataLabel ?? ctx.theme.tickLabel ?? 'currentColor');

    return { fontSize, color };
}

/** Builds the item context a label's accessors read. */
export function labelContext(datum: unknown, dataIndex: number, seriesIndex: number, datasetId: string, value: number, category: string): ItemContext<unknown> {
    return itemContext(datum, dataIndex, seriesIndex, datasetId, value, category);
}

/** The share one value holds of a series total, as a percentage. */
export function shareOf(value: number, total: number): number {
    return total === 0 ? 0 : (Math.abs(value) / total) * 100;
}

/** Sums the magnitudes of a series' values, which is what a percentage is measured against. */
export function magnitudeTotal(values: readonly (number | null)[]): number {
    let total = 0;

    for (const value of values) {
        if (value != null && Number.isFinite(value)) total += Math.abs(value);
    }

    return total;
}

/** A laid-out label's box, used for collision detection. */
interface LabelBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/**
 * Paints the collected labels.
 *
 * Two things happen here that cannot happen during collection. Outside circular labels are pushed
 * apart along their own side, because resolving them one at a time would let the second label
 * decide it collides with the first and vanish -- on a pie that reads as a missing slice. Everything
 * else is resolved greedily: a label that overlaps one already placed is dropped, which is the only
 * honest option for a bar chart too dense to label.
 */
export function paintDataLabels(ctx: DrawContext, props: ChartDataLabelsProps, inputs: readonly LabelInput[]): SvgNode[] {
    if (inputs.length === 0) return [];

    const lineHeight = props.lineHeight ?? 1.2;
    const fontFamily = props.fontFamily ?? ctx.fontFamily;
    const fontWeight = props.fontWeight ?? 'normal';
    const spread = spreadOutside(ctx, inputs, lineHeight);
    const placed: LabelBox[] = [];
    const nodes: SvgNode[] = [];

    for (const input of spread) {
        if (input.text === '' && !input.secondLine) continue;

        const custom = props.render ? props.render(renderContextFor(ctx, input)) : undefined;

        // A custom renderer that returned text replaces the label's text; one that drew for itself
        // and returned nothing replaces the label outright.
        if (props.render && typeof custom !== 'string') continue;

        const text = typeof custom === 'string' ? custom : input.text;
        const width = ctx.measureText(text, input.fontSize, fontFamily);
        const secondWidth = input.secondLine ? ctx.measureText(input.secondLine, input.fontSize, fontFamily) : 0;
        const lines = input.secondLine ? 2 : 1;
        const height = input.fontSize * lineHeight * lines;

        // A label on a mark has to fit the mark. Auto-sizing it down instead would produce a
        // three-pixel label nobody can read.
        if (input.fitBox && (Math.max(width, secondWidth) > input.fitBox.width || height > input.fitBox.height)) continue;

        const box = boxFor(input, Math.max(width, secondWidth), height);

        if (!input.pinned && placed.some((other) => overlaps(box, other))) continue;

        placed.push(box);

        if (input.leaderLine && input.connector) {
            const { x1, y1, x2, y2, x3, y3 } = input.leaderLine;

            nodes.push({
                tag: 'path',
                attrs: {
                    class: 'p-chart-data-label-connector',
                    'data-slot': 'chart-data-label-connector',
                    'data-series': input.datasetId,
                    'data-index': input.dataIndex,
                    d: `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`,
                    fill: 'none',
                    stroke: input.connector.color,
                    'stroke-width': input.connector.width,
                    opacity: ctx.progress
                },
                children: []
            });
        }

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-data-label',
                'data-slot': 'chart-data-label',
                'data-series': input.datasetId,
                'data-index': input.dataIndex,
                x: input.x,
                y: input.y,
                fill: input.color,
                'font-size': input.fontSize,
                'font-family': fontFamily,
                'font-weight': String(fontWeight),
                'text-anchor': input.anchor,
                'dominant-baseline': input.baseline,
                opacity: ctx.progress
            },
            children: [text]
        });

        if (!input.secondLine) continue;

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-data-label p-chart-data-label-secondary',
                'data-slot': 'chart-data-label-value',
                'data-series': input.datasetId,
                'data-index': input.dataIndex,
                x: input.x,
                y: input.y + input.fontSize * lineHeight,
                fill: input.color,
                'font-size': input.fontSize,
                'font-family': fontFamily,
                'font-weight': String(fontWeight),
                'text-anchor': input.anchor,
                'dominant-baseline': input.baseline,
                opacity: ctx.progress * 0.75
            },
            children: [input.secondLine]
        });
    }

    if (nodes.length === 0) return [];

    return [slotGroup('chart-data-labels', { class: 'p-chart-data-labels' }, nodes)];
}

/** The box a label occupies, given how its text sits against its anchor. */
function boxFor(input: LabelInput, width: number, height: number): LabelBox {
    const left = input.anchor === 'start' ? input.x : input.anchor === 'end' ? input.x - width : input.x - width / 2;
    const top = input.baseline === 'hanging' ? input.y : input.baseline === 'middle' ? input.y - height / 2 : input.y - height;

    return { left, top, right: left + width, bottom: top + height };
}

/** Whether two boxes touch. */
function overlaps(a: LabelBox, b: LabelBox): boolean {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Pushes the outside circular labels apart.
 *
 * Slices arrive in angular order, so walking each side from the top and forcing a minimum gap
 * resolves the whole column in one pass. The leader line's last segment follows the text, so a
 * pushed label keeps pointing at its own slice rather than drifting away from the line that
 * belongs to it.
 */
function spreadOutside(ctx: DrawContext, inputs: readonly LabelInput[], lineHeight: number): LabelInput[] {
    const outside = inputs.filter((input) => input.leaderLine != null);

    if (outside.length === 0) return [...inputs];

    const adjusted = new Map<LabelInput, LabelInput>();

    for (const side of ['left', 'right'] as const) {
        const column = outside.filter((input) => input.side === side).sort((a, b) => a.y - b.y);
        let previousBottom = Number.NEGATIVE_INFINITY;

        for (const input of column) {
            const gap = input.fontSize * lineHeight;
            const y = Math.max(input.y, previousBottom + gap);

            previousBottom = y;

            if (y === input.y) continue;

            const line = input.leaderLine!;

            adjusted.set(input, { ...input, y, leaderLine: { ...line, y3: y }, pinned: true });
        }
    }

    return inputs.map((input) => adjusted.get(input) ?? (input.leaderLine ? { ...input, pinned: true } : input));
}

/** Builds the context a custom renderer receives. */
function renderContextFor(ctx: DrawContext, input: LabelInput): DataLabelContext {
    return {
        index: input.dataIndex,
        value: input.value,
        datum: input.datum,
        percentage: input.percentage,
        formattedText: input.text,
        label: input.label,
        color: input.color,
        x: input.x,
        y: input.y,
        side: input.side,
        leaderLine: input.leaderLine,
        center: input.center
    };
}

/**
 * A rounded pill behind a label.
 *
 * Only the reference line and band use it, but it lives here because it has to measure the text the
 * same way the label itself does -- two answers to "how wide is this text" would leave the pill and
 * the text disagreeing.
 */
export function labelPill(ctx: DrawContext, text: string, x: number, y: number, fontSize: number, anchor: 'start' | 'middle' | 'end', padding: number, radius: number, fill: string, opacity: number): SvgNode {
    const width = ctx.measureText(text, fontSize) + padding * 2;
    const height = fontSize + padding * 2;
    const left = anchor === 'start' ? x - padding : anchor === 'end' ? x - width + padding : x - width / 2;

    return {
        tag: 'path',
        attrs: {
            class: 'p-chart-reference-label-background',
            'data-slot': 'chart-reference-label-background',
            d: roundedRectPath(left, y - height / 2, width, height, radius),
            fill,
            opacity
        },
        children: []
    };
}
