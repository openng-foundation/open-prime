import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function buildSeries(): { timestamp: number; price: number; volume: number }[] {
    let price = 150;

    return Array.from({ length: 60 }, (_, i) => {
        const date = new Date(2025, 0, 1);

        date.setDate(date.getDate() + i);
        price += (seededRandom(i) - 0.48) * 4;

        return {
            timestamp: date.getTime(),
            price: Math.round(price * 100) / 100,
            volume: Math.floor(500 + seededRandom(i + 1000) * 1500)
        };
    });
}

const SERIES = buildSeries();

@Component({
    selector: 'types-synced-synced-zoom-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartZoom</i> to each chart and <i>[sync]="true"</i> to synchronize zoom and pan ranges. Zooming or panning one chart automatically updates all others to the same visible range, keeping every metric on the same period.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column; gap: 8px">
                        <p-chart-svg [sync]="true" [height]="250">
                            <p-chart-line id="price" [data]="data" categoryXField="timestamp" valueYField="price" name="Price" curve="smooth" />
                            <p-chart-x-axis type="time" />
                            <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-zoom mode="x" />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="150">
                            <p-chart-bar id="volume" [data]="data" categoryXField="timestamp" valueYField="volume" name="Volume" />
                            <p-chart-x-axis type="time" />
                            <p-chart-y-axis label="Vol" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-zoom mode="x" />
                        </p-chart-svg>
                    </div>
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedSyncedZoomDoc {
    readonly data = SERIES;
}
