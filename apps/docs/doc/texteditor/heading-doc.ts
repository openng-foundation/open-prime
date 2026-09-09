import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarHeadingUI } from '@/components/texteditor';

@Component({
    selector: 'heading-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarHeadingUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.heading(level)</i> applies a heading from 1 to 6 and calling it again with the active level converts the block back; <i>commands.paragraph()</i> does the same explicitly. <i>state.heading</i> carries the active level, or
                <i>null</i> outside a heading, which is what a select binds to.
            </p>
            <p><i>Ctrl/Cmd + Shift + 1</i> to <i>6</i> apply the levels from the keyboard, and the headings are what the navigator's outline is built from.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Headings example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <heading-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class HeadingDoc {
    readonly value = signal<string | undefined>(undefined);
}
