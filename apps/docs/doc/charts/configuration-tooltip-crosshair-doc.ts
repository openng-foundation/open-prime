import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-crosshair-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>crosshair</i> to display a reference line at the hovered position. Pass <i>true</i> for default styling or a <i>CrosshairConfig</i> object for fine control. Set <i>x</i>/<i>y</i> to show vertical or horizontal lines
                independently, and <i>dashArray</i>, <i>color</i>, <i>width</i> to customize their appearance.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="temp" color="#ff7a66" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-tooltip [crosshair]="true" />
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
export class TooltipCrosshairDoc {
    readonly data = [
        { month: 'Jan', temp: 3 },
        { month: 'Feb', temp: 5 },
        { month: 'Mar', temp: 10 },
        { month: 'Apr', temp: 15 },
        { month: 'May', temp: 20 },
        { month: 'Jun', temp: 25 },
        { month: 'Jul', temp: 28 },
        { month: 'Aug', temp: 27 },
        { month: 'Sep', temp: 22 },
        { month: 'Oct', temp: 16 },
        { month: 'Nov', temp: 9 },
        { month: 'Dec', temp: 4 }
    ];
}
