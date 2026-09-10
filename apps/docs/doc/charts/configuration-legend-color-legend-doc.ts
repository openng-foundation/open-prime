import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number) {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

let _idx = 0;
const heatmapData = days.flatMap((day) =>
    months.map((month) => ({
        month,
        day,
        value: Math.round(seededRandom(_idx++) * 80 + 20)
    }))
);

@Component({
    selector: 'configuration-legend-color-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartColorLegend</i> to display a continuous gradient bar mapping values to colors. It renders only when a scale is available: from a heatmap, a value-colored treemap, or an explicit <i>colorScale</i>/<i>colorRange</i> on the
                legend. Without a scale it renders nothing. Set <i>ticks</i> to control the number of labels and <i>formatLabel</i> to customize their text. Set <i>steps</i> to render discrete color blocks instead of a smooth gradient. Use
                <i>width</i> and <i>height</i> to control the gradient bar dimensions.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="280">
                    <p-chart-heatmap [data]="data" categoryXField="month" categoryYField="day" valueField="value" [colorScale]="[0, 50, 100]" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" [spacing]="3" [borderRadius]="4" />
                    <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                    <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                    <p-chart-color-legend position="bottom" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendColorLegendDoc {
    readonly data = heatmapData;
}
