import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>label</i> on <i>ChartXAxis</i> and <i>ChartYAxis</i> to add axis titles. Time axes suit continuous dates; use a secondary Y axis only when one scale would hide a series because the units differ.</p>
            <p>For full configuration see <a href="/charts/configuration/axes">Axes</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="temp" name="Temperature (°C)" yAxisId="temp" curve="smooth" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="rainfall" name="Rainfall (mm)" yAxisId="rain" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis id="temp" position="left" label="Temperature (°C)" />
                        <p-chart-y-axis id="rain" position="right" label="Rainfall (mm)" />
                        <p-chart-legend position="bottom" />
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
export class LineAreaAxesDoc {
    readonly data = [
        { month: 'Jan', temp: 2, rainfall: 78 },
        { month: 'Feb', temp: 4, rainfall: 55 },
        { month: 'Mar', temp: 9, rainfall: 62 },
        { month: 'Apr', temp: 14, rainfall: 48 },
        { month: 'May', temp: 19, rainfall: 52 },
        { month: 'Jun', temp: 23, rainfall: 35 },
        { month: 'Jul', temp: 26, rainfall: 28 },
        { month: 'Aug', temp: 25, rainfall: 32 },
        { month: 'Sep', temp: 20, rainfall: 45 },
        { month: 'Oct', temp: 14, rainfall: 68 },
        { month: 'Nov', temp: 8, rainfall: 72 },
        { month: 'Dec', temp: 3, rainfall: 82 }
    ];
}
