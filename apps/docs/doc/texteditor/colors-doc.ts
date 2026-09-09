import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarForegroundColorUI, ToolbarBackgroundColorUI } from '@/components/texteditor';

@Component({
    selector: 'colors-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarForegroundColorUI, ToolbarBackgroundColorUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.foregroundColor(color)</i> and <i>commands.backgroundColor(color)</i> set the text and highlight colours, and <i>state.foregroundColor</i> and <i>state.backgroundColor</i> carry the current values, or <i>null</i> when the
                selection mixes several. <i>state.highlight</i> is true whenever any highlight is applied.
            </p>
            <p>Both round-trip through HTML, and the values are validated on the way in and on the way out: a pasted span cannot smuggle a <i>url(...)</i> into the document.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Colors example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <foreground-color-ui />
                        <background-color-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ColorsDoc {
    readonly value = signal<string | undefined>(undefined);
}
