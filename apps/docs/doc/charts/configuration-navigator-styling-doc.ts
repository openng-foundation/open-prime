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
    selector: 'configuration-navigator-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>color</i> and <i>opacity</i> to customize the mini area chart fill. Use <i>selectionColor</i> and <i>selectionFill</i> to style the selection window border and interior. Use <i>maskColor</i> to control the dimmed regions
                outside the selection. Set <i>backgroundColor</i> to set the navigator background and <i>gridColor</i> to adjust the grid line color. All navigator colors default to the active chart theme and adapt to dark mode automatically;
                override any of them to take manual control.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="day" valueYField="value" color="#7c8cff" curve="smooth" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-zoom mode="x" />
                        <p-chart-navigator
                            color="#7c8cff"
                            [opacity]="0.4"
                            selectionColor="rgba(93,174,234,0.8)"
                            selectionFill="rgba(93,174,234,0.12)"
                            maskColor="rgba(0,0,0,0.18)"
                            backgroundColor="#eef6ff"
                            gridColor="rgba(93,174,234,0.1)"
                            labelColor="#2531a8"
                        />
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
export class NavigatorStylingDoc {
    readonly data = Array.from({ length: 60 }, (_, i) => ({
        day: `Day ${i + 1}`,
        value: Math.round(100 + Math.sin(i / 4) * 40 + seededRandom(i) * 20)
    }));
}
