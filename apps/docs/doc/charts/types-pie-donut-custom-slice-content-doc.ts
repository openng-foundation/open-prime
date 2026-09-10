import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-custom-slice-content-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Draw custom content inside each slice through the <i>pChartSliceDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartSliceDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup centered at the origin. In Canvas mode,
                pass a <i>renderContent</i> function that draws to <i>ctx</i> and returns <i>null</i>. Both expose the slice's <i>value</i>, <i>percentage</i>, <i>label</i>, <i>index</i>, and <i>color</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="priority">
                            <ng-template pChartSliceDef let-ctx>
                                @if (ctx.percentage >= 10) {
                                    <svg:text text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="bold" fill="#fff">{{ ctx.label }}</svg:text>
                                }
                            </ng-template>
                        </p-chart-pie>
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
export class PieDonutCustomSliceContentDoc {
    readonly data = [
        { priority: 'Critical', share: 18 },
        { priority: 'High', share: 31 },
        { priority: 'Medium', share: 34 },
        { priority: 'Low', share: 17 }
    ];
}
