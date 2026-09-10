import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>categoryXField</i> and <i>valueYField</i> to bind data. Add <i>ChartXAxis</i> and <i>ChartYAxis</i> for axes and gridlines.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="shipped" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Orders shipped" />
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
export class ColumnBarBasicDoc {
    readonly data = [
        { month: 'Jan', shipped: 1240 },
        { month: 'Feb', shipped: 1380 },
        { month: 'Mar', shipped: 1620 },
        { month: 'Apr', shipped: 1510 },
        { month: 'May', shipped: 1740 },
        { month: 'Jun', shipped: 1680 }
    ];
}
