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
    selector: 'configuration-navigator-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartNavigator</i> alongside <i>ChartZoom</i> to display a compact overview of the full dataset below the main chart. Drag the selection window to pan, drag its edges to resize, and click outside the window to jump to a
                position. The navigator and zoom share the same zoom state. Dragging the navigator handle updates the main chart and vice versa.
            </p>
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
export class NavigatorBasicDoc {
    readonly data = Array.from({ length: 60 }, (_, i) => ({
        day: `Day ${i + 1}`,
        value: Math.round(40 + Math.sin(i / 5) * 20 + seededRandom(i) * 10)
    }));
}
