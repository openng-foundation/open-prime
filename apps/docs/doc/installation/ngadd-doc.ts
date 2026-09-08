import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component } from '@angular/core';

@Component({
    selector: 'ngadd-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The recommended way to add Optimus UI to an Angular CLI workspace is a single command.</p>
            <app-code [code]="code" [hideToggleCode]="true"></app-code>
            <p>The schematic asks which theme preset you want and then does the rest:</p>
            <ul class="leading-relaxed">
                <li>adds <i>&#64;openng/optimus-ui</i> and <i>&#64;openng/optimus-ui-themes</i> to your dependencies</li>
                <li>wires <i>provideOptimus</i> into your root providers with the chosen preset, in <i>app.config.ts</i> or your root NgModule</li>
                <li>installs the packages</li>
            </ul>
            <p>Pass the preset up front to skip the prompt, or skip the install step if you want to run it yourself:</p>
            <app-code [code]="flagsCode" [hideToggleCode]="true"></app-code>
            <p>
                If the schematic cannot find a providers array to update it prints the three manual steps instead of guessing, so nothing in your workspace is rewritten unexpectedly. If it detects an existing <i>primeng</i> dependency it changes
                nothing and fails with an error rather than reporting success, and points you at the <a href="https://v1.optimus.openng.org/migration/primeng" target="_blank" rel="noopener noreferrer" class="doc-link">migration guide</a>, which
                covers the <i>migrate-from-primeng</i> schematic. It does not run that schematic for you. The Angular CLI installs <i>&#64;openng/optimus-ui</i> before the schematic runs, so the dependency stays in your <i>package.json</i> — the
                migration schematic needs it there.
            </p>
        </app-docsectiontext>
    `
})
export class NgAddDoc {
    code: Code = {
        command: `ng add @openng/optimus-ui`
    };

    flagsCode: Code = {
        command: `# Choose the preset without the prompt — Aura, Lara, Material or Nora
ng add @openng/optimus-ui --theme=Lara

# Wire everything up but do not run the package install
ng add @openng/optimus-ui --skip-install

# Target a specific project in a multi-project workspace
ng add @openng/optimus-ui --project=admin`
    };
}
