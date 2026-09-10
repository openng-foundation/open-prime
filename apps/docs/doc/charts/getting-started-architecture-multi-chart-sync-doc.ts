import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'getting-started-architecture-multi-chart-sync-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>ChartGroup</i> links multiple chart roots so they share state. Legend toggles, crosshair position, and zoom range all sync. Hover one chart and the crosshair moves on all of them.</p>
            <p>For configuration and examples, see <a href="/charts/types/synced">Synced Charts</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div class="flex flex-col gap-2">
                        <p-chart-svg [sync]="true" [height]="220">
                            <p-chart-line [data]="data" categoryXField="month" valueYField="revenue" name="Revenue ($K)" curve="smooth" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Revenue" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="180">
                            <p-chart-bar [data]="data" categoryXField="month" valueYField="orders" name="Orders" />
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
export class ArchitectureMultiChartSyncDoc {
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
