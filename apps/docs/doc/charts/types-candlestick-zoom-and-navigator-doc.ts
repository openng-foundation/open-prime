import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-candlestick-zoom-and-navigator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartZoom</i> to enable drag-to-zoom on the time axis and <i>ChartNavigator</i> to show a mini overview chart below. The navigator uses the close price for its mini chart.</p>
            <p>For full configuration see <a href="/charts/configuration/zoom-pan">Zoom &amp; Pan</a> and <a href="/charts/configuration/navigator">Navigator</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-candlestick [data]="data" categoryXField="date" openField="open" highField="high" lowField="low" closeField="close" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator />
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
export class CandlestickZoomAndNavigatorDoc {
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
        { date: 'Jan 23', open: 180.0, high: 181.2, low: 177.5, close: 178.2 },
        { date: 'Jan 24', open: 178.2, high: 179.5, low: 176.8, close: 179.0 },
        { date: 'Jan 25', open: 179.0, high: 182.0, low: 178.5, close: 181.5 },
        { date: 'Jan 26', open: 181.5, high: 183.0, low: 180.0, close: 182.2 },
        { date: 'Jan 29', open: 182.2, high: 184.5, low: 181.0, close: 183.8 },
        { date: 'Jan 30', open: 183.8, high: 185.0, low: 182.5, close: 184.5 },
        { date: 'Jan 31', open: 184.5, high: 186.0, low: 183.0, close: 185.2 },
        { date: 'Feb 1', open: 185.2, high: 186.8, low: 183.5, close: 184.0 },
        { date: 'Feb 2', open: 184.0, high: 185.5, low: 182.0, close: 182.8 },
        { date: 'Feb 5', open: 182.8, high: 184.0, low: 181.5, close: 183.5 },
        { date: 'Feb 6', open: 183.5, high: 186.2, low: 183.0, close: 185.8 },
        { date: 'Feb 7', open: 185.8, high: 187.5, low: 185.0, close: 186.5 },
        { date: 'Feb 8', open: 186.5, high: 188.0, low: 185.2, close: 187.2 },
        { date: 'Feb 9', open: 187.2, high: 189.0, low: 186.0, close: 188.5 },
        { date: 'Feb 12', open: 188.5, high: 190.2, low: 187.5, close: 189.0 },
        { date: 'Feb 13', open: 189.0, high: 190.0, low: 186.5, close: 187.0 }
    ];
}
