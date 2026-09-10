import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-reversed-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>reversed</i> to flip the axis direction. On <i>ChartYAxis</i>, higher values appear at the bottom, which is the natural direction for depth or ranking data. On <i>ChartXAxis</i>, categories run right to left.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="rank" valueYField="score" color="#7c8cff" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="Score" [reversed]="true" [gridLines]="true" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesReversedDoc {
    readonly data = [
        { rank: '1st', score: 98 },
        { rank: '2nd', score: 85 },
        { rank: '3rd', score: 72 },
        { rank: '4th', score: 60 },
        { rank: '5th', score: 45 }
    ];
}
