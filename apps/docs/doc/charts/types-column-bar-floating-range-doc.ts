import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-floating-range-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>openField</i> to anchor each bar at a specific starting value instead of zero. The bar spans from <i>openField</i> to <i>valueYField</i>. This is the standard approach for Gantt-style timelines and range charts.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryYField="phase" valueXField="end" openField="start" [borderRadius]="4" color="#5daeea" />
                        <p-chart-x-axis label="Weeks" />
                        <p-chart-y-axis />
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
export class ColumnBarFloatingRangeDoc {
    readonly data = [
        { phase: 'Site survey', start: 0, end: 2 },
        { phase: 'Permits', start: 1, end: 5 },
        { phase: 'Fiber pull', start: 4, end: 8 },
        { phase: 'Equipment install', start: 7, end: 10 },
        { phase: 'Acceptance test', start: 9, end: 11 },
        { phase: 'Customer handoff', start: 10, end: 12 }
    ];
}
