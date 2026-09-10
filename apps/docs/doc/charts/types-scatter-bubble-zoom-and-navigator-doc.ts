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

@Component({
    selector: 'types-scatter-bubble-zoom-and-navigator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartZoom</i> with <i>mode="xy"</i> to zoom both axes at once. Drag a rectangle to select a region. Add <i>ChartNavigator</i> for a mini overview below the chart. This is handy for dense scatter plots where zooming reveals
                clusters.
            </p>
            <p>For full configuration see <a href="/charts/configuration/zoom-pan">Zoom &amp; Pan</a> and <a href="/charts/configuration/navigator">Navigator</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="routes" [data]="data" valueXField="routeDistance" valueYField="fuelBurn" color="#36b7d6" [markerSize]="5" />
                        <p-chart-x-axis label="Route distance (km)" />
                        <p-chart-y-axis label="Fuel burn (liters)" />
                        <p-chart-zoom mode="xy" />
                        <p-chart-navigator />
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
export class ScatterBubbleZoomAndNavigatorDoc {
    readonly data = Array.from({ length: 80 }, (_, i) => ({
        routeDistance: Math.round((30 + seededRandom(i) * 520) * 10) / 10,
        fuelBurn: Math.round((8 + seededRandom(i + 1000) * 74 + (i % 4) * 6) * 10) / 10
    }));
}
