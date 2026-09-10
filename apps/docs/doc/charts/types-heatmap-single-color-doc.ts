import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const SEGMENTS = ['Trial', 'Starter', 'Growth', 'Scale', 'Enterprise'];
const FEATURES = ['Signup', 'Invite', 'Import', 'Automate', 'Report'];

const ADOPTION = [
    [88, 54, 31, 16, 10],
    [93, 72, 46, 28, 18],
    [96, 82, 68, 49, 31],
    [98, 88, 77, 64, 46],
    [99, 91, 84, 78, 63]
];

const ADOPTION_DATA = SEGMENTS.flatMap((segment, i) => FEATURES.map((feature, j) => ({ feature, segment, adoption: ADOPTION[i][j] })));

@Component({
    selector: 'types-heatmap-single-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Pass a single <i>color</i> (a solid, gradient, or pattern) instead of <i>colorRange</i> to use opacity-based mapping. Cell opacity scales from the minimum to the maximum value, with no hue change across the range; this works best for
                positive measures such as feature adoption.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-heatmap [data]="data" categoryXField="feature" categoryYField="segment" valueField="adoption" color="#5daeea" />
                        <p-chart-data-labels [formatter]="formatter" />
                        <p-chart-x-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
                        <p-chart-y-axis [showLine]="false" [showTicks]="false" [gridLines]="false" />
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
export class HeatmapSingleColorDoc {
    readonly data = ADOPTION_DATA;
    readonly formatter = (v: number) => `${v}%`;
}
