/**
 * Mark geometry: markers, arcs, rounded rectangles and the polar mapping.
 *
 * Everything here emits SVG path data or plain numbers, so a shape is defined once and both
 * renderers draw the same thing.
 */
import type { BorderRadius, BorderRadiusConfig, PointStyle } from '@openng/optimus-ui/types/charts';

/** The built-in marker names, so a renderer can tell an enum value from a custom path. */
export const MARKER_SHAPE_NAMES: readonly PointStyle[] = ['circle', 'square', 'triangle', 'cross', 'star'];

/** True when a `markerShape` value names a built-in shape rather than carrying path data. */
export function isMarkerShapeName(value: string): value is PointStyle {
    return (MARKER_SHAPE_NAMES as readonly string[]).includes(value);
}

/**
 * Path data for a built-in marker, centered on the origin so the renderer can translate and rotate
 * it freely. `size` is a radius, which keeps a marker's visual weight consistent across shapes.
 */
export function markerPath(shape: PointStyle, size: number): string {
    const r = Math.max(size, 0);

    switch (shape) {
        case 'square':
            return `M ${-r} ${-r} L ${r} ${-r} L ${r} ${r} L ${-r} ${r} Z`;
        case 'triangle': {
            // Sized so the triangle's area is close to the circle's, or it reads as smaller.
            const h = r * 1.4;

            return `M 0 ${-h} L ${h * 0.866} ${h * 0.5} L ${-h * 0.866} ${h * 0.5} Z`;
        }
        case 'cross': {
            const arm = r * 0.35;

            return `M ${-arm} ${-r} L ${arm} ${-r} L ${arm} ${-arm} L ${r} ${-arm} L ${r} ${arm} L ${arm} ${arm} L ${arm} ${r} L ${-arm} ${r} L ${-arm} ${arm} L ${-r} ${arm} L ${-r} ${-arm} L ${-arm} ${-arm} Z`;
        }
        case 'star':
            return starPath(r, r * 0.45, 5);
        default:
            return circlePath(r);
    }
}

/** A circle as path data, so every marker shape goes down one code path. */
export function circlePath(r: number): string {
    return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
}

/** An n-pointed star as path data. */
export function starPath(outerRadius: number, innerRadius: number, points: number): string {
    const step = Math.PI / points;
    let d = '';

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * step - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }

    return `${d}Z`;
}

/** Normalizes a border radius into its four corners. */
export function resolveBorderRadius(radius: BorderRadius | undefined): Required<BorderRadiusConfig> {
    if (radius == null) return { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };

    if (typeof radius === 'number') {
        return { topLeft: radius, topRight: radius, bottomLeft: radius, bottomRight: radius };
    }

    return {
        topLeft: radius.topLeft ?? 0,
        topRight: radius.topRight ?? 0,
        bottomLeft: radius.bottomLeft ?? 0,
        bottomRight: radius.bottomRight ?? 0
    };
}

/**
 * A rounded rectangle as path data. Each corner radius is capped at half the shorter side, so a
 * radius larger than the bar cannot invert the geometry into a shape that self-intersects.
 */
export function roundedRectPath(x: number, y: number, width: number, height: number, radius: BorderRadius | undefined): string {
    const w = Math.max(width, 0);
    const h = Math.max(height, 0);

    if (w === 0 || h === 0) return '';

    const corners = resolveBorderRadius(radius);
    const cap = Math.min(w, h) / 2;
    const tl = Math.min(corners.topLeft, cap);
    const tr = Math.min(corners.topRight, cap);
    const br = Math.min(corners.bottomRight, cap);
    const bl = Math.min(corners.bottomLeft, cap);

    if (tl === 0 && tr === 0 && br === 0 && bl === 0) {
        return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
    }

    return (
        `M ${x + tl} ${y} ` +
        `L ${x + w - tr} ${y} ` +
        (tr ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr} ` : '') +
        `L ${x + w} ${y + h - br} ` +
        (br ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h} ` : '') +
        `L ${x + bl} ${y + h} ` +
        (bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl} ` : '') +
        `L ${x} ${y + tl} ` +
        (tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y} ` : '') +
        'Z'
    );
}

/** Degrees to radians. */
export function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/** Radians to degrees. */
export function toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

/** A point on a circle, with 0 degrees at three o'clock and angles running clockwise. */
export function polarToCartesian(cx: number, cy: number, radius: number, degrees: number): { x: number; y: number } {
    const radians = toRadians(degrees);

    return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
}

/** The angle of a point relative to a center, normalized into 0 to 360 degrees. */
export function angleOf(cx: number, cy: number, x: number, y: number): number {
    const degrees = toDegrees(Math.atan2(y - cy, x - cx));

    return (degrees + 360) % 360;
}

/** Whether an angle falls inside a sweep, handling the case where the sweep crosses zero. */
export function angleInSweep(angle: number, startAngle: number, endAngle: number): boolean {
    const normalized = (angle + 360) % 360;
    const start = (startAngle + 360) % 360;
    const end = (endAngle + 360) % 360;

    if (start <= end) return normalized >= start && normalized <= end;

    return normalized >= start || normalized <= end;
}

