import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarSubscriptUI } from '@/components/texteditor';

@Component({
    selector: 'subscript-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarSubscriptUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>commands.subscript()</i> toggles subscript on the current selection and <i>state.subscript</i> reflects it. Subscript and superscript exclude each other, so applying one clears the other.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Subscript example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <subscript-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class SubscriptDoc {
    readonly value = signal<string | undefined>(undefined);
}
