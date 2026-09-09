import { Directive, TemplateRef, inject } from '@angular/core';
import type {
    CaretPosition,
    TableOverlayRect,
    TextEditorBlockMenuCommands,
    TextEditorCommands,
    TextEditorFormatState,
    TextEditorHeadingEntry,
    TextEditorMentionCommands,
    TextEditorPluginCommands,
    TextEditorSlashMenuCommands,
    TextEditorSubmenu,
    TextEditorTableCellCommands,
    TextEditorTableColumnCommands,
    TextEditorTableControlsCommands,
    TextEditorTableRowCommands,
    TextEditorValue,
    UploadSlotEntry
} from '@openng/optimus-ui/types/texteditor';

/**
 * Every slot template is handed the whole surface as `$implicit` as well as one variable per field,
 * so both binding styles work: `let-commands="commands"` names what it needs, and
 * `*pTextEditorToolbarDef="let ctx"` takes the object.
 */
export type SlotContext<T> = T & {
    /**
     * The whole slot surface, for the `let ctx` binding style.
     */
    $implicit: T;
};

/**
 * Slot props of `p-text-editor-root`.
 *
 * @group Interface
 */
export interface TextEditorRootSlotProps {
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * The imperative command surface.
     */
    commands: TextEditorCommands;
    /**
     * Commands contributed by plugins, namespaced by plugin name.
     */
    pluginCommands: TextEditorPluginCommands;
    /**
     * The document's heading outline.
     */
    headings: TextEditorHeadingEntry[];
    /**
     * The bound value.
     */
    value: TextEditorValue | undefined;
    /**
     * Whether editing is disabled.
     */
    disabled: boolean;
    /**
     * Whether the editor is read-only.
     */
    readonly: boolean;
    /**
     * Serializes the document to HTML.
     */
    getHTML: () => string;
    /**
     * The document as loss-less JSON.
     */
    getJSON: () => unknown;
    /**
     * The document as one HTML string per block.
     */
    getBlocks: () => string[];
    /**
     * Plain-text projection of the document.
     */
    getText: () => string;
    /**
     * Markdown projection of the document.
     */
    getMarkdown: () => string;
    /**
     * Replaces the document with the given value.
     */
    setValue: (value: TextEditorValue) => void;
}

/**
 * Slot props of `p-text-editor-toolbar`.
 *
 * @group Interface
 */
export interface TextEditorToolbarSlotProps {
    /**
     * The imperative command surface.
     */
    commands: TextEditorCommands;
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * Commands contributed by plugins, namespaced by plugin name.
     */
    plugins: TextEditorPluginCommands;
    /**
     * The same map under the name the prose uses.
     */
    pluginCommands: TextEditorPluginCommands;
}

/**
 * Slot props of `p-text-editor-context-toolbar`.
 *
 * @group Interface
 */
