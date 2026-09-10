import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-architecture-compound-api-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>ChartSvg</i> and <i>ChartCanvas</i> are the chart roots. They manage layout, scales, the animation loop, and theme. Series, axes, legends, and tooltips are child components that hook into the root when they mount.</p>
            <p>
                The component is the configuration. Adding <i>&lt;p-chart-legend /&gt;</i> renders a legend and reserves space for it. Removing it removes the legend. There's no <i>showLegend</i> flag on the root. The same is true for axes, tooltips,
                zoom, and hover. Every feature is a component to add or remove.
            </p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Part</th>
                            <th>Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>ChartSvg</i> / <i>ChartCanvas</i></td>
                            <td>Root. Manages layout, scales, animation loop, and theme.</td>
                        </tr>
                        <tr>
                            <td>Series (<i>ChartLine</i>, <i>ChartBar</i>, ...)</td>
                            <td>Draws data marks and binds field names to the data array.</td>
                        </tr>
                        <tr>
                            <td><i>ChartXAxis</i> / <i>ChartYAxis</i></td>
                            <td>Scale labels, grid lines, tick marks, and axis titles.</td>
                        </tr>
                        <tr>
                            <td><i>ChartLegend</i></td>
                            <td>Series labels and visibility toggles.</td>
                        </tr>
                        <tr>
                            <td><i>ChartTooltip</i></td>
                            <td>Hover detail panel. Supports standard, crosshair, and shared modes.</td>
                        </tr>
                        <tr>
                            <td><i>ChartZoom</i></td>
                            <td>Drag-to-zoom and pan within the visible range.</td>
                        </tr>
                        <tr>
                            <td><i>ChartNavigator</i></td>
                            <td>Scrollable window for exploring long time ranges.</td>
                        </tr>
                        <tr>
                            <td><i>ChartGroup</i></td>
                            <td>Syncs crosshair position, zoom range, and legend state across roots.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>When inputs change, the root waits until the end of the tick and batches everything into one layout and render pass. Update five series at once and it still costs one frame.</p>
            <p>
                The root passes <i>xScale</i> and <i>yScale</i> into context so children know where to draw. <i>chartArea</i> is the plot area inside the axes and title. <i>isDark</i> and <i>textColor</i> come from the active theme so custom
                renderers don't have to detect it themselves.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="400">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureCompoundApiDoc {
    readonly data = [
        { month: 'Jan', revenue: 42 },
        { month: 'Feb', revenue: 55 },
        { month: 'Mar', revenue: 48 },
        { month: 'Apr', revenue: 63 },
        { month: 'May', revenue: 58 },
        { month: 'Jun', revenue: 72 },
        { month: 'Jul', revenue: 65 },
        { month: 'Aug', revenue: 78 }
    ];
}
