import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-line-area-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Line charts track changes over time or across ordered categories. Data and styling live on <i>ChartLine</i>; axes frame the scale. Set <i>fillOpacity</i> to switch to area mode. Use <i>ChartStacked</i> to accumulate multiple series.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineAreaImportDoc {}
