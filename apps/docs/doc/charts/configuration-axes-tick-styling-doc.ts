import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickStyle } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-tick-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>tickStyle</i> to customize tick mark and label appearance. Pass an object for uniform styling across all ticks, or a function <i>(value, index) =&gt; TickStyle</i> for per-tick styling. The function form allows specific values
                to be highlighted. Set <i>tickRotation</i> to rotate labels, or use <i>autoRotate</i> to let the chart rotate them when they would otherwise overlap.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="bookings" color="#5daeea" />
                    <p-chart-x-axis [tickStyle]="xTickStyle" [tickRotation]="-30" />
                    <p-chart-y-axis [tickStyle]="yTickStyle" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesTickStylingDoc {
    readonly xTickStyle: TickStyle = { fontSize: 12, fontWeight: 'bold', color: '#334155' };
    readonly yTickStyle: TickStyle = { fontSize: 12, color: '#64748b', padding: 10 };

    readonly data = [
        { quarter: 'Q1 2023', bookings: 42 },
        { quarter: 'Q2 2023', bookings: 58 },
        { quarter: 'Q3 2023', bookings: 51 },
        { quarter: 'Q4 2023', bookings: 74 },
        { quarter: 'Q1 2024', bookings: 65 },
        { quarter: 'Q2 2024', bookings: 83 }
    ];
}
