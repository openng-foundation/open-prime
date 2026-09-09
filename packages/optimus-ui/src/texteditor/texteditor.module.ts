import { NgModule } from '@angular/core';
import { TextEditorRoot } from './texteditor';
import { TextEditorBlockControls, TextEditorBlockMenu, TextEditorBlockSubmenu } from './texteditor-block';
import { TextEditorContent } from './texteditor-content';
import {
    TextEditorBlockControlsDef,
    TextEditorBlockMenuDef,
    TextEditorBlockSubmenuDef,
    TextEditorContextToolbarDef,
    TextEditorContextToolbarMoreDef,
    TextEditorDocumentUploadDef,
    TextEditorDocumentUploadDropzoneDef,
    TextEditorDocumentUploadProgressDef,
    TextEditorImageUploadDef,
    TextEditorImageUploadDropzoneDef,
    TextEditorImageUploadProgressDef,
    TextEditorMentionMenuDef,
    TextEditorNavigatorMenuDef,
    TextEditorNavigatorTriggerDef,
    TextEditorRootDef,
    TextEditorSlashMenuDef,
    TextEditorTableCellMenuDef,
    TextEditorTableCellSubmenuDef,
    TextEditorTableColumnMenuDef,
    TextEditorTableColumnSubmenuDef,
    TextEditorTableControlsDef,
    TextEditorTableRowMenuDef,
    TextEditorTableRowSubmenuDef,
    TextEditorToolbarDef
} from './texteditor-defs';
import { TextEditorMentionMenu, TextEditorSlashMenu } from './texteditor-menus';
import { TextEditorNavigator, TextEditorNavigatorMenu, TextEditorNavigatorTrigger } from './texteditor-navigator';
import { TextEditorTableCellMenu, TextEditorTableCellSubmenu, TextEditorTableColumnMenu, TextEditorTableColumnSubmenu, TextEditorTableControls, TextEditorTableRowMenu, TextEditorTableRowSubmenu } from './texteditor-table';
import { TextEditorContextToolbar, TextEditorContextToolbarMore, TextEditorToolbar } from './texteditor-toolbar';
import { TextEditorDocumentUpload, TextEditorDocumentUploadDropzone, TextEditorDocumentUploadProgress, TextEditorImageUpload, TextEditorImageUploadDropzone, TextEditorImageUploadProgress } from './texteditor-upload';

const parts = [
    TextEditorRoot,
    TextEditorToolbar,
    TextEditorContent,
    TextEditorContextToolbar,
    TextEditorContextToolbarMore,
    TextEditorBlockControls,
    TextEditorBlockMenu,
    TextEditorBlockSubmenu,
    TextEditorSlashMenu,
    TextEditorMentionMenu,
    TextEditorImageUpload,
    TextEditorImageUploadDropzone,
    TextEditorImageUploadProgress,
    TextEditorDocumentUpload,
    TextEditorDocumentUploadDropzone,
    TextEditorDocumentUploadProgress,
    TextEditorTableControls,
    TextEditorTableColumnMenu,
    TextEditorTableColumnSubmenu,
    TextEditorTableRowMenu,
    TextEditorTableRowSubmenu,
    TextEditorTableCellMenu,
    TextEditorTableCellSubmenu,
    TextEditorNavigator,
    TextEditorNavigatorTrigger,
    TextEditorNavigatorMenu
];

const defs = [
    TextEditorRootDef,
    TextEditorToolbarDef,
    TextEditorContextToolbarDef,
    TextEditorContextToolbarMoreDef,
    TextEditorBlockControlsDef,
    TextEditorBlockMenuDef,
    TextEditorBlockSubmenuDef,
    TextEditorSlashMenuDef,
    TextEditorMentionMenuDef,
    TextEditorImageUploadDef,
    TextEditorImageUploadDropzoneDef,
    TextEditorImageUploadProgressDef,
    TextEditorDocumentUploadDef,
    TextEditorDocumentUploadDropzoneDef,
    TextEditorDocumentUploadProgressDef,
    TextEditorTableControlsDef,
    TextEditorTableColumnMenuDef,
    TextEditorTableColumnSubmenuDef,
    TextEditorTableRowMenuDef,
    TextEditorTableRowSubmenuDef,
    TextEditorTableCellMenuDef,
    TextEditorTableCellSubmenuDef,
    TextEditorNavigatorTriggerDef,
    TextEditorNavigatorMenuDef
];

/**
 * Every part and every slot template in one import, for applications that would rather not list
 * each standalone component. Importing the parts individually keeps the bundle leaner; see the
 * tree-shaking notes in the docs.
 *
 * @group Components
 */
@NgModule({
    imports: [...parts, ...defs],
    exports: [...parts, ...defs]
})
export class TextEditorModule {}
