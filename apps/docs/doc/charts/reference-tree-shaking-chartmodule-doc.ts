import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-chartmodule-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartModule</i> re-exports every chart part the package makes public: roots, axes, all series, and all features. A feature module imports them all at once, and there is nothing to look up. The cost: importing the module pulls in
                every part it re-exports whether or not the template draws it, including series and features the page never uses. On a lazy-loaded feature module this rarely matters.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingChartmoduleDoc {}
