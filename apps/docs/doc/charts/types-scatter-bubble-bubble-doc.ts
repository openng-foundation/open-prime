import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-bubble-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>sizeField</i> to a numeric data field to encode a third dimension as bubble radius. Each point's radius scales between <i>minSize</i> and <i>maxSize</i> based on its value. Sizing is area-based, so the perceived bubble size
                grows in line with the underlying number.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="asia" [data]="asiaData" valueXField="gdp" valueYField="lifeExp" sizeField="population" name="Asia" color="#5daeea" [minSize]="6" [maxSize]="34" />
                        <p-chart-scatter id="europe" [data]="europeData" valueXField="gdp" valueYField="lifeExp" sizeField="population" name="Europe" color="#4ecdc4" [minSize]="6" [maxSize]="34" />
                        <p-chart-scatter id="americas" [data]="americasData" valueXField="gdp" valueYField="lifeExp" sizeField="population" name="Americas" color="#ffad5a" [minSize]="6" [maxSize]="34" />
                        <p-chart-x-axis label="GDP per capita ($K)" [chartPaddingMin]="0.16" [chartPaddingMax]="0.1" />
                        <p-chart-y-axis label="Life expectancy (years)" [startFromZero]="false" [chartPaddingMin]="0.12" [chartPaddingMax]="0.12" />
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
export class ScatterBubbleBubbleDoc {
    readonly asiaData = [
        { gdp: 12, lifeExp: 75, population: 1400 },
        { gdp: 8, lifeExp: 72, population: 1380 },
        { gdp: 42, lifeExp: 84, population: 126 },
        { gdp: 35, lifeExp: 83, population: 52 },
        { gdp: 65, lifeExp: 84, population: 6 }
    ];
    readonly europeData = [
        { gdp: 48, lifeExp: 83, population: 67 },
        { gdp: 52, lifeExp: 81, population: 83 },
        { gdp: 45, lifeExp: 83, population: 60 },
        { gdp: 30, lifeExp: 84, population: 47 },
        { gdp: 58, lifeExp: 82, population: 17 }
    ];
    readonly americasData = [
        { gdp: 65, lifeExp: 79, population: 331 },
        { gdp: 18, lifeExp: 75, population: 212 },
        { gdp: 50, lifeExp: 82, population: 38 },
        { gdp: 10, lifeExp: 75, population: 130 },
        { gdp: 55, lifeExp: 82, population: 25 }
    ];
}
