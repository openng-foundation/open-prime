export interface Sample {
    x: number;
    y: number;
}

function seededRandom(seed: number) {
    let s = seed >>> 0;

    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;

        return s / 0xffffffff;
    };
}

function gaussianPair(rng: () => number): [number, number] {
    const u1 = Math.max(1e-9, rng());
    const u2 = rng();
    const r = Math.sqrt(-2 * Math.log(u1));
    const t = 2 * Math.PI * u2;

    return [r * Math.cos(t), r * Math.sin(t)];
}

export function generateClusters(total: number, seed: number): Sample[] {
    const rng = seededRandom(seed);
    const centers: [number, number, number][] = [
        [25, 65, 8],
        [55, 35, 6],
        [75, 70, 9]
    ];
    const out: Sample[] = new Array(total);
    const perCluster = Math.floor(total / centers.length);
    let idx = 0;

    for (let c = 0; c < centers.length; c++) {
        const [cx, cy, sig] = centers[c]!;
        const count = c === centers.length - 1 ? total - idx : perCluster;

        for (let i = 0; i < count; i++) {
            const [g1, g2] = gaussianPair(rng);

            out[idx++] = { x: cx + g1 * sig, y: cy + g2 * sig };
        }
    }

    return out;
}

export const CLUSTER_COUNT = 100000;
export const CLUSTER_SEED = 7;
