import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

const peakMonths = ['Feb', 'Apr'];

@Component({
    selector: 'configuration-axes-custom-tick-render-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace default tick labels with custom content through the <i>pChartAxisTickDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartAxisTickDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup. In Canvas mode, pass a
                <i>render</i> function that draws to <i>ctx</i> and returns <i>null</i>. Use the <i>pChartAxisTickMarkDef</i> seam (or the <i>renderTick</i> function) to replace the tick mark itself independently.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="signups" color="#5daeea" />
                    <p-chart-x-axis [tickStyle]="xTickStyle" />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesCustomTickRenderDoc {
    xTickStyle = (value: TickValue) => {
        const isPeak = typeof value === 'string' && peakMonths.includes(value);

        return {
            color: isPeak ? '#5daeea' : '#94a3b8',
            fontWeight: (isPeak ? 'bold' : 'normal') as 'bold' | 'normal',
            fontSize: isPeak ? 13 : 11
        };
    };

    readonly data = [
        { month: 'Jan', signups: 42 },
        { month: 'Feb', signups: 78 },
        { month: 'Mar', signups: 55 },
        { month: 'Apr', signups: 91 },
        { month: 'May', signups: 63 },
        { month: 'Jun', signups: 74 }
    ];
}
