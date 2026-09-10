import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display an interactive legend. Use a legend when grouped, stacked, overlap, or percent-stacked bars need series toggles.</p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="inbound" name="Inbound pipeline" color="#5daeea" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="outbound" name="Outbound pipeline" color="#ffad5a" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="$M" />
                        <p-chart-legend position="top" />
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
export class ColumnBarLegendDoc {
    readonly data = [
        { quarter: 'Q1', inbound: 3.2, outbound: 1.8 },
        { quarter: 'Q2', inbound: 4.1, outbound: 2.2 },
        { quarter: 'Q3', inbound: 3.8, outbound: 2.6 },
        { quarter: 'Q4', inbound: 5.2, outbound: 3.1 }
    ];
}
