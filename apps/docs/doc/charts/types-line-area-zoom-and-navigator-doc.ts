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
    selector: 'types-line-area-zoom-and-navigator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartZoom</i> and <i>ChartNavigator</i> when the ordered range is longer than the visible chart can explain at once.</p>
            <p>For full configuration see <a href="/charts/configuration/zoom-pan">Zoom &amp; Pan</a> and <a href="/charts/configuration/navigator">Navigator</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="day" valueYField="value" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-zoom mode="x" />
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
export class LineAreaZoomAndNavigatorDoc {
    readonly data = Array.from({ length: 50 }, (_, i) => ({
        day: `Day ${i + 1}`,
        value: Math.round(40 + Math.sin(i / 5) * 20 + seededRandom(i) * 10)
    }));
}
