import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-polar-grid-styling-doc',
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
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-polar [data]="data" categoryXField="direction" valueYField="speed" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickCount]="3" gridShape="circle" gridStyle="dotted" [gridOpacity]="0.8" [showLine]="false" />
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
export class PolarGridStylingDoc {
    readonly data = [
        { direction: 'N', speed: 12 },
        { direction: 'NE', speed: 8 },
        { direction: 'E', speed: 15 },
        { direction: 'SE', speed: 20 },
        { direction: 'S', speed: 18 },
        { direction: 'SW', speed: 25 },
        { direction: 'W', speed: 22 },
        { direction: 'NW', speed: 10 }
    ];
}
