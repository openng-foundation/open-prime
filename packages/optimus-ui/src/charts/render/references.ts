/**
 * Reference lines and bands.
 *
 * Both mark a place in the data rather than a datum: a target, a threshold, a period worth calling
 * out. That is why their defaults differ in z-order -- a band is context the data is drawn *over*,
 * while a line is a threshold the data is read *against* and has to stay visible on top of it.
 */
import type { ChartReferenceBandProps, ChartReferenceLineProps, SvgNode } from '@openng/optimus-ui/types/charts';
import type { AxisScale } from '@openng/optimus-ui/types/charts';
import { labelPill } from './data-labels';
import { scaleFor, slotGroup, type DrawContext } from './scene';

/** A resolved edge of a reference, in pixels. */
interface Edge {
    position: number;
    /**
     * Width of the band the value occupies, which is non-zero only on a category axis: a reference
     * at a category covers that category's whole band rather than the hairline at its centre.
     */
    bandwidth: number;
}

/** Places a reference value on an axis. */
function edgeOn(scale: AxisScale | undefined, value: string | number | undefined): Edge | null {
    if (scale == null || value == null) return null;

    if (scale.type === 'band') {
        const start = scale.bandStart(value);

        return Number.isFinite(start) ? { position: start, bandwidth: scale.bandwidth } : null;
    }

    const position = scale.scale(value);

    return Number.isFinite(position) ? { position, bandwidth: 0 } : null;
}

/**
 * Paints a reference line.
 *
 * A line at a category is drawn through the middle of that category's band, because a category has
 * width and a threshold does not -- putting the line at the band's leading edge would make it look
 * as though it belonged between two categories.
 */
export function paintReferenceLine(ctx: DrawContext, props: ChartReferenceLineProps): SvgNode[] {
    const stroke = props.stroke ?? ctx.theme.annotation ?? '#94a3b8';
    const width = props.lineStrokeWidth ?? 1;
    const dash = props.lineDash?.join(' ') ?? null;
    const labelSize = props.labelFontSize ?? 11;
    const labelWeight = props.labelFontWeight ?? 500;
    // The label follows an explicit stroke: a red threshold with a grey label reads as two
    // unrelated things. With no stroke set it follows the theme's text colour instead.
    const labelColor = props.labelColor ?? (props.stroke ? props.stroke : (ctx.theme.tickLabel ?? 'currentColor'));
    const nodes: SvgNode[] = [];

    const vertical = edgeOn(scaleFor(ctx, 'x', 'default'), props.x);
    const horizontal = edgeOn(scaleFor(ctx, 'y', props.yAxisId ?? 'default'), props.y);

    if (vertical) {
        const x = vertical.position + vertical.bandwidth / 2;

        nodes.push(line(x, ctx.area.y, x, ctx.area.y + ctx.area.height, stroke, width, dash, 'x'));

        if (props.label) {
            const placement = props.labelPosition ?? 'end';
            const y = placement === 'start' ? ctx.area.y + ctx.area.height - 6 : placement === 'center' ? ctx.area.y + ctx.area.height / 2 : ctx.area.y + labelSize;

            nodes.push(...labelWith(ctx, props, props.label, x, y, 'middle', labelSize, labelWeight, labelColor));
        }
    }

    if (horizontal) {
        const y = horizontal.position + horizontal.bandwidth / 2;

        nodes.push(line(ctx.area.x, y, ctx.area.x + ctx.area.width, y, stroke, width, dash, 'y'));

        if (props.label) {
            const placement = props.labelPosition ?? 'end';
            const x = placement === 'start' ? ctx.area.x + 6 : placement === 'center' ? ctx.area.x + ctx.area.width / 2 : ctx.area.x + ctx.area.width - 6;
            const anchor = placement === 'start' ? 'start' : placement === 'center' ? 'middle' : 'end';

            nodes.push(...labelWith(ctx, props, props.label, x, y - labelSize / 2 - 2, anchor, labelSize, labelWeight, labelColor));
        }
    }

    if (nodes.length === 0) return [];

    return [slotGroup('chart-reference-line', { class: 'p-chart-reference-line' }, nodes)];
}

