import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext } from '@openng/optimus-ui/charts';
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

const LABEL = 'Peak intake: Wed 12:00-14:00';

@Component({
    selector: 'types-heatmap-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Overlay custom content on the chart area through the <i>ChartAnnotation</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template. In Canvas mode, pass a <i>render</i> function that draws to
                <i>ctx</i> and returns <i>null</i>. Both expose <i>chartArea</i>, <i>center</i>, <i>xScale</i>, <i>yScale</i>, <i>textColor</i>, <i>isDark</i>, and the Canvas <i>ctx</i>. Use <i>xScale</i> and <i>yScale</i> to position annotations at
                specific cell coordinates, and <i>getScale</i> to look up axes by ID.
            </p>
            <p>#### SvgHeatmapAnnotationDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="day" categoryYField="window" valueField="tickets" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" [spacing]="2" [borderRadius]="4" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.chartArea && ctx.chartArea.width) {
                                    <svg:g>
                                        <svg:rect [attr.x]="boxX(ctx) - fontSize(ctx) / 2 - 3" [attr.y]="ctx.chartArea.y + 20 - fontSize(ctx) / 2 - 3" [attr.width]="textWidth(ctx) + 12" [attr.height]="fontSize(ctx) + 6" fill="rgba(31,79,122,0.88)" />
                                        <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 8" [attr.y]="ctx.chartArea.y + 20" text-anchor="end" dominant-baseline="middle" [attr.font-size]="fontSize(ctx)" fill="#ffffff">
                                            {{ label }}
                                        </svg:text>
                                    </svg:g>
                                }
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
export class HeatmapAnnotationDoc {
    readonly data = supportLoadMatrix;
    readonly label = LABEL;

    fontSize(ctx: AnnotationContext): number {
        return ctx.responsive.pick({ xs: 10, sm: 11, md: 13 });
    }

    textWidth(ctx: AnnotationContext): number {
        return LABEL.length * (this.fontSize(ctx) * 0.55);
    }

    boxX(ctx: AnnotationContext): number {
        return ctx.chartArea.x + ctx.chartArea.width - 8 - this.textWidth(ctx);
    }
}
