import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarFontFamilyUI, ToolbarFontSizeUI } from '@/components/texteditor';

@Component({
    selector: 'font-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarFontFamilyUI, ToolbarFontSizeUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.fontFamily(family)</i> and <i>commands.fontSize(size)</i> set the typeface and the size of the selection, with <i>state.fontFamily</i> and <i>state.fontSize</i> reporting what is in force. All four values live on one
                merged text style, so setting a size does not clear a colour set a moment earlier.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Font example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <font-family-ui />
                        <font-size-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class FontDoc {
    readonly value = signal<string | undefined>(undefined);
}
