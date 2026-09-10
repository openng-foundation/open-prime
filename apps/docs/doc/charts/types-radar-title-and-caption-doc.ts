import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-title-and-caption-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTitle</i> to display a title above the chart and <i>ChartCaption</i> for a descriptive line beneath it. Both reduce the chart area height together.</p>
            <p>For full configuration see <a href="/charts/configuration/title-caption">Title &amp; Caption</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-title text="Product Evaluation Scorecard" />
                        <p-chart-caption text="Performance ratings across key software quality dimensions (0–100)" />
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
export class RadarTitleAndCaptionDoc {
    readonly data = [
        { metric: 'Speed', value: 85 },
        { metric: 'Reliability', value: 92 },
        { metric: 'Usability', value: 78 },
        { metric: 'Security', value: 88 },
        { metric: 'Scalability', value: 72 },
        { metric: 'Documentation', value: 65 },
        { metric: 'Support', value: 80 }
    ];
}
