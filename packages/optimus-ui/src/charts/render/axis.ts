/**
 * The axis painter: ticks, labels, grid lines and the axis title.
 *
 * An axis is also what reserves the space it needs, so the plot area and the axis agree on where
 * the labels go. The reservation is measured from the rendered labels rather than guessed, because
 * a guess that is too small clips the text and a guess that is too large leaves a visible gap.
 */
import type { AxisPosition, AxisScale, AxisType, BaseAxisProps, SvgNode, TickValue } from '@openng/optimus-ui/types/charts';
import { formatNumberTick, formatTimeTick, formatTickValue } from '../core/format';
import { lineHeightOf, rotatedBounds } from '../core/layout';
import { linearTicks, logTicks, pickTimeStep, skipCollisions, timeTicks } from '../core/ticks';
import { type DrawContext, slotGroup } from './scene';

/** One tick, resolved into a value, a label and a pixel position. */
export interface ResolvedTick {
    value: TickValue;
    label: string;
    position: number;
    index: number;
}

/** The axis' resolved geometry and content. */
export interface AxisRender {
    /**
     * The ticks that survived the collision pass.
     */
    ticks: ResolvedTick[];
    /**
     * Every tick, before skipping, which the minor grid subdivides between.
     */
    allTicks: ResolvedTick[];
    /**
     * Rotation actually applied to the labels, in degrees.
     */
    rotation: number;
    /**
     * Space the axis needs on its edge, in pixels.
     */
    reservation: number;
}

/** Which of the two axes an edge belongs to. */
export function axisOfPosition(position: AxisPosition): 'x' | 'y' {
    return position === 'top' || position === 'bottom' ? 'x' : 'y';
}

/** The default edge for each axis. */
export function defaultPosition(axis: 'x' | 'y'): AxisPosition {
    return axis === 'x' ? 'bottom' : 'left';
}

/** Pixels of axis each automatic tick is given, before the labels are measured for collisions. */
const PIXELS_PER_TICK = 40;

/** The narrowest and widest automatic tick counts, so a tiny or enormous axis stays sensible. */
const AUTO_TICK_BOUNDS = { min: 2, max: 12 };

/**
 * How many ticks an axis gets when `tickCount` is left on `auto`.
 *
 * Derived from the axis' pixel length rather than fixed, because a fixed count crowds a short chart
 * and leaves a tall one sparse. The collision pass afterwards can still thin these; what it cannot
 * do is invent ticks that were never generated.
 */
export function autoTickCount(scale: AxisScale): number {
    return tickCountForLength(Math.abs(scale.range[1] - scale.range[0]));
}

/**
 * The same rule, from a raw pixel length.
 *
 * The domain has to be niced before any scale exists -- that is what breaks the circularity between
 * an axis' reservation and the plot it is measured against -- so it needs this without a scale to
 * ask. Sharing the rule is the point: nicing the domain to one density and drawing the ticks at
 * another rounded the domain out further than the ticks needed, so a series running 28 to 81 got an
 * axis of 20 to 90 with ticks every 5.
 */
export function tickCountForLength(length: number): number {
    if (!Number.isFinite(length) || length <= 0) return AUTO_TICK_BOUNDS.min;

    return Math.min(Math.max(Math.round(length / PIXELS_PER_TICK), AUTO_TICK_BOUNDS.min), AUTO_TICK_BOUNDS.max);
}

/**
 * Generates the tick values for a scale.
 *
 * A band scale's ticks are its categories, so there is nothing to compute. A continuous scale gets
 * the nice-number or calendar treatment, which is what keeps the labels readable.
 */
export function generateTicks(scale: AxisScale, props: BaseAxisProps, type: AxisType): TickValue[] {
    if (scale.type === 'band') return [...scale.domain];

    const [min, max] = scale.domain;
    const count = props.tickCount ?? autoTickCount(scale);

    if (props.tickInterval != null && props.tickInterval > 0) {
        const ticks: TickValue[] = [];

        // Guarded: a tiny interval over a wide domain should degrade to fewer ticks rather than
        // spin building millions of them.
        for (let value = Math.ceil(min / props.tickInterval) * props.tickInterval, guard = 0; value <= max && guard < 1000; value += props.tickInterval, guard++) {
            ticks.push(value);
        }

        return ticks;
    }

    if (type === 'time') {
        return timeTicks(min, max, count, props.tickConfig ? { unit: props.tickConfig.unit, step: props.tickConfig.step } : undefined);
    }

    if (type === 'logarithmic') return logTicks(min, max);

    return linearTicks(min, max, count);
}

