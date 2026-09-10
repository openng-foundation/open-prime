import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-treemap-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Pass the chart-root <i>animation</i> input (<i>&lt;p-chart-svg&gt;</i> / <i>&lt;p-chart-canvas&gt;</i>) to control entrance and update transitions. Cells grow from their center position on entrance. Drilldown transitions use a zoom
                animation.
            </p>
            <p>For full configuration see <a href="/charts/configuration/animation">Animation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreemapAnimationDoc {}
