import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartLegend</i> to display an interactive legend. For pie charts, each slice gets its own legend entry. Click any item to toggle the corresponding slice. Set <i>position</i> to <i>top</i>, <i>bottom</i>, <i>left</i>, or
                <i>right</i>.
            </p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="channel" />
                        <p-chart-legend />
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
export class PieDonutLegendDoc {
    readonly data = [
        { channel: 'Direct sales', share: 38.4 },
        { channel: 'Partner-led', share: 24.7 },
        { channel: 'Marketplace', share: 18.9 },
        { channel: 'Self-serve', share: 11.6 },
        { channel: 'Expansion', share: 6.4 }
    ];
}
