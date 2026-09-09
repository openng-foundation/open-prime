import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { BlockControlsUI, SlashMenuUI } from '@/components/texteditor';

@Component({
    selector: 'slash-commands-doc',
    standalone: true,
    imports: [TextEditorModule, BlockControlsUI, SlashMenuUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Mounting <i>p-text-editor-slash-menu</i> turns the <i>/</i> trigger on. The palette gets <i>filterText</i>, the caret <i>position</i> and an insertion command set covering headings, lists, quotes, code, dividers, tables and the two
                upload flows.
            </p>
            <p>While it is open the editing region becomes an ARIA combobox pointing at the highlighted option, and the arrow keys, Enter and Escape drive the list without moving the caret out of the document.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="blocks" mode="block" slashPlaceholder="Type to search" ariaLabel="Slash commands example">
                <p-text-editor-block-controls>
                    <block-controls-ui />
                </p-text-editor-block-controls>
                <p-text-editor-slash-menu>
                    <slash-menu-ui />
                </p-text-editor-slash-menu>
                <p-text-editor-content height="16rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class SlashCommandsDoc {
    readonly blocks = signal<string[] | undefined>(['<h2>Block Editor</h2>', '<p>Type / for slash commands.</p>']);
}
