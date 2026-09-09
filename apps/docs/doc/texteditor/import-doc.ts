import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'import-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The document model is <a href="https://prosemirror.net" target="_blank" rel="noopener noreferrer">ProseMirror</a>. Its packages are optional peer dependencies, so an application that never mounts the editor does not pay for them, and
                an application that does installs them once.
            </p>
        </app-docsectiontext>
        <app-code [code]="install" [hideToggleCode]="true"></app-code>
        <app-docsectiontext>
            <p class="mt-4"><i>TextEditorModule</i> re-exports every part, so a single entry in <i>imports</i> registers the whole editor.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ImportDoc {
    install: Code = {
        command: `npm install prosemirror-commands prosemirror-dropcursor \\
    prosemirror-gapcursor prosemirror-history \\
    prosemirror-inputrules prosemirror-keymap \\
    prosemirror-model prosemirror-schema-list \\
    prosemirror-state prosemirror-tables \\
    prosemirror-transform prosemirror-view`
    };

    code: Code = {
        typescript: `import { TextEditorModule } from '@openng/optimus-ui/texteditor';`
    };
}
