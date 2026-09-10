import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>ChartAnnotation</i> to render custom content overlaid on the chart area. Use for event markers, threshold callouts, or forecast boundaries tied to specific data coordinates.</p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="pipeline" curve="smooth" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 10" [attr.y]="ctx.chartArea.y + 20" text-anchor="end" [attr.font-size]="ctx.responsive.pick({ xs: 10, sm: 11, md: 13 })" font-weight="600" opacity="0.6">
                                    Expansion pipeline ($k)
                                </svg:text>
                            </ng-template>
                        </p-chart-annotation>
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaAnnotationDoc {
    readonly data = [
        { month: 'Jan', pipeline: 42 },
        { month: 'Feb', pipeline: 48 },
        { month: 'Mar', pipeline: 55 },
        { month: 'Apr', pipeline: 52 },
        { month: 'May', pipeline: 65 },
        { month: 'Jun', pipeline: 72 }
    ];
}
