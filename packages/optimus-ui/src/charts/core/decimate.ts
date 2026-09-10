/**
 * Decimation: drawing fewer points without changing what the chart says.
 *
 * The test for a decimation algorithm is not how few points it keeps but whether the shape survives
 * — a spike that gets dropped is a spike the reader never learns about. Each algorithm here is
 * chosen for the shape it has to preserve.
 */
import type { AggregationMethod, DecimationAlgorithm } from '@openng/optimus-ui/types/charts';

/** A point in the space a decimator works in. */
export interface Sample {
    x: number;
    y: number;
    /**
     * Index into the original array, so a decimated point can still find its datum for a tooltip.
     */
    index: number;
}

/**
 * Largest-Triangle-Three-Buckets.
 *
 * The classic downsampler for an ordered series: it splits the data into buckets and keeps, from
 * each, the point forming the largest triangle with its neighbours. That criterion favours the
 * points that carry the line's shape, so peaks and troughs survive where a plain "every nth point"
 * would step straight over them.
 */
export function lttb(samples: readonly Sample[], target: number): Sample[] {
    const n = samples.length;

    if (target >= n || target < 3) return [...samples];

    const bucketSize = (n - 2) / (target - 2);
    const result: Sample[] = [samples[0]];
    let previous = 0;

    for (let i = 0; i < target - 2; i++) {
        // Average of the next bucket, which is the third vertex of every triangle considered.
        const nextStart = Math.floor((i + 1) * bucketSize) + 1;
        const nextEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);
        const nextCount = Math.max(nextEnd - nextStart, 1);

        let avgX = 0;
        let avgY = 0;

        for (let j = nextStart; j < nextEnd; j++) {
            avgX += samples[j].x;
            avgY += samples[j].y;
        }

        avgX /= nextCount;
        avgY /= nextCount;

        const rangeStart = Math.floor(i * bucketSize) + 1;
        const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;
        const anchor = samples[previous];

        let bestArea = -1;
        let bestIndex = rangeStart;

        for (let j = rangeStart; j < Math.min(rangeEnd, n); j++) {
            // Twice the triangle area; the factor of two is constant so it does not affect the pick.
            const area = Math.abs((anchor.x - avgX) * (samples[j].y - anchor.y) - (anchor.x - samples[j].x) * (avgY - anchor.y));

            if (area > bestArea) {
                bestArea = area;
                bestIndex = j;
            }
        }

        result.push(samples[bestIndex]);
        previous = bestIndex;
    }

    result.push(samples[n - 1]);

    return result;
}

/**
 * Min-max decimation.
 *
 * It keeps both extremes of every bucket, so the vertical envelope is exact: no spike can be lost,
 * only its horizontal position blurred within a bucket. That is the right trade for a signal where
 * the peak value matters more than the moment it happened. It emits up to twice the target count,
 * which is inherent to keeping two points per bucket rather than a shortfall.
 */
export function minMax(samples: readonly Sample[], target: number): Sample[] {
    const n = samples.length;

    if (target >= n || target < 2) return [...samples];

    const buckets = Math.max(Math.floor(target / 2), 1);
    const bucketSize = n / buckets;
    const result: Sample[] = [];

    for (let b = 0; b < buckets; b++) {
        const start = Math.floor(b * bucketSize);
        const end = Math.min(Math.floor((b + 1) * bucketSize), n);

        if (start >= end) continue;

        let minSample = samples[start];
        let maxSample = samples[start];

        for (let i = start + 1; i < end; i++) {
            if (samples[i].y < minSample.y) minSample = samples[i];
            if (samples[i].y > maxSample.y) maxSample = samples[i];
        }

        // Emitted in the order they occur, so the line does not zigzag backwards.
        if (minSample.index <= maxSample.index) {
            result.push(minSample);
            if (maxSample !== minSample) result.push(maxSample);
        } else {
            result.push(maxSample);
            result.push(minSample);
        }
    }

    return result;
}

