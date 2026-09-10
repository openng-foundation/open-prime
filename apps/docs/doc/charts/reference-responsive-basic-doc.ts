import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-responsive-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartResponsive</i> to enable adaptive scaling. By default the chart adjusts font sizes, padding, tick label sizes, data label rotation, and legend position based on the chart container width. No configuration needed.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [responsive]="true" [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue ($K)" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-responsive />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveBasicDoc {
    readonly data = [
        { month: 'Jan', revenue: 42 },
        { month: 'Feb', revenue: 55 },
        { month: 'Mar', revenue: 48 },
        { month: 'Apr', revenue: 63 },
        { month: 'May', revenue: 58 },
        { month: 'Jun', revenue: 72 }
    ];
}
