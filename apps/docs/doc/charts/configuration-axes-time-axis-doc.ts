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

let price = 150;
const priceSeries = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2025, 0, 1);

    date.setDate(date.getDate() + i);
    price += (seededRandom(i) - 0.48) * 4;

    return { timestamp: date.getTime(), price: Math.round(price * 100) / 100 };
});

@Component({
    selector: 'configuration-axes-time-axis-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>type="time"</i> on <i>ChartXAxis</i> to enable continuous date and timestamp parsing. Tick labels format themselves based on the visible range: seconds and minutes for short ranges, hours and days for medium ranges, months and
                years for long ranges. Pass Unix timestamps, JavaScript <i>Date</i> objects, or ISO date strings as category values.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                    <p-chart-x-axis type="time" label="Date" />
                    <p-chart-y-axis label="Price ($)" [startFromZero]="false" [gridLines]="true" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesTimeAxisDoc {
    readonly data = priceSeries;
}
