import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-heatmap-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Pass the chart-root <i>animation</i> input (<i>&lt;p-chart-svg&gt;</i> / <i>&lt;p-chart-canvas&gt;</i>) to control entrance and update transitions. Cells fade in on entrance and cross-fade to new colors on data updates.</p>
            <p>For full configuration see <a href="/charts/configuration/animation">Animation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatmapAnimationDoc {}
