import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-position-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>position</i> to place the legend on any side of the chart. Each position reduces the chart area to make room for the legend.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="newArr" color="#5daeea" name="New ARR" />
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="expansionArr" color="#ffad5a" name="Expansion ARR" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="right" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendPositionDoc {
    readonly data = [
        { quarter: 'Q1', newArr: 120, expansionArr: 80 },
        { quarter: 'Q2', newArr: 185, expansionArr: 95 },
        { quarter: 'Q3', newArr: 156, expansionArr: 88 },
        { quarter: 'Q4', newArr: 210, expansionArr: 102 }
    ];
}
