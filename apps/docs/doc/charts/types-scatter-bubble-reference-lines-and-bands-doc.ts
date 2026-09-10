import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-reference-lines-and-bands-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartReferenceLine</i> to draw threshold or divider lines. Set both <i>x</i> and <i>y</i> reference lines to divide the chart into quadrants. Setting both creates quadrant divisions for scatter plots. Add
                <i>ChartReferenceBand</i> to highlight acceptable value ranges.
            </p>
            <p>For full configuration see <a href="/charts/configuration/reference-lines-bands">Reference Lines &amp; Bands</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="reliability" [data]="data" valueXField="latency" valueYField="reliability" color="#5daeea" [markerSize]="7" />
                        <p-chart-reference-line [y]="99.9" label="SLO floor" stroke="#ff7a66" [lineDash]="[6, 4]" />
                        <p-chart-reference-band [y1]="99.9" [y2]="100" fill="#5ccf9f" [fillOpacity]="0.1" label="Healthy zone" />
                        <p-chart-x-axis label="P95 latency (ms)" />
                        <p-chart-y-axis label="Availability (%)" [startFromZero]="false" />
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
export class ScatterBubbleReferenceLinesAndBandsDoc {
    readonly data = [
        { latency: 84, reliability: 99.98 },
        { latency: 112, reliability: 99.96 },
        { latency: 136, reliability: 99.94 },
        { latency: 161, reliability: 99.91 },
        { latency: 188, reliability: 99.89 },
        { latency: 214, reliability: 99.86 },
        { latency: 247, reliability: 99.84 },
        { latency: 286, reliability: 99.8 },
        { latency: 331, reliability: 99.75 },
        { latency: 372, reliability: 99.7 },
        { latency: 420, reliability: 99.64 }
    ];
}
