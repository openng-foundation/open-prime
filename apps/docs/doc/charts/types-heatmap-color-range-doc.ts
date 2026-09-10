import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

@Component({
    selector: 'types-heatmap-color-range-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>colorRange</i> to define a multi-stop color gradient. Values interpolate between the data minimum and maximum. Set <i>colorScale</i> alongside <i>colorRange</i> to define explicit breakpoints instead of auto-computing them,
                which is necessary for diverging scales where zero needs to map to a specific stop. Use <i>min</i> and <i>max</i> to override the color mapping domain.
            </p>
            <p>#### SvgHeatmapColorRangeDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="day" categoryYField="window" valueField="tickets" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" />
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
export class HeatmapColorRangeDoc {
    readonly data = supportLoadMatrix;
}