/**
 * An arc, or a ring segment when `innerRadius` is above zero, as path data.
 *
 * A full circle is drawn as two half arcs, because a single arc whose start and end coincide is
 * degenerate and renders as nothing at all — which is how a one-slice pie disappears.
 */
export function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, cornerRadius = 0, padWidth = 0): string {
    const sweep = endAngle - startAngle;

    if (Math.abs(sweep) < 1e-6) return '';

    if (Math.abs(sweep) >= 359.999) {
        return fullRingPath(cx, cy, innerRadius, outerRadius);
    }

    if (padWidth > 0) {
        return paddedArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle, cornerRadius, padWidth);
    }

    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
    const direction = sweep > 0 ? 1 : 0;

    if (cornerRadius > 0) {
        return roundedArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle, cornerRadius);
    }

    if (innerRadius <= 0) {
        return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} Z`;
    }

    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

    return (
        `M ${outerStart.x} ${outerStart.y} ` +
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} ` +
        `L ${innerEnd.x} ${innerEnd.y} ` +
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} ${direction === 1 ? 0 : 1} ${innerStart.x} ${innerStart.y} Z`
    );
}

/** A full circle, or a full ring, drawn as two half arcs. */
export function fullRingPath(cx: number, cy: number, innerRadius: number, outerRadius: number): string {
    const outer = `M ${cx - outerRadius} ${cy} A ${outerRadius} ${outerRadius} 0 1 0 ${cx + outerRadius} ${cy} A ${outerRadius} ${outerRadius} 0 1 0 ${cx - outerRadius} ${cy} Z`;

    if (innerRadius <= 0) return outer;

    // The hole is wound the other way so the even-odd fill knocks it out.
    const inner = `M ${cx - innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 1 1 ${cx + innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 1 1 ${cx - innerRadius} ${cy} Z`;

    return `${outer} ${inner}`;
}

/**
 * An arc whose gap to its neighbours is a constant width in pixels.
 *
 * The obvious way to separate two slices is to trim an angle off each, and that is wrong on
 * anything but a thin ring: the width of an angular gap is `angle × radius`, so it closes to
 * nothing at the centre and fans out at the rim. On a rose, where each petal reaches a different
 * radius, the effect is a pinwheel -- the long petals stand far apart while the short ones touch.
 *
 * A constant-width gap is instead a perpendicular offset of the two radial edges. Offsetting an
 * edge by `w/2` moves its intersection with the circle of radius `r` by `asin(w / 2r)`, which is
 * large near the centre and small at the rim -- the opposite of a fixed angle, and the reason the
 * gap comes out the same width all the way along. The two offset edges meet at
 * `(w/2) / sin(sweep/2)`, so a wedge no longer reaches the centre: its apex is truncated, which is
 * what leaves the rose a small clear middle instead of a knot of converging points.
 */
function paddedArcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, cornerRadius: number, padWidth: number): string {
    const sweep = endAngle - startAngle;
    const direction = sweep > 0 ? 1 : -1;
    const half = Math.abs(sweep) / 2;
    const pad = padWidth / 2;
    // Where the two offset edges cross. Inside this radius the slice has no width at all.
    const apex = Math.sin(toRadians(half)) > 1e-6 ? pad / Math.sin(toRadians(half)) : 0;
    const inner = Math.max(innerRadius, apex);

    // Padded away to nothing: a slice thinner than its own gap has nothing left to draw, and
    // drawing it anyway would produce an inside-out path.
    if (outerRadius <= inner + 0.25) return '';

    /** The angular inset at one radius, which is what keeps the gap a constant width. */
    const insetAt = (radius: number) => (radius <= pad ? half : toDegrees(Math.asin(Math.min(pad / radius, 1))));

    const outerInset = Math.min(insetAt(outerRadius), half - 1e-4);
    const innerInset = Math.min(insetAt(inner), half - 1e-4);
    const a0 = startAngle + direction * outerInset;
    const a1 = endAngle - direction * outerInset;
    const i0 = startAngle + direction * innerInset;
    const i1 = endAngle - direction * innerInset;
    const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const flag = sweep > 0 ? 1 : 0;

    if (cornerRadius > 0) {
        return roundedArcPath(cx, cy, inner, outerRadius, a0, a1, cornerRadius);
    }

    const outerStart = polarToCartesian(cx, cy, outerRadius, a0);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, a1);
    const innerEnd = polarToCartesian(cx, cy, inner, i1);
    const innerStart = polarToCartesian(cx, cy, inner, i0);

    // At the apex the two inner points coincide, so the inner arc collapses into a single vertex.
    if (Math.abs(i1 - i0) < 1e-4 || inner <= 1e-4) {
        return `M ${innerStart.x} ${innerStart.y} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${flag} ${outerEnd.x} ${outerEnd.y} Z`;
    }

    return (
        `M ${outerStart.x} ${outerStart.y} ` +
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${flag} ${outerEnd.x} ${outerEnd.y} ` +
        `L ${innerEnd.x} ${innerEnd.y} ` +
        `A ${inner} ${inner} 0 ${largeArc} ${flag === 1 ? 0 : 1} ${innerStart.x} ${innerStart.y} Z`
    );
}

