import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartLegend</i> to display an interactive legend. Each <i>ChartRadar</i> series appears as a separate entry. Click any item to toggle that series.</p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="starter" [data]="data" categoryXField="area" valueYField="starter" [fillOpacity]="0.15" name="Starter" />
                        <p-chart-radar id="growth" [data]="data" categoryXField="area" valueYField="growth" [fillOpacity]="0.15" name="Growth" />
                        <p-chart-radar id="enterprise" [data]="data" categoryXField="area" valueYField="enterprise" [fillOpacity]="0.15" name="Enterprise" />
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
export class RadarLegendDoc {
    readonly data = [
        { area: 'Activation', starter: 86, growth: 72, enterprise: 64 },
        { area: 'Governance', starter: 58, growth: 76, enterprise: 92 },
        { area: 'Automation', starter: 80, growth: 84, enterprise: 88 },
        { area: 'Reporting', starter: 70, growth: 88, enterprise: 91 },
        { area: 'Support', starter: 74, growth: 82, enterprise: 90 }
    ];
}
