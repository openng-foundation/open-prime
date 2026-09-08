import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'faq-migration-doc',
    standalone: true,
    imports: [AppDocSectionText, RouterModule],
    template: `
        <app-docsectiontext>
            <h3>Which Angular versions are supported?</h3>
            <p>
                Angular v21 and newer. Our majors follow Angular's — when a new Angular major ships, a compatible Optimus UI major is the first thing we work on. See the
                <a [routerLink]="'/migration/update'" fragment="angular-compatibility" class="doc-link">version compatibility table</a> in the update guide.
            </p>

            <h3>How do I migrate from PrimeNG? Is it automatic?</h3>
            <p>
                Mostly, but not through <i>ng add</i>, which only sets up new projects and fails without changing anything when it finds an existing <i>primeng</i> dependency. Install <i>&#64;openng/optimus-ui</i>, then run
                <i>ng generate &#64;openng/optimus-ui:migrate-from-primeng</i> in a PrimeNG v21 workspace: packages swapped, imports rewritten, dependencies installed. It then prints a report of anything it could not rewrite, with file and line
                numbers. The <a href="https://v1.optimus.openng.org/migration/primeng" target="_blank" rel="noopener noreferrer" class="doc-link">migration guide</a> covers the details and the manual cases.
            </p>

            <h3>I am on PrimeNG v20 or older. Can I migrate directly?</h3>
            <p>No. Upgrade to PrimeNG v21 first, using PrimeNG's own migration guides, then run the schematic. The schematic checks the version and refuses rather than producing a half-migrated workspace.</p>

            <h3>What happens to my PrimeNG license?</h3>
            <p>
                Nothing — it is unrelated. A PrimeNG v22 commercial license covers PrimeNG. Optimus UI needs no license at all. If you hold a PrimeTek subscription for their templates or theme designer, those remain their products and do not carry
                over here.
            </p>

            <h3>I had an open PR on primefaces/primeng. Can I bring it here?</h3>
            <p>
                Yes, and we would like you to. Append <i>.patch</i> to your original pull request URL and apply it with <i>git am</i> — the contributing guide in the repository walks through it, including what to do when the patch no longer applies
                cleanly.
            </p>

            <h3>Can I run PrimeNG and Optimus UI side by side?</h3>
            <p>
                Technically yes, since the package names and the CSS cascade layer differ, but you will ship two copies of the same components and two theme runtimes. Treat it as a temporary state during migration rather than a supported
                configuration.
            </p>
        </app-docsectiontext>
    `
})
export class FaqMigrationDoc {}
