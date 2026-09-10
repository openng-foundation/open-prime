import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-stacked-bar-and-line-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap <i>ChartBar</i> series inside <i>ChartStacked</i> and place a standalone <i>ChartLine</i> as a sibling to show both a breakdown and the total in one chart. The line sits above the stacked bars and uses the same Y scale. Set
                <i>fillOpacity="0"</i> on the line to prevent it rendering as an area.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-stacked>
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="compute" name="Compute" color="#5daeea" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="storage" name="Storage" color="#7c8cff" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="network" name="Network" color="#4ecdc4" />
                    </p-chart-stacked>
                    <p-chart-line [data]="data" categoryXField="quarter" valueYField="total" name="Total" color="#ffad5a" [showMarkers]="true" [markerSize]="5" [lineStrokeWidth]="2.5" curve="smooth" [fillOpacity]="0" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="formatAxis" />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboStackedBarAndLineDoc {
    readonly data = [
        { quarter: 'Q1 23', compute: 42, storage: 18, network: 11, total: 71 },
        { quarter: 'Q2 23', compute: 48, storage: 21, network: 13, total: 82 },
        { quarter: 'Q3 23', compute: 55, storage: 24, network: 14, total: 93 },
        { quarter: 'Q4 23', compute: 61, storage: 28, network: 16, total: 105 },
        { quarter: 'Q1 24', compute: 68, storage: 31, network: 17, total: 116 },
        { quarter: 'Q2 24', compute: 74, storage: 35, network: 19, total: 128 },
        { quarter: 'Q3 24', compute: 83, storage: 40, network: 22, total: 145 },
        { quarter: 'Q4 24', compute: 94, storage: 46, network: 25, total: 165 }
    ];

    readonly formatAxis = (v: TickValue): string => `$${v}K`;
}
