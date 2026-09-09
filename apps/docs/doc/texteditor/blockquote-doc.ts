import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBlockquoteUI } from '@/components/texteditor';

@Component({
    selector: 'blockquote-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarBlockquoteUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.blockquote()</i> wraps the current block in a quote and unwraps it when it is already quoted, with <i>state.blockquote</i> as its pressed state. Inside a list the item is lifted out first, because a list item has to start
                with a paragraph.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Blockquote example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <blockquote-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BlockquoteDoc {
    readonly value = signal<string | undefined>(undefined);
}
