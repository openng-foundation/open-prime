import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

@Component({
    selector: 'types-heatmap-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>p-chart-tooltip</i> to show cell details on hover. The tooltip displays the X category, Y category, and value for the hovered cell. Cells tile the plot, so the cursor always resolves to one: the gap left by
                <i>spacing</i> belongs to the cell beside it rather than reporting nothing, which keeps the tooltip steady while moving across a dense grid. Set <i>snap="none"</i> on the tooltip to hover only the painted cell and leave the gaps
                empty.
            </p>
            <p>#### SvgHeatmapTooltipDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
            <p>For full configuration see <a href="/charts/configuration/tooltip">Tooltip</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="day" categoryYField="window" valueField="tickets" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" [spacing]="2" [borderRadius]="4" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
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
export class HeatmapTooltipDoc {
    readonly data = supportLoadMatrix;
}
