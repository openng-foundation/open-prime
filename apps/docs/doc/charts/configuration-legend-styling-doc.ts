import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>fontSize</i>, <i>fontFamily</i>, <i>fontWeight</i>, and <i>color</i> to customize legend label text. Set <i>iconSize</i> to control the marker size. Use <i>width</i> and <i>height</i> to fix the legend container dimensions.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" color="#5ccf9f" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" [fontSize]="14" fontWeight="bold" [iconSize]="16" [itemGap]="16" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendStylingDoc {
    readonly data = [
        { month: 'Jan', desktop: 186, mobile: 80 },
        { month: 'Feb', desktop: 305, mobile: 200 },
        { month: 'Mar', desktop: 237, mobile: 120 },
        { month: 'Apr', desktop: 73, mobile: 190 },
        { month: 'May', desktop: 209, mobile: 130 },
        { month: 'Jun', desktop: 214, mobile: 140 }
    ];
}