/**
 * K-means decimation for a scatter cloud.
 *
 * A scatter plot has no ordering to bucket along, so the 1D algorithms do not apply. Clustering
 * keeps the cloud's density structure: the centroids land where the points are dense, which is what
 * a reader looking at a scatter plot is reading.
 */
export function kMeans(samples: readonly Sample[], target: number, iterations = 8): Sample[] {
    const n = samples.length;

    if (target >= n || target < 1) return [...samples];

    // Seeded by even strides through the data rather than at random, so the same input decimates to
    // the same output on every frame. A cloud that shimmered between renders would be unusable.
    const stride = n / target;
    let centroids = Array.from({ length: target }, (_, i) => {
        const seed = samples[Math.min(Math.floor(i * stride), n - 1)];

        return { x: seed.x, y: seed.y };
    });

    const assignment = new Int32Array(n);

    for (let iteration = 0; iteration < iterations; iteration++) {
        let moved = false;

        for (let i = 0; i < n; i++) {
            let best = 0;
            let bestDistance = Infinity;

            for (let c = 0; c < centroids.length; c++) {
                const dx = samples[i].x - centroids[c].x;
                const dy = samples[i].y - centroids[c].y;
                const distance = dx * dx + dy * dy;

                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = c;
                }
            }

            if (assignment[i] !== best) {
                assignment[i] = best;
                moved = true;
            }
        }

        if (!moved && iteration > 0) break;

        const sums = centroids.map(() => ({ x: 0, y: 0, count: 0 }));

        for (let i = 0; i < n; i++) {
            const bucket = sums[assignment[i]];

            bucket.x += samples[i].x;
            bucket.y += samples[i].y;
            bucket.count++;
        }

        centroids = centroids.map((centroid, c) => (sums[c].count === 0 ? centroid : { x: sums[c].x / sums[c].count, y: sums[c].y / sums[c].count }));
    }

    // The representative of each cluster is a real data point, not the centroid itself, so hover and
    // tooltip still resolve to a row the application actually passed in.
    const representatives = new Map<number, Sample>();
    const bestDistances = new Map<number, number>();

    for (let i = 0; i < n; i++) {
        const cluster = assignment[i];
        const centroid = centroids[cluster];
        const dx = samples[i].x - centroid.x;
        const dy = samples[i].y - centroid.y;
        const distance = dx * dx + dy * dy;

        if (!bestDistances.has(cluster) || distance < bestDistances.get(cluster)!) {
            bestDistances.set(cluster, distance);
            representatives.set(cluster, samples[i]);
        }
    }

    return [...representatives.values()].sort((a, b) => a.index - b.index);
}

/** Runs the named algorithm. */
export function decimate(samples: readonly Sample[], algorithm: DecimationAlgorithm, target: number): Sample[] {
    switch (algorithm) {
        case 'min-max':
            return minMax(samples, target);
        case 'k-means':
            return kMeans(samples, target);
        default:
            return lttb(samples, target);
    }
}

/** Combines a group of values by the named method. */
export function aggregate(values: readonly number[], method: AggregationMethod): number {
    if (values.length === 0) return 0;

    switch (method) {
        case 'sum':
            return values.reduce((total, value) => total + value, 0);
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        case 'first':
            return values[0];
        case 'last':
            return values[values.length - 1];
        case 'ohlc':
            // A single number cannot carry OHLC; the caller wanting four values reads them out of
            // `aggregateOhlc` instead. Reporting the close keeps this total order-consistent.
            return values[values.length - 1];
        default:
            return values.reduce((total, value) => total + value, 0) / values.length;
    }
}

/** Combines a group of prices into one candle. */
export function aggregateOhlc(values: readonly { open: number; high: number; low: number; close: number }[]): { open: number; high: number; low: number; close: number } | null {
    if (values.length === 0) return null;

    return {
        open: values[0].open,
        high: Math.max(...values.map((v) => v.high)),
        low: Math.min(...values.map((v) => v.low)),
        close: values[values.length - 1].close
    };
}
