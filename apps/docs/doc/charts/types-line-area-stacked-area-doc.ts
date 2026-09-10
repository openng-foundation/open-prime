import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-stacked-area-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap multiple <i>ChartLine</i> components inside <i>ChartStacked</i> to stack series vertically. Works with line-only and area series. Set <i>mode="percent"</i> on <i>ChartStacked</i> to normalize each category to 100%. Negative
                values stack downward from zero.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-stacked>
                            <p-chart-line [data]="data" categoryXField="month" valueYField="direct" name="Direct" curve="smooth" [fillOpacity]="0.3" />
                            <p-chart-line [data]="data" categoryXField="month" valueYField="organic" name="Organic" curve="smooth" [fillOpacity]="0.3" />
                            <p-chart-line [data]="data" categoryXField="month" valueYField="referral" name="Referral" curve="smooth" [fillOpacity]="0.3" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaStackedAreaDoc {
    readonly data = [
        { month: 'Jan', direct: 4200, organic: 6100, referral: 2100 },
        { month: 'Feb', direct: 4800, organic: 7200, referral: 2200 },
        { month: 'Mar', direct: 5100, organic: 8400, referral: 3300 },
        { month: 'Apr', direct: 4700, organic: 7800, referral: 2800 },
        { month: 'May', direct: 5500, organic: 9200, referral: 4200 },
        { month: 'Jun', direct: 6200, organic: 10500, referral: 4800 }
    ];
}
