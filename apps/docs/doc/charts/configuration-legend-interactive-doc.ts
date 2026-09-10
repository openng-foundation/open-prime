import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type LegendProps } from '@openng/optimus-ui/charts';

type LegendClickContext = Parameters<NonNullable<LegendProps['onClick']>>[0];

@Component({
    selector: 'configuration-legend-interactive-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>interactive</i> to <i>false</i> to disable click-to-toggle behavior. Use it for static charts and reports where legend items are labels. To intercept clicks and run custom logic, use <i>onClick</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="320">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="shipped" color="#5daeea" name="Shipped" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="returns" color="#ffad5a" name="Returns" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="exchanges" color="#ff7a66" name="Exchanges" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" [onClick]="handleClick" />
                </p-chart-svg>

                <div style="margin-top: 12px; padding: 12px 16px; border-radius: 8px; background: var(--p-surface-100, #f3f4f6); font-size: 13px; color: var(--p-surface-600, #4b5563); min-height: 40px">
                    @if (lastClick(); as c) {
                        <span
                            >Clicked: <strong>{{ c.label }}</strong> (id: {{ c.datasetId }})</span
                        >
                    } @else {
                        <span style="opacity: 0.6">Click a legend item to intercept with a custom onClick handler</span>
                    }
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendInteractiveDoc {
    readonly lastClick = signal<{ label: string; datasetId: string } | null>(null);

    readonly data = [
        { month: 'Jan', shipped: 120, returns: 15, exchanges: 8 },
        { month: 'Feb', shipped: 185, returns: 22, exchanges: 12 },
        { month: 'Mar', shipped: 156, returns: 18, exchanges: 9 },
        { month: 'Apr', shipped: 210, returns: 25, exchanges: 14 }
    ];

    handleClick = (context: LegendClickContext) => {
        this.lastClick.set({ label: context.label, datasetId: context.datasetId });
    };
}
