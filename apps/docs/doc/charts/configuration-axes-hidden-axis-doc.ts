import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-hidden-axis-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>visible</i> to <i>false</i> to hide the entire axis including labels, ticks, the axis line, and gridlines. To hide individual parts while keeping the rest, set <i>showLine</i> (axis line), <i>showTicks</i> (tick marks), or
                <i>showLabels</i> (tick labels) to <i>false</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="score" color="#7c8cff" curve="smooth" [fillOpacity]="0.1" />
                    <p-chart-x-axis [showLine]="false" [showTicks]="false" />
                    <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="true" gridStyle="dashed" [gridOpacity]="0.2" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesHiddenAxisDoc {
    readonly data = [
        { month: 'Jan', score: 42 },
        { month: 'Feb', score: 55 },
        { month: 'Mar', score: 48 },
        { month: 'Apr', score: 63 },
        { month: 'May', score: 58 },
        { month: 'Jun', score: 72 }
    ];
}
