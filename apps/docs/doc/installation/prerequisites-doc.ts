import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'prerequisites-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Optimus UI targets Angular v21 and newer. Any workspace created with the Angular CLI works, standalone or NgModule based.</p>
            <ul class="leading-relaxed">
                <li>Angular v21 or newer, including <i>&#64;angular/cdk</i>, <i>&#64;angular/forms</i> and <i>&#64;angular/router</i></li>
                <li>RxJS v7.8.1 or newer</li>
                <li>A package manager of your choice — npm, yarn or pnpm</li>
            </ul>
            <p>
                Already using PrimeNG? Do not follow this page. The <a href="https://v1.optimus.openng.org/migration/primeng" target="_blank" rel="noopener noreferrer" class="doc-link">migration guide</a> covers moving an existing PrimeNG v21
                workspace across with the <i>migrate-from-primeng</i> schematic, which is a separate command from the <i>ng add</i> below.
            </p>
        </app-docsectiontext>
    `
})
export class PrerequisitesDoc {}
