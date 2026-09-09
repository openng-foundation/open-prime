import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarStrikethroughUI } from '@/components/texteditor';

@Component({
    selector: 'strikethrough-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarStrikethroughUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.strikethrough()</i> toggles strikethrough on the current selection and <i>state.strikethrough</i> reflects it. The mark round-trips as <i>&lt;s&gt;</i>, and <i>&lt;del&gt;</i> and <i>&lt;strike&gt;</i> are read back into
                it.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Strikethrough example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <strikethrough-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class StrikethroughDoc {
    readonly value = signal<string | undefined>(undefined);
}