/** Paints a reference band. */
export function paintReferenceBand(ctx: DrawContext, props: ChartReferenceBandProps): SvgNode[] {
    const xScale = scaleFor(ctx, 'x', 'default');
    const yScale = scaleFor(ctx, 'y', props.yAxisId ?? 'default');
    const horizontalSpan = span(edgeOn(xScale, props.x1), edgeOn(xScale, props.x2), ctx.area.x, ctx.area.x + ctx.area.width);
    const verticalSpan = span(edgeOn(yScale, props.y1), edgeOn(yScale, props.y2), ctx.area.y, ctx.area.y + ctx.area.height);

    if (!horizontalSpan || !verticalSpan) return [];

    const fill = typeof props.fill === 'string' ? props.fill : (props.fill?.color ?? ctx.theme.bandFill ?? '#0000001a');
    const opacity = (typeof props.fill === 'object' ? props.fill?.opacity : undefined) ?? props.fillOpacity ?? 1;
    const labelSize = props.labelFontSize ?? 11;
    const nodes: SvgNode[] = [
        {
            tag: 'rect',
            attrs: {
                class: 'p-chart-reference-band-fill',
                'data-slot': 'chart-reference-band-fill',
                x: horizontalSpan.from,
                y: verticalSpan.from,
                width: Math.max(horizontalSpan.to - horizontalSpan.from, 0),
                height: Math.max(verticalSpan.to - verticalSpan.from, 0),
                fill,
                'fill-opacity': opacity,
                stroke: props.stroke ?? null
            },
            children: []
        }
    ];

    if (props.label) {
        const placement = props.labelPosition ?? 'center';
        const x = placement === 'start' ? horizontalSpan.from + 6 : placement === 'end' ? horizontalSpan.to - 6 : (horizontalSpan.from + horizontalSpan.to) / 2;
        const anchor = placement === 'start' ? 'start' : placement === 'end' ? 'end' : 'middle';

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-reference-band-label',
                'data-slot': 'chart-reference-band-label',
                x,
                y: verticalSpan.from + labelSize + 2,
                fill: props.labelColor ?? ctx.theme.tickLabel ?? 'currentColor',
                'font-size': labelSize,
                'font-family': ctx.fontFamily,
                'font-weight': String(props.labelFontWeight ?? 500),
                'text-anchor': anchor,
                'dominant-baseline': 'middle'
            },
            children: [props.label]
        });
    }

    return [slotGroup('chart-reference-band', { class: 'p-chart-reference-band' }, nodes)];
}

/**
 * The pixel extent one axis of a band covers.
 *
 * An omitted edge means "as far as the plot goes", which is what makes a one-sided band -- a
 * threshold strip above a value, say -- expressible without repeating the plot's own bounds.
 */
function span(from: Edge | null, to: Edge | null, fallbackFrom: number, fallbackTo: number): { from: number; to: number } | null {
    if (!from && !to) return { from: fallbackFrom, to: fallbackTo };

    const start = from ? from.position : fallbackFrom;
    // A category edge covers its whole band, so the far edge of the band is the far end of the span
    // in whichever direction it was given.
    const end = to ? to.position + to.bandwidth : fallbackTo;
    const lower = Math.min(start, end);
    const upper = Math.max(start, end);

    return { from: lower, to: upper };
}

/** One straight reference line. */
function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width: number, dash: string | null, axis: 'x' | 'y'): SvgNode {
    return {
        tag: 'line',
        attrs: {
            class: 'p-chart-reference-line-stroke',
            'data-slot': 'chart-reference-line-stroke',
            'data-axis': axis,
            x1,
            y1,
            x2,
            y2,
            stroke,
            'stroke-width': width,
            'stroke-dasharray': dash
        },
        children: []
    };
}

/** A reference label, with the rounded pill behind it when one was asked for. */
function labelWith(ctx: DrawContext, props: ChartReferenceLineProps, text: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', fontSize: number, fontWeight: string | number, color: string): SvgNode[] {
    const nodes: SvgNode[] = [];

    if (props.labelBackground) {
        nodes.push(labelPill(ctx, text, x, y, fontSize, anchor, props.labelPadding ?? 5, props.labelBorderRadius ?? 4, props.labelBackground, props.labelBackgroundOpacity ?? 1));
    }

    nodes.push({
        tag: 'text',
        attrs: {
            class: 'p-chart-reference-line-label',
            'data-slot': 'chart-reference-line-label',
            x,
            y,
            fill: color,
            'font-size': fontSize,
            'font-family': ctx.fontFamily,
            'font-weight': String(fontWeight),
            'text-anchor': anchor,
            'dominant-baseline': 'middle'
        },
        children: [text]
    });

    return nodes;
}