/** Formats one tick, honouring whichever form `tickFormat` took. */
export function formatTick(value: TickValue, index: number, props: BaseAxisProps, type: AxisType, locale: string | undefined, spanMs: number): string {
    const format = props.tickFormat;

    if (typeof format === 'function') return format(value, index);

    if (type === 'time') {
        const time = value instanceof Date ? value.getTime() : Number(value);
        const unit = props.tickConfig?.unit ?? pickTimeStep(spanMs, props.tickCount ?? 6).unit;

        return formatTimeTick(time, unit, locale, props.dateTimeFormats, props.timezone);
    }

    if (typeof value === 'number') return formatNumberTick(value, locale, format);

    return formatTickValue(value, locale, format);
}

/**
 * Resolves an axis: which ticks to draw, at what rotation, and how much room that needs.
 *
 * The order matters. Labels are formatted first, then measured, then thinned, and only then is the
 * rotation decided — auto-rotating before knowing whether the labels actually collide would tilt
 * text that had room to stay flat.
 */
export function resolveAxis(ctx: DrawContext, scale: AxisScale, props: BaseAxisProps, position: AxisPosition, type: AxisType): AxisRender {
    const axis = axisOfPosition(position);
    const horizontal = axis === 'x';
    const spanMs = scale.type === 'band' ? 0 : scale.domain[1] - scale.domain[0];
    const fontSize = props.tickStyle && typeof props.tickStyle === 'object' ? (props.tickStyle.fontSize ?? ctx.fontSize) : ctx.fontSize;
    const values = generateTicks(scale, props, type);

    const allTicks: ResolvedTick[] = values.map((value, index) => ({
        value,
        label: formatTick(value, index, props, type, ctx.locale, spanMs),
        position: scale.scale(value instanceof Date ? value.getTime() : value),
        index
    }));

    /*
     * Only the ticks that land inside the plot survive.
     *
     * `linearTicks` rounds outward so an axis can end on a round number, and the domain is niced for
     * the tick count it can know about -- but the count actually used is derived from the axis'
     * pixel length, which the domain never sees. The two can disagree, and when they do the extra
     * ticks are drawn outside the plot: a "185" label sitting 39px above the top of the chart. The
     * scale is the authority on what is on screen, so anything outside its range goes.
     */
    const drawable = allTicks.filter((tick) => Number.isFinite(tick.position) && withinRange(tick.position, scale.range));
    const labelWidths = drawable.map((tick) => ctx.measureText(tick.label, fontSize));
    const widest = labelWidths.length ? Math.max(...labelWidths) : 0;

    let rotation = props.tickRotation ?? 0;
    let ticks = drawable;

    if (horizontal) {
        const step = scale.type === 'band' ? scale.step : drawable.length > 1 ? Math.abs(drawable[1].position - drawable[0].position) : ctx.area.width;
        const spacing = props.labelMinSpacing ?? 6;
        const needed = widest + spacing;

        // Rotation is preferred over skipping, because a tilted label still says what it says
        // whereas a skipped one is gone.
        if (needed > step && (props.autoRotate ?? true) && rotation === 0) {
            rotation = props.autoRotateAngle ?? -45;
        }

        if (props.autoSkip ?? true) {
            const minDistance = props.minGridDistance ?? rotatedBounds(widest, lineHeightOf(fontSize), rotation).width + spacing;

            ticks = skipCollisions(drawable, (tick) => tick.position, minDistance);
        }
    } else if (props.autoSkip ?? true) {
        const minDistance = props.minGridDistance ?? lineHeightOf(fontSize) + (props.labelMinSpacing ?? 6);

        ticks = skipCollisions(drawable, (tick) => tick.position, minDistance);
    }

    if (props.showFirstLabel === false) ticks = ticks.filter((tick) => tick.index !== 0);
    if (props.showLastLabel === false) ticks = ticks.filter((tick) => tick.index !== allTicks.length - 1);

    return { ticks, allTicks: drawable, rotation, reservation: reserveFor(ctx, props, position, ticks, rotation, widest, fontSize) };
}

