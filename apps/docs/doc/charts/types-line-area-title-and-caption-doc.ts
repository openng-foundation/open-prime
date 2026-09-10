import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-title-and-caption-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTitle</i> to display a title above the chart and <i>ChartCaption</i> for a descriptive line beneath it. Adding both reduces the available chart area.</p>
            <p>For full configuration see <a href="/charts/configuration/title-caption">Title &amp; Caption</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="activation" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-title text="Trial activation rate" />
                        <p-chart-caption text="Activated trial accounts by signup month · Jan-Jun cohort" />
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
export class LineAreaTitleAndCaptionDoc {
    readonly data = [
        { month: 'Jan', activation: 41 },
        { month: 'Feb', activation: 46 },
        { month: 'Mar', activation: 49 },
        { month: 'Apr', activation: 45 },
        { month: 'May', activation: 53 },
        { month: 'Jun', activation: 58 }
    ];
}
