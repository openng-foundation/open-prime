import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-donut-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>innerRadius</i> to cut a hole in the center. The value is a ratio of the outer radius. <i>0.6</i> creates a readable account-mix ring, while <i>0.8</i> produces a thin ring.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="accounts" categoryField="plan" [innerRadius]="0.6" />
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
export class PieDonutDonutDoc {
    readonly data = [
        { plan: 'Enterprise', accounts: 42 },
        { plan: 'Business', accounts: 31 },
        { plan: 'Team', accounts: 18 },
        { plan: 'Starter', accounts: 9 }
    ];
}
