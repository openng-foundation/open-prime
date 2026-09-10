import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>A line chart connects data points to show trends over time or across categories. Set <i>categoryXField</i> and <i>valueYField</i> to bind data fields. Add <i>ChartXAxis</i> and <i>ChartYAxis</i> to render axes and gridlines.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="activation" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaBasicDoc {
    readonly data = [
        { month: 'Jan', activation: 41 },
        { month: 'Feb', activation: 46 },
        { month: 'Mar', activation: 49 },
        { month: 'Apr', activation: 45 },
        { month: 'May', activation: 53 },
        { month: 'Jun', activation: 58 }
    ];
}
