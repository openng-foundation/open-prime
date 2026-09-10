import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-icon-shape-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>iconShape</i> to control the marker shape shown next to each legend label. <i>circle</i> renders a dot, <i>line</i> a thin bar, and <i>square</i> a filled box. The default <i>auto</i> picks a shape that matches the mark: line
                and area series show a line, scatter, bubble, pie, and donut show a dot, and everything else shows a square.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="bookings" color="#5daeea" name="Bookings" />
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="supportCost" color="#ffad5a" name="Support Cost" />
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="margin" color="#10a981" name="Margin" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" iconShape="circle" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendIconShapeDoc {
    readonly data = [
        { quarter: 'Q1', bookings: 120, supportCost: 80, margin: 40 },
        { quarter: 'Q2', bookings: 185, supportCost: 95, margin: 90 },
        { quarter: 'Q3', bookings: 156, supportCost: 88, margin: 68 },
        { quarter: 'Q4', bookings: 210, supportCost: 102, margin: 108 }
    ];
}
