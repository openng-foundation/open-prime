import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDataLabels</i> to display labels outside the slices with leader lines. Set <i>display</i> to <i>value</i>, <i>percentage</i>, or <i>both</i>. Use <i>minPercentage</i> to hide labels on very small slices and
                <i>lineStyle</i> to switch between angled and straight connectors.
            </p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="population" categoryField="continent" sort="value-desc" />
                        <p-chart-data-labels display="percentage" [fontSize]="12" fontWeight="bold" lineStyle="angled" />
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
export class PieDonutDataLabelsDoc {
    readonly data = [
        { continent: 'Europe', population: 745 },
        { continent: 'Oceania', population: 46 },
        { continent: 'Asia', population: 4753 },
        { continent: 'South America', population: 434 },
        { continent: 'Africa', population: 1461 },
        { continent: 'North America', population: 380 }
    ];
}
