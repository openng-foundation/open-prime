import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'internationalization-rtl-auto-direction-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>dir</i> defaults to <i>'auto'</i>, which inherits the text direction from the nearest ancestor element with a <i>dir</i> attribute. Charts inside an RTL page therefore mirror automatically with no <i>dir</i> set on each chart. Set
                <i>dir</i> explicitly to <i>'ltr'</i> or <i>'rtl'</i> to override the inherited direction.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RtlAutoDirectionDoc {}
