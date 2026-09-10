import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-bundle-impact-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                For a line chart, the <i>ChartModule</i> import carries every re-exported part at once. Standalone imports keep the cartesian engine, the chosen renderer, and the line type, and leave the unused types behind as stray label strings
                rather than drawing code. Each chart type added to a flat build costs roughly its own renderer and nothing else, so the bundle grows only with the types actually drawn.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingBundleImpactDoc {}
