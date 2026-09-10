import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartDataLabels</i> to label data points. Line labels work best for endpoints, sparse checkpoints, or a few key events. Avoid labeling every vertex in dense time series.</p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="quarter" valueYField="revenue" showMarkers curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-data-labels display="value" />
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
export class LineAreaDataLabelsDoc {
    readonly data = [
        { quarter: 'Q1', revenue: 120 },
        { quarter: 'Q2', revenue: 185 },
        { quarter: 'Q3', revenue: 156 },
        { quarter: 'Q4', revenue: 210 }
    ];
}
