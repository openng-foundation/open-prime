import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-overlap-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap multiple <i>ChartBar</i> components inside <i>ChartOverlap</i> to layer bars at the same category position. The first child renders widest at the back, the last renders narrowest at the front. This creates target vs. actual
                comparisons without side-by-side grouping.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-overlap>
                            <p-chart-bar [data]="data" categoryXField="month" valueYField="target" name="Target" color="#94a3b8" [opacity]="0.32" [borderRadius]="6" />
                            <p-chart-bar [data]="data" categoryXField="month" valueYField="actual" name="Actual" color="#5daeea" [borderRadius]="6" />
                        </p-chart-overlap>
                        <p-chart-x-axis />
                        <p-chart-y-axis label="% of goal" />
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
export class ColumnBarOverlapDoc {
    readonly data = [
        { month: 'Jan', target: 100, actual: 78 },
        { month: 'Feb', target: 100, actual: 92 },
        { month: 'Mar', target: 100, actual: 105 },
        { month: 'Apr', target: 100, actual: 88 },
        { month: 'May', target: 100, actual: 95 },
        { month: 'Jun', target: 100, actual: 110 }
    ];
}
