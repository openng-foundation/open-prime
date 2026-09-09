import { Component, signal } from '@angular/core';
import { TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { BlockColorSubmenuUI, BlockControlsUI, BlockMenuUI, BlockTurnIntoSubmenuUI } from '@/components/texteditor';

@Component({
    selector: 'block-menu-doc',
    standalone: true,
    imports: [TextEditorModule, BlockControlsUI, BlockMenuUI, BlockTurnIntoSubmenuUI, BlockColorSubmenuUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-text-editor-block-menu</i> attaches per-block actions to the drag handle: duplicate, copy, turn into and delete. Pair it with <i>p-text-editor-block-submenu</i> for the nested panels; both halves share one <i>submenu</i>
                controller through the parent context, so opening a key in the menu drives the sibling panel open.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="blocks" mode="block" placeholder="Type something..." ariaLabel="Block menu example">
                <p-text-editor-block-controls>
                    <block-controls-ui />
                </p-text-editor-block-controls>
                <p-text-editor-block-menu>
                    <block-menu-ui />
                    <p-text-editor-block-submenu>
                        <ng-template pTextEditorBlockSubmenuDef let-activeSubmenu="activeSubmenu">
                            @if (activeSubmenu === 'turnInto') {
                                <block-turn-into-submenu-ui />
                            }
                            @if (activeSubmenu === 'color') {
                                <block-color-submenu-ui />
                            }
                        </ng-template>
                    </p-text-editor-block-submenu>
                </p-text-editor-block-menu>
                <p-text-editor-content height="16rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BlockMenuDoc {
    readonly blocks = signal<string[] | undefined>(['<h2>Welcome to the Block Editor</h2>', '<p>Click the drag handle to display the menu.</p>']);
}
