import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-multi-series-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Place multiple <i>ChartRadar</i> components as siblings to overlay separate datasets. Each series renders its own polygon. Overlay multiple series to compare profiles side by side.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="selfServe" [data]="data" categoryXField="dimension" valueYField="selfServe" [fillOpacity]="0.2" name="Self-serve" />
                        <p-chart-radar id="enterprise" [data]="data" categoryXField="dimension" valueYField="enterprise" [fillOpacity]="0.2" name="Enterprise" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend position="bottom" />
                        <p-chart-tooltip />
                        <p-chart-hover [brightness]="1.1" />
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
export class RadarMultiSeriesDoc {
    readonly data = [
        { dimension: 'Activation', selfServe: 86, enterprise: 72 },
        { dimension: 'Reliability', selfServe: 74, enterprise: 92 },
        { dimension: 'Reporting', selfServe: 68, enterprise: 88 },
        { dimension: 'Security', selfServe: 70, enterprise: 94 },
        { dimension: 'Setup Speed', selfServe: 91, enterprise: 63 },
        { dimension: 'Support Fit', selfServe: 76, enterprise: 89 }
    ];
}
