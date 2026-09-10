import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-combo-line-and-scatter-on-a-category-axis-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Both <i>ChartLine</i> and <i>ChartScatter</i> can share a single category axis using the axis-tagged accessors <i>categoryXField</i> and <i>valueYField</i>. The scatter points land on the same band positions as the line vertices.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="target" name="Target" color="#94a3b8" curve="linear" [lineStrokeWidth]="2" [showMarkers]="false" [fillOpacity]="0" />
                        <p-chart-scatter [data]="data" categoryXField="month" valueYField="actual" name="Actual" color="#6366f1" [markerSize]="7" [pointFillOpacity]="0.7" />
                        <p-chart-x-axis label="Month" />
                        <p-chart-y-axis label="Units" [startFromZero]="true" />
                        <p-chart-legend position="top" />
                        <p-chart-tooltip />
                        <p-chart-hover [dimOpacity]="0.3" />
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
export class ComboLineAndScatterOnACategoryAxisDoc {
    readonly data = [
        { month: 'Jan', target: 120, actual: 110 },
        { month: 'Feb', target: 135, actual: 142 },
        { month: 'Mar', target: 150, actual: 138 },
        { month: 'Apr', target: 162, actual: 170 },
        { month: 'May', target: 178, actual: 165 },
        { month: 'Jun', target: 190, actual: 201 },
        { month: 'Jul', target: 205, actual: 198 },
        { month: 'Aug', target: 218, actual: 229 },
        { month: 'Sep', target: 230, actual: 222 },
        { month: 'Oct', target: 245, actual: 251 },
        { month: 'Nov', target: 258, actual: 248 },
        { month: 'Dec', target: 272, actual: 285 }
    ];
}
