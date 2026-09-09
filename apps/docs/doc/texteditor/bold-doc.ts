import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBoldUI } from '@/components/texteditor';

@Component({
    selector: 'bold-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarBoldUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.bold()</i> toggles bold on the current selection and <i>state.bold</i> reflects it, which is what a toolbar button binds its pressed state to. <i>Ctrl/Cmd + B</i> does the same from the keyboard.</p>
            <p>With a collapsed cursor the command sets a stored mark, so the button lights up before anything is typed and the next characters come out bold.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Bold example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <bold-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BoldDoc {
    readonly value = signal<string | undefined>(undefined);
}
