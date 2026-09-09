import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarCodeBlockUI } from '@/components/texteditor';

@Component({
    selector: 'code-block-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarCodeBlockUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.codeBlock()</i> turns the current block into a fenced code block and back, with <i>state.codeBlock</i> as its pressed state. Inline marks are stripped inside it, and typing three backticks with markdown enabled does the
                same thing.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Code block example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <code-block-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class CodeBlockDoc {
    readonly value = signal<string | undefined>('<p>Select this line and turn it into a code block.</p>');
}
