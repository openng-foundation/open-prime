import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-column-bar-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Bar charts compare categories by length and work well for rankings, period breakdowns, and distributions. Data and styling live on <i>ChartBar</i>; axes frame the scale. Wrapper components like <i>ChartStacked</i>,
                <i>ChartWaterfall</i>, and <i>ChartOverlap</i> add composite behavior without changing the bar's own inputs.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarImportDoc {}
