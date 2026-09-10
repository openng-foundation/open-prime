import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-grid-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Grid styling lives on <i>ChartYAxis</i>. Set <i>tickCount</i> to control the number of concentric levels. Visibility follows the same model as cartesian axes: <i>showLine="false"</i> hides the spoke lines,
                <i>gridLines="false"</i> hides the concentric rings, and <i>showLabels="false"</i> hides the value labels. Use <i>gridColor</i>, <i>gridStrokeWidth</i>, and <i>gridOpacity</i> to adjust the grid line appearance, and set
                <i>gridStyle</i> to <i>dashed</i> or <i>dotted</i> for non-solid grid lines.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" [fillOpacity]="0.25" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="4" gridStyle="dashed" [gridOpacity]="0.8" [showLabels]="false" />
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
export class RadarGridStylingDoc {
    readonly data = [
        { metric: 'Speed', value: 85 },
        { metric: 'Reliability', value: 92 },
        { metric: 'Usability', value: 78 },
        { metric: 'Security', value: 88 },
        { metric: 'Scalability', value: 72 },
        { metric: 'Support', value: 80 }
    ];
}
