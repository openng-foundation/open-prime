import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarPrintUI } from '@/components/texteditor';

@Component({
    selector: 'print-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarPrintUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.print()</i> hands the editor content to the browser print flow. It is always available, so the button needs no disabled binding. The content is rendered into a sandboxed frame without <i>allow-scripts</i>, and the HTML it
                receives has already been through the sanitizing serializer.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Printable document example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <print-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class PrintDoc {
    readonly value = signal<string | undefined>(undefined);
}
