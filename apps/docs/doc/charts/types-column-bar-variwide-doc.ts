import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-variwide-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>weightField</i> to a numeric data field to make each bar's width proportional to that value. Wider bars represent larger weight values. Useful for Marimekko charts where two dimensions are encoded at once.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="country" valueYField="gdpPerCapita" weightField="population" [borderRadius]="2" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="GDP per Capita ($k)" />
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
export class ColumnBarVariwideDoc {
    readonly data = [
        { country: 'USA', gdpPerCapita: 63, population: 331 },
        { country: 'China', gdpPerCapita: 12, population: 1412 },
        { country: 'Japan', gdpPerCapita: 40, population: 125 },
        { country: 'Germany', gdpPerCapita: 51, population: 83 },
        { country: 'India', gdpPerCapita: 2, population: 1408 }
    ];
}
