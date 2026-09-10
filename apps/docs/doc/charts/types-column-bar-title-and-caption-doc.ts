import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-title-and-caption-doc',
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
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="netRevenue" color="#5daeea" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="$M" />
                        <p-chart-title text="Net Revenue by Month" />
                        <p-chart-caption text="Closed-won subscription revenue, first half of FY 2026" />
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
export class ColumnBarTitleAndCaptionDoc {
    readonly data = [
        { month: 'Jan', netRevenue: 5.4 },
        { month: 'Feb', netRevenue: 6.2 },
        { month: 'Mar', netRevenue: 8.1 },
        { month: 'Apr', netRevenue: 7.3 },
        { month: 'May', netRevenue: 9.0 },
        { month: 'Jun', netRevenue: 6.8 }
    ];
}
