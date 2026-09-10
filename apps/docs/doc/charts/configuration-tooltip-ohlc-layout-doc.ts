import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-ohlc-layout-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>On candlestick charts, the tooltip renders open, high, low, and close values in a structured layout with no configuration. Use a <i>pChartTooltipDef</i> template to replace this layout with custom content if needed.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
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
export class TooltipOhlcLayoutDoc {
    readonly data = [
        { date: 'Mon', open: 142, high: 148, low: 140, close: 147 },
        { date: 'Tue', open: 147, high: 152, low: 145, close: 150 },
        { date: 'Wed', open: 150, high: 155, low: 148, close: 149 },
        { date: 'Thu', open: 149, high: 153, low: 146, close: 152 },
        { date: 'Fri', open: 152, high: 158, low: 151, close: 157 }
    ];
}
