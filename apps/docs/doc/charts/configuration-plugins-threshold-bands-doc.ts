import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, defineChartPlugin, type ChartPluginEntry } from '@openng/optimus-ui/charts';

interface ThresholdOptions {
    warn: number;
    critical: number;
    max: number;
}

const threshold = (opts: ThresholdOptions = { warn: 200, critical: 280, max: 350 }) =>
    defineChartPlugin('threshold', (ctx) => {
        ctx.registerOverlay(({ svg, area }) => {
            if (!svg) return;

            const o = opts;
            const yFor = (v: number) => area.y + area.height - (v / o.max) * area.height;

            const band = (top: number, bottom: number, fill: string) => {
                const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

                r.setAttribute('x', String(area.x));
                r.setAttribute('y', String(top));
                r.setAttribute('width', String(area.width));
                r.setAttribute('height', String(Math.max(0, bottom - top)));
                r.setAttribute('fill', fill);
                svg.appendChild(r);
            };

            band(area.y, yFor(o.critical), 'rgba(229, 72, 77, 0.10)');
            band(yFor(o.critical), yFor(o.warn), 'rgba(255, 173, 90, 0.12)');
            band(yFor(o.warn), area.y + area.height, 'rgba(16, 169, 129, 0.08)');
        });
    });

@Component({
    selector: 'configuration-plugins-threshold-bands-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Shades the plot area into ok / warning / critical zones at fixed value thresholds, so out-of-SLA regions are obvious at a glance. Ideal for monitoring and alerting dashboards.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="420" [plugins]="plugins">
                    <p-chart-line [data]="data" categoryXField="hour" valueYField="latency" color="#36b7d6" [showMarkers]="true" />
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
export class PluginsThresholdBandsDoc {
    readonly data = [
        { hour: '00', latency: 120 },
        { hour: '04', latency: 95 },
        { hour: '08', latency: 240 },
        { hour: '12', latency: 310 },
        { hour: '16', latency: 180 },
        { hour: '20', latency: 140 }
    ];

    readonly plugins: ChartPluginEntry[] = [threshold({ warn: 200, critical: 280, max: 350 })];
}
