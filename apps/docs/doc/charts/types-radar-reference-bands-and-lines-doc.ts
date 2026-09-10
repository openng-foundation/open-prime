import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-reference-bands-and-lines-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>ChartReferenceBand</i> to shade a concentric annular zone between two radial values (<i>y1</i> / <i>y2</i>). Use <i>ChartReferenceLine</i> to draw a dashed ring at a specific value (<i>y</i>). Both components work on radar with
                the same inputs as on cartesian charts. The values are mapped to the same scale as the chart data.
            </p>
            <p>For full configuration see <a href="/charts/configuration/reference-lines-bands">Reference Band</a> and <a href="/charts/configuration/reference-lines-bands">Reference Line</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 400px">
                    <p-chart-svg>
                        <p-chart-reference-band [y1]="70" [y2]="90" fill="#5ccf9f" [fillOpacity]="0.12" label="Target Zone" />
                        <p-chart-reference-line [y]="50" stroke="#5daeea" [lineStrokeWidth]="1.5" [lineDash]="[5, 4]" label="Baseline" />
                        <p-chart-radar [data]="data" categoryXField="skill" valueYField="score" color="#5daeea" [fillOpacity]="0.2" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarReferenceBandsAndLinesDoc {
    readonly data = [
        { skill: 'Design', score: 82 },
        { skill: 'Frontend', score: 91 },
        { skill: 'Backend', score: 58 },
        { skill: 'Testing', score: 76 },
        { skill: 'DevOps', score: 44 },
        { skill: 'Security', score: 68 }
    ];
}
