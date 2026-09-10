import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type SyncConfig } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-synced-shared-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Place <i>ChartLegend</i> outside the individual charts but inside <i>ChartGroup</i> to create a single legend that controls all synced charts. Toggling a series in the shared legend hides it across every chart simultaneously. Set
                <i>mode</i> on <i>ChartLegend</i> to <i>dataset</i> for one entry per series, <i>category</i> for one entry per shared category label, or <i>both</i> for combined entries.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px">
                        <p-chart-svg [sync]="sync" [height]="260">
                            <p-chart-bar id="q1" [data]="data" categoryXField="region" valueYField="q1" name="Q1" />
                            <p-chart-bar id="q2" [data]="data" categoryXField="region" valueYField="q2" name="Q2" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Revenue ($K)" />
                            <p-chart-tooltip />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="sync" [height]="260">
                            <p-chart-line id="q1" [data]="data" categoryXField="region" valueYField="q1" name="Q1" [showMarkers]="true" />
                            <p-chart-line id="q2" [data]="data" categoryXField="region" valueYField="q2" name="Q2" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Revenue ($K)" />
                            <p-chart-tooltip />
                            <p-chart-hover />
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
export class SyncedSharedLegendDoc {
    readonly sync: SyncConfig = { visibility: true, highlight: false, extremes: false };

    readonly data = [
        { region: 'North', q1: 85, q2: 92 },
        { region: 'South', q1: 72, q2: 68 },
        { region: 'East', q1: 95, q2: 88 },
        { region: 'West', q1: 63, q2: 78 },
        { region: 'Central', q1: 81, q2: 85 }
    ];
}
