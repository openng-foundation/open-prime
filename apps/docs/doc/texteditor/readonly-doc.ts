import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';
import { DEMO_HTML } from './demo-data';

@Component({
    selector: 'readonly-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>disabled</i> blocks editing and greys the UI; <i>readonly</i> blocks editing but keeps the content selectable and copyable. Both reject document-mutating transactions at the source, so a toolbar command cannot bypass them, and both
                surface on the root as <i>data-disabled</i> and <i>data-readonly</i> for styling.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-text-editor-root [value]="value()" readonly ariaLabel="Read-only editor">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-content height="10rem" />
            </p-text-editor-root>
            <p-text-editor-root [value]="value()" disabled ariaLabel="Disabled editor">
                <p-text-editor-toolbar>
                    <toolbar-ui />
                </p-text-editor-toolbar>
                <p-text-editor-content height="10rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ReadonlyDoc {
    readonly value = signal<string | undefined>(DEMO_HTML);
}
