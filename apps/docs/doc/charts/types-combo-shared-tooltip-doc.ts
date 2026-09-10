import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-shared-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>mode="shared"</i> on <i>ChartTooltip</i> to show all series values at the hovered category in a single tooltip, so actual, forecast, and prior-year series can be compared at once. Add <i>crosshair</i> to display a dashed
                reference line across the chart. All series must share a common Y scale; use <i>yAxisId</i> to split series with incompatible units.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" color="#5daeea" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="forecast" name="Forecast" color="#64748b" [lineDash]="[5, 4]" [lineStrokeWidth]="2" [showMarkers]="false" [fillOpacity]="0" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="lastYear" name="Last year" color="#94a3b8" [lineDash]="[2, 3]" [lineStrokeWidth]="1.5" [showMarkers]="false" [fillOpacity]="0" />
                        <p-chart-x-axis />
                        <p-chart-y-axis [tickFormat]="formatK" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip mode="shared" [crosshair]="true" />
                        <p-chart-hover />
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
export class ComboSharedTooltipDoc {
    readonly data = [
        { month: 'Jan', revenue: 412, forecast: 430, lastYear: 368 },
        { month: 'Feb', revenue: 468, forecast: 450, lastYear: 395 },
        { month: 'Mar', revenue: 445, forecast: 465, lastYear: 412 },
        { month: 'Apr', revenue: 492, forecast: 480, lastYear: 431 },
        { month: 'May', revenue: 538, forecast: 510, lastYear: 468 },
        { month: 'Jun', revenue: 521, forecast: 530, lastYear: 482 },
        { month: 'Jul', revenue: 574, forecast: 555, lastYear: 506 },
        { month: 'Aug', revenue: 612, forecast: 580, lastYear: 541 },
        { month: 'Sep', revenue: 589, forecast: 600, lastYear: 558 },
        { month: 'Oct', revenue: 645, forecast: 625, lastYear: 578 },
        { month: 'Nov', revenue: 892, forecast: 850, lastYear: 762 },
        { month: 'Dec', revenue: 1048, forecast: 980, lastYear: 891 }
    ];
    readonly formatK = (v: TickValue) => `$${v}K`;
}
