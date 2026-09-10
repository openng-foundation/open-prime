import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number): () => number {
    let s = seed;

    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;

        return (s >>> 0) / 0xffffffff;
    };
}

function generateData(): { t: number; v: number }[] {
    const rng = seededRandom(44);
    const points: { t: number; v: number }[] = [];
    let value = 50;
    const start = new Date('2024-01-01').getTime();
    const step = 60 * 1000;

    for (let i = 0; i < 5000; i++) {
        value += (rng() - 0.5) * 4;
        if (i % 300 === 0) value += (rng() > 0.5 ? 1 : -1) * 15;

        value = Math.max(5, Math.min(95, value));
        points.push({ t: start + i * step, v: Math.round(value * 10) / 10 });
    }

    return points;
}

@Component({
    selector: 'configuration-decimation-sample-count-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>samples</i> to control the target number of output points after decimation. Lower values produce more aggressive downsampling: faster rendering but less detail. Higher values preserve more shape at the cost of rendering
                performance. The default is <i>500</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-start items-center mb-2 gap-3">
                    <span class="text-xs opacity-70">samples</span>
                    <input type="range" min="50" max="1000" step="50" style="width: 180px" [value]="samples()" (input)="samples.set(+asInput($event).value)" />
                    <span class="text-xs font-medium">{{ samples() }}</span>
                </div>
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="t" valueYField="v" color="#36b7d6" [lineStrokeWidth]="1.5" />
                    <p-chart-x-axis type="time" />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                    <p-chart-decimation [samples]="samples()" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationSampleCountDoc {
    readonly samples = signal(200);
    readonly data = generateData();

    asInput(e: Event): HTMLInputElement {
        return e.target as HTMLInputElement;
    }
}
