import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-candlestick-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDataLabels</i> to print a value above each candle. By default the label shows the close. Set <i>formatter</i> to build custom text; the callback receives the close, the percentage, the category, and the row <i>datum</i>,
                so a field such as the high or low can drive the label. Set <i>display</i> to <i>value</i>, <i>percentage</i>, or <i>both</i>, though percentage is rarely meaningful for prices. Labels sit clear of the high wick and auto-hide on
                candles too narrow to fit the text.
            </p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 420px">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" />
                        <p-chart-data-labels />
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
export class CandlestickDataLabelsDoc {
    readonly data = [
        { date: 'Jan 2', open: 170.2, high: 173.5, low: 169.0, close: 172.8 },
        { date: 'Jan 3', open: 172.8, high: 174.1, low: 170.5, close: 171.0 },
        { date: 'Jan 4', open: 171.0, high: 172.3, low: 168.2, close: 168.8 },
        { date: 'Jan 5', open: 168.8, high: 170.0, low: 166.5, close: 169.5 },
        { date: 'Jan 8', open: 169.5, high: 172.0, low: 169.0, close: 171.8 },
        { date: 'Jan 9', open: 171.8, high: 175.2, low: 171.0, close: 174.5 },
        { date: 'Jan 10', open: 174.5, high: 176.8, low: 173.2, close: 175.9 }
    ];
}
