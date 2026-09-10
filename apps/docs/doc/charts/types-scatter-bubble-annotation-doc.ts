import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Overlay custom content on the chart area through the <i>ChartAnnotation</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template. In Canvas mode, pass a <i>render</i> function that draws to
                <i>ctx</i> and returns <i>null</i>. Both expose <i>chartArea</i>, <i>center</i>, <i>xScale</i>, <i>yScale</i>, <i>textColor</i>, <i>isDark</i>, and the Canvas <i>ctx</i>. Use <i>xScale</i> and <i>yScale</i> to position annotations at
                specific data coordinates, and <i>getScale('y2')</i> to position against a secondary axis by its ID. Use this for quadrant labels and callouts on extreme points.
            </p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="warehouse" [data]="data" valueXField="pickTime" valueYField="accuracy" color="#4ecdc4" [markerSize]="7" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:text
                                    [attr.x]="ctx.chartArea.x + ctx.chartArea.width - ctx.responsive.pick({ xs: 6, sm: 8, md: 10 })"
                                    [attr.y]="ctx.chartArea.y + ctx.responsive.pick({ xs: 14, sm: 16, md: 20 })"
                                    text-anchor="end"
                                    [attr.font-size]="ctx.responsive.pick({ xs: 10, sm: 11, md: 13 })"
                                    font-weight="600"
                                    opacity="0.6"
                                >
                                    r² = 0.91
                                </svg:text>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-x-axis label="Average pick time (min)" />
                        <p-chart-y-axis label="Pick accuracy (%)" />
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
export class ScatterBubbleAnnotationDoc {
    readonly data = [
        { pickTime: 2.4, accuracy: 96 },
        { pickTime: 3.1, accuracy: 94 },
        { pickTime: 3.8, accuracy: 92 },
        { pickTime: 4.2, accuracy: 89 },
        { pickTime: 4.9, accuracy: 86 },
        { pickTime: 5.4, accuracy: 83 },
        { pickTime: 6.2, accuracy: 79 },
        { pickTime: 7.1, accuracy: 75 },
        { pickTime: 8.3, accuracy: 68 }
    ];
}
