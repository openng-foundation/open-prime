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

@Component({
    selector: 'configuration-navigator-series-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                By default the navigator displays the first registered series as a filled area chart. Set <i>series</i> to a dataset ID to pin the navigator to a specific series. Pass an array of IDs to show multiple series. The first drives the X
                axis and gets the filled area treatment; remaining series appear as lines on a shared Y scale.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line id="views" [data]="data" categoryXField="day" valueYField="pageViews" name="Page Views" color="#5daeea" curve="smooth" />
                        <p-chart-line id="sessions" [data]="data" categoryXField="day" valueYField="sessions" name="Sessions" color="#5ccf9f" curve="smooth" />
                        <p-chart-x-axis [minGridDistance]="80" />
                        <p-chart-y-axis />
                        <p-chart-legend position="top" />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator [series]="['views', 'sessions']" color="#5daeea" />
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
export class NavigatorSeriesDoc {
    readonly data = Array.from({ length: 50 }, (_, i) => ({
        day: `Day ${i + 1}`,
        pageViews: Math.round(500 + Math.sin(i / 5) * 200 + seededRandom(i) * 50),
        sessions: Math.round(200 + Math.sin(i / 7) * 80 + seededRandom(i + 1000) * 30)
    }));
}
