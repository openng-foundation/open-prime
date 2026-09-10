import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

function seededRandom(seed: number) {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const tempSeries = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date('2025-01-15T00:00:00Z').getTime() + i * 3_600_000,
    temp: Math.round((22 + Math.sin(((i - 8) * Math.PI) / 12) * 7 + (seededRandom(i) - 0.5) * 2) * 10) / 10
}));

@Component({
    selector: 'configuration-axes-time-zone-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>timezone</i> on a time axis to display tick labels in a specific IANA timezone instead of UTC. Use <i>dateTimeFormats</i> to override how each time unit (second, minute, hour, day, month, year) is formatted.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="timestamp" valueYField="temp" color="#ffad5a" curve="smooth" [showMarkers]="true" />
                    <p-chart-x-axis type="time" timezone="America/New_York" label="Time (ET)" />
                    <p-chart-y-axis label="Temperature (°C)" [startFromZero]="false" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesTimeZoneDoc {
    readonly data = tempSeries;
}
