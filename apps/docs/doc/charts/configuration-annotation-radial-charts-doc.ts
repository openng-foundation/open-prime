import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const DATA = [
    { category: 'Rent', amount: 1800 },
    { category: 'Food', amount: 650 },
    { category: 'Transport', amount: 320 },
    { category: 'Utilities', amount: 280 },
    { category: 'Other', amount: 450 }
];

@Component({
    selector: 'configuration-annotation-radial-charts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                On pie, donut, polar, and radar charts <i>xScale</i>, <i>yScale</i>, and <i>getScale</i> are <i>null</i> because there are no cartesian axes. Use <i>center</i> to position content at the chart center and <i>chartArea</i> for the
                bounding rectangle. This is the standard approach for donut hole labels and polar center annotations.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="amount" name="Expenses" [innerRadius]="0.65" />
                        <p-chart-legend position="bottom" />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                @if (ctx.center) {
                                    <svg:g>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 10" text-anchor="middle" dominant-baseline="central" [attr.font-size]="ctx.responsive.pick({ xs: 20, sm: 28 })" font-weight="bold">
                                            \${{ totalStr }}
                                        </svg:text>
                                        <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 14" text-anchor="middle" dominant-baseline="central" [attr.font-size]="ctx.responsive.pick({ xs: 9, sm: 12 })" opacity="0.5">Monthly Total</svg:text>
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
export class AnnotationRadialChartsDoc {
    readonly data = DATA;
    readonly totalStr = DATA.reduce((s, d) => s + d.amount, 0).toLocaleString();
}
