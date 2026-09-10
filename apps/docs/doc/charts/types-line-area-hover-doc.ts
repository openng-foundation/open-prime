import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-hover-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>ChartHover</i> brightens the hovered point while the rest stay at normal opacity. Shared X-position hover is most useful when several series share the same ordered axis.</p>
            <p>For full configuration see <a href="/charts/configuration/hover">Hover</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="activation" showMarkers />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-hover [brightness]="1.2" />
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
export class LineAreaHoverDoc {
    readonly data = [
        { month: 'Jan', activation: 41 },
        { month: 'Feb', activation: 46 },
        { month: 'Mar', activation: 49 },
        { month: 'Apr', activation: 45 },
        { month: 'May', activation: 53 },
        { month: 'Jun', activation: 58 }
    ];
}
