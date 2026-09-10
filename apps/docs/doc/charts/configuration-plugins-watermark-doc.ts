import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, defineChartPlugin, type ChartPluginEntry } from '@openng/optimus-ui/charts';

const watermark = (opts: { text?: string } = {}) =>
    defineChartPlugin('watermark', (ctx) => {
        ctx.registerOverlay(({ svg, area }) => {
            if (!svg) return;

            const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const cx = area.x + area.width / 2;
            const cy = area.y + area.height / 2;

            t.setAttribute('x', String(cx));
            t.setAttribute('y', String(cy));
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('dominant-baseline', 'middle');
            t.setAttribute('font-size', '40');
            t.setAttribute('font-weight', '700');
            t.setAttribute('fill', 'rgba(17, 24, 39, 0.18)');
            t.setAttribute('stroke', 'rgba(255, 255, 255, 0.35)');
            t.setAttribute('stroke-width', '0.75');
            t.setAttribute('paint-order', 'stroke');
            t.setAttribute('letter-spacing', '2');
            t.setAttribute('transform', `rotate(-24 ${cx} ${cy})`);
            t.textContent = opts.text ?? 'PrimeUI';
            svg.appendChild(t);
        });
    });

@Component({
    selector: 'configuration-plugins-watermark-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>A minimal overlay plugin: paints a diagonal label across the plot area. It reads only the chart area and draws, with no data access.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [plugins]="plugins">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsWatermarkDoc {
    readonly data = [
        { month: 'Jan', bookings: 320 },
        { month: 'Feb', bookings: 480 },
        { month: 'Mar', bookings: 410 },
        { month: 'Apr', bookings: 590 },
        { month: 'May', bookings: 530 }
    ];

    readonly plugins: ChartPluginEntry[] = [watermark({ text: 'CONFIDENTIAL' })];
}
