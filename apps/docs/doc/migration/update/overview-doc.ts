import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'update-overview-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                All <i>&#64;openng/optimus-ui</i> packages — the components, themes, locale definitions, Tailwind CSS plugin and their internal dependencies — are versioned and released together, so an update always moves the whole suite to a single
                new version. Optimus UI supports <i>ng update</i>, the Angular CLI's own update mechanism, which bumps every installed Optimus UI package in one step and runs any automated code migrations shipped with the new version.
            </p>
            <p>Major versions follow Angular's: when a new Angular major ships, a matching Optimus UI major is released for it. Minor and patch releases stay within the same Angular major and are drop-in updates.</p>
            <p>
                This page is about updating a project that already uses Optimus UI. To move an existing PrimeNG workspace across, see the
                <a href="https://v1.optimus.openng.org/migration/primeng" target="_blank" rel="noopener noreferrer" class="doc-link">migration guide</a> instead.
            </p>
        </app-docsectiontext>
    `
})
export class UpdateOverviewDoc {}
