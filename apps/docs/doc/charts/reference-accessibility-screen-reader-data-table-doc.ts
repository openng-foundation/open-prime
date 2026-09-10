import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-accessibility-screen-reader-data-table-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Charts also render a visually hidden data table for assistive technology. The table uses the chart's registered data model instead of the rendered SVG or Canvas marks, so screen readers can inspect the underlying values by row and
                column.
            </p>
            <p>
                Set <i>dataTableMaxRows</i> to cap how many rows are rendered in the hidden table. The default cap is <i>200</i>; when more rows exist, a summary row reports how many rows were omitted. Set <i>dataTableCellFormatter</i> to format each
                rendered table cell. The formatter also applies to CSV export, so downloaded values can match the accessible table text.
            </p>
            <p>CSV export uses the same data-table columns and formatter, but exports every chart row instead of applying the screen reader row cap.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityScreenReaderDataTableDoc {}
