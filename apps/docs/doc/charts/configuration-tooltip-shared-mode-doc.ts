import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-shared-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>mode="shared"</i> to show all series values at the hovered position in a single tooltip. This works for multi-series charts where comparing values at the same anchor is the main interaction. The tooltip snaps to the nearest
                anchor regardless of where the cursor is off-axis.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="direct" name="Direct" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="partner" name="Partner" color="#ffad5a" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="marketplace" name="Marketplace" color="#7c8cff" />
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
export class TooltipSharedModeDoc {
    readonly data = [
        { month: 'Jan', direct: 42, partner: 28, marketplace: 18 },
        { month: 'Feb', direct: 45, partner: 30, marketplace: 17 },
        { month: 'Mar', direct: 48, partner: 32, marketplace: 16 },
        { month: 'Apr', direct: 51, partner: 35, marketplace: 15 },
        { month: 'May', direct: 53, partner: 34, marketplace: 14 },
        { month: 'Jun', direct: 56, partner: 36, marketplace: 13 }
    ];
}
