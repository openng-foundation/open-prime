import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { BlockControlsUI, ContextToolbarUI } from '@/components/texteditor';
import { DEMO_BLOCKS } from './demo-data';

@Component({
    selector: 'block-doc',
    standalone: true,
    imports: [TextEditorModule, BlockControlsUI, ContextToolbarUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>mode="block"</i> switches the value to an array of HTML strings, one per block. Each entry renders as its own draggable block: the runtime owns the reordering, the hover bar's position and the drop indicator, and the application
                owns the widgets inside <i>p-text-editor-block-controls</i>.
            </p>
            <p>Block mode pairs naturally with the context toolbar, since there is no static toolbar in the way.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="blocks" mode="block" placeholder="Type something..." ariaLabel="Block editor">
                <p-text-editor-block-controls>
                    <block-controls-ui />
                </p-text-editor-block-controls>
                <p-text-editor-context-toolbar>
                    <context-toolbar-ui />
                </p-text-editor-context-toolbar>
                <p-text-editor-content height="18rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BlockDoc {
    readonly blocks = signal<string[] | undefined>(DEMO_BLOCKS);
}
