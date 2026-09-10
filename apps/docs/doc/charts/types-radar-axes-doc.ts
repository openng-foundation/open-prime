import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-axes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Bind per-category radial scales using <i>category</i> on <i>ChartYAxis</i>. Each axis applies to its matching spoke (category) and maintains its own domain, useful when comparing metrics with different ranges within the same radar
                chart.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="perf" [data]="data" categoryXField="metric" valueYField="value" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [min]="0" [max]="100" />
                        <p-chart-y-axis category="Speed" [min]="0" [max]="300" />
                        <p-chart-y-axis category="Reliability" [min]="0" [max]="1" />
                        <p-chart-y-axis category="Usability" [min]="0" [max]="100" />
                        <p-chart-y-axis category="Security" [min]="0" [max]="5" />
                        <p-chart-y-axis category="Scalability" [min]="0" [max]="2000" />
                        <p-chart-y-axis category="Documentation" [min]="0" [max]="1000" />
                        <p-chart-y-axis category="Support" [min]="0" [max]="72" />
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
export class RadarAxesDoc {
    readonly data = [
        { metric: 'Speed', value: 220 },
        { metric: 'Reliability', value: 0.92 },
        { metric: 'Usability', value: 78 },
        { metric: 'Security', value: 4.5 },
        { metric: 'Scalability', value: 1200 },
        { metric: 'Documentation', value: 650 },
        { metric: 'Support', value: 48 }
    ];
}
