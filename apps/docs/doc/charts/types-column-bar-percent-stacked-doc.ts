import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-percent-stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>mode="percent"</i> on <i>ChartStacked</i> to normalize each category to 100%. The axis always spans 0–100% regardless of the underlying data magnitude.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-stacked mode="percent">
                            <p-chart-bar [data]="data" categoryXField="tier" valueYField="selfServe" name="Self-service" color="#5daeea" />
                            <p-chart-bar [data]="data" categoryXField="tier" valueYField="assisted" name="Assisted" color="#ffad5a" />
                        </p-chart-stacked>
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickFormat]="tickFormat" />
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
export class ColumnBarPercentStackedDoc {
    readonly tickFormat = (v: string | number | Date) => `${v}%`;
    readonly valueFormatter = (v: number) => `${Math.round(Number(v))}%`;

    readonly data = [
        { tier: 'Free', selfServe: 72, assisted: 28 },
        { tier: 'Team', selfServe: 48, assisted: 52 },
        { tier: 'Business', selfServe: 31, assisted: 69 },
        { tier: 'Enterprise', selfServe: 18, assisted: 82 }
    ];
}
