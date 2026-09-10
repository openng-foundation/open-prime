import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CITIES = ['Tokyo', 'London', 'Sydney', 'New York'];

const AVG_TEMPS: Record<string, number[]> = {
    Tokyo: [5, 6, 10, 15, 20, 23, 27, 28, 24, 18, 12, 7],
    London: [5, 5, 8, 11, 14, 17, 19, 19, 16, 12, 8, 5],
    Sydney: [26, 26, 24, 22, 18, 16, 15, 16, 19, 22, 23, 25],
    'New York': [1, 2, 7, 13, 18, 24, 27, 26, 22, 15, 9, 3]
};

const TEMP_DATA = CITIES.flatMap((city) => MONTHS.map((month, i) => ({ month, city, temp: AVG_TEMPS[city][i] })));

@Component({
    selector: 'types-heatmap-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDataLabels</i> to display a value inside each cell. Use <i>formatter</i> to customize the text. Set <i>display</i> to <i>value</i>, <i>percentage</i>, or <i>both</i>, where the percentage is each cell's share of the
                non-empty total. Percentage is meaningful for additive data such as counts or sales, not for correlations or temperatures. Labels use dark text on light cells and light text on dark cells by default; override with <i>color</i>, which
                can be a callback receiving <i>fillColor</i> to compute a custom contrast. Cells auto-size the text and hide labels that do not fit.
            </p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="month" categoryYField="city" valueField="temp" [colorRange]="['#eef6ff', '#ffd166', '#ff7a66']" />
                        <p-chart-data-labels [formatter]="formatter" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
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
export class HeatmapDataLabelsDoc {
    readonly data = TEMP_DATA;
    readonly formatter = (v: number) => `${v}°`;
}
