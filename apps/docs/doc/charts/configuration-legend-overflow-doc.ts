import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

function makeData(base: number, seed: number) {
    return months.map((month, i) => ({
        month,
        value: base + Math.round(Math.sin(i + seed) * 15)
    }));
}

@Component({
    selector: 'configuration-legend-overflow-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The legend area is pre-calculated by the layout engine as a fixed rectangle. <i>maxWidth</i> and <i>maxHeight</i> cap the legend container within that space and enable scrolling when content exceeds the limit. For <i>top</i>/<i
                    >bottom</i
                >
                legends use <i>maxHeight</i>, for <i>left</i>/<i>right</i> legends use <i>maxWidth</i>. Use <i>width</i> and <i>height</i> to lock the container to a fixed size regardless of item count.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="350">
                    <p-chart-line [data]="data.direct" categoryXField="month" valueYField="value" name="Direct" color="#5daeea" />
                    <p-chart-line [data]="data.partner" categoryXField="month" valueYField="value" name="Partner" color="#ffad5a" />
                    <p-chart-line [data]="data.marketplace" categoryXField="month" valueYField="value" name="Marketplace" color="#ffd166" />
                    <p-chart-line [data]="data.enterprise" categoryXField="month" valueYField="value" name="Enterprise" color="#4ecdc4" />
                    <p-chart-line [data]="data.startup" categoryXField="month" valueYField="value" name="Startup" color="#7c8cff" />
                    <p-chart-line [data]="data.expansion" categoryXField="month" valueYField="value" name="Expansion" color="#c084fc" />
                    <p-chart-line [data]="data.services" categoryXField="month" valueYField="value" name="Services" color="#ff6fae" />
                    <p-chart-line [data]="data.training" categoryXField="month" valueYField="value" name="Training" color="#36b7d6" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" [maxHeight]="52" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendOverflowDoc {
    readonly data = {
        direct: makeData(80, 0),
        partner: makeData(65, 1),
        marketplace: makeData(90, 2),
        enterprise: makeData(55, 3),
        startup: makeData(75, 4),
        expansion: makeData(85, 5),
        services: makeData(60, 6),
        training: makeData(70, 7)
    };
}
