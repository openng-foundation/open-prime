/**
 * Path generators for line and area series.
 *
 * Every generator takes the same point list and emits SVG path data, which the Canvas renderer
 * replays through `Path2D`. That is what keeps a smoothed line identical between the two renderers
 * rather than each one smoothing in its own way.
 */
import type { ComputedPoint, CurveType } from '@openng/optimus-ui/types/charts';

/** A point the path generators can work with: pixel coordinates and nothing else. */
export interface PathPoint {
    x: number;
    y: number;
}

function moveTo(p: PathPoint): string {
    return `M ${p.x} ${p.y}`;
}

/** Straight segments between the points. */
export function linearPath(points: readonly PathPoint[]): string {
    if (points.length === 0) return '';

    let d = moveTo(points[0]);

    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;

    return d;
}

/**
 * Monotone cubic interpolation, which is what `curve="smooth"` uses. Unlike a plain Catmull-Rom
 * spline it cannot overshoot: a series that never dips below zero will not have its curve dip below
 * zero between two points, which matters because that overshoot reads as data the series does not
 * contain.
 */
export function monotonePath(points: readonly PathPoint[]): string {
    const n = points.length;

    if (n === 0) return '';
    if (n < 3) return linearPath(points);

    // Secant slopes between consecutive points.
    const slopes: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        const dx = points[i + 1].x - points[i].x;

        slopes.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
    }

    // Tangents, initialised to the average of the neighbouring secants.
    const tangents: number[] = [slopes[0]];

    for (let i = 1; i < n - 1; i++) {
        if (slopes[i - 1] * slopes[i] <= 0) {
            // A local extremum: a zero tangent is what pins the curve to the data point.
            tangents.push(0);
        } else {
            tangents.push((slopes[i - 1] + slopes[i]) / 2);
        }
    }

    tangents.push(slopes[n - 2]);

    // Fritsch-Carlson limiting, which clamps the tangents into the region where monotonicity holds.
    for (let i = 0; i < n - 1; i++) {
        if (slopes[i] === 0) {
            tangents[i] = 0;
            tangents[i + 1] = 0;
            continue;
        }

        const alpha = tangents[i] / slopes[i];
        const beta = tangents[i + 1] / slopes[i];
        const magnitude = Math.hypot(alpha, beta);

        if (magnitude > 3) {
            const scale = 3 / magnitude;

            tangents[i] = scale * alpha * slopes[i];
            tangents[i + 1] = scale * beta * slopes[i];
        }
    }

    let d = moveTo(points[0]);

    for (let i = 0; i < n - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const c1x = points[i].x + dx / 3;
        const c1y = points[i].y + (tangents[i] * dx) / 3;
        const c2x = points[i + 1].x - dx / 3;
        const c2y = points[i + 1].y - (tangents[i + 1] * dx) / 3;

        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    return d;
}

/**
 * Catmull-Rom spline, which is what `curve="spline"` uses. `tension` sets how tightly the curve
 * hugs the points: 0 collapses to straight segments and 0.5 is the classic Catmull-Rom.
 */
export function splinePath(points: readonly PathPoint[], tension = 0.5): string {
    const n = points.length;

    if (n === 0) return '';
    if (n < 3 || tension <= 0) return linearPath(points);

    let d = moveTo(points[0]);

    for (let i = 0; i < n - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;

        const c1x = p1.x + ((p2.x - p0.x) * tension) / 3;
        const c1y = p1.y + ((p2.y - p0.y) * tension) / 3;
        const c2x = p2.x - ((p3.x - p1.x) * tension) / 3;
        const c2y = p2.y - ((p3.y - p1.y) * tension) / 3;

        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }

    return d;
}

/** Step at the midpoint between the points, which is what `curve="step"` uses. */
export function stepPath(points: readonly PathPoint[]): string {
    if (points.length === 0) return '';

    let d = moveTo(points[0]);

    for (let i = 1; i < points.length; i++) {
        const midX = (points[i - 1].x + points[i].x) / 2;

        d += ` L ${midX} ${points[i - 1].y} L ${midX} ${points[i].y} L ${points[i].x} ${points[i].y}`;
    }

    return d;
}

/** Step up before moving across: the value holds until the next point's x. */
export function stepBeforePath(points: readonly PathPoint[]): string {
    if (points.length === 0) return '';

    let d = moveTo(points[0]);

    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i - 1].x} ${points[i].y} L ${points[i].x} ${points[i].y}`;
    }

    return d;
}

/** Step across before moving up: the value holds from this point's x. */
export function stepAfterPath(points: readonly PathPoint[]): string {
    if (points.length === 0) return '';

    let d = moveTo(points[0]);

    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i - 1].y} L ${points[i].x} ${points[i].y}`;
    }

    return d;
}

/** Emits the path for a curve type. */
export function curvePath(points: readonly PathPoint[], curve: CurveType = 'linear', tension = 0.5): string {
    switch (curve) {
        case 'smooth':
            return monotonePath(points);
        case 'spline':
            return splinePath(points, tension);
        case 'step':
            return stepPath(points);
        case 'step-before':
            return stepBeforePath(points);
        case 'step-after':
            return stepAfterPath(points);
        default:
            return linearPath(points);
    }
}

/**
 * Closes a line path into an area against a baseline, or against a second line for a range area.
 * The lower edge is walked in reverse so the fill closes without crossing itself.
 */
export function areaPath(upper: readonly PathPoint[], lower: readonly PathPoint[], curve: CurveType = 'linear', tension = 0.5): string {
    if (upper.length === 0) return '';

    const top = curvePath(upper, curve, tension);
    const reversedLower = [...lower].reverse();

    if (reversedLower.length === 0) return `${top} Z`;

    // The lower edge starts with a line rather than a move, so the two edges stay one subpath.
    const bottom = curvePath(reversedLower, curve, tension).replace(/^M/, 'L');

    return `${top} ${bottom} Z`;
}

/** Builds the flat baseline an ordinary area closes against. */
export function baselineOf(points: readonly PathPoint[], baselineY: number): PathPoint[] {
    return points.map((p) => ({ x: p.x, y: baselineY }));
}

/** Whether a point has a real position on both axes and can therefore be drawn. */
export function isPlaced(point: ComputedPoint): boolean {
    return point.value != null && Number.isFinite(point.x) && Number.isFinite(point.y);
}

/**
 * Splits a point list at the gaps, so `connectNulls: 'gap'` renders separate subpaths instead of
 * bridging a missing value with a straight line that implies data.
 *
 * A point is a gap when it has no value *or* no position. Checking only the value was a real bug:
 * a category absent from the axis domain scales to NaN, and the path came out as
 * `M NaN NaN L NaN NaN`, which the browser rejects once per mark.
 */
export function splitAtGaps(points: readonly ComputedPoint[]): ComputedPoint[][] {
    const runs: ComputedPoint[][] = [];
    let current: ComputedPoint[] = [];

    for (const point of points) {
        if (!isPlaced(point)) {
            if (current.length) runs.push(current);
            current = [];
            continue;
        }

        current.push(point);
    }

    if (current.length) runs.push(current);

    return runs;
}
