import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-horizontal-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Bind <i>categoryYField</i> and <i>valueXField</i> instead of <i>categoryXField</i> and <i>valueYField</i> to render bars horizontally. The category axis moves to Y, which keeps long labels readable without rotation.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryYField="service" valueXField="incidents" [borderRadius]="4" color="#5daeea" />
                        <p-chart-x-axis label="Incidents in last 30 days" />
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
export class ColumnBarHorizontalDoc {
    readonly data = [
        { service: 'Identity and SSO', incidents: 42 },
        { service: 'Checkout payments', incidents: 35 },
        { service: 'Search indexing', incidents: 28 },
        { service: 'Notifications', incidents: 22 },
        { service: 'Data exports', incidents: 17 },
        { service: 'Admin console', incidents: 12 }
    ];
}
