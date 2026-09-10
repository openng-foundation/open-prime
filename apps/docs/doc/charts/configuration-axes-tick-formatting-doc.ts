import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-tick-formatting-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>tickFormat</i> to a function <i>(value, index) =&gt; string</i> to customize how tick values are displayed. Use this for currency, percentages, units, and abbreviated large numbers. Set <i>tickInterval</i> to force a specific
                step between ticks instead of the auto-calculated interval.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="plan" valueYField="mrr" color="#5ccf9f" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="MRR" [tickFormat]="tickFormat" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesTickFormattingDoc {
    tickFormat = (v: TickValue) => `$${(Number(v) / 1000).toFixed(0)}K`;

    readonly data = [
        { plan: 'Starter', mrr: 42000 },
        { plan: 'Growth', mrr: 38500 },
        { plan: 'Scale', mrr: 51200 },
        { plan: 'Enterprise', mrr: 45800 },
        { plan: 'Platform', mrr: 33000 }
    ];
}
