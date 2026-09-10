import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-synced-full-sync-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Combine crosshair sync, shared legend, and synced zoom in a single layout. The shared legend at the bottom controls visibility for all charts while crosshairs and zoom stay synchronized across every panel.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-group>
                    <div style="display: flex; flex-direction: column; gap: 8px">
                        <p-chart-svg [sync]="true" [height]="240">
                            <p-chart-line id="revenue" [data]="data" categoryXField="month" valueYField="revenue" name="Revenue" curve="smooth" [showMarkers]="true" />
                            <p-chart-line id="expenses" [data]="data" categoryXField="month" valueYField="expenses" name="Expenses" curve="smooth" [showMarkers]="true" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Amount ($K)" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>

                        <p-chart-svg [sync]="true" [height]="180">
                            <p-chart-bar id="profit" [data]="data" categoryXField="month" valueYField="profit" name="Profit" />
                            <p-chart-x-axis />
                            <p-chart-y-axis label="Profit ($K)" />
                            <p-chart-tooltip [crosshair]="true" />
                            <p-chart-hover />
                        </p-chart-svg>
                    </div>

                    <p-chart-legend align="center" />
                </p-chart-group>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedFullSyncDoc {
    readonly data = [
        { month: 'Jan', revenue: 42, expenses: 28, profit: 14 },
        { month: 'Feb', revenue: 55, expenses: 32, profit: 23 },
        { month: 'Mar', revenue: 48, expenses: 30, profit: 18 },
        { month: 'Apr', revenue: 63, expenses: 35, profit: 28 },
        { month: 'May', revenue: 58, expenses: 33, profit: 25 },
        { month: 'Jun', revenue: 72, expenses: 38, profit: 34 },
        { month: 'Jul', revenue: 65, expenses: 36, profit: 29 },
        { month: 'Aug', revenue: 78, expenses: 40, profit: 38 }
    ];
}
