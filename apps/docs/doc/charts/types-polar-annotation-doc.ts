import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Overlay custom content on the chart area through the <i>ChartAnnotation</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template. In Canvas mode, pass a <i>render</i> function that draws to
                <i>ctx</i> and returns <i>null</i>. Both expose <i>chartArea</i>, <i>center</i>, <i>xScale</i>, <i>yScale</i>, <i>textColor</i>, and the Canvas <i>ctx</i>. Use <i>center</i> to position content at the chart's center; <i>xScale</i> and
                <i>yScale</i> are <i>null</i> for polar charts. Combine with <i>innerRadius</i> to place content in the hollow center.
            </p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar [data]="data" categoryXField="direction" valueYField="speed" [innerRadius]="0.3" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 5" text-anchor="middle" [attr.font-size]="ctx.responsive.pick({ xs: 11, sm: 12, md: 14 })" font-weight="bold">SW dominant</svg:text>
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
export class PolarAnnotationDoc {
    readonly data = [
        { direction: 'N', speed: 12 },
        { direction: 'NE', speed: 8 },
        { direction: 'E', speed: 15 },
        { direction: 'SE', speed: 20 },
        { direction: 'S', speed: 18 },
        { direction: 'SW', speed: 25 },
        { direction: 'W', speed: 22 },
        { direction: 'NW', speed: 10 }
    ];
}
