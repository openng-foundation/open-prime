import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-synced-dashboard-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Combine four or more charts in a grid layout with synced crosshairs. Hovering any chart highlights the same time period across all panels, so temporal patterns line up across metrics.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 16px">
                        <p-chart-svg [sync]="true" [height]="200">
                            <p-chart-line id="temp" [data]="data" categoryXField="month" valueYField="temp" name="Temperature (°C)" curve="smooth" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="200">
                            <p-chart-bar id="rainfall" [data]="data" categoryXField="month" valueYField="rainfall" name="Rainfall (mm)" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="200">
                            <p-chart-line id="wind" [data]="data" categoryXField="month" valueYField="wind" name="Wind (km/h)" curve="smooth" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="200">
                            <p-chart-line id="humidity" [data]="data" categoryXField="month" valueYField="humidity" name="Humidity (%)" [fillOpacity]="0.15" curve="smooth" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
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
export class SyncedDashboardDoc {
    readonly data = [
        { month: 'Jan', temp: 5, rainfall: 78, wind: 15, humidity: 82 },
        { month: 'Feb', temp: 7, rainfall: 62, wind: 14, humidity: 78 },
        { month: 'Mar', temp: 11, rainfall: 55, wind: 12, humidity: 72 },
        { month: 'Apr', temp: 15, rainfall: 48, wind: 10, humidity: 65 },
        { month: 'May', temp: 19, rainfall: 52, wind: 9, humidity: 60 },
        { month: 'Jun', temp: 23, rainfall: 45, wind: 8, humidity: 55 },
        { month: 'Jul', temp: 26, rainfall: 35, wind: 7, humidity: 52 },
        { month: 'Aug', temp: 25, rainfall: 40, wind: 8, humidity: 58 },
        { month: 'Sep', temp: 21, rainfall: 55, wind: 10, humidity: 65 },
        { month: 'Oct', temp: 15, rainfall: 68, wind: 12, humidity: 72 },
        { month: 'Nov', temp: 10, rainfall: 75, wind: 14, humidity: 78 },
        { month: 'Dec', temp: 6, rainfall: 82, wind: 16, humidity: 85 }
    ];
}
