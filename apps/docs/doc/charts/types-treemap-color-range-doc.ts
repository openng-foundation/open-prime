import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-color-range-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>colorValueField</i> to a numeric field to map cell colors to a gradient. Set <i>colorRange</i> to define the color stops; breakpoints are auto-computed from the data min/max. Set <i>colorScale</i> alongside <i>colorRange</i> to
                define explicit breakpoints, useful for diverging scales where negative, neutral, and positive values need stable stops.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="population" colorValueField="population" [colorRange]="colorRange" />
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
export class TreemapColorRangeDoc {
    readonly colorRange = ['#eef6ff', '#5bc8f5', '#2531a8'];
    readonly data = [
        { name: 'Asia', population: 4700 },
        { name: 'Africa', population: 1400 },
        { name: 'Europe', population: 750 },
        { name: 'N. America', population: 580 },
        { name: 'S. America', population: 430 },
        { name: 'Oceania', population: 45 }
    ];
}
