import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TickValue } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-data-labels-formatter-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>formatter</i> to control the label text. The callback receives the raw <i>value</i>, the <i>percentage</i> (0–100), the category <i>label</i>, and the row <i>datum</i>, and returns a string. Use the datum to pull sibling fields
                into the label. Use this for currency formatting, units, and conditional display logic.
            </p>
            <p>
                &gt; <strong>Security.</strong> <i>formatter</i> returns a <strong>string</strong>, rendered as text (<i>textContent</i>) and never parsed as HTML. There is no XSS surface even with untrusted data: any returned markup shows up as
                literal text, not elements.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="region" valueYField="arr" color="#5ccf9f" [borderRadius]="4" />
                    <p-chart-x-axis />
                    <p-chart-y-axis [tickFormat]="axisFormatter" />
                    <p-chart-data-labels [formatter]="labelFormatter" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataLabelsFormatterDoc {
    readonly data = [
        { region: 'North', arr: 42000 },
        { region: 'South', arr: 38000 },
        { region: 'East', arr: 51000 },
        { region: 'West', arr: 45000 },
        { region: 'Central', arr: 33000 }
    ];

    axisFormatter = (v: TickValue) => `$${(Number(v) / 1000).toFixed(0)}k`;
    labelFormatter = (v: number) => `$${(v / 1000).toFixed(0)}k`;
}
