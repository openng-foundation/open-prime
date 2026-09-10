import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-offsets-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>distance</i> (alias: <i>leaderOffset</i>) to control the gap between the slice edge and the start of the leader line on circular charts. Use <i>textGap</i> (alias: <i>textOffset</i>) to add space between the leader line end and
                the label text. Use <i>horizontalOffset</i> to shift labels horizontally after alignment.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="amount" name="Budget" />
                        <p-chart-data-labels lineStyle="angled" [distance]="20" [textGap]="8" [horizontalOffset]="20" />
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
export class DataLabelsOffsetsDoc {
    readonly data = [
        { category: 'Rent', amount: 1800 },
        { category: 'Food', amount: 650 },
        { category: 'Transport', amount: 320 },
        { category: 'Utilities', amount: 280 },
        { category: 'Savings', amount: 500 }
    ];
}