export interface TextEditorContextToolbarSlotProps extends TextEditorToolbarSlotProps {
    /**
     * Whether the overflow panel is open.
     */
    moreActive: boolean;
    /**
     * Opens or closes the overflow panel.
     */
    toggleMore: (event?: Event) => void;
    /**
     * Closes the toolbar.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-context-toolbar-more`.
 *
 * @group Interface
 */
export interface TextEditorContextToolbarMoreSlotProps {
    /**
     * The imperative command surface.
     */
    commands: TextEditorCommands;
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * Closes the overflow panel.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-block-controls`.
 *
 * @group Interface
 */
export interface TextEditorBlockControlsSlotProps {
    /**
     * Index of the hovered block.
     */
    index: number;
    /**
     * Type of the hovered block.
     */
    blockType: string;
    /**
     * Inserts an empty block after the given index.
     */
    addBlock: (index: number) => void;
    /**
     * Starts a block drag.
     */
    onDragStart: (index: number, event: DragEvent) => void;
    /**
     * Ends a block drag.
     */
    onDragEnd: () => void;
    /**
     * Opens the block menu from the drag handle.
     */
    onDragHandleClick: (index: number, event: MouseEvent) => void;
}

/**
 * Slot props of `p-text-editor-block-menu`.
 *
 * @group Interface
 */
export interface TextEditorBlockMenuSlotProps {
    /**
     * Index of the block the menu was opened from.
     */
    blockIndex: number;
    /**
     * Type of that block.
     */
    blockType: string;
    /**
     * The block command set.
     */
    commands: TextEditorBlockMenuCommands;
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * The submenu controller shared by the menu and its submenu.
     */
    submenu: TextEditorSubmenu;
    /**
     * Closes the menu.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-block-submenu`.
 *
 * @group Interface
 */
export interface TextEditorBlockSubmenuSlotProps {
    /**
     * Name of the open submenu, or null.
     */
    activeSubmenu: string | null;
    /**
     * The block command set.
     */
    commands: TextEditorBlockMenuCommands;
    /**
     * Type of the block the menu was opened from.
     */
    blockType: string;
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * Closes the menu.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-slash-menu`.
 *
 * @group Interface
 */
export interface TextEditorSlashMenuSlotProps {
    /**
     * The insertion command set.
     */
    commands: TextEditorSlashMenuCommands;
    /**
     * The formatting snapshot at the current selection.
     */
    state: TextEditorFormatState;
    /**
     * Text typed after the `/`.
     */
    filterText: string;
    /**
     * Caret the palette anchors to.
     */
    position: CaretPosition | null;
    /**
     * Closes the palette.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-mention-menu`.
 *
 * @group Interface
 */
export interface TextEditorMentionMenuSlotProps<TItem = unknown> {
    /**
     * Candidates resolved for the current query.
     */
    items: TItem[];
    /**
     * The mention command set.
     */
    commands: TextEditorMentionCommands<TItem>;
    /**
     * Text typed after the `@`.
     */
    filterText: string;
    /**
     * Caret the popover anchors to.
     */
    position: CaretPosition | null;
    /**
     * Closes the popover.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-table-controls`.
 *
 * @group Interface
 */
export interface TextEditorTableControlsSlotProps {
    /**
     * Geometry of the active table, or null.
     */
    position: TableOverlayRect | null;
    /**
     * The add-row and add-column commands.
     */
    commands: TextEditorTableControlsCommands;
}

/**
 * Slot props of `p-text-editor-table-column-menu`.
 *
 * @group Interface
 */
export interface TextEditorTableColumnMenuSlotProps {
    /**
     * Index of the column the menu was opened from.
     */
    colIndex: number;
    /**
     * Number of columns in the table.
     */
    colCount: number;
    /**
     * The column command set.
     */
    commands: TextEditorTableColumnCommands;
    /**
     * The submenu controller shared by the menu and its submenu.
     */
    submenu: TextEditorSubmenu;
    /**
     * Closes the menu.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-table-column-submenu`.
 *
 * @group Interface
 */
export interface TextEditorTableColumnSubmenuSlotProps extends Omit<TextEditorTableColumnMenuSlotProps, 'submenu'> {
    /**
     * Name of the open submenu, or null.
     */
    activeSubmenu: string | null;
}

/**
 * Slot props of `p-text-editor-table-row-menu`.
 *
 * @group Interface
 */
export interface TextEditorTableRowMenuSlotProps {
    /**
     * Index of the row the menu was opened from.
     */
    rowIndex: number;
    /**
     * Number of rows in the table.
     */
    rowCount: number;
    /**
     * The row command set.
     */
    commands: TextEditorTableRowCommands;
    /**
     * The submenu controller shared by the menu and its submenu.
     */
    submenu: TextEditorSubmenu;
    /**
     * Closes the menu.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-table-row-submenu`.
 *
 * @group Interface
 */
export interface TextEditorTableRowSubmenuSlotProps extends Omit<TextEditorTableRowMenuSlotProps, 'submenu'> {
    /**
     * Name of the open submenu, or null.
     */
    activeSubmenu: string | null;
}

/**
 * Slot props of `p-text-editor-table-cell-menu`.
 *
 * @group Interface
 */
export interface TextEditorTableCellMenuSlotProps {
    /**
     * Whether more than one cell is selected.
     */
    isMultiCellSelected: boolean;
    /**
     * Whether the active cell is merged.
     */
    isCellMerged: boolean;
    /**
     * The cell command set.
     */
    commands: TextEditorTableCellCommands;
    /**
     * The submenu controller shared by the menu and its submenu.
     */
    submenu: TextEditorSubmenu;
    /**
     * Closes the menu.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-table-cell-submenu`.
 *
 * @group Interface
 */
export interface TextEditorTableCellSubmenuSlotProps extends Omit<TextEditorTableCellMenuSlotProps, 'submenu'> {
    /**
     * Name of the open submenu, or null.
     */
    activeSubmenu: string | null;
}

/**
 * Slot props of the upload overlays.
 *
 * @group Interface
 */
export interface TextEditorUploadSlotProps {
    /**
     * Opens the file picker.
     */
    selectFiles: () => void;
    /**
     * The files currently in flight.
     */
    uploads: UploadSlotEntry[];
    /**
     * Accepts files dropped on the dropzone.
     */
    onDrop: (event: DragEvent) => void;
    /**
     * Cancels the uploads in flight and closes the overlay.
     */
    dismiss: () => void;
}

/**
 * Slot props of the upload dropzones.
 *
 * @group Interface
 */
export interface TextEditorUploadDropzoneSlotProps {
    /**
     * Opens the file picker.
     */
    selectFiles: () => void;
    /**
     * Accepts files dropped on the dropzone.
     */
    onDrop: (event: DragEvent) => void;
}

/**
 * Slot props of the upload progress surfaces.
 *
 * @group Interface
 */
export interface TextEditorUploadProgressSlotProps {
    /**
     * The files currently in flight.
     */
    uploads: UploadSlotEntry[];
    /**
     * Cancels the uploads in flight and closes the overlay.
     */
    dismiss: () => void;
}

/**
 * Slot props of `p-text-editor-navigator-trigger`.
 *
 * @group Interface
 */
export interface TextEditorNavigatorTriggerSlotProps {
    /**
     * The document's heading outline.
     */
    headings: TextEditorHeadingEntry[];
    /**
     * Index of the heading currently in view.
     */
    activeIndex: number;
}

/**
 * Slot props of `p-text-editor-navigator-menu`.
 *
 * @group Interface
 */
export interface TextEditorNavigatorMenuSlotProps extends TextEditorNavigatorTriggerSlotProps {
    /**
     * Scrolls the heading at the given position into view.
     */
    scrollTo: (pos: number) => void;
}

/** Slot template of `p-text-editor-root`. @group Components */
@Directive({ selector: '[pTextEditorRootDef]', standalone: true })
export class TextEditorRootDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorRootSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorRootDef, context: unknown): context is SlotContext<TextEditorRootSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-toolbar`. @group Components */
@Directive({ selector: '[pTextEditorToolbarDef]', standalone: true })
export class TextEditorToolbarDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorToolbarSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorToolbarDef, context: unknown): context is SlotContext<TextEditorToolbarSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-context-toolbar`. @group Components */
@Directive({ selector: '[pTextEditorContextToolbarDef]', standalone: true })
export class TextEditorContextToolbarDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorContextToolbarSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorContextToolbarDef, context: unknown): context is SlotContext<TextEditorContextToolbarSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-context-toolbar-more`. @group Components */
@Directive({ selector: '[pTextEditorContextToolbarMoreDef]', standalone: true })
export class TextEditorContextToolbarMoreDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorContextToolbarMoreSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorContextToolbarMoreDef, context: unknown): context is SlotContext<TextEditorContextToolbarMoreSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-block-controls`. @group Components */
@Directive({ selector: '[pTextEditorBlockControlsDef]', standalone: true })
export class TextEditorBlockControlsDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorBlockControlsSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorBlockControlsDef, context: unknown): context is SlotContext<TextEditorBlockControlsSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-block-menu`. @group Components */
@Directive({ selector: '[pTextEditorBlockMenuDef]', standalone: true })
export class TextEditorBlockMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorBlockMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorBlockMenuDef, context: unknown): context is SlotContext<TextEditorBlockMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-block-submenu`. @group Components */
@Directive({ selector: '[pTextEditorBlockSubmenuDef]', standalone: true })
export class TextEditorBlockSubmenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorBlockSubmenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorBlockSubmenuDef, context: unknown): context is SlotContext<TextEditorBlockSubmenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-slash-menu`. @group Components */
@Directive({ selector: '[pTextEditorSlashMenuDef]', standalone: true })
export class TextEditorSlashMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorSlashMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorSlashMenuDef, context: unknown): context is SlotContext<TextEditorSlashMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-mention-menu`. @group Components */
@Directive({ selector: '[pTextEditorMentionMenuDef]', standalone: true })
export class TextEditorMentionMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorMentionMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorMentionMenuDef, context: unknown): context is SlotContext<TextEditorMentionMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-controls`. @group Components */
@Directive({ selector: '[pTextEditorTableControlsDef]', standalone: true })
export class TextEditorTableControlsDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableControlsSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableControlsDef, context: unknown): context is SlotContext<TextEditorTableControlsSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-column-menu`. @group Components */
@Directive({ selector: '[pTextEditorTableColumnMenuDef]', standalone: true })
export class TextEditorTableColumnMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableColumnMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableColumnMenuDef, context: unknown): context is SlotContext<TextEditorTableColumnMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-column-submenu`. @group Components */
@Directive({ selector: '[pTextEditorTableColumnSubmenuDef]', standalone: true })
export class TextEditorTableColumnSubmenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableColumnSubmenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableColumnSubmenuDef, context: unknown): context is SlotContext<TextEditorTableColumnSubmenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-row-menu`. @group Components */
@Directive({ selector: '[pTextEditorTableRowMenuDef]', standalone: true })
export class TextEditorTableRowMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableRowMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableRowMenuDef, context: unknown): context is SlotContext<TextEditorTableRowMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-row-submenu`. @group Components */
@Directive({ selector: '[pTextEditorTableRowSubmenuDef]', standalone: true })
export class TextEditorTableRowSubmenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableRowSubmenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableRowSubmenuDef, context: unknown): context is SlotContext<TextEditorTableRowSubmenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-cell-menu`. @group Components */
@Directive({ selector: '[pTextEditorTableCellMenuDef]', standalone: true })
export class TextEditorTableCellMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableCellMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableCellMenuDef, context: unknown): context is SlotContext<TextEditorTableCellMenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-table-cell-submenu`. @group Components */
@Directive({ selector: '[pTextEditorTableCellSubmenuDef]', standalone: true })
export class TextEditorTableCellSubmenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorTableCellSubmenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorTableCellSubmenuDef, context: unknown): context is SlotContext<TextEditorTableCellSubmenuSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-image-upload`. @group Components */
@Directive({ selector: '[pTextEditorImageUploadDef]', standalone: true })
export class TextEditorImageUploadDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorImageUploadDef, context: unknown): context is SlotContext<TextEditorUploadSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-image-upload-dropzone`. @group Components */
@Directive({ selector: '[pTextEditorImageUploadDropzoneDef]', standalone: true })
export class TextEditorImageUploadDropzoneDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadDropzoneSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorImageUploadDropzoneDef, context: unknown): context is SlotContext<TextEditorUploadDropzoneSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-image-upload-progress`. @group Components */
@Directive({ selector: '[pTextEditorImageUploadProgressDef]', standalone: true })
export class TextEditorImageUploadProgressDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadProgressSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorImageUploadProgressDef, context: unknown): context is SlotContext<TextEditorUploadProgressSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-document-upload`. @group Components */
@Directive({ selector: '[pTextEditorDocumentUploadDef]', standalone: true })
export class TextEditorDocumentUploadDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorDocumentUploadDef, context: unknown): context is SlotContext<TextEditorUploadSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-document-upload-dropzone`. @group Components */
@Directive({ selector: '[pTextEditorDocumentUploadDropzoneDef]', standalone: true })
export class TextEditorDocumentUploadDropzoneDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadDropzoneSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorDocumentUploadDropzoneDef, context: unknown): context is SlotContext<TextEditorUploadDropzoneSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-document-upload-progress`. @group Components */
@Directive({ selector: '[pTextEditorDocumentUploadProgressDef]', standalone: true })
export class TextEditorDocumentUploadProgressDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorUploadProgressSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorDocumentUploadProgressDef, context: unknown): context is SlotContext<TextEditorUploadProgressSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-navigator-trigger`. @group Components */
@Directive({ selector: '[pTextEditorNavigatorTriggerDef]', standalone: true })
export class TextEditorNavigatorTriggerDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorNavigatorTriggerSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorNavigatorTriggerDef, context: unknown): context is SlotContext<TextEditorNavigatorTriggerSlotProps> {
        return true;
    }
}

/** Slot template of `p-text-editor-navigator-menu`. @group Components */
@Directive({ selector: '[pTextEditorNavigatorMenuDef]', standalone: true })
export class TextEditorNavigatorMenuDef {
    readonly template = inject<TemplateRef<SlotContext<TextEditorNavigatorMenuSlotProps>>>(TemplateRef);

    static ngTemplateContextGuard(_directive: TextEditorNavigatorMenuDef, context: unknown): context is SlotContext<TextEditorNavigatorMenuSlotProps> {
        return true;
    }
}
