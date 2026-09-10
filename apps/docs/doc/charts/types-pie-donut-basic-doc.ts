import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-pie-donut-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Map data fields with <i>valueField</i> and <i>categoryField</i>. The chart calculates each slice angle from the acquisition-channel share.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="channel" />
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
export class PieDonutBasicDoc {
    readonly data = [
        { channel: 'Direct sales', share: 38.4 },
        { channel: 'Partner-led', share: 24.7 },
        { channel: 'Marketplace', share: 18.9 },
        { channel: 'Self-serve', share: 11.6 },
        { channel: 'Expansion', share: 6.4 }
    ];
}
