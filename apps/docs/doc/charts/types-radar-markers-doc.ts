import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-radar-markers-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>showMarkers</i> to display point markers at each spoke vertex. Set <i>markerSize</i> to control the radius. Mixing marker sizes across series creates visual hierarchy without changing stroke weights.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-radar id="large" [data]="data" categoryXField="metric" valueYField="api" [fillOpacity]="0.15" [showMarkers]="true" [markerSize]="8" name="API cluster" />
                        <p-chart-radar id="small" [data]="data" categoryXField="metric" valueYField="worker" [fillOpacity]="0.15" [showMarkers]="true" [markerSize]="3" name="Worker queue" />
                        <p-chart-radar id="none" [data]="data" categoryXField="metric" valueYField="batch" [fillOpacity]="0.15" [showMarkers]="false" name="Batch jobs" />
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
export class RadarMarkersDoc {
    readonly data = [
        { metric: 'Latency', api: 88, worker: 74, batch: 62 },
        { metric: 'Throughput', api: 79, worker: 86, batch: 93 },
        { metric: 'Error Budget', api: 91, worker: 76, batch: 68 },
        { metric: 'Cost Control', api: 72, worker: 84, batch: 88 },
        { metric: 'Deploy Safety', api: 86, worker: 71, batch: 75 },
        { metric: 'Alert Quality', api: 80, worker: 69, batch: 82 }
    ];
}
