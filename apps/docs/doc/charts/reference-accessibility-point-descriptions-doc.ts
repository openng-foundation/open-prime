import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type PointDescriptionContext } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-point-descriptions-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Each data point gets an auto-generated aria-label describing its category, value, and series. Set <i>pointDescriptionFormatter</i> to customize the text. Set <i>seriesDescriptionFormatter</i> to customize the series-level description.
                Set <i>pointDescriptionThreshold</i> to disable per-point labels on large datasets; when the point count exceeds the threshold, only the series-level description is announced. These descriptions apply to the SVG renderer; canvas
                charts expose the same data through the screen-reader data table instead.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" color="#5daeea" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="costs" name="Costs" color="#ffad5a" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-accessibility [pointDescriptionFormatter]="pointFormatter" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityPointDescriptionsDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, costs: 28 },
        { month: 'Feb', revenue: 55, costs: 34 },
        { month: 'Mar', revenue: 48, costs: 31 },
        { month: 'Apr', revenue: 63, costs: 38 },
        { month: 'May', revenue: 58, costs: 36 },
        { month: 'Jun', revenue: 72, costs: 42 }
    ];

    readonly pointFormatter = ({ category, value, seriesName }: PointDescriptionContext): string => `${seriesName} in ${category}: $${value}K`;
}
