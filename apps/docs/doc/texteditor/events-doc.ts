import { Component, signal, viewChild } from '@angular/core';
import { TextEditorModule, TextEditorRoot } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarUI } from '@/components/texteditor';

@Component({
    selector: 'events-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Beyond <i>[(value)]</i>, the root emits granular lifecycle events - <i>editorCreate</i>, <i>editorFocus</i>, <i>editorBlur</i> and <i>selectionUpdate</i>, which covers caret movement without an edit - and exposes the document in
                several formats: <i>getHTML()</i>, <i>getJSON()</i>, <i>getText()</i>, <i>getMarkdown()</i> and <i>getBlocks()</i>.
            </p>
            <p>All of them are safe to call before the editor has mounted; they return an empty document rather than throwing.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-3 md:flex-row">
            <div class="flex-1">
                <p-text-editor-root #editor [(value)]="value" ariaLabel="Events example" (editorCreate)="push('create')" (selectionUpdate)="push('selection-update')" (editorFocus)="push('focus')" (editorBlur)="push('blur')">
                    <p-text-editor-toolbar>
                        <toolbar-ui />
                    </p-text-editor-toolbar>
                    <p-text-editor-content height="14rem" />
                </p-text-editor-root>
                <button type="button" class="p-text-editor-ui-menu-item mt-2" (click)="markdown.set(editor.getMarkdown())">Get Markdown</button>
                @if (markdown()) {
                    <pre class="mt-2 p-2 text-xs rounded overflow-auto bg-surface-100 dark:bg-surface-800">{{ markdown() }}</pre>
                }
            </div>
            <div class="md:w-56">
                <div class="text-sm font-semibold mb-1 text-muted-color">Event log</div>
                <ul class="text-xs font-mono flex flex-col gap-0.5">
                    @for (entry of log(); track $index) {
                        <li class="text-muted-color">{{ entry }}</li>
                    }
                    @if (!log().length) {
                        <li class="text-muted-color italic">interact with the editor...</li>
                    }
                </ul>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class EventsDoc {
    readonly editor = viewChild<TextEditorRoot>('editor');

    readonly value = signal<string | undefined>('<h2>Events &amp; Output</h2><p>Type, move the caret, focus and blur - the log on the right reacts. Click <strong>Get Markdown</strong> to serialize.</p>');

    readonly log = signal<string[]>([]);

    readonly markdown = signal('');

    push(event: string): void {
        this.log.update((entries) => [event, ...entries].slice(0, 8));
    }
}
