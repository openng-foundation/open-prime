import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-svg-and-canvas-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartSvg</i> and <i>ChartCanvas</i> are two renderers over the same chart components. The chart types inside (<i>ChartLine</i>, <i>ChartBar</i>, ...) are the same either way. Swapping one root for the other on a line chart does not
                change the bundle size in any meaningful way, because the cartesian engine and the line renderer are the bulk of it and both paths share them. Tree-shaking drops the chart types that go undrawn, not the engine. Any chart pays for the
                cartesian core baseline, the chosen renderer, and the types requested.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingSvgAndCanvasDoc {}
