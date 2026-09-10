import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type DecimationAlgorithm } from '@openng/optimus-ui/charts';

const BASE_BTN = 'px-3 py-1 text-xs font-mono tracking-wide uppercase rounded-md border cursor-pointer transition-colors ';
const ACTIVE_BTN = 'font-semibold text-primary border-primary/30 bg-primary/10';
const INACTIVE_BTN = 'font-medium text-surface-500 dark:text-surface-400 border-transparent hover:text-surface-900 dark:hover:text-surface-100 hover:border-surface-200 dark:hover:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800';

function seededRandom(seed: number): () => number {
    let s = seed;

    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;

        return (s >>> 0) / 0xffffffff;
    };
}

function generateData(): { t: number; v: number }[] {
    const rng = seededRandom(42);
    const points: { t: number; v: number }[] = [];
    let base = 50;
    const start = new Date('2024-01-01').getTime();
    const step = 60 * 1000;

    for (let i = 0; i < 5000; i++) {
        base += (rng() - 0.5) * 2;
        base = Math.max(20, Math.min(80, base));

        let v = base;

        if (i % 80 === 0) v = base + (rng() > 0.5 ? 1 : -1) * 30;

        v = Math.max(2, Math.min(98, v));

        points.push({ t: start + i * step, v: Math.round(v * 10) / 10 });
    }

    return points;
}

@Component({
    selector: 'configuration-decimation-algorithms-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>algorithm</i> to choose which visual quality the summary should favor. Ordered series such as line, area, and bar use the configured strategy to keep selected source points. Scatter decimation uses the k-means path to replace
                dense point clusters with representative centroids, so a rendered centroid may not correspond to a single source row.
            </p>
            <p>
                <strong><i>'lttb'</i></strong> (Largest Triangle Three Buckets, default): shape-oriented. Selects points that maximize the area of triangles formed with neighboring points, favoring the overall trend and silhouette. Best for time
                series where the broad shape matters more than every local movement.
            </p>
            <p>
                <strong><i>'min-max'</i></strong
                >: peak-oriented. Keeps the minimum and maximum value in each bucket, preserving visible spikes and troughs better than a shape-only summary. Best for signal data, sensor readings, and financial charts where extremes are meaningful.
            </p>
            <p>
                <strong><i>'k-means'</i></strong
                >: density-oriented, <strong>scatter charts only</strong>. Groups nearby points into clusters and represents each cluster with its centroid. Best for dense scatter plots where density and cluster placement matter more than individual
                point positions. On ordered series, <i>'k-means'</i> falls back to <i>'lttb'</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="inline-flex mb-2 gap-1">
                    @for (alg of algorithms; track alg) {
                        <button [class]="baseBtn + (algorithm() === alg ? activeBtn : inactiveBtn)" (click)="algorithm.set(alg)">{{ alg }}</button>
                    }
                </div>
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="t" valueYField="v" color="#36b7d6" [lineStrokeWidth]="1.5" />
                    <p-chart-x-axis type="time" />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                    <p-chart-decimation [algorithm]="algorithm()" [samples]="150" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationAlgorithmsDoc {
    readonly algorithms: DecimationAlgorithm[] = ['lttb', 'min-max'];
    readonly algorithm = signal<DecimationAlgorithm>('lttb');
    readonly baseBtn = BASE_BTN;
    readonly activeBtn = ACTIVE_BTN;
    readonly inactiveBtn = INACTIVE_BTN;

    readonly data = generateData();
}
