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
    selector: 'configuration-zoom-pan-zoom-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>mode</i> to control which axes zoom. <i>'x'</i> zooms only the category or time axis (default), <i>'y'</i> zooms only the value axis, and <i>'xy'</i> zooms both at once. The <i>xy</i> mode is handy for scatter charts where both
                dimensions are continuous.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="points" [data]="data" valueXField="x" valueYField="y" color="#5daeea" [markerSize]="5" />
                        <p-chart-x-axis label="X" />
                        <p-chart-y-axis label="Y" />
                        <p-chart-zoom mode="xy" />
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
export class ZoomPanZoomModeDoc {
    readonly data = Array.from({ length: 80 }, (_, i) => ({
        x: Math.round(seededRandom(i) * 100 * 10) / 10,
        y: Math.round(seededRandom(i + 1000) * 100 * 10) / 10
    }));
}
