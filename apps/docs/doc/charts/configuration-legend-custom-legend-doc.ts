import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-legend-custom-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use a <i>pChartLegendItemDef</i> template to replace each legend item with custom content. The template context is a <i>LegendItemRenderContext</i> for each item, including <i>label</i>, <i>color</i>, <i>visible</i>, <i>isHovered</i>,
                and event handlers for click and hover. The legend is an HTML overlay, so the same template works in both the SVG and Canvas renderers.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="bookings" color="#5daeea" name="Bookings" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="supportCost" color="#ffad5a" name="Support Cost" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="margin" color="#10a981" name="Margin" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="target" color="#ffd166" name="Target" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom">
                        <ng-template pChartLegendItemDef let-ctx>
                            <button
                                (click)="ctx.onClick()"
                                (mouseenter)="ctx.onMouseEnter()"
                                (mouseleave)="ctx.onMouseLeave()"
                                style="display: inline-flex; align-items: center; padding: 4px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; transition: all 0.15s"
                                [style.border]="'2px solid ' + ctx.color"
                                [style.background]="ctx.visible ? ctx.color : 'transparent'"
                                [style.color]="ctx.visible ? '#fff' : ctx.color"
                                [style.opacity]="ctx.isHovered ? 0.75 : 1"
                                [style.text-decoration]="ctx.visible ? 'none' : 'line-through'"
                            >
                                {{ ctx.label }}
                            </button>
                        </ng-template>
                    </p-chart-legend>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendCustomLegendDoc {
    readonly data = [
        { month: 'Jan', bookings: 120, supportCost: 80, margin: 40, target: 100 },
        { month: 'Feb', bookings: 185, supportCost: 95, margin: 90, target: 120 },
        { month: 'Mar', bookings: 156, supportCost: 88, margin: 68, target: 130 },
        { month: 'Apr', bookings: 210, supportCost: 102, margin: 108, target: 140 },
        { month: 'May', bookings: 198, supportCost: 90, margin: 108, target: 150 },
        { month: 'Jun', bookings: 230, supportCost: 108, margin: 122, target: 160 }
    ];
}
