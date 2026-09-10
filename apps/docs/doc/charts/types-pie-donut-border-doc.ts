import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-border-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>borderStrokeWidth</i> and <i>borderColor</i> to add a stroke around each slice. Add <i>borderRadius</i> for rounded corners, <i>spacing</i> to introduce gaps between slices, and <i>borderDash</i> for a dashed stroke.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="stage" [borderStrokeWidth]="2" borderColor="rgba(255, 255, 255, 0.78)" [borderDash]="[4, 3]" [spacing]="1" [borderRadius]="6" borderAlign="inner" />
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
export class PieDonutBorderDoc {
    readonly data = [
        { stage: 'Qualified', share: 35 },
        { stage: 'Evaluation', share: 27 },
        { stage: 'Security review', share: 16 },
        { stage: 'Procurement', share: 13 },
        { stage: 'Closed won', share: 9 }
    ];
}
