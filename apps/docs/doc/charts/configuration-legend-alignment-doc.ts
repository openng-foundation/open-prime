import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-alignment-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>align</i> to <i>start</i>, <i>center</i>, or <i>end</i> to control how legend items are aligned within the legend area. <i>start</i> left-aligns items, <i>center</i> centers them, and <i>end</i> right-aligns them.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="desktop" name="Desktop" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="mobile" name="Mobile" color="#5ccf9f" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="top" align="end" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendAlignmentDoc {
    readonly data = [
        { month: 'Jan', desktop: 186, mobile: 80 },
        { month: 'Feb', desktop: 305, mobile: 200 },
        { month: 'Mar', desktop: 237, mobile: 120 },
        { month: 'Apr', desktop: 73, mobile: 190 },
        { month: 'May', desktop: 209, mobile: 130 },
        { month: 'Jun', desktop: 214, mobile: 140 }
    ];
}
