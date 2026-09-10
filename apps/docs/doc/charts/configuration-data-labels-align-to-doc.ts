import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-align-to-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>alignTo</i> to <i>edge</i> to align all outside labels flush to the chart boundary. Labels on both sides line up at the same horizontal distance, giving a column layout. The default <i>labelLine</i> positions each label at its
                own leader line end.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="amount" name="Budget" />
                        <p-chart-data-labels lineStyle="angled" alignTo="edge" />
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
export class DataLabelsAlignToDoc {
    readonly data = [
        { category: 'Rent', amount: 1800 },
        { category: 'Food', amount: 650 },
        { category: 'Transport', amount: 320 },
        { category: 'Utilities', amount: 280 },
        { category: 'Entertainment', amount: 200 },
        { category: 'Savings', amount: 500 }
    ];
}
