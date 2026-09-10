import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-brightness-and-dim-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>brightness</i> to control how much the hovered item lightens. <i>1.0</i> means no change, <i>1.3</i> means 30% brighter. Set <i>dimOpacity</i> below <i>1</i> to fade non-hovered items. <i>0</i> makes them invisible,
                <i>1</i> means no fading. Combining brightness with explicit dimming produces a stronger focus effect without changing colors.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="profit" name="Profit" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-hover [brightness]="1.3" [dimOpacity]="0.3" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverBrightnessAndDimDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, profit: 18 },
        { month: 'Feb', revenue: 45, profit: 20 },
        { month: 'Mar', revenue: 48, profit: 22 },
        { month: 'Apr', revenue: 51, profit: 25 },
        { month: 'May', revenue: 53, profit: 24 },
        { month: 'Jun', revenue: 56, profit: 28 }
    ];
}
