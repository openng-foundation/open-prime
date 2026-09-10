import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'internationalization-rtl-cartesian-charts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>dir="rtl"</i> on <i>ChartSvg</i> or <i>ChartCanvas</i> to switch to a right-to-left layout. The X axis is mirrored so the first category appears on the right, the Y axis moves to the right side by default, and all overlay
                positioning (tooltip, data labels) follows the RTL direction.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" dir="rtl">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="الإيرادات" color="#5daeea" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="costs" name="التكاليف" color="#ffad5a" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RtlCartesianChartsDoc {
    readonly data = [
        { month: 'يناير', revenue: 42, costs: 28 },
        { month: 'فبراير', revenue: 55, costs: 34 },
        { month: 'مارس', revenue: 48, costs: 31 },
        { month: 'أبريل', revenue: 63, costs: 38 },
        { month: 'مايو', revenue: 58, costs: 36 },
        { month: 'يونيو', revenue: 72, costs: 42 }
    ];
}