/** Whether a pixel position lies within a scale's range, whichever way the range runs. */
function withinRange(position: number, range: readonly [number, number]): boolean {
    const [start, end] = range;
    const lower = Math.min(start, end);
    const upper = Math.max(start, end);
    // A half-pixel of slack, so a tick sitting exactly on the edge is not lost to rounding.
    const slack = 0.5;

    return position >= lower - slack && position <= upper + slack;
}

/** How much space the axis asks the layout to keep for it. */
function reserveFor(ctx: DrawContext, props: BaseAxisProps, position: AxisPosition, ticks: readonly ResolvedTick[], rotation: number, widest: number, fontSize: number): number {
    if (props.visible === false) return 0;

    const style = props.tickStyle && typeof props.tickStyle === 'object' ? props.tickStyle : {};
    const tickLength = props.showTicks === false ? 0 : (style.tickLength ?? 6);
    const padding = style.padding ?? 8;
    const titleHeight = props.label ? lineHeightOf(fontSize + 2) + 4 : 0;

    if (props.showLabels === false) return tickLength + titleHeight;

    if (axisOfPosition(position) === 'x') {
        const labelBox = rotatedBounds(widest, lineHeightOf(fontSize), rotation);

        return tickLength + padding + labelBox.height + titleHeight;
    }

    return tickLength + padding + widest + titleHeight;
}

/** Paints the axis line, its ticks and its labels. */
export function paintAxis(ctx: DrawContext, render: AxisRender, props: BaseAxisProps, position: AxisPosition, axisId: string): SvgNode[] {
    if (props.visible === false) return [];

    const style = props.tickStyle && typeof props.tickStyle === 'object' ? props.tickStyle : {};
    const axis = axisOfPosition(position);
    const horizontal = axis === 'x';
    const color = props.color ?? ctx.theme.axes?.[horizontal ? 0 : 1] ?? ctx.theme.axes?.[0] ?? 'currentColor';
    const labelColor = style.color ?? props.color ?? ctx.theme.tickLabel ?? 'currentColor';
    const fontSize = style.fontSize ?? ctx.fontSize;
    const tickLength = style.tickLength ?? 6;
    const padding = style.padding ?? 8;
    const inside = props.tickPosition === 'inside';
    const nodes: SvgNode[] = [];

    const edge = edgeOf(ctx, position);

    if (props.showLine !== false) {
        nodes.push({
            tag: 'line',
            attrs: {
                class: 'p-chart-axis-line',
                'data-slot': 'chart-axis-line',
                x1: horizontal ? ctx.area.x : edge,
                y1: horizontal ? edge : ctx.area.y,
                x2: horizontal ? ctx.area.x + ctx.area.width : edge,
                y2: horizontal ? edge : ctx.area.y + ctx.area.height,
                stroke: color,
                'stroke-width': style.tickStrokeWidth ?? 1
            },
            children: []
        });
    }

    const direction = position === 'bottom' || position === 'right' ? 1 : -1;
    const tickSign = inside ? -direction : direction;

    for (const tick of render.ticks) {
        if (props.showTicks !== false && tickLength > 0) {
            nodes.push({
                tag: 'line',
                attrs: {
                    class: 'p-chart-tick',
                    'data-slot': 'chart-axis-tick',
                    x1: horizontal ? tick.position : edge,
                    y1: horizontal ? edge : tick.position,
                    x2: horizontal ? tick.position : edge + tickLength * tickSign,
                    y2: horizontal ? edge + tickLength * tickSign : tick.position,
                    stroke: style.tickColor ?? color,
                    'stroke-width': style.tickStrokeWidth ?? 1
                },
                children: []
            });
        }

        if (props.showLabels === false) continue;

        const offset = (props.showTicks === false ? 0 : tickLength) + padding;
        const x = horizontal ? tick.position : edge + offset * direction;
        const y = horizontal ? edge + offset * direction : tick.position;

        nodes.push({
            tag: 'text',
            attrs: {
                class: 'p-chart-tick-label',
                'data-slot': 'chart-tick-label',
                x,
                y,
                fill: labelColor,
                'font-size': fontSize,
                'font-family': style.fontFamily ?? ctx.fontFamily,
                'font-weight': style.fontWeight ?? 'normal',
                'text-anchor': labelAnchor(position, render.rotation, ctx.direction),
                'dominant-baseline': labelBaseline(position, render.rotation),
                transform: render.rotation ? `rotate(${render.rotation} ${x} ${y})` : null
            },
            children: [tick.label]
        });
    }

    if (props.label) {
        // The title reads the axis colour, not the tick label's: it names the axis rather than
        // annotating a tick, which is why the reference gives the two the same alias as the axis
        // line and its ticks.
        nodes.push(paintAxisTitle(ctx, props.label, position, props.color ?? ctx.theme.axes?.[axisOfPosition(position) === 'x' ? 0 : 1] ?? labelColor, fontSize, render));
    }

    return [slotGroup('chart-axis', { class: `p-chart-axis p-chart-axis-${axis}`, 'data-axis': axis, 'data-axis-id': axisId, 'data-position': position }, nodes)];
}

