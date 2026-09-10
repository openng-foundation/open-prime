import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-tooltip-custom-tooltip-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use a <i>pChartTooltipDef</i> template to replace the default tooltip with custom content. The template context is a <i>TooltipRenderContext</i> containing all series items at the hovered position, the chart type, and theme
                information. The tooltip is an HTML overlay, so the same template works in both the SVG and Canvas renderers.
            </p>
            <p>
                &gt; <strong>Security.</strong> The built-in tooltip renders values as text (<i>textContent</i>), so raw data cannot inject markup. It is XSS-safe by default. When you supply a custom <i>pChartTooltipDef</i> template, you control the
                markup: never bind untrusted strings via <i>[innerHTML]</i>. Angular escapes interpolation (<i>{{ '{' }}{{ '{' }} value {{ '}' }}{{ '}' }}</i
                >) by default, so binding values as text keeps your tooltip safe.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="product" valueYField="units" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-tooltip>
                        <ng-template pChartTooltipDef let-ctx>
                            @let item = data[ctx.index];
                            <div style="display: flex; flex-direction: column; gap: 4px; background: #1f2937; padding: 10px 14px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3)">
                                <div style="font-weight: 600; font-size: 13px; color: #f9fafb">{{ item.product }}</div>
                                <div style="color: #9ca3af; font-size: 12px">{{ item.units.toLocaleString() }} units sold</div>
                                <div style="color: #5ccf9f; font-weight: 500; font-size: 12px">\${{ item.revenue.toLocaleString() }} revenue</div>
                            </div>
                        </ng-template>
                    </p-chart-tooltip>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipCustomTooltipDoc {
    readonly data = [
        { product: 'Laptop', units: 320, revenue: 384000 },
        { product: 'Phone', units: 580, revenue: 464000 },
        { product: 'Tablet', units: 210, revenue: 105000 },
        { product: 'Watch', units: 440, revenue: 132000 },
        { product: 'Headphones', units: 670, revenue: 67000 }
    ];
}
