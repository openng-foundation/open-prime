import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUnderlineUI } from '@/components/texteditor';

@Component({
    selector: 'underline-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUnderlineUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.underline()</i> toggles underline on the current selection, with <i>state.underline</i> as its pressed state and <i>Ctrl/Cmd + U</i> as its shortcut.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Underline example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <underline-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class UnderlineDoc {
    readonly value = signal<string | undefined>(undefined);
}
