import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-hover-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartHover</i> to pop the hovered slice outward along its angle. The chart reserves padding so it doesn't clip. Use <i>brightness</i> to lighten the slice and set <i>dimOpacity</i> below <i>1</i> only when you want the rest to
                fade.
            </p>
            <p>For full configuration see <a href="/charts/configuration/hover">Hover</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="channel" />
                        <p-chart-hover [offset]="8" [brightness]="1.1" />
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
export class PieDonutHoverDoc {
    readonly data = [
        { channel: 'Direct sales', share: 38.4 },
        { channel: 'Partner-led', share: 24.7 },
        { channel: 'Marketplace', share: 18.9 },
        { channel: 'Self-serve', share: 11.6 },
        { channel: 'Expansion', share: 6.4 }
    ];
}
