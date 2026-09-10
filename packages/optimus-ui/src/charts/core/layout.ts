/**
 * Layout: turning a container size and a set of registered parts into a plot area.
 *
 * Layout runs once per frame and both renderers read the same result, which is why a legend, an
 * axis label and a leader line land in the same place under SVG and Canvas. Only text
 * rasterization differs between them, and that is the browser's business, not this module's.
 */
import type { BoxArea, Position, ResponsiveTier } from '@openng/optimus-ui/types/charts';

/** Space one part asks the layout to reserve on an edge. */
export interface EdgeReservation {
    /**
     * Edge to reserve on.
     */
    position: Position;
    /**
     * Pixels to reserve.
     */
    size: number;
}

/** Everything the layout pass needs to know. */
export interface LayoutRequest {
    /**
     * Container width in pixels.
     */
    width: number;
    /**
     * Container height in pixels.
     */
    height: number;
    /**
     * Reservations from the axes, legends, title, caption, navigator and color legend.
     */
    reservations: readonly EdgeReservation[];
    /**
     * Padding applied inside the container, before anything is reserved.
     */
    padding?: Partial<Record<Position, number>>;
}

/** What the layout pass produced. */
export interface LayoutResult {
    /**
     * The plot area every series draws into.
     */
    chartArea: BoxArea;
    /**
     * Total reserved space per edge, so a part can position itself in its own band.
     */
    reserved: Record<Position, number>;
}

/**
 * Computes the plot area. A degenerate result is clamped to zero rather than allowed to go
 * negative, because a negative width propagates into every scale and produces marks drawn outside
 * the chart instead of an obviously empty one.
 */
export function computeLayout(request: LayoutRequest): LayoutResult {
    const reserved: Record<Position, number> = {
        top: request.padding?.top ?? 0,
        right: request.padding?.right ?? 0,
        bottom: request.padding?.bottom ?? 0,
        left: request.padding?.left ?? 0
    };

    for (const reservation of request.reservations) {
        if (reservation.size <= 0) continue;
        reserved[reservation.position] += reservation.size;
    }

    const width = Math.max(0, request.width - reserved.left - reserved.right);
    const height = Math.max(0, request.height - reserved.top - reserved.bottom);

    return {
        chartArea: { x: reserved.left, y: reserved.top, width, height },
        reserved
    };
}

/** Default container-width thresholds for the responsive tiers. */
export const DEFAULT_BREAKPOINTS = { xs: 300, sm: 500, md: 700 } as const;

/** Works out which responsive tier a container width falls into. */
export function responsiveTier(width: number, breakpoints: Partial<typeof DEFAULT_BREAKPOINTS> = {}): ResponsiveTier {
    const xs = breakpoints.xs ?? DEFAULT_BREAKPOINTS.xs;
    const sm = breakpoints.sm ?? DEFAULT_BREAKPOINTS.sm;
    const md = breakpoints.md ?? DEFAULT_BREAKPOINTS.md;

    if (width < xs) return 'xs';
    if (width < sm) return 'sm';
    if (width < md) return 'md';

    return 'lg';
}

/** Title and caption font sizes per tier, for when neither was given an explicit size. */
export const TIER_FONT_SIZES: Record<ResponsiveTier, { title: number; caption: number }> = {
    xs: { title: 12, caption: 10 },
    sm: { title: 13, caption: 11 },
    md: { title: 14, caption: 12 },
    lg: { title: 17, caption: 13 }
};

/**
 * Measures text width.
 *
 * A canvas context measures accurately, which matters because axis label collision detection is
 * only as good as its measurement. Without one — during server-side rendering, before the canvas
 * exists — it falls back to an average-character-width estimate, which is deliberately generous so
 * the layout reserves too much space rather than too little and clips.
 */
export function measureTextWidth(text: string, fontSize: number, fontFamily: string, ctx?: CanvasRenderingContext2D | null): number {
    if (ctx) {
        ctx.save();
        ctx.font = `${fontSize}px ${fontFamily}`;
        const width = ctx.measureText(text).width;
        ctx.restore();

        return width;
    }

    return text.length * fontSize * 0.6;
}

/** The height one line of text occupies. */
export function lineHeightOf(fontSize: number, multiplier = 1.2): number {
    return fontSize * multiplier;
}

/**
 * The bounding box of a label rotated about its anchor. Rotating an axis label changes how much
 * height it needs, so the reservation has to be computed from the rotated box rather than the flat
 * one.
 */
export function rotatedBounds(width: number, height: number, degrees: number): { width: number; height: number } {
    if (degrees === 0) return { width, height };

    const radians = (Math.abs(degrees) * Math.PI) / 180;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);

    return {
        width: width * cos + height * sin,
        height: width * sin + height * cos
    };
}

/** Clamps a point into a rectangle, which is what keeps a tooltip card inside the chart. */
export function clampToArea(x: number, y: number, width: number, height: number, area: BoxArea): { x: number; y: number } {
    return {
        x: Math.min(Math.max(x, area.x), Math.max(area.x, area.x + area.width - width)),
        y: Math.min(Math.max(y, area.y), Math.max(area.y, area.y + area.height - height))
    };
}

/** True when a point sits inside a rectangle. */
export function containsPoint(area: BoxArea, x: number, y: number): boolean {
    return x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height;
}

/** The center of a rectangle. */
export function centerOf(area: BoxArea): { x: number; y: number } {
    return { x: area.x + area.width / 2, y: area.y + area.height / 2 };
}

/** The largest radius a radial chart can use inside a rectangle. */
export function radiusOf(area: BoxArea): number {
    return Math.max(0, Math.min(area.width, area.height) / 2);
}

/**
 * Resolves the pixel size a chart should render at.
 *
 * `width` and `height` are maximums while responsive rather than fixed sizes, and `aspectRatio`
 * takes over the height once set, so a chart in a fluid column keeps its shape instead of going
 * letterbox at one breakpoint.
 */
export function resolveSize(options: { containerWidth: number; containerHeight: number; width?: number | 'auto'; height?: number | 'auto'; responsive?: boolean; aspectRatio?: number }): { width: number; height: number } {
    const { containerWidth, containerHeight, width, height, responsive = true, aspectRatio } = options;

    let resolvedWidth = typeof width === 'number' ? (responsive ? Math.min(width, containerWidth || width) : width) : containerWidth;
    let resolvedHeight = typeof height === 'number' ? (responsive ? Math.min(height, containerHeight || height) : height) : containerHeight;

    if (aspectRatio && aspectRatio > 0 && resolvedWidth > 0) {
        resolvedHeight = resolvedWidth / aspectRatio;
    }

    // A container that has not been measured yet reports zero. Falling back to a sensible box keeps
    // the first frame from computing every scale against a zero-width range.
    if (!Number.isFinite(resolvedWidth) || resolvedWidth <= 0) resolvedWidth = 0;
    if (!Number.isFinite(resolvedHeight) || resolvedHeight <= 0) resolvedHeight = 0;

    return { width: resolvedWidth, height: resolvedHeight };
}
