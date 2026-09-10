import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-null-values-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                By default, null values leave an empty category slot with no bar drawn (<i>'gap'</i>). Set <i>connectNulls="zero"</i> to treat nulls as zero and draw a bar at the baseline instead. Unlike line charts, there is no path-bridging mode
                for bars. <i>'connect'</i> behaves the same as <i>'zero'</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="week" valueYField="reported" name="Sensor gap" color="#5daeea" />
                        <p-chart-bar [data]="data" categoryXField="week" valueYField="zeroBaseline" name="connectNulls: zero" color="#ffad5a" connectNulls="zero" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Processed batches" />
                        <p-chart-legend position="bottom" />
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
export class ColumnBarNullValuesDoc {
    readonly data = [
        { week: 'W1', reported: 54, zeroBaseline: 54 },
        { week: 'W2', reported: 78, zeroBaseline: 78 },
        { week: 'W3', reported: null, zeroBaseline: null },
        { week: 'W4', reported: null, zeroBaseline: null },
        { week: 'W5', reported: 92, zeroBaseline: 92 },
        { week: 'W6', reported: 86, zeroBaseline: 86 },
        { week: 'W7', reported: null, zeroBaseline: null },
        { week: 'W8', reported: 74, zeroBaseline: 74 },
        { week: 'W9', reported: 68, zeroBaseline: 68 }
    ];
}
