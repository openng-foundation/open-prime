import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-architecture-first-chart-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Start with <i>ChartSvg</i>, one series, a category field, a value field, and two axes. That is enough to get a chart on screen.</p>
            <p>Add <i>ChartLegend</i> and <i>ChartTooltip</i> to complete the standard layout. Add <i>ChartZoom</i> or <i>ChartNavigator</i> when users need to explore large ranges.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="380">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureFirstChartDoc {
    readonly data = [
        { month: 'Jan', revenue: 42 },
        { month: 'Feb', revenue: 55 },
        { month: 'Mar', revenue: 48 },
        { month: 'Apr', revenue: 63 },
        { month: 'May', revenue: 58 },
        { month: 'Jun', revenue: 72 }
    ];
}
