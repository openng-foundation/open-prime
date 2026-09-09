import { InjectionToken, Signal } from '@angular/core';
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
    TextEditorUploadKind,
    TextEditorValue,
    UploadSlotEntry
} from '@openng/optimus-ui/types/texteditor';

/**
 * The editor surface every widget under the root can reach. Reactive fields are signals - read them
 * by calling them, `ctx.commands().bold()` and `ctx.state().bold` - while the serializers are plain
 * methods.
 *
 * @group Interface
 */
export interface AngularTextEditorContext {
    /**
     * The imperative command surface.
     */
    commands: Signal<TextEditorCommands>;
    /**
     * The formatting snapshot at the current selection.
     */
    state: Signal<TextEditorFormatState>;
    /**
     * Commands contributed by plugins, namespaced by plugin name.
     */
    pluginCommands: Signal<TextEditorPluginCommands>;
    /**
     * The document's heading outline.
     */
    headings: Signal<TextEditorHeadingEntry[]>;
    /**
     * The bound value.
     */
    value: Signal<TextEditorValue | undefined>;
    /**
     * Whether editing is disabled.
     */
    disabled: Signal<boolean>;
    /**
     * Whether the editor is read-only.
     */
    readonly: Signal<boolean>;
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
 * Resolves to the editor root. Injected by any widget rendered under `p-text-editor-root`.
 *
 * @group Token
 */
export const TEXT_EDITOR_CONTEXT = new InjectionToken<AngularTextEditorContext>('TEXT_EDITOR_CONTEXT');

/**
 * The selection-anchored floating toolbar's surface.
 *
 * @group Interface
 */
export interface AngularContextToolbarContext {
    /**
     * The imperative command surface.
     */
    commands: Signal<TextEditorCommands>;
    /**
     * The formatting snapshot at the current selection.
     */
    state: Signal<TextEditorFormatState>;
    /**
     * Commands contributed by plugins, namespaced by plugin name.
     */
    pluginCommands: Signal<TextEditorPluginCommands>;
    /**
     * Whether the overflow panel is open.
     */
    moreActive: Signal<boolean>;
    /**
     * The element the overflow panel anchors to.
     */
    moreTrigger: Signal<HTMLElement | null>;
    /**
     * Opens or closes the overflow panel.
     */
    toggleMore: (event?: Event) => void;
    /**
     * Registers the element the overflow panel anchors to.
     */
    setMoreTrigger: (element: HTMLElement | null) => void;
    /**
     * Closes the toolbar.
     */
    dismiss: () => void;
}

/**
 * Resolves to the floating toolbar. Injected by widgets rendered under
 * `p-text-editor-context-toolbar`.
 *
 * @group Token
 */
export const CONTEXT_TOOLBAR_CONTEXT = new InjectionToken<AngularContextToolbarContext>('CONTEXT_TOOLBAR_CONTEXT');

/**
 * The block-mode hover bar's surface.
 *
 * @group Interface
 */
export interface AngularBlockControlsContext {
    /**
     * Index of the hovered block.
     */
    index: Signal<number>;
    /**
     * Type of the hovered block, such as `text` or `heading:2`.
     */
    blockType: Signal<string>;
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
 * Resolves to the hover bar. Injected by widgets rendered under `p-text-editor-block-controls`.
 *
 * @group Token
 */
export const BLOCK_CONTROLS_CONTEXT = new InjectionToken<AngularBlockControlsContext>('BLOCK_CONTROLS_CONTEXT');

/**
 * The per-block options menu's surface, shared with its submenu.
 *
 * @group Interface
 */
export interface AngularBlockMenuContext {
    /**
     * Index of the block the menu was opened from.
     */
    blockIndex: Signal<number>;
    /**
     * Type of that block.
     */
    blockType: Signal<string>;
    /**
     * The block command set.
     */
    commands: Signal<TextEditorBlockMenuCommands>;
    /**
     * The formatting snapshot at the current selection.
     */
    state: Signal<TextEditorFormatState>;
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
 * Resolves to the block menu. Injected by widgets rendered under `p-text-editor-block-menu` and
 * `p-text-editor-block-submenu`.
 *
 * @group Token
 */
export const BLOCK_MENU_CONTEXT = new InjectionToken<AngularBlockMenuContext>('BLOCK_MENU_CONTEXT');

/**
 * The slash palette's surface.
 *
 * @group Interface
 */
export interface AngularSlashMenuContext {
    /**
     * The insertion command set.
     */
    commands: Signal<TextEditorSlashMenuCommands>;
    /**
     * The formatting snapshot at the current selection.
     */
    state: Signal<TextEditorFormatState>;
    /**
     * Text typed after the `/`.
     */
    filterText: Signal<string>;
    /**
     * Caret the palette anchors to.
     */
    position: Signal<CaretPosition | null>;
    /**
     * Closes the palette.
     */
    dismiss: () => void;
}

/**
 * Resolves to the slash palette. Injected by widgets rendered under `p-text-editor-slash-menu`.
 *
 * @group Token
 */
export const SLASH_MENU_CONTEXT = new InjectionToken<AngularSlashMenuContext>('SLASH_MENU_CONTEXT');

/**
 * The mention popover's surface, generic over the item type the handler resolves.
 *
 * @group Interface
 */
export interface AngularMentionMenuContext<TItem = unknown> {
    /**
     * Candidates resolved for the current query.
     */
    items: Signal<TItem[]>;
    /**
     * The mention command set.
     */
    commands: Signal<TextEditorMentionCommands<TItem>>;
    /**
     * Text typed after the `@`.
     */
    filterText: Signal<string>;
    /**
     * Caret the popover anchors to.
     */
    position: Signal<CaretPosition | null>;
    /**
     * Closes the popover.
     */
    dismiss: () => void;
}

/**
 * Resolves to the mention popover. Injected by widgets rendered under
 * `p-text-editor-mention-menu`; type the injection to get typed items back.
 *
 * @group Token
 */
export const MENTION_MENU_CONTEXT = new InjectionToken<AngularMentionMenuContext>('MENTION_MENU_CONTEXT');

/**
 * The upload overlay's surface, shared by the image and document overlays and by their dropzone and
 * progress sub-parts.
 *
 * @group Interface
 */
export interface AngularUploadContext {
    /**
     * Which overlay this is.
     */
    kind: TextEditorUploadKind;
    /**
     * The files currently in flight.
     */
    uploads: Signal<UploadSlotEntry[]>;
    /**
     * Opens the file picker.
     */
    selectFiles: () => void;
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
 * Resolves to the upload overlay. Injected by widgets rendered under
 * `p-text-editor-image-upload` or `p-text-editor-document-upload`.
 *
 * @group Token
 */
export const UPLOAD_CONTEXT = new InjectionToken<AngularUploadContext>('UPLOAD_CONTEXT');

/**
 * The floating table controls' surface.
 *
 * @group Interface
 */
export interface AngularTableControlsContext {
    /**
     * Geometry of the active table, or null when the cursor is outside one.
     */
    position: Signal<TableOverlayRect | null>;
    /**
     * The add-row and add-column commands.
     */
    commands: Signal<TextEditorTableControlsCommands>;
}

/**
 * Resolves to the table controls. Injected by widgets rendered under
 * `p-text-editor-table-controls`.
 *
 * @group Token
 */
export const TABLE_CONTROLS_CONTEXT = new InjectionToken<AngularTableControlsContext>('TABLE_CONTROLS_CONTEXT');

/**
 * The column action menu's surface, shared with its submenu.
 *
 * @group Interface
 */
export interface AngularTableColumnMenuContext {
    /**
     * Index of the column the menu was opened from.
     */
    colIndex: Signal<number>;
    /**
     * Number of columns in the table.
     */
    colCount: Signal<number>;
    /**
     * The column command set.
     */
    commands: Signal<TextEditorTableColumnCommands>;
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
 * Resolves to the column menu.
 *
 * @group Token
 */
export const TABLE_COLUMN_MENU_CONTEXT = new InjectionToken<AngularTableColumnMenuContext>('TABLE_COLUMN_MENU_CONTEXT');

/**
 * The row action menu's surface, shared with its submenu.
 *
 * @group Interface
 */
export interface AngularTableRowMenuContext {
    /**
     * Index of the row the menu was opened from.
     */
    rowIndex: Signal<number>;
    /**
     * Number of rows in the table.
     */
    rowCount: Signal<number>;
    /**
     * The row command set.
     */
    commands: Signal<TextEditorTableRowCommands>;
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
 * Resolves to the row menu.
 *
 * @group Token
 */
export const TABLE_ROW_MENU_CONTEXT = new InjectionToken<AngularTableRowMenuContext>('TABLE_ROW_MENU_CONTEXT');

/**
 * The cell action menu's surface, shared with its submenu.
 *
 * @group Interface
 */
export interface AngularTableCellMenuContext {
    /**
     * Whether more than one cell is selected.
     */
    isMultiCellSelected: Signal<boolean>;
    /**
     * Whether the active cell is merged.
     */
    isCellMerged: Signal<boolean>;
    /**
     * The cell command set.
     */
    commands: Signal<TextEditorTableCellCommands>;
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
 * Resolves to the cell menu.
 *
 * @group Token
 */
export const TABLE_CELL_MENU_CONTEXT = new InjectionToken<AngularTableCellMenuContext>('TABLE_CELL_MENU_CONTEXT');

/**
 * The heading-outline minimap's surface.
 *
 * @group Interface
 */
export interface AngularNavigatorContext {
    /**
     * The document's heading outline.
     */
    headings: Signal<TextEditorHeadingEntry[]>;
    /**
     * Index of the heading currently in view.
     */
    activeIndex: Signal<number>;
    /**
     * Whether the heading list is open.
     */
    menuOpen: Signal<boolean>;
    /**
     * The rail element the list anchors to.
     */
    triggerEl: Signal<HTMLElement | null>;
    /**
     * Opens the heading list.
     */
    openMenu: () => void;
    /**
     * Closes the heading list.
     */
    closeMenu: () => void;
    /**
     * Scrolls the heading at the given position into view.
     */
    scrollTo: (pos: number) => void;
}

/**
 * Resolves to the navigator. Injected by widgets rendered under `p-text-editor-navigator`.
 *
 * @group Token
 */
export const NAVIGATOR_CONTEXT = new InjectionToken<AngularNavigatorContext>('NAVIGATOR_CONTEXT');
