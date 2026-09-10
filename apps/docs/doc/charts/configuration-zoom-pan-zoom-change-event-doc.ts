import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ZoomState } from '@openng/optimus-ui/charts';

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

function formatDate(ms: number) {
    return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

@Component({
    selector: 'configuration-zoom-pan-zoom-change-event-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>onZoomChange</i> to receive the current zoom state whenever the view changes. The callback receives a <i>ZoomState</i> object with the current X and Y windows. Use this to sync zoom state to external state, URL params, or other
                charts.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="margin-bottom: 8px; font-size: 12px; opacity: 0.7; min-height: 20px">
                    @if (zoomState()?.x; as x) {
                        <span>Zoomed: {{ fmt(x.min) }} — {{ fmt(x.max) }}</span>
                    } @else {
                        <span>Scroll or drag to zoom</span>
                    }
                </div>
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                        <p-chart-zoom [onZoomChange]="handleZoomChange" />
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
export class ZoomPanZoomChangeEventDoc {
    readonly data = priceSeries(90);
    readonly zoomState = signal<ZoomState | null>(null);
    readonly fmt = formatDate;
    readonly handleZoomChange = (state: ZoomState) => this.zoomState.set(state);
}
