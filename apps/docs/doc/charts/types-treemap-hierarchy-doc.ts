import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-treemap-hierarchy-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>nodeId</i> to the field name holding each item's own unique ID, and <i>parentField</i> to the field name holding its parent's ID, the same pattern as a SQL adjacency list. The treemap builds the full hierarchy by matching IDs
                to parent references. Parent nodes with a <i>null</i> or missing parent value become top-level containers.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="value" nodeId="id" parentField="parent" />
                        <p-chart-tooltip />
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
export class TreemapHierarchyDoc {
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
