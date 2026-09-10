import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { injectChartTheme } from '@/doc/charts/_shared/inject-chart-theme';
import { generateClusters, CLUSTER_COUNT, CLUSTER_SEED } from '@/doc/charts/data/scatterClusters';

@Component({
    selector: 'reference-performance-runnable-large-data-evidence-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>The examples below are the current public proof points for high-density charts. They use the same components and source tabs as the type pages, but are grouped here so performance guidance is backed by demos users can run.</p>
            <p>### 100,000 raw scatter points on Canvas</p>
            <p>
                This Canvas-only scatter demo renders the full 100,000-point cloud without decimation. <i>boost</i> mode activates above 50,000 visible points, avoids per-point DOM work, and pairs with quadtree hover lookup after the first pointer
                move. Use this pattern when the visual task is density, clustering, or outlier scanning and the raw point cloud needs to stay visible.
            </p>
            <p>#### CanvasScatterBigDataBoostDemo.ts</p>
            <p>#### scatterClusters.ts</p>
            <p>### 100,000 readings with decimation and fidelity notes</p>
            <p>
                This wind-farm scatter demo keeps the original 100,000 readings in the source data, then applies <i>ChartDecimation algorithm="lttb"</i> with a 2,000-sample target for the visible chart. Treat decimation as a visual-summary layer: it
                preserves the shape and visible extrema better than drawing every mark, but the rendered samples are not a row-for-row audit surface. For workflows that need exact point inspection, pair decimation with zoom, navigator windows, source
                data export, or a detail table that reads from the un-decimated dataset.
            </p>
            <p>#### SvgScatterBigDataDecimationDemo.ts</p>
            <p>#### windFarmTelemetry.ts</p>
            <p>### Streaming with a bounded rolling window</p>
            <p>
                This live server-metrics demo keeps a 60-point rolling window and updates the bound array once per second. Use the Canvas renderer for the high-frequency performance path, and keep the chart input bounded even if the application
                retains longer history elsewhere: store archival data in the app, worker, or backend, and pass only the current viewport window to the chart. That keeps chart memory proportional to the visible window instead of the total stream
                lifetime.
            </p>
            <p>#### SvgLineNasaTempDemo.ts</p>
            <p>#### serverMetrics.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-canvas [theme]="theme()">
                        <p-chart-scatter id="cloud" [data]="samples" valueXField="x" valueYField="y" name="Population sample" color="#7c8cff" [markerSize]="2" [pointFillOpacity]="0.4" [pointBorderStrokeWidth]="0" />
                        <p-chart-zoom mode="xy" />
                        <p-chart-tooltip />
                        <p-chart-legend position="top" />
                        <p-chart-x-axis label="Feature A" />
                        <p-chart-y-axis label="Feature B" />
                        <p-chart-title [text]="totalCount + ' points · Canvas + boost mode'" />
                        <p-chart-caption text="Three Gaussian clusters drawn as a raw 100k point cloud · boost auto-activates above 50k points · hover lookup uses a quadtree (O(log n))" />
                        <p-chart-export-menu filename="scatter-100k-boost" />
                    </p-chart-canvas>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceRunnableLargeDataEvidenceDoc {
    readonly theme = injectChartTheme();
    readonly samples = generateClusters(CLUSTER_COUNT, CLUSTER_SEED);
    readonly totalCount = this.samples.length.toLocaleString();
}
