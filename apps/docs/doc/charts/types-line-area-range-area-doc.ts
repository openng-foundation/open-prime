import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-range-area-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap two <i>ChartLine</i> components inside <i>ChartRange</i> to fill the region between them. Set <i>color</i> on <i>ChartRange</i> for a uniform fill, or omit it for dual-color mode where each line's color fills the region where
                that series is on top. <i>ChartRange</i> requires exactly two <i>ChartLine</i> children. Fewer renders nothing; more than two uses only the first two.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-range>
                            <p-chart-line [data]="data" categoryXField="month" valueYField="high" name="High" curve="smooth" />
                            <p-chart-line [data]="data" categoryXField="month" valueYField="low" name="Low" curve="smooth" />
                        </p-chart-range>
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaRangeAreaDoc {
    readonly data = [
        { month: 'Jan', high: 8, low: -2 },
        { month: 'Feb', high: 10, low: 0 },
        { month: 'Mar', high: 15, low: 4 },
        { month: 'Apr', high: 20, low: 8 },
        { month: 'May', high: 25, low: 13 },
        { month: 'Jun', high: 30, low: 18 },
        { month: 'Jul', high: 33, low: 21 },
        { month: 'Aug', high: 32, low: 20 },
        { month: 'Sep', high: 27, low: 15 },
        { month: 'Oct', high: 20, low: 9 },
        { month: 'Nov', high: 13, low: 4 },
        { month: 'Dec', high: 9, low: 0 }
    ];
}
