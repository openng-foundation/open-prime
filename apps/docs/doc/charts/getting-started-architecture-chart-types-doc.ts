import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-architecture-chart-types-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Pick the chart type before configuring layout or features. The type drives what the x-axis represents, how marks overlap, and what interactions make sense.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>User need</th>
                            <th>Chart type</th>
                            <th>Add when needed</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Trends and changes over time</td>
                            <td>Line &amp; Area</td>
                            <td>Area fill, stacking, range bands, time-series axis</td>
                            <td><a href="/charts/types/line-area">Line &amp; Area</a></td>
                        </tr>
                        <tr>
                            <td>Comparisons across categories</td>
                            <td>Column &amp; Bar</td>
                            <td>Grouping, stacking, waterfall, horizontal orientation</td>
                            <td><a href="/charts/types/column-bar">Column &amp; Bar</a></td>
                        </tr>
                        <tr>
                            <td>Part-to-whole relationships</td>
                            <td>Pie &amp; Donut</td>
                            <td>Donut cutout, gauge variant, data labels, custom center slot</td>
                            <td><a href="/charts/types/pie-donut">Pie &amp; Donut</a></td>
                        </tr>
                        <tr>
                            <td>Correlations and distributions</td>
                            <td>Scatter &amp; Bubble</td>
                            <td>Bubble sizing, quadrant lines, color scale</td>
                            <td><a href="/charts/types/scatter-bubble">Scatter &amp; Bubble</a></td>
                        </tr>
                        <tr>
                            <td>Intensity across two categorical dimensions</td>
                            <td>Heatmap</td>
                            <td>Color scale, custom cell content, null handling</td>
                            <td><a href="/charts/types/heatmap">Heatmap</a></td>
                        </tr>
                        <tr>
                            <td>Financial OHLC price data</td>
                            <td>Candlestick &amp; OHLC</td>
                            <td>Volume bars via Combo, annotations, navigator</td>
                            <td><a href="/charts/types/candlestick">Candlestick &amp; OHLC</a></td>
                        </tr>
                        <tr>
                            <td>Multivariate profiles and comparisons</td>
                            <td>Radar</td>
                            <td>Fill, multiple series, custom spoke labels</td>
                            <td><a href="/charts/types/radar">Radar</a></td>
                        </tr>
                        <tr>
                            <td>Radial bars proportional to value</td>
                            <td>Polar</td>
                            <td>Multiple series, custom colors, labels</td>
                            <td><a href="/charts/types/polar">Polar</a></td>
                        </tr>
                        <tr>
                            <td>Hierarchical part-to-whole</td>
                            <td>Treemap</td>
                            <td>Drilldown, hierarchy levels, custom cell content</td>
                            <td><a href="/charts/types/treemap">Treemap</a></td>
                        </tr>
                        <tr>
                            <td>Mixed chart types on a shared category axis</td>
                            <td>Combo</td>
                            <td>Secondary y-axis, mixed series colors</td>
                            <td><a href="/charts/types/combo">Combo</a></td>
                        </tr>
                        <tr>
                            <td>Multiple charts with shared crosshair and zoom</td>
                            <td>Synced Charts</td>
                            <td>Shared legend, shared zoom range</td>
                            <td><a href="/charts/types/synced">Synced Charts</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureChartTypesDoc {}
