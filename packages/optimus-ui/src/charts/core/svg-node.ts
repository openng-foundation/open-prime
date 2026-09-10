/**
 * The declarative SVG descriptor.
 *
 * A render function returns one of these rather than touching the DOM, which is what lets the same
 * callback serve both renderers: the SVG renderer stamps the descriptor into elements, and the
 * Canvas renderer paints it. A custom marker written once therefore works under either root.
 */
import type { SvgNode } from '@openng/optimus-ui/types/charts';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Builds an SVG node descriptor.
 *
 * ```ts
 * svgNode('circle', { r: 6, fill: '#5daeea' })
 * ```
 */
export function svgNode(tag: string, attrs: SvgNode['attrs'] = {}, children: SvgNode['children'] = []): SvgNode {
    return { tag, attrs, children };
}

/** True when the value is a node descriptor rather than text. */
export function isSvgNode(value: unknown): value is SvgNode {
    return !!value && typeof value === 'object' && typeof (value as SvgNode).tag === 'string';
}

/** Materializes a descriptor into real SVG elements. */
export function createSvgElement(node: SvgNode, doc: Document): SVGElement {
    const element = doc.createElementNS(SVG_NS, node.tag) as SVGElement;

    for (const [name, value] of Object.entries(node.attrs)) {
        if (value == null || value === false) continue;
        element.setAttribute(name, value === true ? '' : String(value));
    }

    for (const child of node.children) {
        if (typeof child === 'string') {
            element.appendChild(doc.createTextNode(child));
            continue;
        }

        element.appendChild(createSvgElement(child, doc));
    }

    return element;
}

/** Serializes a descriptor to markup, which is what the SVG export path needs. */
export function serializeSvgNode(node: SvgNode): string {
    const attrs = Object.entries(node.attrs)
        .filter(([, value]) => value != null && value !== false)
        .map(([name, value]) => ` ${name}="${escapeAttribute(value === true ? '' : String(value))}"`)
        .join('');

    if (node.children.length === 0) return `<${node.tag}${attrs} />`;

    const children = node.children.map((child) => (typeof child === 'string' ? escapeText(child) : serializeSvgNode(child))).join('');

    return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}

function escapeAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Paints a descriptor onto a canvas context.
 *
 * The subset covered is the one a chart seam actually draws with — shapes, paths, text and groups.
 * Anything outside it is skipped rather than approximated, because a half-painted filter or clip
 * path would diverge from the SVG output in a way that is hard to notice and harder to debug.
 */
export function paintSvgNode(node: SvgNode, ctx: CanvasRenderingContext2D, inherited: PaintState = {}): void {
    const state = mergeState(inherited, node.attrs);

    ctx.save();

    applyTransform(node.attrs.transform, ctx);

    switch (node.tag) {
        case 'g':
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(num(node.attrs.cx), num(node.attrs.cy), num(node.attrs.r), 0, Math.PI * 2);
            strokeAndFill(ctx, state);
            break;
        case 'rect': {
            const radius = num(node.attrs.rx);

            ctx.beginPath();

            if (radius > 0 && typeof ctx.roundRect === 'function') {
                ctx.roundRect(num(node.attrs.x), num(node.attrs.y), num(node.attrs.width), num(node.attrs.height), radius);
            } else {
                ctx.rect(num(node.attrs.x), num(node.attrs.y), num(node.attrs.width), num(node.attrs.height));
            }

            strokeAndFill(ctx, state);
            break;
        }
        case 'line':
            ctx.beginPath();
            ctx.moveTo(num(node.attrs.x1), num(node.attrs.y1));
            ctx.lineTo(num(node.attrs.x2), num(node.attrs.y2));
            applyStroke(ctx, state);
            ctx.stroke();
            break;
        case 'path': {
            const d = node.attrs.d == null ? '' : String(node.attrs.d);

            if (d) {
                const path = new Path2D(d);

                if (state.fill && state.fill !== 'none') {
                    ctx.fillStyle = state.fill;
                    ctx.globalAlpha = state.fillOpacity ?? state.opacity ?? 1;
                    ctx.fill(path);
                }

                if (state.stroke && state.stroke !== 'none') {
                    applyStroke(ctx, state);
                    ctx.stroke(path);
                }
            }

            break;
        }
        case 'polygon':
        case 'polyline': {
            const points = parsePoints(node.attrs.points);

            if (points.length) {
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
                if (node.tag === 'polygon') ctx.closePath();
                strokeAndFill(ctx, state);
            }

            break;
        }
        case 'text': {
            const text = node.children.filter((c): c is string => typeof c === 'string').join('');

            if (text) {
                ctx.font = `${state.fontWeight ?? 'normal'} ${state.fontSize ?? 12}px ${state.fontFamily ?? 'system-ui, sans-serif'}`;
                ctx.textAlign = anchorToAlign(node.attrs['text-anchor']);
                ctx.textBaseline = baselineToCanvas(node.attrs['dominant-baseline']);
                ctx.globalAlpha = state.opacity ?? 1;
                ctx.fillStyle = state.fill && state.fill !== 'none' ? state.fill : (inherited.fill ?? '#000');
                ctx.fillText(text, num(node.attrs.x), num(node.attrs.y));
            }

            break;
        }
        default:
            // An unsupported tag still walks its children, so a wrapper element does not silently
            // drop the content inside it.
            break;
    }

    for (const child of node.children) {
        if (typeof child === 'string') continue;
        paintSvgNode(child, ctx, state);
    }

    ctx.restore();
}

/** The presentation attributes inherited down a descriptor tree while painting. */
export interface PaintState {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    fillOpacity?: number;
    strokeDash?: number[];
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
}

function mergeState(inherited: PaintState, attrs: SvgNode['attrs']): PaintState {
    const next: PaintState = { ...inherited };

    if (attrs.fill != null) next.fill = String(attrs.fill);
    if (attrs.stroke != null) next.stroke = String(attrs.stroke);
    if (attrs['stroke-width'] != null) next.strokeWidth = num(attrs['stroke-width']);
    if (attrs.opacity != null) next.opacity = num(attrs.opacity);
    if (attrs['fill-opacity'] != null) next.fillOpacity = num(attrs['fill-opacity']);
    if (attrs['stroke-dasharray'] != null) next.strokeDash = parseDashArray(attrs['stroke-dasharray']);
    if (attrs['font-size'] != null) next.fontSize = num(attrs['font-size']);
    if (attrs['font-family'] != null) next.fontFamily = String(attrs['font-family']);
    if (attrs['font-weight'] != null) next.fontWeight = String(attrs['font-weight']);
    if (attrs['stroke-linecap'] != null) next.lineCap = String(attrs['stroke-linecap']) as CanvasLineCap;
    if (attrs['stroke-linejoin'] != null) next.lineJoin = String(attrs['stroke-linejoin']) as CanvasLineJoin;

    return next;
}

function strokeAndFill(ctx: CanvasRenderingContext2D, state: PaintState): void {
    if (state.fill !== 'none') {
        ctx.fillStyle = state.fill ?? '#000';
        ctx.globalAlpha = state.fillOpacity ?? state.opacity ?? 1;
        ctx.fill();
    }

    if (state.stroke && state.stroke !== 'none') {
        applyStroke(ctx, state);
        ctx.stroke();
    }
}

function applyStroke(ctx: CanvasRenderingContext2D, state: PaintState): void {
    ctx.strokeStyle = state.stroke ?? '#000';
    ctx.lineWidth = state.strokeWidth ?? 1;
    ctx.globalAlpha = state.opacity ?? 1;
    if (state.lineCap) ctx.lineCap = state.lineCap;
    if (state.lineJoin) ctx.lineJoin = state.lineJoin;
    ctx.setLineDash(state.strokeDash ?? []);
}

const TRANSLATE = /translate\(\s*([-\d.]+)[\s,]*([-\d.]+)?\s*\)/;
const ROTATE = /rotate\(\s*([-\d.]+)(?:[\s,]+([-\d.]+)[\s,]+([-\d.]+))?\s*\)/;
const SCALE = /scale\(\s*([-\d.]+)[\s,]*([-\d.]+)?\s*\)/;

function applyTransform(transform: SvgNode['attrs'][string], ctx: CanvasRenderingContext2D): void {
    if (transform == null) return;

    const value = String(transform);
    const translate = TRANSLATE.exec(value);

    if (translate) ctx.translate(parseFloat(translate[1]), parseFloat(translate[2] ?? '0'));

    const rotate = ROTATE.exec(value);

    if (rotate) {
        const angle = (parseFloat(rotate[1]) * Math.PI) / 180;

        if (rotate[2] != null) {
            const cx = parseFloat(rotate[2]);
            const cy = parseFloat(rotate[3]);

            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.translate(-cx, -cy);
        } else {
            ctx.rotate(angle);
        }
    }

    const scale = SCALE.exec(value);

    if (scale) ctx.scale(parseFloat(scale[1]), parseFloat(scale[2] ?? scale[1]));
}

function num(value: SvgNode['attrs'][string]): number {
    if (typeof value === 'number') return value;
    if (value == null || typeof value === 'boolean') return 0;

    const parsed = parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

function parsePoints(value: SvgNode['attrs'][string]): [number, number][] {
    if (value == null || typeof value === 'boolean') return [];

    const numbers = String(value)
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat)
        .filter(Number.isFinite);
    const points: [number, number][] = [];

    for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);

    return points;
}

function parseDashArray(value: SvgNode['attrs'][string]): number[] {
    if (value == null || typeof value === 'boolean') return [];

    return String(value)
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat)
        .filter(Number.isFinite);
}

function anchorToAlign(anchor: SvgNode['attrs'][string]): CanvasTextAlign {
    switch (anchor) {
        case 'middle':
            return 'center';
        case 'end':
            return 'right';
        default:
            return 'left';
    }
}

function baselineToCanvas(baseline: SvgNode['attrs'][string]): CanvasTextBaseline {
    switch (baseline) {
        case 'central':
        case 'middle':
            return 'middle';
        case 'hanging':
        case 'text-before-edge':
            return 'top';
        case 'text-after-edge':
        case 'ideographic':
            return 'bottom';
        default:
            return 'alphabetic';
    }
}
