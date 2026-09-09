import { Component, signal } from '@angular/core';
import { TEXT_EDITOR_FILE_SIZE, TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { TextEditorUIModule } from '@/components/texteditor';
import { MENTION_USERS, demoUploadHandler } from './demo-data';

@Component({
    selector: 'block-complete-doc',
    standalone: true,
    imports: [TextEditorModule, TextEditorUIModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Every block-mode part wired into a single editor: the hover bar, the block menu and its submenu, the slash palette, the context toolbar, mentions, tables and both upload overlays.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="blocks" mode="block" markdown placeholder="Type / for commands" slashPlaceholder="Type to search" checklistPlaceholder="To-Do" ariaLabel="Complete block editor">
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
                <p-text-editor-slash-menu>
                    <slash-menu-ui />
                </p-text-editor-slash-menu>
                <p-text-editor-context-toolbar>
                    <context-toolbar-ui />
                    <p-text-editor-context-toolbar-more>
                        <context-toolbar-more-ui />
                    </p-text-editor-context-toolbar-more>
                </p-text-editor-context-toolbar>
                <p-text-editor-mention-menu [handler]="mentionHandler" filterField="name" [template]="mentionTemplate">
                    <mention-list-ui />
                </p-text-editor-mention-menu>
                <p-text-editor-image-upload [handler]="uploadHandler" [maxFileSize]="oneMB">
                    <p-text-editor-image-upload-dropzone>
                        <image-upload-dropzone-ui />
                    </p-text-editor-image-upload-dropzone>
                    <p-text-editor-image-upload-progress>
                        <upload-progress-ui />
                    </p-text-editor-image-upload-progress>
                </p-text-editor-image-upload>
                <p-text-editor-document-upload [handler]="uploadHandler" [maxFileSize]="tenMB">
                    <p-text-editor-document-upload-dropzone>
                        <document-upload-dropzone-ui />
                    </p-text-editor-document-upload-dropzone>
                    <p-text-editor-document-upload-progress>
                        <upload-progress-ui />
                    </p-text-editor-document-upload-progress>
                </p-text-editor-document-upload>
                <p-text-editor-table-column-menu>
                    <table-column-options-ui />
                    <p-text-editor-table-column-submenu>
                        <table-column-options-submenu-ui />
                    </p-text-editor-table-column-submenu>
                </p-text-editor-table-column-menu>
                <p-text-editor-table-row-menu>
                    <table-row-options-ui />
                    <p-text-editor-table-row-submenu>
                        <table-row-options-submenu-ui />
                    </p-text-editor-table-row-submenu>
                </p-text-editor-table-row-menu>
                <p-text-editor-table-cell-menu>
                    <table-cell-options-ui />
                    <p-text-editor-table-cell-submenu>
                        <table-cell-options-submenu-ui />
                    </p-text-editor-table-cell-submenu>
                </p-text-editor-table-cell-menu>
                <p-text-editor-content height="24rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class BlockCompleteDoc {
    readonly blocks = signal<string[] | undefined>(['<h2>Welcome</h2>', '<p>Start editing to explore the features. Type <code>/</code> for slash commands.</p>']);

    readonly oneMB = TEXT_EDITOR_FILE_SIZE.ONE_MB;

    readonly tenMB = TEXT_EDITOR_FILE_SIZE.TEN_MB;

    readonly uploadHandler = demoUploadHandler;

    readonly mentionHandler = () => MENTION_USERS;

    readonly mentionTemplate = (data: (typeof MENTION_USERS)[number]) => `@${data.name}`;
}
