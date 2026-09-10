import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-display-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>display</i> to control what is shown. <i>value</i> shows the raw number, <i>percentage</i> shows the proportion of the total, and <i>both</i> shows both. Set <i>display="none"</i> to hide labels without removing the component.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="visits" name="Traffic Sources" />
                        <p-chart-data-labels display="both" />
                        <p-chart-legend position="bottom" />
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
export class DataLabelsDisplayModeDoc {
    readonly data = [
        { category: 'Direct', visits: 4200 },
        { category: 'Organic', visits: 3100 },
        { category: 'Referral', visits: 1800 },
        { category: 'Social', visits: 950 },
        { category: 'Email', visits: 620 }
    ];
}
