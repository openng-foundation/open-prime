import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>label</i> on <i>ChartXAxis</i> and <i>ChartYAxis</i> to add axis titles. Use a secondary Y axis when mixed units would otherwise flatten one series. Reverse the value axis for depth, ranking, or scorecards where the visual
                direction has domain meaning.
            </p>
            <p>For full configuration see <a href="/charts/configuration/axes">Axes</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue ($k)" yAxisId="revenue" color="#5daeea" />
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="orders" name="Orders" yAxisId="orders" color="#ffad5a" />
                        <p-chart-x-axis />
                        <p-chart-y-axis id="revenue" label="Revenue ($k)" position="left" />
                        <p-chart-y-axis id="orders" label="Orders" position="right" />
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
export class ColumnBarAxesDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, orders: 320 },
        { month: 'Feb', revenue: 38, orders: 280 },
        { month: 'Mar', revenue: 56, orders: 410 },
        { month: 'Apr', revenue: 48, orders: 365 },
        { month: 'May', revenue: 62, orders: 480 },
        { month: 'Jun', revenue: 55, orders: 420 }
    ];
}
