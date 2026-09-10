import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const data = [
    { metric: 'Speed', value: 85 },
    { metric: 'Reliability', value: 92 },
    { metric: 'Usability', value: 78 },
    { metric: 'Security', value: 88 },
    { metric: 'Scalability', value: 72 },
    { metric: 'Support', value: 80 }
];

const AVG = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);

@Component({
    selector: 'types-radar-annotation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Overlay custom content on the chart area through the <i>ChartAnnotation</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAnnotationDef let-ctx&gt;</i> template. In Canvas mode, pass a <i>render</i> function that draws to
                <i>ctx</i> and returns <i>null</i>. Both expose <i>chartArea</i>, <i>center</i>, <i>xScale</i>, <i>yScale</i>, <i>textColor</i>, and the Canvas <i>ctx</i>. Use <i>center</i> to position content at the chart's center; <i>xScale</i> and
                <i>yScale</i> are <i>null</i> for radar charts.
            </p>
            <p>For full configuration see <a href="/charts/configuration/annotation">Annotation</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" [fillOpacity]="0.2" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-annotation>
                            <ng-template pChartAnnotationDef let-ctx>
                                <svg:g text-anchor="middle">
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y - 8" font-size="22" font-weight="700">{{ avg }}</svg:text>
                                    <svg:text [attr.x]="ctx.center.x" [attr.y]="ctx.center.y + 12" font-size="11" opacity="0.5">avg score</svg:text>
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
export class RadarAnnotationDoc {
    readonly data = data;
    readonly avg = AVG;
}
