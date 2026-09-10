import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-treemap-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Treemaps show hierarchical data as nested rectangles sized by value, good for part-to-whole comparisons with many categories. Cell area scales proportionally to each value. Pass a flat array with <i>parentField</i> and a unique node
                identifier to define drilldown-enabled hierarchy.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapImportDoc {}
