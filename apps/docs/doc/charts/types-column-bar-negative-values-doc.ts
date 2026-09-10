import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ItemContext } from '@openng/optimus-ui/charts';

interface ProfitRow {
    month: string;
    profit: number;
}

@Component({
    selector: 'types-column-bar-negative-values-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Bars extend below the zero line for negative values. Pass a function to <i>color</i> to color positive and negative bars differently.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="profit" [color]="barColors" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Operating margin delta ($M)" />
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
export class ColumnBarNegativeValuesDoc {
    readonly data = [
        { month: 'Jan', profit: 1.2 },
        { month: 'Feb', profit: -0.8 },
        { month: 'Mar', profit: 2.2 },
        { month: 'Apr', profit: -0.3 },
        { month: 'May', profit: 1.8 },
        { month: 'Jun', profit: -1.5 },
        { month: 'Jul', profit: 3.0 },
        { month: 'Aug', profit: 0.5 }
    ];

    readonly barColors = ({ datum }: ItemContext) => {
        const d = datum as ProfitRow;

        return d.profit >= 0 ? '#10a981' : '#e5484d';
    };
}