/** Paints the axis title, centred along the axis and outside its labels. */
function paintAxisTitle(ctx: DrawContext, label: string, position: AxisPosition, color: string, fontSize: number, render: AxisRender): SvgNode {
    const horizontal = axisOfPosition(position) === 'x';
    const centre = horizontal ? ctx.area.x + ctx.area.width / 2 : ctx.area.y + ctx.area.height / 2;
    const edge = edgeOf(ctx, position);
    const direction = position === 'bottom' || position === 'right' ? 1 : -1;
    const distance = render.reservation - lineHeightOf(fontSize) / 2;
    const x = horizontal ? centre : edge + distance * direction;
    const y = horizontal ? edge + distance * direction : centre;

    return {
        tag: 'text',
        attrs: {
            class: 'p-chart-axis-title',
            'data-slot': 'chart-axis-title',
            x,
            y,
            fill: color,
            // The title names what the axis measures, so it carries more weight than the tick
            // labels that read against it -- otherwise the two rows compete at the same voice.
            'font-size': fontSize + 2,
            'font-weight': 700,
            'font-family': ctx.fontFamily,
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            // A vertical axis title reads bottom-to-top, which is the convention everywhere except
            // a right-hand axis, where top-to-bottom keeps it facing out of the chart.
            transform: horizontal ? null : `rotate(${position === 'right' ? 90 : -90} ${x} ${y})`
        },
        children: [label]
    };
}

/** The pixel the axis sits on. */
export function edgeOf(ctx: DrawContext, position: AxisPosition): number {
    switch (position) {
        case 'top':
            return ctx.area.y;
        case 'bottom':
            return ctx.area.y + ctx.area.height;
        case 'left':
            return ctx.area.x;
        default:
            return ctx.area.x + ctx.area.width;
    }
}

/** Where a tick label anchors, given its edge and rotation. */
function labelAnchor(position: AxisPosition, rotation: number, direction: 'ltr' | 'rtl'): string {
    if (axisOfPosition(position) === 'y') {
        // A left axis' labels sit to its left and so end at it; RTL mirrors that.
        const leftSide = position === 'left';

        return (direction === 'rtl' ? !leftSide : leftSide) ? 'end' : 'start';
    }

    if (rotation === 0) return 'middle';

    return rotation < 0 ? 'end' : 'start';
}

/** Where a tick label sits vertically, given its edge and rotation. */
function labelBaseline(position: AxisPosition, rotation: number): string {
    if (axisOfPosition(position) === 'y') return 'central';
    if (rotation !== 0) return 'central';

    return position === 'top' ? 'text-after-edge' : 'text-before-edge';
}

/**
 * Paints the grid lines, the minor grid and the alternating bands.
 *
 * `gridLines` defaults to `auto`, which means on for the value axis and off for the category axis.
 * That is not arbitrary: a grid line's job is to let a reader carry a mark's height back to a
 * number, and a category axis has no numbers to carry back to. Drawing them there just adds
 * vertical rules between bands that the band spacing already separates.
 */
