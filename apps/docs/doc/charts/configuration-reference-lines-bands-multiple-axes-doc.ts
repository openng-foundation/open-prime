import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-reference-lines-bands-multiple-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                On multi-axis charts, set <i>yAxisId</i> to pin a reference line or band to a specific Y axis. Without <i>yAxisId</i> the primary Y axis is used. <i>xAxisId</i> is not needed because X axis reference lines always use the shared
                category axis.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" name="Expansion ARR" color="#5daeea" yAxisId="arr" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="margin" name="Margin (%)" color="#10a981" yAxisId="margin" [showMarkers]="true" />
                    <p-chart-reference-line [y]="50" label="ARR Target" stroke="#ffad5a" [lineDash]="[6, 4]" yAxisId="arr" />
                    <p-chart-reference-line [y]="20" label="Margin Floor" stroke="#ff7a66" [lineDash]="[6, 4]" yAxisId="margin" />
                    <p-chart-x-axis />
                    <p-chart-y-axis id="arr" label="Expansion ARR ($K)" position="left" />
                    <p-chart-y-axis id="margin" label="Margin (%)" position="right" />
                    <p-chart-legend position="bottom" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferenceLinesBandsMultipleAxesDoc {
    readonly data = [
        { month: 'Jan', arr: 42, margin: 18 },
        { month: 'Feb', arr: 55, margin: 22 },
        { month: 'Mar', arr: 48, margin: 20 },
        { month: 'Apr', arr: 63, margin: 25 },
        { month: 'May', arr: 58, margin: 23 },
        { month: 'Jun', arr: 72, margin: 28 }
    ];
}
