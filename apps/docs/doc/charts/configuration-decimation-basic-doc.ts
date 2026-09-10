import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    const rng = seededRandom(42);
    const points: { t: number; v: number }[] = [];
    let value = 50;
    const start = new Date('2024-01-01').getTime();
    const step = 60 * 1000;

    for (let i = 0; i < 5000; i++) {
        value += (rng() - 0.5) * 4;
        value = Math.max(10, Math.min(90, value));
        points.push({ t: start + i * step, v: Math.round(value * 10) / 10 });
    }

    return points;
}

@Component({
    selector: 'configuration-decimation-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDecimation</i> to reduce large datasets to a manageable number of representative points before rendering. The chart stays responsive at smaller sizes, but the rendered marks are a summary rather than every source row. Use
                lower <i>samples</i> values for speed, and higher values or zoom windows when small movements matter.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="t" valueYField="v" color="#36b7d6" [lineStrokeWidth]="1.5" />
                    <p-chart-x-axis type="time" />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                    <p-chart-decimation />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationBasicDoc {
    readonly data = generateData();
}
