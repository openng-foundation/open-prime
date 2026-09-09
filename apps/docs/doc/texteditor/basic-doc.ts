import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';
import { DEMO_HTML } from './demo-data';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                TextEditor is a compound component: <i>p-text-editor-root</i> owns the document, the commands and the state, and every visible surface is a part the application fills with its own widgets. A minimal editor is the root, a toolbar and
                the content region.
            </p>
            <p>The editor ships no toolbar of its own. <i>toolbar-ui</i> below is an application widget that reads <i>commands</i> and <i>state</i> from the editor context; the docs keep its source next to these demos.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Article body example">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-content height="20rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    readonly value = signal<string | undefined>(DEMO_HTML);
}
