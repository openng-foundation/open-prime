import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-reference-lines-bands-reference-band-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartReferenceBand</i> to shade a region between two values. Set <i>y1</i> and <i>y2</i> for a horizontal band. Set <i>x1</i> and <i>x2</i> for a vertical band spanning a time or category range.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" />
                    <p-chart-reference-band [y1]="55" [y2]="70" fill="#10a981" [fillOpacity]="0.18" label="Target Range" placement="afterData" />
                    <p-chart-reference-band x1="Apr" x2="Jun" fill="#ffad5a" [fillOpacity]="0.18" label="Q2" placement="afterData" />
                    <p-chart-x-axis />
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
export class ReferenceLinesBandsReferenceBandDoc {
    readonly data = [
        { month: 'Jan', bookings: 42 },
        { month: 'Feb', bookings: 55 },
        { month: 'Mar', bookings: 48 },
        { month: 'Apr', bookings: 63 },
        { month: 'May', bookings: 58 },
        { month: 'Jun', bookings: 72 },
        { month: 'Jul', bookings: 68 },
        { month: 'Aug', bookings: 75 }
    ];
}
