import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { supportLoadMatrix } from '@/doc/charts/data/supportLoadMatrix';

@Component({
    selector: 'types-heatmap-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Use <i>ChartXAxis</i> and <i>ChartYAxis</i> to render category labels along each axis. Set <i>label</i> on each axis to add axis titles.</p>
            <p>#### SvgHeatmapAxesDemo.ts</p>
            <p>#### supportLoadMatrix.ts</p>
            <p>For full configuration see <a href="/charts/configuration/axes">Axes</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="day" categoryYField="window" valueField="tickets" [colorRange]="['#eef6ff', '#5bc8f5', '#2531a8']" />
                        <p-chart-x-axis label="Day" />
                        <p-chart-y-axis label="Queue window" />
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
export class HeatmapAxesDoc {
    readonly data = supportLoadMatrix;
}
