import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Wrap multiple <i>ChartBar</i> components inside <i>ChartStacked</i> to stack bars vertically. Each series accumulates on top of the previous one. Negative values stack downward from zero.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-stacked>
                            <p-chart-bar [data]="data" categoryXField="year" valueYField="enterprise" name="Enterprise" color="#5daeea" />
                            <p-chart-bar [data]="data" categoryXField="year" valueYField="midmarket" name="Mid-market" color="#4ecdc4" />
                            <p-chart-bar [data]="data" categoryXField="year" valueYField="startup" name="Startup" color="#ffad5a" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis label="ARR ($M)" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip mode="shared" [valueFormatter]="valueFormatter" />
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
export class ColumnBarStackedDoc {
    readonly valueFormatter = (v: number) => `$${Number(v).toFixed(1)}M`;

    readonly data = [
        { year: '2020', enterprise: 12.0, midmarket: 9.5, startup: 4.5 },
        { year: '2021', enterprise: 15.0, midmarket: 11.0, startup: 6.5 },
        { year: '2022', enterprise: 18.0, midmarket: 13.0, startup: 9.0 },
        { year: '2023', enterprise: 21.0, midmarket: 15.5, startup: 12.0 }
    ];
}
