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
    selector: 'configuration-zoom-pan-zoom-and-pan-buttons-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>zoomButtons</i> to <i>true</i> to render a control cluster in the corner of the chart: zoom out, zoom in, and, where a drag-pan gesture exists, pan left and pan right. The reset button joins the same cluster.</p>
            <p>
                The buttons make zooming and panning reachable without a drag gesture, which is what WCAG 2.5.7 (Dragging Movements) requires, and reachable by keyboard alone, which is what WCAG 2.1.1 (Keyboard) requires. They are opt-in, so a chart
                that offers dragging without enabling them leaves both routes closed.
            </p>
            <p>
                The pan pair appears only where a drag-pan gesture exists, that is when <i>pan</i> is enabled or a <i>ChartNavigator</i> is mounted. Adding a navigator therefore changes what the cluster contains, because the navigator window is
                itself dragged to pan.
            </p>
            <p>
                Every button takes its accessible name from the text catalogue, so it is translated wherever a locale is registered. A button whose action becomes unavailable is marked <i>aria-disabled</i> and stays in the tab order rather than
                disappearing, which keeps focus where the user left it. Each press announces the resulting range to screen readers.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="timestamp" valueYField="price" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis label="Price ($)" [startFromZero]="false" />
                        <p-chart-zoom mode="x" [pan]="{ enabled: true, modifierKey: 'shift' }" [zoomButtons]="true" />
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
export class ZoomPanZoomAndPanButtonsDoc {
    readonly data = priceSeries(120);
}
