import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-axis-grouping-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Nest <i>ChartAxisGroup</i> inside <i>ChartXAxis</i> or <i>ChartYAxis</i> to add category group headers below the tick labels. Each group takes a <i>label</i> and lists the categories it spans, given either as a <i>categories</i> input
                or as nested <i>ChartAxisCategory</i> children. Nest multiple <i>ChartAxisGroup</i> components for multi-level grouping. Depth increases from outermost to innermost. Use <i>bracket</i>, <i>separator</i>, <i>fill</i>, and
                <i>tickSeparator</i> to add visual dividers between groups. A <i>range</i> input, or two numeric <i>ChartAxisCategory</i> children, instead defines a value range group across <i>[from, to]</i>. Axis groups apply to bar, line, scatter,
                and candlestick series on a category axis.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="orders" color="#5daeea" />
                    <p-chart-x-axis>
                        <p-chart-axis-group label="Q1" [bracket]="true">
                            <p-chart-axis-category value="Jan" />
                            <p-chart-axis-category value="Feb" />
                            <p-chart-axis-category value="Mar" />
                        </p-chart-axis-group>
                        <p-chart-axis-group label="Q2" [bracket]="true">
                            <p-chart-axis-category value="Apr" />
                            <p-chart-axis-category value="May" />
                            <p-chart-axis-category value="Jun" />
                        </p-chart-axis-group>
                        <p-chart-axis-group label="Q3" [bracket]="true">
                            <p-chart-axis-category value="Jul" />
                            <p-chart-axis-category value="Aug" />
                            <p-chart-axis-category value="Sep" />
                        </p-chart-axis-group>
                        <p-chart-axis-group label="Q4" [bracket]="true">
                            <p-chart-axis-category value="Oct" />
                            <p-chart-axis-category value="Nov" />
                            <p-chart-axis-category value="Dec" />
                        </p-chart-axis-group>
                    </p-chart-x-axis>
                    <p-chart-y-axis label="Orders (K)" [gridLines]="true" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesAxisGroupingDoc {
    readonly data = [
        { month: 'Jan', orders: 42 },
        { month: 'Feb', orders: 48 },
        { month: 'Mar', orders: 55 },
        { month: 'Apr', orders: 52 },
        { month: 'May', orders: 65 },
        { month: 'Jun', orders: 72 },
        { month: 'Jul', orders: 68 },
        { month: 'Aug', orders: 75 },
        { month: 'Sep', orders: 62 },
        { month: 'Oct', orders: 58 },
        { month: 'Nov', orders: 70 },
        { month: 'Dec', orders: 82 }
    ];
}
