import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Place custom content in the center of a donut through the <i>ChartAnnotation</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template. In Canvas mode, pass a <i>render</i> function that draws to
                <i>ctx</i> and returns <i>null</i>. Both expose <i>chartArea</i>, <i>center</i>, <i>xScale</i>, <i>yScale</i>, <i>textColor</i>, <i>fontFamily</i>, and the Canvas <i>ctx</i>. Use <i>center</i> to position content at the chart's
                center; <i>xScale</i> and <i>yScale</i> are <i>null</i> for pie charts.
            </p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie id="revenue" [data]="data" valueField="amount" categoryField="source" [innerRadius]="0.65" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g text-anchor="middle">
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 8" dominant-baseline="central" [attr.font-size]="ctx.responsive.pick({ xs: 20, sm: 28 })" font-weight="bold">{{ formatted }}</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 16" dominant-baseline="central" [attr.font-size]="ctx.responsive.pick({ xs: 10, sm: 13 })" opacity="0.6">Total Revenue</svg:text>
                                </svg:g>
                            </ng-template>
                        </p-chart-annotation>
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
export class PieDonutAnnotationDoc {
    readonly data = [
        { source: 'Online', amount: 42000 },
        { source: 'Retail', amount: 28000 },
        { source: 'Wholesale', amount: 18000 },
        { source: 'Partners', amount: 12000 }
    ];
    readonly formatted = `$${(this.data.reduce((sum, d) => sum + d.amount, 0) / 1000).toFixed(0)}k`;
}
