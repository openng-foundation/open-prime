import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-animation-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Animations are on by default; no configuration is required for standard entrance and update transitions. Pass an <i>animation</i> input to the chart root to override duration or easing. Use <i>animations</i> for per-property control
                or <i>transitions</i> to target specific update scenarios.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationImportDoc {}
