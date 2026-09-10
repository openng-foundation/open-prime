import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-svg-vs-canvas-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                SVG is the right default: crisp, CSS-themeable, and inspectable. Switch to <i>ChartCanvas</i> when pushing past a few thousand marks or for high-frequency streaming updates. The two roots share the same children, so swapping is a
                one-line change.
            </p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Renderer</th>
                            <th>Use when</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>ChartSvg</i></td>
                            <td>Default. Up to a few thousand marks, static or low-frequency updates, CSS theming</td>
                        </tr>
                        <tr>
                            <td><i>ChartCanvas</i></td>
                            <td>Large datasets, real-time streaming, dense scatter and heatmap surfaces</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>On Canvas, each series renders to its own compositor layer, so an update repaints only the changed series rather than the whole plot, an advantage for multi-series and live charts.</p>
            <p>### Why the renderer choice matters at scale</p>
            <p>
                The key difference is DOM weight. SVG creates one element per mark: a 50k-point bar chart is 50k <i>&lt;rect&gt;</i> nodes, which the browser must lay out, paint, and keep in memory. Canvas draws every mark into a single bitmap, so
                its DOM stays flat (one <i>&lt;canvas&gt;</i> per layer) no matter how many points you push.
            </p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Points (bar)</th>
                            <th><i>ChartSvg</i> DOM nodes</th>
                            <th><i>ChartCanvas</i> DOM nodes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>5,000</td>
                            <td>~5,000</td>
                            <td>~1 per layer</td>
                        </tr>
                        <tr>
                            <td>50,000</td>
                            <td>~50,000</td>
                            <td>~1 per layer</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>
                Above ~8k marks on a single SVG series the chart logs a development-mode hint pointing you here. Line and area are cheaper, since a line series is a single <i>&lt;path&gt;</i> regardless of point count, so the ceiling mainly affects
                per-mark types (bar, scatter). For dense scatter, SVG also auto-batches into flat paths past a high threshold; bar has no such fallback, so prefer <i>ChartCanvas</i> (or <i>ChartDecimation</i>) for very large bar charts.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceSvgVsCanvasDoc {}
