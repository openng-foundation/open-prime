import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-layout-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>layout="vertical"</i> to stack legend items vertically instead of the default horizontal row. Vertical layout pairs well with <i>position="left"</i> or <i>position="right"</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="shipped" color="#5daeea" name="Shipped" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="returns" color="#ffad5a" name="Returns" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="exchanges" color="#ff7a66" name="Exchanges" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="right" layout="vertical" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendLayoutDoc {
    readonly data = [
        { month: 'Jan', shipped: 120, returns: 15, exchanges: 8 },
        { month: 'Feb', shipped: 185, returns: 22, exchanges: 12 },
        { month: 'Mar', shipped: 156, returns: 18, exchanges: 9 },
        { month: 'Apr', shipped: 210, returns: 25, exchanges: 14 },
        { month: 'May', shipped: 198, returns: 20, exchanges: 11 },
        { month: 'Jun', shipped: 230, returns: 28, exchanges: 16 }
    ];
}
