import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-snap-strategy-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>snap</i> to control how the hovered point is selected. <i>category</i> snaps to the nearest category (bar/column default), <i>x</i> snaps along the X axis (line/area default), <i>xy</i> picks the Euclidean-nearest point
                (scatter/bubble default), <i>y</i> snaps along the Y axis, and <i>none</i> disables neighborhood search so the tooltip only appears on exact shape hover. When unset, each chart type uses its natural default. Heatmap is the exception
                that snaps without being asked: its cells tile the plot, so the <i>spacing</i> between them is decoration rather than background, and the cursor resolves to the cell whose band it falls in. Pass <i>none</i> there for exact hover on
                the painted cell only.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" name="Expansion ARR" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="growth" name="Growth %" color="#ffad5a" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-tooltip mode="shared" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipSnapStrategyDoc {
    readonly data = [
        { month: 'Jan', arr: 42, growth: 5 },
        { month: 'Feb', arr: 55, growth: 12 },
        { month: 'Mar', arr: 48, growth: 8 },
        { month: 'Apr', arr: 63, growth: 15 },
        { month: 'May', arr: 58, growth: 11 },
        { month: 'Jun', arr: 71, growth: 18 }
    ];
}
