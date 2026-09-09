import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ContextToolbarMoreUI, ContextToolbarUI, ToolbarUI } from '@/components/texteditor';

@Component({
    selector: 'context-toolbar-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, ContextToolbarUI, ContextToolbarMoreUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-text-editor-context-toolbar</i> is a floating toolbar anchored to the selection. It opens when text is selected and closes on the first document edit, so it never hovers over text the user is still changing. Add
                <i>p-text-editor-context-toolbar-more</i> for an overflow panel.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Article body example">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-context-toolbar>
                    <context-toolbar-ui />
                    <p-text-editor-context-toolbar-more>
                        <context-toolbar-more-ui />
                    </p-text-editor-context-toolbar-more>
                </p-text-editor-context-toolbar>
                <p-text-editor-content height="16rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ContextToolbarDoc {
    readonly value = signal<string | undefined>('<p>Double-click on any word or select some text to see the context toolbar appear.</p>');
}
