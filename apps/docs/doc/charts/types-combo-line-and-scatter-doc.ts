import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

const CAMPAIGNS = [
    { spend: 8.2, customers: 142 },
    { spend: 11.5, customers: 198 },
    { spend: 9.8, customers: 167 },
    { spend: 14.2, customers: 243 },
    { spend: 12.6, customers: 219 },
    { spend: 18.4, customers: 301 },
    { spend: 15.9, customers: 274 },
    { spend: 22.1, customers: 352 },
    { spend: 19.7, customers: 328 },
    { spend: 25.3, customers: 398 },
    { spend: 28.8, customers: 441 },
    { spend: 24.5, customers: 385 },
    { spend: 31.2, customers: 487 },
    { spend: 27.4, customers: 422 },
    { spend: 34.6, customers: 531 },
    { spend: 38.1, customers: 578 },
    { spend: 33.7, customers: 512 },
    { spend: 41.5, customers: 623 }
];

function regression(points: { spend: number; customers: number }[]) {
    const xs = points.map((c) => c.spend);
    const ys = points.map((c) => c.customers);
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;

    for (let i = 0; i < n; i++) {
        num += (xs[i]! - mx) * (ys[i]! - my);
        den += (xs[i]! - mx) ** 2;
    }

    const slope = den === 0 ? 0 : num / den;
    const intercept = my - slope * mx;
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const steps = 48;

    return Array.from({ length: steps + 1 }, (_, i) => {
        const spend = xMin + ((xMax - xMin) * i) / steps;

        return { spend, customers: slope * spend + intercept };
    });
}

@Component({
    selector: 'types-combo-line-and-scatter-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>ChartScatter</i> for raw data points and <i>ChartLine</i> for a regression or trend line. Both plot on the same axes. The scatter shows distribution while the line shows the overall pattern. Set <i>type="linear"</i> on
                <i>ChartXAxis</i> when the X field is numeric rather than categorical.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter [data]="campaigns" valueXField="spend" valueYField="customers" name="Monthly campaigns" color="#7c8cff" [pointFillOpacity]="0.65" [markerSize]="6" />
                        <p-chart-line [data]="trend" valueXField="spend" valueYField="customers" name="Regression" color="#94a3b8" curve="linear" [lineStrokeWidth]="2" [lineDash]="[6, 4]" [showMarkers]="false" [fillOpacity]="0" />
                        <p-chart-x-axis type="linear" label="Ad spend ($K)" [tickFormat]="formatSpend" />
                        <p-chart-y-axis label="New customers" [startFromZero]="true" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip />
                        <p-chart-hover />
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
export class ComboLineAndScatterDoc {
    readonly campaigns = CAMPAIGNS;
    readonly trend = regression(CAMPAIGNS);
    readonly formatSpend = (v: TickValue) => `$${v}K`;
}
