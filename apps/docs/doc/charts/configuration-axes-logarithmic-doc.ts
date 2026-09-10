import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-axes-logarithmic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>type="logarithmic"</i> on <i>ChartYAxis</i> to use a log scale. Each tick represents a power of ten. Use this for data spanning multiple orders of magnitude. Also supported on <i>ChartXAxis</i> for horizontal bar charts.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="year" valueYField="users" color="#7c8cff" [showMarkers]="true" />
                    <p-chart-x-axis label="Year" />
                    <p-chart-y-axis label="Users" type="logarithmic" [gridLines]="true" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesLogarithmicDoc {
    readonly data = [
        { year: '2015', users: 100 },
        { year: '2016', users: 350 },
        { year: '2017', users: 1200 },
        { year: '2018', users: 5500 },
        { year: '2019', users: 22000 },
        { year: '2020', users: 85000 },
        { year: '2021', users: 310000 },
        { year: '2022', users: 1200000 }
    ];
}
