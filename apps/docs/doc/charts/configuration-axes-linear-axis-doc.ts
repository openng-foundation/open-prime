import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-linear-axis-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>type="linear"</i> on <i>ChartXAxis</i> to treat category values as continuous numbers rather than discrete labels. Use this for numeric X/Y scatter data where the X axis represents a continuous numeric dimension.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-scatter [data]="data" valueXField="age" valueYField="salary" color="#5daeea" [markerSize]="8" />
                    <p-chart-x-axis type="linear" label="Age (years)" />
                    <p-chart-y-axis label="Salary ($)" [startFromZero]="false" [tickFormat]="tickFormat" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesLinearAxisDoc {
    tickFormat = (v: TickValue) => '$' + (Number(v) / 1000).toFixed(0) + 'K';

    readonly data = [
        { age: 22, salary: 38000 },
        { age: 25, salary: 44000 },
        { age: 28, salary: 52000 },
        { age: 30, salary: 59000 },
        { age: 33, salary: 67000 },
        { age: 36, salary: 75000 },
        { age: 40, salary: 88000 },
        { age: 45, salary: 99000 },
        { age: 50, salary: 112000 }
    ];
}
