import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

interface Holding {
    id: string;
    name: string;
    value: number;
    parent: string | null;
    change: string | null;
}

@Component({
    selector: 'types-treemap-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDataLabels</i> to display a value line below the leaf cell name. By default the value line shows the plain value. Set <i>display</i> to <i>value</i>, <i>percentage</i>, or <i>both</i> to switch the content, where the
                percentage is each leaf's share of the visible leaf total. Set <i>formatter</i> to build custom text; the callback receives the value, percentage, name, and row <i>datum</i>, so a sibling field such as a change value can drive the
                line. Set <i>color</i> to style the value line, while <i>labelColor</i> on <i>ChartTreemap</i> still colors the cell name.
            </p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-treemap [data]="data" categoryField="name" valueField="value" nodeId="id" parentField="parent" [labelMinSize]="40" [showGroupLabel]="true" [groupLabelHeight]="28" />
                        <p-chart-data-labels [formatter]="labelFormatter" />
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
export class TreemapDataLabelsDoc {
    readonly labelFormatter = (_v: number, _p: number | undefined, _name: string | undefined, d: unknown): string => (d as Holding).change ?? '';

    readonly data: Holding[] = [
        { id: 'tech', name: 'Technology', value: 0, parent: null, change: null },
        { id: 'health', name: 'Healthcare', value: 0, parent: null, change: null },
        { id: 'finance', name: 'Finance', value: 0, parent: null, change: null },
        { id: 'aapl', name: 'AAPL', value: 2900, parent: 'tech', change: '+2.4%' },
        { id: 'msft', name: 'MSFT', value: 2800, parent: 'tech', change: '+1.1%' },
        { id: 'googl', name: 'GOOGL', value: 1700, parent: 'tech', change: '-0.8%' },
        { id: 'nvda', name: 'NVDA', value: 1200, parent: 'tech', change: '+5.3%' },
        { id: 'meta', name: 'META', value: 320, parent: 'tech', change: '+0.6%' },
        { id: 'unh', name: 'UNH', value: 480, parent: 'health', change: '-1.2%' },
        { id: 'jnj', name: 'JNJ', value: 420, parent: 'health', change: '+0.3%' },
        { id: 'lly', name: 'LLY', value: 550, parent: 'health', change: '+3.7%' },
        { id: 'jpm', name: 'JPM', value: 520, parent: 'finance', change: '+1.8%' },
        { id: 'v', name: 'V', value: 480, parent: 'finance', change: '-0.4%' },
        { id: 'ma', name: 'MA', value: 390, parent: 'finance', change: '+2.1%' }
    ];
}
