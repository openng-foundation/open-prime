import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTooltip</i> to display a tooltip when hovering over data elements. The default <i>mode="item"</i> shows details for the specific element under the cursor: one series, one value.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipBasicDoc {
    readonly data = [
        { month: 'Jan', bookings: 540 },
        { month: 'Feb', bookings: 620 },
        { month: 'Mar', bookings: 810 },
        { month: 'Apr', bookings: 730 },
        { month: 'May', bookings: 900 },
        { month: 'Jun', bookings: 680 }
    ];
}
