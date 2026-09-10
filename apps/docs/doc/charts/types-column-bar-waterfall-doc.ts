import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext } from '@openng/optimus-ui/charts';

interface WaterfallRow {
    item: string;
    value: number;
    isTotal: boolean;
}

@Component({
    selector: 'types-column-bar-waterfall-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap <i>ChartBar</i> inside <i>ChartWaterfall</i> to create a waterfall chart. Each bar floats from the running total of previous values. Set <i>totalField</i> to a boolean field on the data items to mark summary bars. Total bars
                reset from zero and display the cumulative sum.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-waterfall totalField="isTotal">
                            <p-chart-bar [data]="data" categoryXField="item" valueYField="value" [color]="barColors" [borderRadius]="3" />
                        </p-chart-waterfall>
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickFormat]="tickFormat" />
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
export class ColumnBarWaterfallDoc {
    readonly tickFormat = (v: string | number | Date) => `$${v}k`;

    readonly data = [
        { item: 'Revenue', value: 420, isTotal: false },
        { item: 'COGS', value: -180, isTotal: false },
        { item: 'Services', value: 85, isTotal: false },
        { item: 'Marketing', value: -65, isTotal: false },
        { item: 'Salaries', value: -95, isTotal: false },
        { item: 'R&D', value: -40, isTotal: false },
        { item: 'Net Income', value: 0, isTotal: true }
    ];

    readonly barColors = ({ datum }: ItemContext) => {
        const d = datum as WaterfallRow;

        if (d.isTotal) return '#7c8cff';

        return d.value >= 0 ? '#10a981' : '#e5484d';
    };
}
