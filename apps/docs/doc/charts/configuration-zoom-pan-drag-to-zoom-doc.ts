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

function priceSeries(n: number) {
    let price = 150;

    return Array.from({ length: n }, (_, i) => {
        const date = new Date(2025, 0, 1);

        date.setDate(date.getDate() + i);
        price += (seededRandom(i) - 0.48) * 4;

        return { timestamp: date.getTime(), price: Math.round(price * 100) / 100 };
    });
}

@Component({
    selector: 'configuration-zoom-pan-drag-to-zoom-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Drag-to-zoom is enabled by default. Drag across the chart to draw a selection rectangle and zoom to that region. Set <i>drag</i> to <i>false</i> to disable it, or require a modifier key such as <i>'alt'</i> to avoid conflicting with
                pan.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                        <p-chart-zoom mode="x" />
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
export class ZoomPanDragToZoomDoc {
    readonly data = priceSeries(60);
}
