import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';

@Component({
    selector: 'controlled-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>value</i> is a model, so both <i>[(value)]</i> and <i>[value]</i> are legal, and which one is written decides who owns the document. Two-way is the default shape: the value the editor emits is the serialized document, an HTML
                string in classic mode and a <i>string[]</i> in block mode. Writing back the value the editor just emitted is ignored, so the round trip does not loop.
            </p>
            <p>For a large document, debounce the emit with <i>valueChangeDebounce</i> rather than throttling the signal. A one-way <i>[value]</i> seeds the document once and leaves the editor to own it from there.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3 md:flex-row">
            <div class="flex-1">
                <p-text-editor-root [(value)]="value" [valueChangeDebounce]="200" ariaLabel="Controlled editor">
                    <p-text-editor-toolbar>
                        <toolbar-ui />
                    </p-text-editor-toolbar>
                    <p-text-editor-content height="14rem" />
                </p-text-editor-root>
            </div>
            <div class="md:w-72">
                <div class="text-sm font-semibold mb-1 text-muted-color">Bound value</div>
                <pre class="p-2 text-xs rounded overflow-auto max-h-56 bg-surface-100 dark:bg-surface-800">{{ value() }}</pre>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class ControlledDoc {
    readonly value = signal<string | undefined>('<p>Type here and watch the bound value.</p>');
}
