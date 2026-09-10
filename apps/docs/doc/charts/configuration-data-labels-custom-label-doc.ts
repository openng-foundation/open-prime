import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const FONT_SIZE = 11;
const PADDING_X = 10;
const PADDING_Y = 5;
const RADIUS = 5;
const ARROW_H = 6;

@Component({
    selector: 'configuration-data-labels-custom-label-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Replace the default label with custom content through the <i>pChartDataLabelDef</i> seam. In SVG mode, use an <i>&lt;ng-template pChartDataLabelDef let-ctx&gt;</i> template returning <i>svg:</i>-prefixed markup. In Canvas mode, pass a
                <i>render</i> function that draws to <i>ctx</i>. The context is the full <i>DataLabelContext</i>: use <i>formattedText</i> for the pre-formatted value, <i>x</i>/<i>y</i> for position, and <i>ctx</i> in Canvas mode to draw
                imperatively.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-data-labels>
                        <ng-template pChartDataLabelDef let-ctx>
                            @let accent = ctx.color || '#5daeea';
                            @let w = ctx.formattedText.length * 6.6 + PADDING_X * 2;
                            @let bh = FONT_SIZE + PADDING_Y * 2;
                            <svg:g transform="translate(0, -10)">
                                <svg:rect [attr.x]="-w / 2 + 1.5" [attr.y]="-bh / 2 + 1.5" [attr.width]="w" [attr.height]="bh" [attr.rx]="RADIUS" [attr.fill]="accent" fill-opacity="0.18" />
                                <svg:rect [attr.x]="-w / 2" [attr.y]="-bh / 2" [attr.width]="w" [attr.height]="bh" [attr.rx]="RADIUS" fill="white" [attr.stroke]="accent" stroke-width="1.5" />
                                <svg:polygon [attr.points]="'0,' + (bh / 2 + ARROW_H) + ' -5,' + bh / 2 + ' 5,' + bh / 2" [attr.fill]="accent" />
                                <svg:text fill="#1e293b" [attr.font-size]="FONT_SIZE" font-weight="700" font-family="'Fira Code','JetBrains Mono','Courier New',monospace" text-anchor="middle" dominant-baseline="central">
                                    {{ ctx.formattedText }}
                                </svg:text>
                            </svg:g>
                        </ng-template>
                    </p-chart-data-labels>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataLabelsCustomLabelDoc {
    readonly FONT_SIZE = FONT_SIZE;
    readonly PADDING_X = PADDING_X;
    readonly PADDING_Y = PADDING_Y;
    readonly RADIUS = RADIUS;
    readonly ARROW_H = ARROW_H;

    readonly data = [
        { month: 'Jan', bookings: 540 },
        { month: 'Feb', bookings: 620 },
        { month: 'Mar', bookings: 810 },
        { month: 'Apr', bookings: 730 },
        { month: 'May', bookings: 900 },
        { month: 'Jun', bookings: 680 }
    ];
}
