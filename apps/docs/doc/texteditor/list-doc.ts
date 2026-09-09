import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarBulletListUI, ToolbarOrderedListUI, ToolbarCheckListUI } from '@/components/texteditor';

@Component({
    selector: 'list-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarBulletListUI, ToolbarOrderedListUI, ToolbarCheckListUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.bulletList()</i>, <i>commands.orderedList()</i> and <i>commands.checkList()</i> toggle the three list types, with <i>state.bulletList</i>, <i>state.orderedList</i> and <i>state.checkList</i> as their pressed states.
                Calling one while another is active converts between them rather than nesting one inside the other.
            </p>
            <p>
                <i>Tab</i> and <i>Shift + Tab</i> nest and unnest an item, and <i>Backspace</i> on an empty item lifts it out of the list. Checklists render a real checkbox and round-trip as <i>data-p-checked</i> on the item;
                <i>checklistPlaceholder</i> sets the text shown in an empty one.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Lists example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <bullet-list-ui />
                        <ordered-list-ui />
                        <check-list-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" placeholder="Type here..." />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class ListDoc {
    readonly value = signal<string | undefined>(undefined);
}
