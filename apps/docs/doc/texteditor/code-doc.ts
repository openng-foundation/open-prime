import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarCodeUI } from '@/components/texteditor';

@Component({
    selector: 'code-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarCodeUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.code()</i> toggles inline code on the current selection, with <i>state.code</i> as its pressed state. The mark excludes every other inline format, so code spans stay literal.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Inline code example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <code-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class CodeDoc {
    readonly value = signal<string | undefined>(undefined);
}
