import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';

@Component({
    selector: 'markdown-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Markdown is a feature, not a mode: <i>markdown</i> works in both classic and block editors. Type <i>#</i> for a heading, <i>**text**</i> for bold, <i>*text*</i> for italic, <i>-</i> for a bullet, <i>1.</i> for an ordered item,
                <i>[ ]</i> for a checklist, <i>&gt;</i> for a quote, <i>&#96;code&#96;</i> for inline code, three backticks for a code block and <i>---</i> for a rule.
            </p>
            <p>The rules are added and removed live, so flipping the input mid-session does not rebuild the editor or lose the undo history.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" markdown ariaLabel="Markdown editor">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-content height="16rem" placeholder="Type # for a heading..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class MarkdownDoc {
    readonly value = signal<string | undefined>(undefined);
}
