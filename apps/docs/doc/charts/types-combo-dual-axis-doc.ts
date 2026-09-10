import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-dual-axis-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                When combining series with incompatible units (such as volume and temperature, or revenue and a rate) bind each to its own Y-axis using <i>yAxisId</i>. Add a <i>ChartYAxis</i> for each axis, set <i>position</i> to <i>left</i> or
                <i>right</i>, and use <i>label</i> and <i>tickFormat</i> to annotate each scale independently. The category axis remains shared.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="demand" name="Electricity demand" color="#5daeea" yAxisId="demand" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="temp" name="Mean temperature" color="#ffad5a" yAxisId="temp" curve="smooth" [showMarkers]="true" [markerSize]="5" [lineStrokeWidth]="2.5" [fillOpacity]="0" />
                        <p-chart-x-axis />
                        <p-chart-y-axis id="demand" position="left" label="Demand (TWh)" [tickFormat]="formatTwh" />
                        <p-chart-y-axis id="temp" position="right" label="Temperature (°C)" [tickFormat]="formatTemp" />
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
export class ComboDualAxisDoc {
    readonly data = [
        { month: 'Jan', demand: 29.4, temp: 4.3 },
        { month: 'Feb', demand: 26.8, temp: 4.8 },
        { month: 'Mar', demand: 24.1, temp: 7.2 },
        { month: 'Apr', demand: 20.5, temp: 10.4 },
        { month: 'May', demand: 18.2, temp: 13.8 },
        { month: 'Jun', demand: 16.9, temp: 16.5 },
        { month: 'Jul', demand: 16.3, temp: 18.7 },
        { month: 'Aug', demand: 16.7, temp: 18.2 },
        { month: 'Sep', demand: 18.6, temp: 15.1 },
        { month: 'Oct', demand: 22.3, temp: 11.3 },
        { month: 'Nov', demand: 25.9, temp: 7.6 },
        { month: 'Dec', demand: 28.7, temp: 5.1 }
    ];
    readonly formatTwh = (v: TickValue) => `${v} TWh`;
    readonly formatTemp = (v: TickValue) => `${v}°C`;
}
