import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTooltip</i> to show slice details on hover. The tooltip includes the percentage alongside the value with no extra configuration. Use a <i>pChartTooltipDef</i> template for custom tooltip content.</p>
            <p>For full configuration see <a href="/charts/configuration/tooltip">Tooltip</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="bookings" categoryField="channel" />
                        <p-chart-tooltip />
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
export class PieDonutTooltipDoc {
    readonly data = [
        { channel: 'Direct sales', bookings: 38.4 },
        { channel: 'Partner-led', bookings: 24.7 },
        { channel: 'Marketplace', bookings: 18.9 },
        { channel: 'Self-serve', bookings: 11.6 },
        { channel: 'Expansion', bookings: 6.4 }
    ];
}
