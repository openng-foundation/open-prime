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
    selector: 'types-heatmap-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartColorLegend</i> to display a continuous gradient bar that maps values to colors. Set <i>position</i> to <i>top</i>, <i>bottom</i>, <i>left</i>, or <i>right</i>. Use <i>ticks</i> to control the number of labels and
                <i>formatLabel</i> to customize their text. Set <i>steps</i> to render discrete color blocks instead of a gradient.
            </p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="month" categoryYField="city" valueField="temp" [colorScale]="[0, 15, 30]" [colorRange]="['#eef6ff', '#ffd166', '#ff7a66']" [spacing]="3" [borderRadius]="6" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-color-legend position="bottom" />
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
export class HeatmapLegendDoc {
    readonly data = TEMP_DATA;
}
