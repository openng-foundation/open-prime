import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-bar-and-line-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Place <i>ChartBar</i> and <i>ChartLine</i> as siblings inside a single <i>ChartSvg</i> or <i>ChartCanvas</i>. Both series share the same category axis and Y scale. Set <i>name</i> on each dataset to label them in the legend and
                tooltip. Use <i>lineDash</i> on <i>ChartLine</i> to distinguish a target or forecast from the actual bars.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="budget" name="Budget" color="#64748b" [lineDash]="[6, 4]" [lineStrokeWidth]="2" [showMarkers]="false" [fillOpacity]="0" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="formatAxis" />
                    <p-chart-legend position="top" />
                    <p-chart-tooltip mode="shared" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBarAndLineDoc {
    readonly data = [
        { month: 'Jan', revenue: 284, budget: 310 },
        { month: 'Feb', revenue: 312, budget: 310 },
        { month: 'Mar', revenue: 298, budget: 320 },
        { month: 'Apr', revenue: 341, budget: 340 },
        { month: 'May', revenue: 378, budget: 360 },
        { month: 'Jun', revenue: 362, budget: 380 },
        { month: 'Jul', revenue: 405, budget: 395 },
        { month: 'Aug', revenue: 438, budget: 410 },
        { month: 'Sep', revenue: 421, budget: 425 },
        { month: 'Oct', revenue: 467, budget: 440 },
        { month: 'Nov', revenue: 512, budget: 460 },
        { month: 'Dec', revenue: 549, budget: 480 }
    ];

    readonly formatAxis = (v: TickValue): string => `$${v}K`;
}
