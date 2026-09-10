import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-title-and-caption-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTitle</i> to display a title above the chart and <i>ChartCaption</i> for a descriptive line beneath it. Adding both reduces the available chart area.</p>
            <p>For full configuration see <a href="/charts/configuration/title-caption">Title &amp; Caption</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-pie [data]="data" valueField="share" categoryField="channel" />
                        <p-chart-title text="New ARR by acquisition channel" />
                        <p-chart-caption text="Enterprise SaaS bookings mix · Q1 FY26" />
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
export class PieDonutTitleAndCaptionDoc {
    readonly data = [
        { channel: 'Direct sales', share: 38.4 },
        { channel: 'Partner-led', share: 24.7 },
        { channel: 'Marketplace', share: 18.9 },
        { channel: 'Self-serve', share: 11.6 },
        { channel: 'Expansion', share: 6.4 }
    ];
}
