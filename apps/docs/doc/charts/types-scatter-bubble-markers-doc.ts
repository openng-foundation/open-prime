import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const BASE = [
    { latency: 86, errorRate: 0.8 },
    { latency: 104, errorRate: 1.1 },
    { latency: 118, errorRate: 1.5 },
    { latency: 134, errorRate: 1.7 },
    { latency: 151, errorRate: 2.1 },
    { latency: 166, errorRate: 2.4 },
    { latency: 188, errorRate: 2.9 },
    { latency: 213, errorRate: 3.2 }
];

@Component({
    selector: 'types-scatter-bubble-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>markerShape</i> to differentiate series visually. The built-in shapes are <i>circle</i>, <i>square</i>, <i>triangle</i>, <i>cross</i>, and <i>star</i>. Use <i>markerSize</i> to control the radius and <i>pointRotation</i> to
                orient the shape. In bubble mode <i>markerSize</i> is ignored and the radius comes from the <i>size</i> field instead.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="checkout" [data]="data" valueXField="latency" valueYField="errorRate" name="Checkout" markerShape="circle" [markerSize]="7" />
                        <p-chart-scatter id="search" [data]="data2" valueXField="latency" valueYField="errorRate" name="Search" markerShape="triangle" [markerSize]="7" />
                        <p-chart-scatter id="billing" [data]="data3" valueXField="latency" valueYField="errorRate" name="Billing" markerShape="square" [markerSize]="7" />
                        <p-chart-x-axis label="P95 latency (ms)" />
                        <p-chart-y-axis label="Error rate (%)" />
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
export class ScatterBubbleMarkersDoc {
    readonly data = BASE;
    readonly data2 = BASE.map((d) => ({ latency: d.latency + 18, errorRate: d.errorRate + 0.7 }));
    readonly data3 = BASE.map((d) => ({ latency: d.latency - 12, errorRate: Math.max(0.4, d.errorRate - 0.35) }));
}
