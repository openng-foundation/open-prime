import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

const RAW = [
    { month: 'Jan', shipments: 112.4 },
    { month: 'Feb', shipments: 94.8 },
    { month: 'Mar', shipments: 138.6 },
    { month: 'Apr', shipments: 101.2 },
    { month: 'May', shipments: 89.5 },
    { month: 'Jun', shipments: 118.3 },
    { month: 'Jul', shipments: 82.1 },
    { month: 'Aug', shipments: 96.7 },
    { month: 'Sep', shipments: 127.4 },
    { month: 'Oct', shipments: 143.8 },
    { month: 'Nov', shipments: 109.2 },
    { month: 'Dec', shipments: 88.6 }
];

@Component({
    selector: 'types-combo-bar-and-area-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Overlay a smoothed area line on top of bars to show a moving average or trend. Set <i>fillOpacity</i> on <i>ChartLine</i> to a low value (0.05–0.10) to hint at the fill without obscuring the bars beneath. Use
                <i>connectNulls="false"</i> when the line series has leading nulls, for example a 3-month moving average that only becomes valid from the third data point onward.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="shipments" name="Fulfilled orders" color="#36b7d6" [opacity]="0.75" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="ma3" name="3-month avg" color="#ffad5a" curve="smooth" [fillOpacity]="0.1" [lineStrokeWidth]="2.5" [showMarkers]="false" [connectNulls]="false" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="formatAxis" />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBarAndAreaDoc {
    readonly data = RAW.map((d, i) => ({
        ...d,
        ma3: i < 2 ? null : +((RAW[i].shipments + RAW[i - 1].shipments + RAW[i - 2].shipments) / 3).toFixed(1)
    }));

    readonly formatAxis = (v: TickValue): string => `${v}K`;
}
