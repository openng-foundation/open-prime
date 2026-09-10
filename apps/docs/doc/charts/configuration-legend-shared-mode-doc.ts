import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-shared-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                When <i>ChartLegend</i> is placed inside <i>ChartGroup</i> outside individual charts, it acts as a shared legend controlling all synced charts. Set <i>mode</i> to control what each entry represents: <i>dataset</i> for one entry per
                series (default), <i>category</i> for one entry per shared category label, or <i>both</i> for dataset entries followed by category entries.
            </p>
            <p>For full configuration see <a href="/charts/types/synced">Synced Charts</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px">
                        <p-chart-svg [sync]="{ visibility: true }" [height]="260">
                            <p-chart-bar id="forecast" [data]="data" categoryXField="region" valueYField="forecast" color="#7c8cff" name="Forecast" />
                            <p-chart-bar id="actual" [data]="data" categoryXField="region" valueYField="actual" color="#5daeea" name="Actual" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                        </p-chart-svg>

                        <p-chart-svg [sync]="{ visibility: true }" [height]="260">
                            <p-chart-line id="forecast" [data]="data" categoryXField="region" valueYField="forecast" color="#7c8cff" name="Forecast" [showMarkers]="true" />
                            <p-chart-line id="actual" [data]="data" categoryXField="region" valueYField="actual" color="#5daeea" name="Actual" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                        </p-chart-svg>
                    </div>

                    <p-chart-legend align="center" />
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendSharedModeDoc {
    readonly data = [
        { region: 'North', forecast: 85, actual: 92 },
        { region: 'South', forecast: 72, actual: 68 },
        { region: 'East', forecast: 95, actual: 88 },
        { region: 'West', forecast: 63, actual: 78 },
        { region: 'Central', forecast: 81, actual: 85 }
    ];
}
