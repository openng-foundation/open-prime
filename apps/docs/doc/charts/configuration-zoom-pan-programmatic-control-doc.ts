import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ZoomAxisWindow, type ZoomHandle } from '@openng/optimus-ui/charts';

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

const DATA = priceSeries(90);
const BTN = 'padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(128, 128, 128, 0.3); background: transparent; cursor: pointer; font-size: 13px; min-width: 32px';

@Component({
    selector: 'configuration-zoom-pan-programmatic-control-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Bind an object of shape <i>{{ '{' }} current: ZoomHandle | null {{ '}' }}</i> to <i>[zoomRef]</i>; the handle populates on mount. Call <i>zoomRef.current.setZoomState</i> to jump to a specific range,
                <i>zoomRef.current.resetZoom</i> to return to the original view, and <i>zoomRef.current.getZoomState</i> to read the current state at any time without a re-render.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; gap: 6px; margin-bottom: 8px">
                    <button (click)="panLeft()" [style]="btn" title="Pan left">‹</button>
                    <button (click)="zoomOut()" [style]="btn" title="Zoom out">−</button>
                    <button (click)="zoomIn()" [style]="btn" title="Zoom in">+</button>
                    <button (click)="panRight()" [style]="btn" title="Pan right">›</button>
                    <button (click)="zoomRef.current?.resetZoom()" [style]="btn">Reset</button>
                </div>
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                        <p-chart-zoom mode="x" [zoomRef]="zoomRef" />
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
export class ZoomPanProgrammaticControlDoc {
    readonly data = DATA;
    readonly btn = BTN;
    private readonly originalMin = DATA[0]!.timestamp;
    private readonly originalMax = DATA[DATA.length - 1]!.timestamp;
    readonly zoomRef: { current: ZoomHandle | null } = { current: null };

    private currentX(): ZoomAxisWindow {
        return this.zoomRef.current?.getZoomState().x ?? { min: this.originalMin, max: this.originalMax };
    }

    private applyX(min: number, max: number): void {
        const range = max - min;
        const totalRange = this.originalMax - this.originalMin;

        if (range >= totalRange) {
            this.zoomRef.current?.resetZoom();

            return;
        }

        if (min < this.originalMin) {
            max += this.originalMin - min;
            min = this.originalMin;
        }

        if (max > this.originalMax) {
            min -= max - this.originalMax;
            max = this.originalMax;
        }

        this.zoomRef.current?.setZoomState({ x: { min, max }, y: null });
    }

    zoomIn(): void {
        const { min, max } = this.currentX();
        const center = (min + max) / 2;
        const half = ((max - min) / 2) * 0.75;

        this.applyX(center - half, center + half);
    }

    zoomOut(): void {
        const { min, max } = this.currentX();
        const center = (min + max) / 2;
        const half = ((max - min) / 2) * 1.33;

        this.applyX(center - half, center + half);
    }

    panLeft(): void {
        const { min, max } = this.currentX();
        const shift = (max - min) * 0.25;

        this.applyX(min - shift, max - shift);
    }

    panRight(): void {
        const { min, max } = this.currentX();
        const shift = (max - min) * 0.25;

        this.applyX(min + shift, max + shift);
    }
}
