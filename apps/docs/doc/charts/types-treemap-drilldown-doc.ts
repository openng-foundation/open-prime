import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-drilldown-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>drilldown</i> to enable click-to-drill navigation. Clicking a parent cell zooms into its children. Add <i>ChartBreadcrumb</i> to display a navigation trail; click any crumb to drill back up. Set <i>rootLabel</i> to name the
                top-level breadcrumb entry.
            </p>
            <p>Set <i>drilldownMode="flat"</i> to render parent cells as regular solid cells where clicking drills in. The default <i>"nested"</i> mode shows parent headers with children visible inside.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="value" nodeId="id" parentField="parent" [drilldown]="true" rootLabel="S&P 500" />
                        <p-chart-tooltip />
                        <p-chart-breadcrumb />
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
export class TreemapDrilldownDoc {
    readonly data = [
        { id: 'tech', name: 'Technology', value: 0, parent: null },
        { id: 'health', name: 'Healthcare', value: 0, parent: null },
        { id: 'finance', name: 'Finance', value: 0, parent: null },
        { id: 'aapl', name: 'AAPL', value: 2900, parent: 'tech' },
        { id: 'msft', name: 'MSFT', value: 2800, parent: 'tech' },
        { id: 'googl', name: 'GOOGL', value: 1700, parent: 'tech' },
        { id: 'nvda', name: 'NVDA', value: 1200, parent: 'tech' },
        { id: 'unh', name: 'UNH', value: 480, parent: 'health' },
        { id: 'jnj', name: 'JNJ', value: 420, parent: 'health' },
        { id: 'lly', name: 'LLY', value: 550, parent: 'health' },
        { id: 'jpm', name: 'JPM', value: 520, parent: 'finance' },
        { id: 'v', name: 'V', value: 480, parent: 'finance' },
        { id: 'ma', name: 'MA', value: 390, parent: 'finance' }
    ];
}
