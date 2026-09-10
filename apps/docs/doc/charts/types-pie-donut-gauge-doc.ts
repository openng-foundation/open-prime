import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-gauge-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Reduce <i>sweepAngle</i> below 360 to create a gauge arc. Combine with <i>startAngle</i> to set the opening direction. Pair with <i>innerRadius</i> and a muted remainder slice for a compact SLO or error-budget readout.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie id="slo" [data]="data" valueField="value" categoryField="label" [color]="colors" [startAngle]="225" [sweepAngle]="270" [innerRadius]="0.7" />
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
export class PieDonutGaugeDoc {
    readonly data = [
        { label: 'SLO met', value: 92 },
        { label: 'Error budget', value: 8 }
    ];
    readonly colors = ['#10a981', 'rgba(148, 163, 184, 0.28)'];
}
