import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/texteditor';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-text-editor p-component',
        {
            'p-text-editor-disabled': instance.$disabled(),
            'p-text-editor-readonly': instance.readonly(),
            'p-text-editor-block-mode': instance.mode() === 'block'
        }
    ]
};

@Injectable()
export class TextEditorStyle extends BaseStyle {
    name = 'texteditor';

    style = style;

    classes = classes;
}

/**
 *
 * TextEditor is a ProseMirror-based rich text editor with a classic toolbar, Notion-style blocks,
 * markdown input rules and a fully template-driven UI.
 *
 * [Live Demo](https://optimus.openng.org/texteditor/)
 *
 * @module texteditorstyle
 *
 */
export enum TextEditorClasses {
    /** Class name of the root element */
    root = 'p-text-editor',
    /** Class name of the toolbar element */
    toolbar = 'p-text-editor-toolbar',
    /** Class name of the body element */
    body = 'p-text-editor-body',
    /** Class name of the content element */
    content = 'p-text-editor-content',
    /** Class name of a block in block mode */
    block = 'p-text-editor-block',
    /** Class name of a block's content in block mode */
    blockContent = 'p-text-editor-block-content',
    /** Class name of the block controls element */
    blockControls = 'p-text-editor-block-controls',
    /** Class name of the block drop indicator element */
    blockDropIndicator = 'p-text-editor-block-drop-indicator',
    /** Class name of a block placeholder element */
    blockPlaceholder = 'p-text-editor-block-placeholder',
    /** Class name of the navigator element */
    navigator = 'p-text-editor-navigator',
    /** Class name of a navigator bar element */
    navigatorBar = 'p-text-editor-navigator-bar',
    /** Class name of the navigator popover element */
    navigatorPopover = 'p-text-editor-navigator-popover',
    /** Class name of the context toolbar element */
    contextToolbar = 'p-text-editor-context-toolbar',
    /** Class name of a popover menu element */
    popoverMenu = 'p-text-editor-popover-menu',
    /** Class name of a popover submenu element */
    popoverSubmenu = 'p-text-editor-popover-submenu',
    /** Class name of the placeholder element */
    placeholder = 'p-text-editor-placeholder',
    /** Class name of the table selection outline element */
    tableSelectionOutline = 'p-text-editor-table-selection-outline',
    /** Class name of a table trigger element */
    tableTrigger = 'p-text-editor-table-trigger',
    /** Class name of the table cell trigger element */
    tableTriggerCell = 'p-text-editor-table-trigger-cell',
    /** Class name of the table column trigger element */
    tableTriggerCol = 'p-text-editor-table-trigger-col',
    /** Class name of the table row trigger element */
    tableTriggerRow = 'p-text-editor-table-trigger-row',
    /** Class name of a table add button element */
    tableAdd = 'p-text-editor-table-add',
    /** Class name of the add column button element */
    tableAddCol = 'p-text-editor-table-add-col',
    /** Class name of the add row button element */
    tableAddRow = 'p-text-editor-table-add-row',
    /** Class name of the mention typing decoration */
    mentionTyping = 'p-text-editor-mention-typing',
    /** Class name of a mention chip */
    mention = 'p-text-editor-mention',
    /** Class name of the slash typing decoration */
    slashTyping = 'p-text-editor-slash-typing',
    /** Class name of the preserved selection decoration */
    selection = 'p-text-editor-selection',
    /** Class name of the image upload placeholder element */
    imageUploadPlaceholder = 'p-text-editor-image-upload-placeholder',
    /** Class name of the document upload placeholder element */
    documentUploadPlaceholder = 'p-text-editor-document-upload-placeholder',
    /** Class name of an upload overlay element */
    upload = 'p-text-editor-upload',
    /** Class name of an upload dropzone element */
    uploadDropzone = 'p-text-editor-upload-dropzone',
    /** Class name of an upload progress element */
    uploadProgress = 'p-text-editor-upload-progress',
    /** Class name of the hidden native file input element */
    fileInput = 'p-text-editor-file-input'
}

export interface TextEditorStyle extends BaseStyle {}
