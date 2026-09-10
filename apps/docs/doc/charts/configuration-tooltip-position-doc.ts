import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-position-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>position</i> to control where the tooltip appears relative to the hovered element. <i>cursor</i> (default) follows the mouse, <i>top</i> and <i>bottom</i> pin it to the chart edges, <i>left</i> and <i>right</i> align it to the
                sides. Use <i>offsetX</i> and <i>offsetY</i> to adjust placement after the position is applied.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="sales" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip position="top" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipPositionDoc {
    readonly data = [
        { month: 'Jan', sales: 540 },
        { month: 'Feb', sales: 620 },
        { month: 'Mar', sales: 810 },
        { month: 'Apr', sales: 730 },
        { month: 'May', sales: 900 },
        { month: 'Jun', sales: 680 }
    ];
}
