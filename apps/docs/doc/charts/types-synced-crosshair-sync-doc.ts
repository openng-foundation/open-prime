import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-synced-crosshair-sync-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Wrap multiple charts in <i>ChartGroup</i> and set <i>[sync]="true"</i> on each <i>ChartSvg</i> or <i>ChartCanvas</i>. Hovering one chart shows a crosshair at the same category position on all other charts in the group. Add
                <i>ChartTooltip</i> with <i>crosshair</i> to display the vertical guide line.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column; gap: 8px">
                        <p-chart-svg [sync]="true" [height]="220">
                            <p-chart-line id="revenue" [data]="data" categoryXField="month" valueYField="revenue" name="Revenue ($K)" curve="smooth" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Revenue" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="180">
                            <p-chart-bar id="orders" [data]="data" categoryXField="month" valueYField="orders" name="Orders" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Orders" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>
                    </div>
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedCrosshairSyncDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, orders: 120 },
        { month: 'Feb', revenue: 55, orders: 145 },
        { month: 'Mar', revenue: 48, orders: 130 },
        { month: 'Apr', revenue: 63, orders: 165 },
        { month: 'May', revenue: 58, orders: 155 },
        { month: 'Jun', revenue: 72, orders: 190 },
        { month: 'Jul', revenue: 65, orders: 175 },
        { month: 'Aug', revenue: 78, orders: 210 }
    ];
}
