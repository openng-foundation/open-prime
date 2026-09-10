import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-hover-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>ChartHover</i> brightens the hovered bar while the rest stay at normal opacity. Category snapping keeps the selected category obvious when the chart is dense.</p>
            <p>For full configuration see <a href="/charts/configuration/hover">Hover</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="city" valueYField="population" color="#5daeea" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Population (M)" />
                        <p-chart-hover [brightness]="1.15" />
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
export class ColumnBarHoverDoc {
    readonly data = [
        { city: 'Tokyo', population: 37 },
        { city: 'Delhi', population: 32 },
        { city: 'Shanghai', population: 29 },
        { city: 'São Paulo', population: 22 },
        { city: 'Mumbai', population: 21 },
        { city: 'Cairo', population: 21 }
    ];
}
