import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-legend-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartColorLegend</i> to map cell colors to a value scale. Set <i>colorValueField</i> to color cells by a metric separate from their size, and pass matching <i>colorScale</i> and <i>colorRange</i> stops. The legend renders a
                gradient bar; set <i>position</i> to <i>top</i>, <i>bottom</i>, <i>left</i>, or <i>right</i>.
            </p>
            <p>For full configuration see <a href="/charts/configuration/legend">Legend</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="revenue" colorValueField="growth" [colorScale]="colorScale" [colorRange]="colorRange" />
                        <p-chart-color-legend position="bottom" [colorScale]="colorScale" [colorRange]="colorRange" />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapLegendDoc {
    readonly colorScale = [-10, 0, 25];
    readonly colorRange = ['#e5484d', '#e2e8f0', '#10a981'];
    readonly data = [
        { name: 'Cloud', revenue: 92, growth: 24 },
        { name: 'Advertising', revenue: 78, growth: 9 },
        { name: 'Subscriptions', revenue: 54, growth: 16 },
        { name: 'Devices', revenue: 38, growth: -6 },
        { name: 'Payments', revenue: 27, growth: 12 },
        { name: 'Gaming', revenue: 21, growth: -2 }
    ];
}
