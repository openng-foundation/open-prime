import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number) {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

let price = 120;
const priceSeries = Array.from({ length: 730 }, (_, i) => {
    const date = new Date(2022, 0, 1);

    date.setDate(date.getDate() + i);
    price += (seededRandom(i) - 0.49) * 3;

    return { timestamp: date.getTime(), price: Math.round(price * 100) / 100 };
});

@Component({
    selector: 'configuration-axes-data-grouping-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>grouping</i> on a time axis to aggregate large datasets by time interval. The aggregation runs before the renderer, reducing years of data to a manageable density without rendering thousands of individual points.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" />
                    <p-chart-x-axis type="time" [grouping]="{ method: 'average', targetPoints: 24 }" />
                    <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesDataGroupingDoc {
    readonly data = priceSeries;
}
