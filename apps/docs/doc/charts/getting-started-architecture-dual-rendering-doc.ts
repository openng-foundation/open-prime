import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-architecture-dual-rendering-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>SVG is the right default. Switch to Canvas when pushing past a few thousand marks or for streaming updates.</p>
            <p>SVG renders each mark as a DOM element. It can be styled with CSS, is accessible by default, and works with print and screenshot tools.</p>
            <p>
                Canvas draws everything onto a single <i>&lt;canvas&gt;</i> element on a <i>requestAnimationFrame</i> loop. 100K+ points and streaming updates stay smooth. There's no DOM tree, so CSS selectors don't apply and screen readers can't
                navigate the element tree. Add <i>ChartAccessibility</i> for keyboard navigation and ARIA with Canvas.
            </p>
            <p>SVG picks up CSS custom properties automatically. Canvas doesn't have DOM access, so theming goes through a <i>theme</i> input instead. For details, see <a href="/charts/reference/theming">Theming</a>.</p>
            <p>
                Layout is computed once and shared by both renderers, so geometry, label placement, leader-line routing, and text wrapping match between SVG and Canvas. The one thing that differs is text rasterization: SVG text is drawn by the
                browser and inherits the operating system's font smoothing, so it reads slightly heavier than the same text painted by Canvas <i>fillText</i>. This is inherent to canvas versus DOM text rendering and is not configurable. Choose the
                renderer for the performance and accessibility tradeoff, not for label appearance.
            </p>
            <p>
                Custom content follows the same split. Seams that render in an HTML layer above the chart, such as the legend and tooltip, accept a <i>pChartXxxDef</i> template in both renderers. Seams stamped into the chart's SVG are SVG-only, and
                Canvas takes the matching <i>render*</i> function input instead, drawing through the <i>ctx</i> on its context. That function is not Canvas-only: under SVG it returns an <i>SvgNode</i> descriptor and serves as the alternative to a
                template, which takes precedence when both are supplied. Content painted on Canvas is pixels rather than elements, so it carries no event bindings in either renderer. Each chart type's page documents which form its seams take.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="380">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" curve="smooth" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
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
export class ArchitectureDualRenderingDoc {
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
