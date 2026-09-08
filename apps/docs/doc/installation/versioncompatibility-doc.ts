import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppVersionCompatibility } from '@/components/doc/app.versioncompatibility';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'installation-version-compatibility-doc',
    standalone: true,
    imports: [AppDocSectionText, AppVersionCompatibility, RouterModule],
    template: `
        <app-docsectiontext>
            <p>Each Optimus UI major targets a single Angular major. Install the version matching your workspace, and see the <a [routerLink]="'/migration/update'" class="doc-link">update guide</a> when moving to a newer one.</p>
            <app-version-compatibility></app-version-compatibility>
        </app-docsectiontext>
    `
})
export class InstallationVersionCompatibilityDoc {}
