import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-candlestick-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>upColor</i>, <i>downColor</i>, and <i>neutralColor</i> to customize candle colors. <i>upColor</i> applies when price rose, <i>downColor</i> when it fell, and <i>neutralColor</i> for doji candles where open equals close. This
                sample uses a teal and periwinkle pair to show that direction colors can follow a product palette instead of the usual market convention.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" upColor="#4ecdc4" downColor="#7c8cff" neutralColor="#94a3b8" />
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
export class CandlestickColorsDoc {
    readonly data = [
        { date: 'Jan 2', open: 170.2, high: 173.5, low: 169.0, close: 172.8 },
        { date: 'Jan 3', open: 172.8, high: 174.1, low: 170.5, close: 171.0 },
        { date: 'Jan 4', open: 171.0, high: 172.3, low: 168.2, close: 168.8 },
        { date: 'Jan 5', open: 168.8, high: 170.0, low: 166.5, close: 169.5 },
        { date: 'Jan 8', open: 169.5, high: 172.0, low: 169.0, close: 171.8 },
        { date: 'Jan 9', open: 171.8, high: 175.2, low: 171.0, close: 174.5 },
        { date: 'Jan 10', open: 174.5, high: 176.8, low: 173.2, close: 175.9 },
        { date: 'Jan 11', open: 175.9, high: 177.0, low: 174.0, close: 174.8 },
        { date: 'Jan 12', open: 174.8, high: 175.5, low: 172.0, close: 172.5 },
        { date: 'Jan 16', open: 172.5, high: 174.0, low: 171.2, close: 173.8 },
        { date: 'Jan 17', open: 173.8, high: 176.5, low: 173.0, close: 176.0 },
        { date: 'Jan 18', open: 176.0, high: 178.2, low: 175.5, close: 177.5 },
        { date: 'Jan 19', open: 177.5, high: 179.0, low: 176.0, close: 178.8 },
        { date: 'Jan 22', open: 178.8, high: 180.5, low: 178.0, close: 180.0 },
        { date: 'Jan 23', open: 180.0, high: 181.2, low: 177.5, close: 178.2 }
    ];
}
