import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartXAxis</i> and <i>ChartYAxis</i> to render axes and gridlines. Both default to a category axis with auto-calculated tick labels and a linear scale.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="requests" color="#5daeea" [showMarkers]="true" />
                    <p-chart-x-axis label="Month" />
                    <p-chart-y-axis label="Requests" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesBasicDoc {
    readonly data = [
        { month: 'Jan', requests: 4200 },
        { month: 'Feb', requests: 4800 },
        { month: 'Mar', requests: 5500 },
        { month: 'Apr', requests: 5200 },
        { month: 'May', requests: 6500 },
        { month: 'Jun', requests: 7200 }
    ];
}
