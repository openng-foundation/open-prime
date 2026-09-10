import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>label</i> on <i>ChartXAxis</i> and <i>ChartYAxis</i> to add axis titles. Set <i>startFromZero</i> to anchor the axis at zero, <i>tickCount</i> to control tick density, and <i>type="logarithmic"</i> for data spanning multiple
                orders of magnitude.
            </p>
            <p>For full configuration see <a href="/charts/configuration/axes">Axes</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="queue-risk" [data]="data" valueXField="backlog" valueYField="breachRisk" color="#36b7d6" [markerSize]="7" />
                        <p-chart-x-axis label="Support backlog" [tickCount]="6" [tickFormat]="formatTickets" gridStyle="dashed" />
                        <p-chart-y-axis label="SLA breach risk" [startFromZero]="true" [tickFormat]="formatRisk" />
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
export class ScatterBubbleAxesDoc {
    readonly data = [
        { backlog: 120, breachRisk: 18 },
        { backlog: 185, breachRisk: 24 },
        { backlog: 240, breachRisk: 31 },
        { backlog: 310, breachRisk: 42 },
        { backlog: 370, breachRisk: 48 },
        { backlog: 430, breachRisk: 57 },
        { backlog: 520, breachRisk: 66 },
        { backlog: 610, breachRisk: 73 },
        { backlog: 690, breachRisk: 81 },
        { backlog: 760, breachRisk: 88 }
    ];
    readonly formatTickets = (v: TickValue) => `${v} tickets`;
    readonly formatRisk = (v: TickValue) => `${v}%`;
}
