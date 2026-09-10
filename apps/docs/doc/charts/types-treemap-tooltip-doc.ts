import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTooltip</i> to show cell details on hover. The tooltip displays the label and value for the hovered cell.</p>
            <p>For full configuration see <a href="/charts/configuration/tooltip">Tooltip</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="population" />
                        <p-chart-tooltip />
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
export class TreemapTooltipDoc {
    readonly data = [
        { name: 'Asia', population: 4700 },
        { name: 'Africa', population: 1400 },
        { name: 'Europe', population: 750 },
        { name: 'N. America', population: 580 },
        { name: 'S. America', population: 430 },
        { name: 'Oceania', population: 45 }
    ];
}
