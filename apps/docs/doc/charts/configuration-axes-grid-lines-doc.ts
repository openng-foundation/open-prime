import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-grid-lines-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>gridLines</i> to <i>false</i> to hide major gridlines. Use <i>gridColor</i>, <i>gridStrokeWidth</i>, <i>gridStyle</i>, and <i>gridOpacity</i> to customize their appearance. Set <i>minorGridLines</i> to show additional grid
                lines between major ticks. Use <i>alternateGridColor</i> to fill alternating bands between grid lines.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="latency" color="#36b7d6" curve="smooth" />
                    <p-chart-x-axis alternateGridColor="#5daeea" [alternateGridOpacity]="0.04" />
                    <p-chart-y-axis gridColor="#94a3b8" gridStyle="dashed" [gridOpacity]="0.5" [minorGridLines]="true" [minorGridOpacity]="0.2" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesGridLinesDoc {
    readonly data = [
        { month: 'Jan', latency: 42 },
        { month: 'Feb', latency: 55 },
        { month: 'Mar', latency: 48 },
        { month: 'Apr', latency: 63 },
        { month: 'May', latency: 58 },
        { month: 'Jun', latency: 72 },
        { month: 'Jul', latency: 65 },
        { month: 'Aug', latency: 78 }
    ];
}