export function paintGrid(ctx: DrawContext, render: AxisRender, props: BaseAxisProps, position: AxisPosition, axisId: string, type: AxisType): SvgNode[] {
    if (props.visible === false) return [];

    const horizontal = axisOfPosition(position) === 'x';
    const showGrid = props.gridLines ?? type !== 'category';
    const nodes: SvgNode[] = [];

    if (props.alternateGridColor) {
        nodes.push(...paintAlternatingBands(ctx, render, props, horizontal));
    }

    if (props.minorGridLines) {
        nodes.push(...paintMinorGrid(ctx, render, props, horizontal));
    }

    if (showGrid) {
        for (const tick of render.ticks) {
            nodes.push({
                tag: 'line',
                attrs: {
                    class: 'p-chart-grid-line',
                    'data-slot': 'chart-grid-line',
                    x1: horizontal ? tick.position : ctx.area.x,
                    y1: horizontal ? ctx.area.y : tick.position,
                    x2: horizontal ? tick.position : ctx.area.x + ctx.area.width,
                    y2: horizontal ? ctx.area.y + ctx.area.height : tick.position,
                    stroke: props.gridColor ?? ctx.theme.grid ?? 'currentColor',
                    'stroke-width': props.gridStrokeWidth ?? 1,
                    'stroke-opacity': props.gridOpacity ?? 1,
                    'stroke-dasharray': dashOf(props.gridStyle)
                },
                children: []
            });
        }
    }

    if (nodes.length === 0) return [];

    return [slotGroup('chart-grid', { class: 'p-chart-grid', 'data-axis-id': axisId }, nodes)];
}

/** Paints the minor grid lines between the major ticks. */
function paintMinorGrid(ctx: DrawContext, render: AxisRender, props: BaseAxisProps, horizontal: boolean): SvgNode[] {
    const subdivisions = props.minorGridCount ?? 4;
    const nodes: SvgNode[] = [];

    for (let i = 1; i < render.allTicks.length; i++) {
        const from = render.allTicks[i - 1].position;
        const to = render.allTicks[i].position;
        const step = (to - from) / subdivisions;

        for (let j = 1; j < subdivisions; j++) {
            const position = from + step * j;

            nodes.push({
                tag: 'line',
                attrs: {
                    class: 'p-chart-grid-line-minor',
                    'data-slot': 'chart-grid-line-minor',
                    x1: horizontal ? position : ctx.area.x,
                    y1: horizontal ? ctx.area.y : position,
                    x2: horizontal ? position : ctx.area.x + ctx.area.width,
                    y2: horizontal ? ctx.area.y + ctx.area.height : position,
                    stroke: props.minorGridColor ?? props.gridColor ?? ctx.theme.gridMinor ?? 'currentColor',
                    'stroke-width': props.minorGridStrokeWidth ?? 0.5,
                    'stroke-opacity': props.minorGridOpacity ?? 0.15,
                    'stroke-dasharray': dashOf(props.minorGridStyle)
                },
                children: []
            });
        }
    }

    return nodes;
}

/** Paints the alternating background bands between grid lines. */
function paintAlternatingBands(ctx: DrawContext, render: AxisRender, props: BaseAxisProps, horizontal: boolean): SvgNode[] {
    const nodes: SvgNode[] = [];

    for (let i = 1; i < render.ticks.length; i += 2) {
        const from = render.ticks[i - 1].position;
        const to = render.ticks[i].position;
        const start = Math.min(from, to);
        const size = Math.abs(to - from);

        nodes.push({
            tag: 'rect',
            attrs: {
                class: 'p-chart-band',
                'data-slot': 'chart-band',
                x: horizontal ? start : ctx.area.x,
                y: horizontal ? ctx.area.y : start,
                width: horizontal ? size : ctx.area.width,
                height: horizontal ? ctx.area.height : size,
                fill: props.alternateGridColor ?? ctx.theme.bandFill ?? 'currentColor',
                'fill-opacity': props.alternateGridOpacity ?? 0.05,
                stroke: 'none'
            },
            children: []
        });
    }

    return nodes;
}

/** Turns a named grid style into a dash array. */
function dashOf(style: 'solid' | 'dashed' | 'dotted' | undefined): string | null {
    switch (style) {
        case 'dashed':
            return '4 4';
        case 'dotted':
            return '1 3';
        default:
            return null;
    }
}
