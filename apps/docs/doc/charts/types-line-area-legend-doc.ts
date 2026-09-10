import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display an interactive legend. Each <i>ChartLine</i> series appears as a separate entry; click any item to toggle that series.</p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="selfServe" name="Self-serve" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="salesAssist" name="Sales-assist" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="partner" name="Partner" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
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
export class LineAreaLegendDoc {
    readonly data = [
        { month: 'Jan', selfServe: 42, salesAssist: 28, partner: 18 },
        { month: 'Feb', selfServe: 45, salesAssist: 31, partner: 17 },
        { month: 'Mar', selfServe: 49, salesAssist: 33, partner: 19 },
        { month: 'Apr', selfServe: 53, salesAssist: 35, partner: 21 },
        { month: 'May', selfServe: 55, salesAssist: 38, partner: 23 },
        { month: 'Jun', selfServe: 59, salesAssist: 41, partner: 24 }
    ];
}
