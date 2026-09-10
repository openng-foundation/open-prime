import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-column-bar-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Pass the chart-root <i>animation</i> input to control entrance and update transitions. Bars create one mark per category, so large category sets often benefit from Canvas rendering.</p>
            <p>For full configuration see <a href="/charts/configuration/animation">Animation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnBarAnimationDoc {}
