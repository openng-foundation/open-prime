import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, defineChartPlugin, type ChartPluginContext, type ChartPluginEntry } from '@openng/optimus-ui/charts';

interface Stats {
    count: number;
    total: number;
    average: number;
    max: number;
}

@Component({
    selector: 'configuration-plugins-live-stats-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Reads every dataset on each frame and exposes live aggregates (count, total, average, max) through a signal. The chart analogue of a character-count plugin: pure data, no painting.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="420" [plugins]="plugins">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5ccf9f" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
                <div style="display: flex; gap: 16px; padding: 12px 4px 0; font-size: 13px; color: var(--p-text-color, #374151)">
                    <span><strong>Points:</strong> {{ liveStats().count }}</span>
                    <span><strong>Total:</strong> {{ liveStats().total.toLocaleString() }}</span>
                    <span><strong>Average:</strong> {{ round(liveStats().average).toLocaleString() }}</span>
                    <span><strong>Max:</strong> {{ liveStats().max.toLocaleString() }}</span>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsLiveStatsDoc {
    readonly round = Math.round;

    readonly data = [
        { month: 'Jan', bookings: 320 },
        { month: 'Feb', bookings: 480 },
        { month: 'Mar', bookings: 410 },
        { month: 'Apr', bookings: 590 },
        { month: 'May', bookings: 530 }
    ];

    readonly liveStats = signal<Stats>({ count: 0, total: 0, average: 0, max: 0 });

    private readonly statsPlugin = defineChartPlugin('stats', (ctx: ChartPluginContext<unknown>) => {
        const compute = () => {
            let count = 0;
            let total = 0;
            let max = -Infinity;

            for (const [, ds] of ctx.getDatasets()) {
                const rows = ((ds.props as { data?: unknown[] }).data ?? []) as Record<string, unknown>[];

                for (const row of rows) {
                    const v = Number(row.bookings ?? 0);

                    count++;
                    total += v;
                    if (v > max) max = v;
                }
            }

            this.liveStats.set({ count, total, average: count ? total / count : 0, max: count ? max : 0 });
        };

        compute();
        ctx.onFrame(compute);

        return { api: { getStats: () => this.liveStats() } };
    });

    readonly plugins: ChartPluginEntry[] = [this.statsPlugin];
}
