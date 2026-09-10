import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';

const DATA = [
    { account: 'Aster', seats: 24, activation: 62, conversion: 48 },
    { account: 'Beacon', seats: 41, activation: 71, conversion: 58 },
    { account: 'Cobalt', seats: 18, activation: 55, conversion: 39 },
    { account: 'Dovetail', seats: 63, activation: 84, conversion: 73 },
    { account: 'Evergreen', seats: 36, activation: 76, conversion: 66 },
    { account: 'Forge', seats: 52, activation: 69, conversion: 57 },
    { account: 'Harbor', seats: 29, activation: 81, conversion: 70 },
    { account: 'Juniper', seats: 47, activation: 58, conversion: 44 },
    { account: 'Keystone', seats: 70, activation: 88, conversion: 79 },
    { account: 'Lumen', seats: 33, activation: 64, conversion: 51 }
];

@Component({
    selector: 'types-scatter-bubble-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTooltip</i> to show data details on hover. Unlike line charts, scatter tooltip hit-testing uses 2D Euclidean distance. The nearest point within <i>pointHitRadius</i> pixels is highlighted regardless of axis position.</p>
            <p>For full configuration see <a href="/charts/configuration/tooltip">Tooltip</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="accounts" [data]="data" valueXField="activation" valueYField="conversion" sizeField="seats" color="#5daeea" [minSize]="6" [maxSize]="24" />
                        <p-chart-x-axis label="Activation depth (%)" />
                        <p-chart-y-axis label="Trial conversion (%)" />
                        <p-chart-tooltip [valueFormatter]="tooltipRows" />
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
export class ScatterBubbleTooltipDoc {
    readonly data = DATA;
    readonly tooltipRows = (_value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const account = DATA[ctx.index!];

        if (!account) return [];

        return [
            { label: account.account, value: `${account.seats} seats` },
            { label: 'Activation', value: `${account.activation}%` },
            { label: 'Trial conversion', value: `${account.conversion}%` }
        ];
    };
}
