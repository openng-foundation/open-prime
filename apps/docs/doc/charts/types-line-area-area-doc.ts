import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-area-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>fillOpacity</i> to fill the region beneath the line. <i>0</i> draws only the line, <i>0.3</i> gives a semi-transparent fill. Any value above <i>0</i> activates area mode.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="sessions" [fillOpacity]="0.3" />
                        <p-chart-x-axis />
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
export class LineAreaAreaDoc {
    readonly data = [
        { month: 'Jan', sessions: 12400 },
        { month: 'Feb', sessions: 14200 },
        { month: 'Mar', sessions: 16800 },
        { month: 'Apr', sessions: 15300 },
        { month: 'May', sessions: 18900 },
        { month: 'Jun', sessions: 21500 },
        { month: 'Jul', sessions: 24100 },
        { month: 'Aug', sessions: 22800 },
        { month: 'Sep', sessions: 19600 },
        { month: 'Oct', sessions: 17400 },
        { month: 'Nov', sessions: 15100 },
        { month: 'Dec', sessions: 18200 }
    ];
}
