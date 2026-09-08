import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';

@Component({
    selector: 'update-ng-update-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Run <i>ng update</i> without arguments at any time to list the updates available in your workspace, Optimus UI included.</p>
            <app-code [code]="checkCode" [hideToggleCode]="true"></app-code>
            <p>
                To update within the current major, pass the main package. The Angular CLI resolves the rest: <i>&#64;openng/optimus-ui</i> declares all its companion packages as a group, so every installed <i>&#64;openng/optimus-ui-*</i> package —
                themes, locale, Tailwind CSS plugin and the internal runtime packages — is updated together and the suite cannot end up on mixed versions.
            </p>
            <app-code [code]="updateCode" [hideToggleCode]="true"></app-code>
            <p>Like any <i>ng update</i> run, the command expects a clean git working tree so its changes can be reviewed or reverted in isolation — commit or stash your work first.</p>
        </app-docsectiontext>
    `
})
export class NgUpdateDoc {
    checkCode: Code = {
        command: `ng update`
    };

    updateCode: Code = {
        command: `ng update @openng/optimus-ui`
    };
}
