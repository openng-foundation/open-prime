import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>ChartAnnotation</i> to render custom content overlaid on the chart area. Use for targets, capacity limits, and callouts tied to category groups or value thresholds.</p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="trials" color="#5daeea" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="New trials" />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @if (ctx.chartArea.width) {
                                <svg:text [attr.x]="ctx.chartArea.x + ctx.chartArea.width - 8" [attr.y]="ctx.chartArea.y + 20" text-anchor="end" [attr.font-size]="ctx.responsive.pick({ xs: 10, sm: 11, md: 13 })" opacity="0.6">
                                    Launch push record high
                                </svg:text>
                            }
                        </ng-template>
                    </p-chart-annotation>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarAnnotationDoc {
    readonly data = [
        { quarter: 'Q1', trials: 280 },
        { quarter: 'Q2', trials: 340 },
        { quarter: 'Q3', trials: 310 },
        { quarter: 'Q4', trials: 520 }
    ];
}
