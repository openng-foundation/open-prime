import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-reference-lines-and-bands-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartReferenceLine</i> for threshold and divider lines. Add <i>ChartReferenceBand</i> to highlight tolerance, forecast, or alert ranges.</p>
            <p>For full configuration see <a href="/charts/configuration/reference-lines-bands">Reference Lines &amp; Bands</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" curve="smooth" />
                        <p-chart-reference-line [y]="5000" label="Target" stroke="#5daeea" [lineDash]="[6, 4]" />
                        <p-chart-reference-line x="Apr" label="Q2 Start" stroke="#ffad5a" [lineDash]="[4, 4]" />
                        <p-chart-reference-band [y1]="4500" [y2]="6000" label="Healthy range" fill="#4ecdc4" [fillOpacity]="0.1" labelPosition="start" />
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
export class LineAreaReferenceLinesAndBandsDoc {
    readonly data = [
        { month: 'Jan', revenue: 4200 },
        { month: 'Feb', revenue: 4800 },
        { month: 'Mar', revenue: 5500 },
        { month: 'Apr', revenue: 5200 },
        { month: 'May', revenue: 6500 },
        { month: 'Jun', revenue: 7200 }
    ];
}
