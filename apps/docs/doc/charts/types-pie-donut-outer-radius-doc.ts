import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-outer-radius-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>outerRadius</i> to control how much of the chart area the pie fills. The default <i>1</i> fills the available space. A smaller radius leaves room for external labels and leader lines.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="source" [outerRadius]="0.72" />
                        <p-chart-data-labels display="label-percentage" lineStyle="angled" [fontSize]="11" />
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
export class PieDonutOuterRadiusDoc {
    readonly data = [
        { source: 'Paid search', share: 32 },
        { source: 'Organic', share: 24 },
        { source: 'Lifecycle email', share: 18 },
        { source: 'Partner', share: 14 },
        { source: 'Community', share: 12 }
    ];
}
