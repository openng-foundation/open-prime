import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-null-handling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                By default, null values break the line into separate segments (<i>'gap'</i>). Set <i>connectNulls="connect"</i> to bridge gaps with a straight segment. Set <i>connectNulls="zero"</i> to treat nulls as zero, which is only appropriate
                when zero is a meaningful value rather than missing data. <i>true</i> and <i>false</i> are aliases for <i>'connect'</i> and <i>'gap'</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="gaps" name="With Gaps" showMarkers [markerSize]="5" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="bridged" name="connectNulls" showMarkers [markerSize]="5" connectNulls />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend position="bottom" />
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
export class LineAreaNullHandlingDoc {
    readonly data = [
        { month: 'Jan', gaps: 42, bridged: 42 },
        { month: 'Feb', gaps: 48, bridged: 48 },
        { month: 'Mar', gaps: null, bridged: null },
        { month: 'Apr', gaps: null, bridged: null },
        { month: 'May', gaps: 65, bridged: 65 },
        { month: 'Jun', gaps: 72, bridged: 72 },
        { month: 'Jul', gaps: null, bridged: null },
        { month: 'Aug', gaps: 80, bridged: 80 },
        { month: 'Sep', gaps: 76, bridged: 76 }
    ];
}
