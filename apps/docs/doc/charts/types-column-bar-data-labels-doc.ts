import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartDataLabels</i> to display values on each bar. Label bars when the exact value is the point of the chart. Dense rankings and stacked segments usually read better with tooltip access.</p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="team" valueYField="attainment" [borderRadius]="4" color="#5daeea" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="% of quota" />
                        <p-chart-data-labels display="value" [formatter]="formatter" />
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
export class ColumnBarDataLabelsDoc {
    readonly formatter = (v: number) => `${v}%`;

    readonly data = [
        { team: 'East', attainment: 87 },
        { team: 'Central', attainment: 92 },
        { team: 'West', attainment: 76 },
        { team: 'Enterprise', attainment: 95 },
        { team: 'Public Sector', attainment: 83 }
    ];
}
