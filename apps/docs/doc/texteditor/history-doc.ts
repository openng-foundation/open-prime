import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ToolbarRedoUI, ToolbarUndoUI } from '@/components/texteditor';

@Component({
    selector: 'history-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarUndoUI, ToolbarRedoUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                History is on by default. <i>commands.undo()</i> and <i>commands.redo()</i> step through it, and <i>state.canUndo</i> and <i>state.canRedo</i> say whether a step is available, which is what a toolbar binds its disabled state to.
                <i>Ctrl/Cmd + Z</i> and <i>Ctrl/Cmd + Shift + Z</i> (or <i>Ctrl + Y</i>) work without any wiring.
            </p>
            <p>Values written in from the outside are applied without adding a history entry, so an external update cannot be undone into a state the application never had.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="History example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <undo-ui />
                        <redo-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-content height="12rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class HistoryDoc {
    readonly value = signal<string | undefined>(undefined);
}
