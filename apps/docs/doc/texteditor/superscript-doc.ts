import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarSuperscriptUI } from '@/components/texteditor';

@Component({
    selector: 'superscript-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarSuperscriptUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.superscript()</i> toggles superscript on the current selection, with <i>state.superscript</i> as its pressed state.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Superscript example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <superscript-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class SuperscriptDoc {
    readonly value = signal<string | undefined>(undefined);
}
