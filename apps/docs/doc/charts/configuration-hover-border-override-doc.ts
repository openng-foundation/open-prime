import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-hover-border-override-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>borderColor</i> and <i>borderStrokeWidth</i> to add a stroke around the hovered item. Use <i>borderDash</i> to apply a dashed border pattern and <i>borderDashOffset</i> to shift the pattern along the stroke. This provides a
                selection indicator that works alongside brightness and optional dimming.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-hover borderColor="#ffad5a" [borderStrokeWidth]="2" [brightness]="1.1" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverBorderOverrideDoc {
    readonly data = [
        { month: 'Jan', bookings: 540 },
        { month: 'Feb', bookings: 620 },
        { month: 'Mar', bookings: 810 },
        { month: 'Apr', bookings: 730 },
        { month: 'May', bookings: 900 },
        { month: 'Jun', bookings: 680 }
    ];
}
