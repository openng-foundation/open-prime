import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display a legend below the chart. Each series appears as a separate entry. Click any item to toggle that series on or off.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="direct" name="Direct" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="partner" name="Partner" color="#ffad5a" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="marketplace" name="Marketplace" color="#7c8cff" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendBasicDoc {
    readonly data = [
        { month: 'Jan', direct: 42, partner: 28, marketplace: 18 },
        { month: 'Feb', direct: 45, partner: 30, marketplace: 17 },
        { month: 'Mar', direct: 48, partner: 32, marketplace: 16 },
        { month: 'Apr', direct: 51, partner: 35, marketplace: 15 },
        { month: 'May', direct: 53, partner: 34, marketplace: 14 },
        { month: 'Jun', direct: 56, partner: 36, marketplace: 13 }
    ];
}
