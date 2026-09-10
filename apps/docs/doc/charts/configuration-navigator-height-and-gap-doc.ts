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
    selector: 'configuration-navigator-height-and-gap-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>height</i> to control how tall the navigator area is. Set <i>gap</i> to adjust the spacing between the main chart and the navigator.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="day" valueYField="visitors" color="#5daeea" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator [height]="80" [gap]="12" />
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
export class NavigatorHeightAndGapDoc {
    readonly data = Array.from({ length: 80 }, (_, i) => ({
        day: `Day ${i + 1}`,
        visitors: Math.round(200 + Math.sin(i / 8) * 100 + seededRandom(i) * 30)
    }));
}
