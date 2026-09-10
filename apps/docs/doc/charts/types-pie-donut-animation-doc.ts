import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-pie-donut-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Pass the chart-root <i>animation</i> input (<i>&lt;p-chart-svg&gt;</i> / <i>&lt;p-chart-canvas&gt;</i>) to control entrance and update transitions. Slices expand from zero span on entrance. On data updates, slices interpolate their
                rotation and angle. Slice additions and removals animate independently.
            </p>
            <p>For full configuration see <a href="/charts/configuration/animation">Animation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieDonutAnimationDoc {}
