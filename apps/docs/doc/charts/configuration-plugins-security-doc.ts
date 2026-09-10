import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-plugins-security-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Overlays you draw are your own DOM/canvas calls. Bind text via <i>textContent</i>/<i>{{ '{' }}{{ '{' }} {{ '}' }}{{ '}' }}</i> and never inject untrusted strings through <i>[innerHTML]</i>. The chart core never parses plugin output as
                HTML.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PluginsSecurityDoc {}
