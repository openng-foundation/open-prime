import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-stacked-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap multiple <i>ChartRadar</i> components inside <i>ChartStacked</i> to render concentric rings instead of overlapping polygons. Each series fills the band above the previous one, useful for showing cumulative contributions rather
                than direct comparison.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-stacked>
                            <p-chart-radar id="automated" [data]="data" categoryXField="queue" valueYField="automated" [fillOpacity]="0.5" name="Automated" />
                            <p-chart-radar id="assisted" [data]="data" categoryXField="queue" valueYField="assisted" [fillOpacity]="0.5" name="Assisted" />
                        </p-chart-stacked>
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
export class RadarStackedDoc {
    readonly data = [
        { queue: 'Billing', automated: 42, assisted: 21 },
        { queue: 'Login', automated: 55, assisted: 16 },
        { queue: 'Provisioning', automated: 31, assisted: 29 },
        { queue: 'Integrations', automated: 36, assisted: 33 },
        { queue: 'Data Export', automated: 47, assisted: 18 },
        { queue: 'Security Review', automated: 24, assisted: 38 }
    ];
}
