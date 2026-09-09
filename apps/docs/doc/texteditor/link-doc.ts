import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarLinkUI } from '@/components/texteditor';

@Component({
    selector: 'link-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarLinkUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.insertLink(url, text?)</i> wraps the selection, or inserts <i>text</i> when the cursor is collapsed. <i>commands.updateLink(url)</i> changes the href around the cursor and <i>commands.removeLink()</i> unwraps it - both
                find the link boundaries themselves, so the selection does not have to cover the whole link.
            </p>
            <p><i>state.link</i> says whether the cursor sits inside a link and <i>state.linkUrl</i> carries its href. Unsafe schemes are rejected on the way in: an unsafe href drops the link and keeps the text.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Links example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <link-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class LinkDoc {
    readonly value = signal<string | undefined>(undefined);
}
