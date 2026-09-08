import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'update-release-notes-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Every version is published with its notes on the <a href="https://github.com/openng-org/optimus-ui/releases" target="_blank" rel="noopener noreferrer">GitHub releases page</a>, covering new features, fixes and any breaking changes or
                manual steps a release requires. Check the notes for the target version before a major update.
            </p>
        </app-docsectiontext>
    `
})
export class ReleaseNotesDoc {}
