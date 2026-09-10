import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type HoverProps } from '@openng/optimus-ui/charts';

type HoverClickContext = Parameters<NonNullable<HoverProps['onClick']>>[0];

@Component({
    selector: 'configuration-hover-click-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartHover</i> and set <i>onClick</i> to respond to clicks on data elements. The callback receives the clicked element's <i>datasetId</i>, <i>index</i>, <i>label</i>, <i>value</i>, and <i>color</i>. When <i>onClick</i> is not
                set, a click has no effect on the data element; series visibility is toggled through the legend, not by clicking the chart.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="bookings" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-hover [onClick]="handleClick" />
                </p-chart-svg>
                @if (clicked(); as c) {
                    <div style="margin-top: 12px; padding: 12px 16px; border-radius: 6px; border: 1px solid rgba(128, 128, 128, 0.2); font-size: 13px; display: flex; gap: 12px; align-items: center">
                        <span [style.background]="c.color" style="width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0"></span>
                        <span
                            ><strong>{{ c.label }}</strong> — {{ c.value.toLocaleString() }}</span
                        >
                    </div>
                } @else {
                    <div style="margin-top: 12px; padding: 12px 16px; border-radius: 6px; border: 1px solid rgba(128, 128, 128, 0.2); font-size: 13px; opacity: 0.5">Click a bar to see its data</div>
                }
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoverClickDoc {
    readonly clicked = signal<HoverClickContext | null>(null);

    readonly data = [
        { month: 'Jan', bookings: 540 },
        { month: 'Feb', bookings: 620 },
        { month: 'Mar', bookings: 810 },
        { month: 'Apr', bookings: 730 },
        { month: 'May', bookings: 900 },
        { month: 'Jun', bookings: 680 }
    ];

    readonly handleClick = (context: HoverClickContext): void => {
        this.clicked.set(context);
    };
}
