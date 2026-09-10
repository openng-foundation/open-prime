import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-line-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>lineStrokeWidth</i> to control stroke thickness. Use <i>lineDash</i> for dashed or dotted patterns with <i>lineDashOffset</i> to shift the pattern. Set <i>lineCapStyle</i> for line endings and <i>lineJoinStyle</i> for how
                segments connect at data points.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" name="Revenue (round cap)" [lineStrokeWidth]="4" curve="smooth" lineCapStyle="round" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="forecast" name="Forecast (dashed)" [lineStrokeWidth]="2" [lineDash]="[8, 4]" curve="smooth" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="target" name="Target (dotted, square cap)" [lineStrokeWidth]="2" [lineDash]="[2, 4]" lineCapStyle="square" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="budget" name="Budget (dash offset)" [lineStrokeWidth]="2" [lineDash]="[10, 5]" [lineDashOffset]="5" />
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
export class LineAreaLineStylingDoc {
    readonly data = [
        { month: 'Jan', revenue: 4200, forecast: 4000, target: 5000, budget: 4500 },
        { month: 'Feb', revenue: 4800, forecast: 4600, target: 5000, budget: 4500 },
        { month: 'Mar', revenue: 5500, forecast: 5200, target: 5000, budget: 4500 },
        { month: 'Apr', revenue: 5200, forecast: 5800, target: 5000, budget: 4500 },
        { month: 'May', revenue: 6500, forecast: 6200, target: 5000, budget: 4500 },
        { month: 'Jun', revenue: 7200, forecast: 6800, target: 5000, budget: 4500 }
    ];
}
