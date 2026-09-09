import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarTextAlignUI } from '@/components/texteditor';

@Component({
    selector: 'text-align-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarTextAlignUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.textAlign(alignment)</i> sets the alignment of every block the selection touches - <i>left</i>, <i>center</i>, <i>right</i> or <i>justify</i> - and setting the one already in force clears it. <i>state.textAlign</i> carries
                the active value, or <i>null</i> when the selection mixes several.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Text align example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <text-align-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class TextAlignDoc {
    readonly value = signal<string | undefined>(undefined);
}
