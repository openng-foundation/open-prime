import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-domain-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>min</i> and <i>max</i> to fix the axis domain. Set <i>startFromZero</i> to force the axis to always include zero. Use <i>softMin</i> and <i>softMax</i> as soft limits. They extend the domain only when the data doesn't already
                reach those values, which prevents unwanted whitespace.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="temp" color="#ff7a66" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="°C" [min]="-10" [max]="40" [startFromZero]="false" [gridLines]="true" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesDomainDoc {
    readonly data = [
        { month: 'Jan', temp: 5 },
        { month: 'Feb', temp: 7 },
        { month: 'Mar', temp: 12 },
        { month: 'Apr', temp: 16 },
        { month: 'May', temp: 20 },
        { month: 'Jun', temp: 25 }
    ];
}
