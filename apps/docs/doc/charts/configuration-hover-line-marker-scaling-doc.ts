import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-line-marker-scaling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                On line, scatter, and radar charts the hovered point's marker enlarges. By default it grows to <i>markerSize × 1.3</i>. Set <i>radiusMultiplier</i> on <i>ChartHover</i> to change that multiplier globally, or <i>hoverPointRadius</i> on
                the series component to override a specific series with an absolute pixel radius. Use <i>pointHoverBackgroundColor</i> and <i>pointHoverBorderColor</i> to override marker colors on hover.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="organic" name="Organic" [markerSize]="4" [hoverPointRadius]="8" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="paid" name="Paid" [markerSize]="4" [hoverPointRadius]="8" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-hover [brightness]="1.2" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverLineMarkerScalingDoc {
    readonly data = [
        { month: 'Jan', organic: 1200, paid: 800 },
        { month: 'Feb', organic: 1400, paid: 950 },
        { month: 'Mar', organic: 1100, paid: 1100 },
        { month: 'Apr', organic: 1600, paid: 1050 },
        { month: 'May', organic: 1800, paid: 1200 },
        { month: 'Jun', organic: 2100, paid: 1350 }
    ];
}
