import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';
import { monthly, solar } from '@/doc/charts/data/syncedClimateOverview';

@Component({
    selector: 'types-synced-examples-climate-overview-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartGroup</i> with <i>[sync]="true"</i> wraps four panels using different chart types: line, bar, radar, and calendar heatmap. Hovering any month on one cartesian chart highlights the same category on the others; the heatmap and
                radar participate via category-hover sync even though their axes differ.
            </p>
            <p>#### SvgSyncedClimateOverviewDemo.ts</p>
            <p>#### syncedClimateOverview.ts</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px">
                        <p-chart-svg [sync]="true" [height]="220">
                            <p-chart-line [data]="monthly" categoryXField="month" valueYField="tempMax" name="Max" color="#ffad5a" curve="smooth" [showMarkers]="true" [lineStrokeWidth]="2" />
                            <p-chart-line [data]="monthly" categoryXField="month" valueYField="tempMin" name="Min" color="#5daeea" curve="smooth" [showMarkers]="true" [lineStrokeWidth]="2" />
                            <p-chart-x-axis />
                            <p-chart-y-axis [tickFormat]="formatTemp" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                            <p-chart-legend position="top" />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="220">
                            <p-chart-bar [data]="monthly" categoryXField="month" valueYField="rainfall" name="Rainfall" color="#36b7d6" [borderRadius]="{ topLeft: 3, topRight: 3 }" />
                            <p-chart-x-axis />
                            <p-chart-y-axis [tickFormat]="formatRain" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                            <p-chart-legend position="top" />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-radar [data]="monthly" categoryXField="month" valueYField="uv" name="UV index" color="#c084fc" [fillOpacity]="0.2" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip />
                            <p-chart-hover [brightness]="1.15" />
                            <p-chart-legend position="top" />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="260">
                            <p-chart-heatmap [data]="solar" categoryXField="month" categoryYField="hour" valueField="value" name="Solar W/m²" [colorRange]="colorRange" />
                            <p-chart-x-axis />
                            <p-chart-y-axis [tickCount]="6" />
                            <p-chart-tooltip />
                            <p-chart-hover />
                            <p-chart-color-legend position="right" />
                        </p-chart-svg>
                    </div>
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedExamplesClimateOverviewDoc {
    readonly monthly = monthly;
    readonly solar = solar;
    readonly colorRange = ['#fff7ed', '#fed7aa', '#ffad5a', '#ff7a66', '#b23b4b'];

    readonly formatTemp = (v: TickValue): string => `${v}°`;
    readonly formatRain = (v: TickValue): string => `${v}mm`;
}
