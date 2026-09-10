import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-choosing-an-import-style-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Standalone imports are the size-safe default and read almost as cleanly as the module. <i>ChartModule</i> is fine when readability wins and the feature module is lazy-loaded. One more thing to avoid: importing from an aggregate
                <i>chart-core</i> barrel to grab a helper can drag in renderers that never render. The few core utilities worth reaching for (<i>easings</i>, <i>getEasing</i>, <i>registerEasing</i>, and the common types) are re-exported from the
                package root already.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingChoosingAnImportStyleDoc {}
