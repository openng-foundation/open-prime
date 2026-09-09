import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarItalicUI } from '@/components/texteditor';

@Component({
    selector: 'italic-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarItalicUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.italic()</i> toggles italic on the current selection, with <i>state.italic</i> as its pressed state and <i>Ctrl/Cmd + I</i> as its shortcut.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Italic example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <italic-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ItalicDoc {
    readonly value = signal<string | undefined>(undefined);
}
