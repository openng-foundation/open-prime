import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-candlestick-hollow-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>variant="hollow"</i> for a style where bullish candles render as stroke-only outlines while bearish candles remain solid. In hollow mode, color is determined by close relative to the previous candle's close rather than the
                candle's own open. Positive color means price closed higher than the last close; negative color means lower.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" variant="hollow" />
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
export class CandlestickHollowDoc {
    readonly data = [
        { date: 'Jan 2', open: 170, high: 175, low: 169, close: 172 },
        { date: 'Jan 3', open: 171, high: 176, low: 170, close: 174 },
        { date: 'Jan 4', open: 172, high: 173, low: 169, close: 173 },
        { date: 'Jan 5', open: 175, high: 176, low: 172, close: 174 },
        { date: 'Jan 8', open: 174, high: 175, low: 170, close: 171 },
        { date: 'Jan 9', open: 170, high: 175, low: 169, close: 173 },
        { date: 'Jan 10', open: 171, high: 172, low: 168, close: 172 },
        { date: 'Jan 11', open: 174, high: 175, low: 171, close: 173 },
        { date: 'Jan 12', open: 173, high: 174, low: 169, close: 170 },
        { date: 'Jan 15', open: 169, high: 173, low: 168, close: 172 },
        { date: 'Jan 16', open: 170, high: 171, low: 167, close: 171 },
        { date: 'Jan 17', open: 173, high: 174, low: 170, close: 172 },
        { date: 'Jan 18', open: 172, high: 173, low: 168, close: 169 },
        { date: 'Jan 19', open: 168, high: 172, low: 167, close: 171 },
        { date: 'Jan 22', open: 169, high: 170, low: 166, close: 170 },
        { date: 'Jan 23', open: 172, high: 173, low: 169, close: 171 },
        { date: 'Jan 24', open: 171, high: 172, low: 167, close: 168 }
    ];
}
