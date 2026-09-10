import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

@Component({
    selector: 'types-heatmap-cell-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Cells tile the plot area edge to edge, so <i>spacing</i> is the only thing that separates them: it insets each cell by that many pixels on all four sides, giving an even gap between neighbours and the same inset at the grid's outer
                edge. Set <i>borderRadius</i> for rounded corners. Use <i>borderColor</i> and <i>borderStrokeWidth</i> to add a border around each cell. Set <i>nullColor</i> to customize the fill for missing data cells and <i>showEmptyCells</i> to
                hide them entirely.
            </p>
            <p>#### SvgHeatmapCellStylingDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="day" categoryYField="window" valueField="tickets" [colorRange]="['#eef6ff', '#4ecdc4', '#1f4f7a']" [spacing]="4" [borderRadius]="8" />
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
export class HeatmapCellStylingDoc {
    readonly data = supportLoadMatrix;
}
