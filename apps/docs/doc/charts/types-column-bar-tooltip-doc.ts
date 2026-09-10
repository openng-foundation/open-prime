import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTooltip</i> to show data details on hover. Shared tooltips are useful when grouped bars compare values at the same category.</p>
            <p>For full configuration see <a href="/charts/configuration/tooltip">Tooltip</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="area" valueYField="activations" color="#5daeea" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="Accounts activated" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarTooltipDoc {
    readonly data = [
        { area: 'Checkout', activations: 4200, trialShare: 38 },
        { area: 'Projects', activations: 3100, trialShare: 31 },
        { area: 'Automation', activations: 2800, trialShare: 26 },
        { area: 'Reporting', activations: 2400, trialShare: 19 },
        { area: 'Admin', activations: 1800, trialShare: 14 }
    ];

    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = this.data[ctx.index ?? -1];

        if (!item) return [];

        return [
            { label: 'Activated accounts', value: item.activations.toLocaleString() },
            { label: 'From trial cohort', value: `${item.trialShare}%` }
        ];
    };
}
