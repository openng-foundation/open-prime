import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const DATA_SIZE = 2000;

function seededRandom(seed: number): () => number {
    let s = seed;

    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;

        return (s >>> 0) / 0xffffffff;
    };
}

function generateData(): { t: number; v: number }[] {
    const rng = seededRandom(43);
    const points: { t: number; v: number }[] = [];
    let value = 50;
    const start = new Date('2024-01-01').getTime();
    const step = 60 * 1000;

    for (let i = 0; i < DATA_SIZE; i++) {
        value += (rng() - 0.5) * 4;
        value = Math.max(10, Math.min(90, value));
        points.push({ t: start + i * step, v: Math.round(value * 10) / 10 });
    }

    return points;
}

@Component({
    selector: 'configuration-decimation-threshold-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>threshold</i> to only decimate when the dataset exceeds a certain size. When the point count is below the threshold, the full dataset renders without decimation, preserving exact values for smaller datasets. When omitted,
                <i>threshold</i> defaults to the same value as <i>samples</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-start items-center mb-2 gap-3">
                    <span class="text-xs opacity-70">threshold: {{ threshold() }}</span>
                    <input type="range" min="100" max="3000" step="100" style="width: 180px" [value]="threshold()" (input)="threshold.set(+asInput($event).value)" />
                    <span class="text-xs font-medium">
                        {{ threshold() < dataSize ? 'decimated (' + dataSize + ' pts exceeds threshold)' : 'full resolution (' + dataSize + ' pts below threshold)' }}
                    </span>
                </div>
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="t" valueYField="v" color="#36b7d6" [lineStrokeWidth]="1.5" />
                    <p-chart-x-axis type="time" />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                    <p-chart-decimation [threshold]="threshold()" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationThresholdDoc {
    readonly dataSize = DATA_SIZE;
    readonly threshold = signal(500);
    readonly data = generateData();

    asInput(e: Event): HTMLInputElement {
        return e.target as HTMLInputElement;
    }
}
