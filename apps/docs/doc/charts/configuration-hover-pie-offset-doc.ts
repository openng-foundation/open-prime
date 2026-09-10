import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-pie-offset-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>offset</i> to pop the hovered slice outward from the center along the slice angle. The chart reserves extra padding to prevent clipping. Also works on bar charts, where <i>offset</i> lifts the hovered bar upward.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" categoryField="browser" valueField="share" name="Browser Share" />
                        <p-chart-legend position="bottom" />
                        <p-chart-hover [offset]="12" />
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
export class HoverPieOffsetDoc {
    readonly data = [
        { browser: 'Chrome', share: 65 },
        { browser: 'Safari', share: 18 },
        { browser: 'Firefox', share: 8 },
        { browser: 'Edge', share: 5 },
        { browser: 'Other', share: 4 }
    ];
}
