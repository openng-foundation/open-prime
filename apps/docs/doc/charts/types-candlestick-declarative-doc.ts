import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-candlestick-declarative-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Define candles inline using <i>ChartItem</i> instead of a data array. Each <i>ChartItem</i> accepts <i>open</i>, <i>high</i>, <i>low</i>, <i>close</i>, and <i>categoryX</i> for the time period.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-candlestick>
                            <p-chart-item categoryX="Mon" [open]="170.2" [high]="173.5" [low]="169.0" [close]="172.8" />
                            <p-chart-item categoryX="Tue" [open]="172.8" [high]="174.1" [low]="170.5" [close]="171.0" />
                            <p-chart-item categoryX="Wed" [open]="171.0" [high]="172.3" [low]="168.2" [close]="168.8" />
                            <p-chart-item categoryX="Thu" [open]="168.8" [high]="170.0" [low]="166.5" [close]="169.5" />
                            <p-chart-item categoryX="Fri" [open]="169.5" [high]="172.0" [low]="169.0" [close]="171.8" />
                        </p-chart-candlestick>
                        <p-chart-x-axis />
                        <p-chart-y-axis [startFromZero]="false" />
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
export class CandlestickDeclarativeDoc {}
