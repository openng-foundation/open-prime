import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-accessibility-disabling-accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Set <i>enabled</i> to <i>false</i> to disable all accessibility features. Only do this when the chart is purely decorative and a text alternative is provided elsewhere on the page.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityDisablingAccessibilityDoc {}
