import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-grouped-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Place multiple <i>ChartBar</i> components as siblings. Each series positions itself within the category group. <i>barGap</i> and <i>categoryGap</i> both accept a fraction between 0 and 1, relative to the category band width.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="newLogo" name="New logo ARR" color="#5daeea" [borderRadius]="3" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="expansion" name="Expansion ARR" color="#4ecdc4" [borderRadius]="3" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="services" name="Services ARR" color="#ffad5a" [borderRadius]="3" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="$M" />
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
export class ColumnBarGroupedDoc {
    readonly valueFormatter = (v: number) => `$${Number(v).toFixed(1)}M`;

    readonly data = [
        { quarter: 'Q1', newLogo: 4.2, expansion: 2.8, services: 1.5 },
        { quarter: 'Q2', newLogo: 5.1, expansion: 3.4, services: 1.8 },
        { quarter: 'Q3', newLogo: 4.8, expansion: 3.1, services: 2.1 },
        { quarter: 'Q4', newLogo: 6.2, expansion: 3.9, services: 2.4 }
    ];
}
