import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-multiple-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add multiple <i>ChartYAxis</i> components with unique <i>id</i> values to create independent Y scales. Bind each dataset to its axis using <i>yAxisId</i>. Set <i>position="right"</i> on the secondary axis to render it on the opposite
                side.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" name="Expansion ARR" color="#5daeea" yAxisId="arr" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="seats" name="Seats Added" color="#ffad5a" yAxisId="seats" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis id="arr" label="Expansion ARR" position="left" [tickFormat]="tickFormat" />
                    <p-chart-y-axis id="seats" label="Seats Added" position="right" />
                    <p-chart-legend position="bottom" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesMultipleAxesDoc {
    tickFormat = (v: TickValue) => `$${(Number(v) / 1000).toFixed(0)}K`;

    readonly data = [
        { month: 'Jan', arr: 42000, seats: 320 },
        { month: 'Feb', arr: 48000, seats: 380 },
        { month: 'Mar', arr: 55000, seats: 420 },
        { month: 'Apr', arr: 52000, seats: 390 },
        { month: 'May', arr: 65000, seats: 510 },
        { month: 'Jun', arr: 72000, seats: 580 }
    ];
}
