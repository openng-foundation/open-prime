import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-color-override-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>backgroundColor</i> to replace the hovered item's fill color instead of adjusting brightness. When <i>backgroundColor</i> is set, <i>brightness</i> is ignored. Use this when base colors are muted and brightness alone is not
                visible enough.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#94a3b8" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-hover backgroundColor="#5daeea" borderColor="#2531a8" [borderStrokeWidth]="2" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverColorOverrideDoc {
    readonly data = [
        { month: 'Jan', bookings: 540 },
        { month: 'Feb', bookings: 620 },
        { month: 'Mar', bookings: 810 },
        { month: 'Apr', bookings: 730 },
        { month: 'May', bookings: 900 },
        { month: 'Jun', bookings: 680 }
    ];
}
