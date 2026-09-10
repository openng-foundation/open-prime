import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Pass an array to <i>color</i> to define a custom palette. Slices cycle through colors by index, which is useful for stable acquisition channels or product segments. For per-slice control, pass a function that receives each data item
                and returns a color string.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="channel" [color]="colors" />
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
export class PieDonutColorsDoc {
    readonly data = [
        { channel: 'Product signup', share: 34 },
        { channel: 'Sales assisted', share: 26 },
        { channel: 'Partner referral', share: 17 },
        { channel: 'Marketplace', share: 12 },
        { channel: 'Expansion', share: 7 },
        { channel: 'Education', share: 4 }
    ];
    readonly colors = ['#e5484d', '#ffad5a', '#ffd166', '#5daeea', '#ff6fae', '#94a3b8'];
}