/**
 * An arc with rounded corners.
 *
 * Each corner is a real arc tangent to both edges it joins, not an inset endpoint: insetting alone
 * shortens the slice without rounding anything, which is why a `borderRadius` on a pie had no
 * visible effect and none at all on a ring.
 *
 * The radius is capped three ways -- half the ring's thickness, half the arc length at the outer
 * edge, and half at the inner -- so two corners on a thin or narrow slice cannot cross and turn the
 * path inside out.
 */
function roundedArcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, cornerRadius: number): string {
    const sweep = endAngle - startAngle;
    const direction = sweep > 0 ? 1 : 0;
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
    const outerArc = (Math.abs(sweep) / 360) * 2 * Math.PI * outerRadius;
    const innerArc = innerRadius > 0 ? (Math.abs(sweep) / 360) * 2 * Math.PI * innerRadius : Infinity;
    const r = Math.min(cornerRadius, (outerRadius - Math.max(innerRadius, 0)) / 2, outerArc / 2, innerArc / 2);
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

    // Below about half a pixel there is nothing to see, and the corner arcs would only add
    // rounding errors to a path that is already correct.
    if (r <= 0.5) {
        if (innerRadius <= 0) {
            return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} Z`;
        }

        const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
        const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

        return (
            `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${outerEnd.x} ${outerEnd.y} ` +
            `L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} ${direction === 1 ? 0 : 1} ${innerStart.x} ${innerStart.y} Z`
        );
    }

    // The angle a corner of radius r subtends at each edge, so it meets the circular edge
    // tangentially rather than cutting across it.
    const outerInset = toDegrees(r / outerRadius) * (sweep > 0 ? 1 : -1);
    const from = polarToCartesian(cx, cy, outerRadius, startAngle + outerInset);
    const to = polarToCartesian(cx, cy, outerRadius, endAngle - outerInset);
    const trailingOuter = polarToCartesian(cx, cy, outerRadius - r, endAngle);
    const leadingOuter = polarToCartesian(cx, cy, outerRadius - r, startAngle);

    if (innerRadius <= 0) {
        // A wedge keeps its apex sharp: the two radial edges meet at a point there, and rounding it
        // would open a gap at the centre of the pie.
        return (
            `M ${cx} ${cy} L ${leadingOuter.x} ${leadingOuter.y} ` +
            `A ${r} ${r} 0 0 ${direction} ${from.x} ${from.y} ` +
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${to.x} ${to.y} ` +
            `A ${r} ${r} 0 0 ${direction} ${trailingOuter.x} ${trailingOuter.y} Z`
        );
    }

    const innerInset = toDegrees(r / innerRadius) * (sweep > 0 ? 1 : -1);
    const innerTo = polarToCartesian(cx, cy, innerRadius, endAngle - innerInset);
    const innerFrom = polarToCartesian(cx, cy, innerRadius, startAngle + innerInset);
    const trailingInner = polarToCartesian(cx, cy, innerRadius + r, endAngle);
    const leadingInner = polarToCartesian(cx, cy, innerRadius + r, startAngle);

    return (
        `M ${from.x} ${from.y} ` +
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} ${direction} ${to.x} ${to.y} ` +
        `A ${r} ${r} 0 0 ${direction} ${trailingOuter.x} ${trailingOuter.y} ` +
        `L ${trailingInner.x} ${trailingInner.y} ` +
        `A ${r} ${r} 0 0 ${direction} ${innerTo.x} ${innerTo.y} ` +
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} ${direction === 1 ? 0 : 1} ${innerFrom.x} ${innerFrom.y} ` +
        `A ${r} ${r} 0 0 ${direction} ${leadingInner.x} ${leadingInner.y} ` +
        `L ${leadingOuter.x} ${leadingOuter.y} ` +
        `A ${r} ${r} 0 0 ${direction} ${from.x} ${from.y} Z`
    );
}

/** A regular polygon, which is what a polygon-shaped radar grid ring is. */
export function polygonPath(cx: number, cy: number, radius: number, sides: number, rotationDegrees = -90): string {
    if (sides < 3 || radius <= 0) return '';

    let d = '';

    for (let i = 0; i < sides; i++) {
        const angle = rotationDegrees + (360 / sides) * i;
        const point = polarToCartesian(cx, cy, radius, angle);

        d += `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y} `;
    }

    return `${d}Z`;
}

/** The vertices of a radar or polar chart's spokes. */
export function spokeAngles(count: number, startDegrees = -90, sweepDegrees = 360): number[] {
    if (count <= 0) return [];

    const step = sweepDegrees / count;

    return Array.from({ length: count }, (_, i) => startDegrees + step * i);
}

/** Squared distance, for comparing distances without paying for the square root. */
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return dx * dx + dy * dy;
}
