import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, defineChartPlugin, type ChartPluginEntry } from '@openng/optimus-ui/charts';

const trendline = (opts: { color?: string } = {}) =>
    defineChartPlugin('trendline', (ctx) => {
        ctx.registerOverlay(({ svg, area }) => {
            if (!svg) return;

            const values: number[] = [];

            for (const [, ds] of ctx.getDatasets()) {
                for (const row of (ds.props as { data?: Record<string, unknown>[] }).data ?? []) values.push(Number(row.bookings ?? 0));
            }

            if (values.length < 2) return;

            const n = values.length;
            const sumX = values.reduce((s, _v, i) => s + i, 0);
            const sumY = values.reduce((s, v) => s + v, 0);
            const sumXY = values.reduce((s, v, i) => s + i * v, 0);
            const sumXX = values.reduce((s, _v, i) => s + i * i, 0);
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
            const intercept = (sumY - slope * sumX) / n;

            const minV = Math.min(...values);
            const maxV = Math.max(...values);
            const range = maxV - minV || 1;
            const yFor = (val: number) => area.y + area.height - ((val - minV) / range) * area.height;

            const x1 = area.x + area.width / (n * 2);
            const x2 = area.x + area.width - area.width / (n * 2);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            line.setAttribute('x1', String(x1));
            line.setAttribute('y1', String(yFor(intercept)));
            line.setAttribute('x2', String(x2));
            line.setAttribute('y2', String(yFor(slope * (n - 1) + intercept)));
            line.setAttribute('stroke', opts.color ?? '#7c8cff');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '6 4');
            svg.appendChild(line);
        });
    });

@Component({
    selector: 'configuration-plugins-trendline-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Fits a least-squares regression line to the series and paints it across the plot area. Useful for surfacing the underlying direction of noisy data.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="420" [plugins]="plugins">
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
export class PluginsTrendlineDoc {
    readonly data = [
        { month: 'Jan', bookings: 310 },
        { month: 'Feb', bookings: 380 },
        { month: 'Mar', bookings: 350 },
        { month: 'Apr', bookings: 470 },
        { month: 'May', bookings: 520 },
        { month: 'Jun', bookings: 610 }
    ];

    readonly plugins: ChartPluginEntry[] = [trendline({ color: '#7c8cff' })];
}
