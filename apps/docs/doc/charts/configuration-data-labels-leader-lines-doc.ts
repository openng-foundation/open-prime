import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-leader-lines-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                On pie and donut charts, labels render outside the slices with a leader line connecting each label to its slice. Set <i>lineStyle</i> to <i>angled</i> (default; radial segment with horizontal elbow), <i>straight</i> (single direct
                line), or <i>none</i> (no connector). Set <i>alignTo</i> to <i>labelLine</i> (labels align to the line end) or <i>edge</i> (labels align flush to the chart boundary).
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="category" valueField="amount" name="Budget" />
                        <p-chart-data-labels display="both" lineStyle="angled" [formatter]="formatter" />
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
export class DataLabelsLeaderLinesDoc {
    readonly data = [
        { category: 'Rent', amount: 1800 },
        { category: 'Food', amount: 650 },
        { category: 'Transport', amount: 320 },
        { category: 'Utilities', amount: 280 },
        { category: 'Entertainment', amount: 200 },
        { category: 'Savings', amount: 500 }
    ];

    formatter = (v: number, p?: number) => `$${v} (${Math.round(p ?? 0)}%)`;
}
