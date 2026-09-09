import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';
import type { Command, EditorState, Plugin } from 'prosemirror-state';
import type { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';
import type { EditorView } from 'prosemirror-view';

/**
 * TextEditor mode.
 *
 * `classic` renders a single content area driven by a static toolbar and binds to an HTML string.
 * `block` renders every entry of the bound array as its own draggable block.
 *
 * @group Types
 */
export type TextEditorMode = 'classic' | 'block';

/**
 * Value the editor binds to: an HTML string in classic mode, one HTML string per block in block mode.
 *
 * @group Types
 */
export type TextEditorValue = string | string[];

/**
 * Text alignment applied to a block, a table column, a table row or a cell.
 *
 * @group Types
 */
export type TextEditorTextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Why a selected file never made it into an upload.
 *
 * @group Types
 */
export type TextEditorUploadRejectReason = 'max-file-count' | 'max-file-size' | 'file-type';

/**
 * Which upload overlay a surface belongs to.
 *
 * @group Types
 */
export type TextEditorUploadKind = 'image' | 'document';

/**
 * Upload transport. Resolves with the URL the uploaded file is reachable at.
 *
 * The `signal` must be forwarded to `fetch`/`XMLHttpRequest` so cancelling the upload aborts the
 * in-flight request.
 *
 * @group Types
 */
export type TextEditorUploadHandler = (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<string>;

/**
 * Resolves the candidates offered while an `@` mention is being typed.
 *
 * @group Types
 */
export type TextEditorMentionHandler<TItem = unknown> = (query: string) => TItem[] | Promise<TItem[]>;

/**
 * Renders the text inserted for a selected mention candidate.
 *
 * @group Types
 */
export type TextEditorMentionTemplate<TItem = unknown> = (data: TItem) => string;

/**
 * Viewport coordinates and dimensions of the text caret, used to position floating surfaces such as
 * the context toolbar, the slash menu and the mention menu.
 *
 * @group Interface
 */
export interface CaretPosition {
    /**
     * Distance from the top of the viewport to the top of the caret, in pixels.
     */
    top: number;
    /**
     * Distance from the left of the viewport to the caret, in pixels.
     */
    left: number;
    /**
     * Distance from the top of the viewport to the bottom of the caret, in pixels.
     */
    bottom: number;
    /**
     * Width of the caret, in pixels.
     */
    width: number;
    /**
     * Height of the caret, in pixels.
     */
    height: number;
}

/**
 * Table active state emitted when the cursor is inside a table.
 *
 * @group Interface
 */
export interface TableActiveState {
    /**
     * The table element the cursor is currently inside.
     */
    table: HTMLTableElement;
    /**
     * Zero-based row index of the active cell.
     */
    rowIndex: number;
    /**
     * Zero-based column index of the active cell.
     */
    colIndex: number;
    /**
     * Total number of rows in the table.
     */
    rowCount: number;
    /**
     * Total number of columns in the table.
     */
    colCount: number;
}

/**
 * Bounding rectangle of a multi-cell table selection, expressed as inclusive row and column indexes.
 *
 * @group Interface
 */
export interface TableSelectionRect {
    /**
     * Smallest (top-most) row index in the selection.
     */
    minRow: number;
    /**
     * Largest (bottom-most) row index in the selection.
     */
    maxRow: number;
    /**
     * Smallest (left-most) column index in the selection.
     */
    minCol: number;
    /**
     * Largest (right-most) column index in the selection.
     */
    maxCol: number;
}

/**
 * Geometry used to position the table editing overlay (resize handles and the floating add
 * row / add column controls).
 *
 * @group Interface
 */
export interface TableOverlayRect {
    /**
     * Bounding rectangle of the table element.
     */
    tableRect: DOMRect;
    /**
     * Bounding rectangle of the currently focused cell.
     */
    cellRect: DOMRect;
    /**
     * X positions of the column borders, used to render resize handles.
     */
    columnBorders: number[];
    /**
     * Whether the active cell is in the last row.
     */
    isLastRow: boolean;
    /**
     * Whether the active cell is in the last column.
     */
    isLastColumn: boolean;
}

/**
 * A heading entry extracted from the document.
 *
 * @group Interface
 */
export interface TextEditorHeadingEntry {
    /**
     * Heading level (1-6).
     */
    level: number;
    /**
     * Plain text content of the heading.
     */
    text: string;
    /**
     * ProseMirror document position of the heading node.
     */
    pos: number;
}

/**
 * Snapshot of the active formatting at the current selection. Each flag mirrors one toolbar
 * control, so a widget renders its pressed state straight from this object.
 *
 * @group Interface
 */
export interface TextEditorFormatState {
    /**
     * Whether bold is applied to the selection.
     */
    bold?: boolean;
    /**
     * Whether italic is applied to the selection.
     */
    italic?: boolean;
    /**
     * Whether underline is applied to the selection.
     */
    underline?: boolean;
    /**
     * Whether strikethrough is applied to the selection.
     */
    strikethrough?: boolean;
    /**
     * Whether inline code is applied to the selection.
     */
    code?: boolean;
    /**
     * Whether subscript is applied to the selection.
     */
    subscript?: boolean;
    /**
     * Whether superscript is applied to the selection.
     */
    superscript?: boolean;
    /**
     * Whether a highlight (any background color) is applied to the selection.
     */
    highlight?: boolean;
    /**
     * Current heading level (1-6), or null when not a heading.
     */
    heading?: number | null;
    /**
     * Whether the selection is inside a blockquote.
     */
    blockquote?: boolean;
    /**
     * Whether the selection is inside a code block.
     */
    codeBlock?: boolean;
    /**
     * Whether the selection is inside a bullet list.
     */
    bulletList?: boolean;
    /**
     * Whether the selection is inside an ordered list.
     */
    orderedList?: boolean;
    /**
     * Whether the selection is inside a checklist.
     */
    checkList?: boolean;
    /**
     * Current text alignment of the block, or null if mixed/none.
     */
    textAlign?: string | null;
    /**
     * Current text (foreground) color, or null if mixed/none.
     */
    foregroundColor?: string | null;
    /**
     * Current highlight (background) color, or null if mixed/none.
     */
    backgroundColor?: string | null;
    /**
     * Current font family of the selection, or null if mixed/none.
     */
    fontFamily?: string | null;
    /**
     * Current font size of the selection, or null if mixed/none.
     */
    fontSize?: string | null;
    /**
     * Whether the selection is within a link.
     */
    link?: boolean;
    /**
     * URL of the active link, or null when not in a link.
     */
    linkUrl?: string | null;
    /**
     * Whether an undo step is available.
     */
    canUndo?: boolean;
    /**
     * Whether a redo step is available.
     */
    canRedo?: boolean;
    /**
     * Whether there is a non-empty text selection.
     */
    hasSelection?: boolean;
    /**
     * Whether the editor currently has focus.
     */
    hasFocus?: boolean;
    /**
     * Whether the cursor is inside a table.
     */
    inTable?: boolean;
    /**
     * Whether more than one table cell is selected.
     */
    isMultiCellSelected?: boolean;
    /**
     * Whether the active cell is a merged cell.
     */
    isCellMerged?: boolean;
    /**
     * Whether an image upload placeholder is present in the document.
     */
    hasImageUploadPlaceholder?: boolean;
    /**
     * Whether a document upload placeholder is present in the document.
     */
    hasDocumentUploadPlaceholder?: boolean;
}

/**
 * Formatting state exposed to the toolbar slot. Identical in shape to {@link TextEditorFormatState}.
 *
 * @group Interface
 */
export interface TextEditorToolbarState extends TextEditorFormatState {}

/**
 * Commands for applying foreground (text) and background (highlight) colors.
 *
 * @group Interface
 */
export interface TextEditorColorCommands {
    /**
     * Applies the given text (foreground) color.
     */
    foregroundColor: (color: string) => void;
    /**
     * Applies the given highlight (background) color.
     */
    backgroundColor: (color: string) => void;
}

/**
 * The full set of imperative editing commands. Every command is a plain function, so a host widget
 * wires it to a button, a keyboard shortcut or an agent without going through the editor instance.
 *
 * @group Interface
 */
export interface TextEditorCommands extends TextEditorColorCommands {
    /**
     * Toggles bold on the current selection.
     */
    bold: () => void;
    /**
     * Toggles italic on the current selection.
     */
    italic: () => void;
    /**
     * Toggles underline on the current selection.
     */
    underline: () => void;
    /**
     * Toggles strikethrough on the current selection.
     */
    strikethrough: () => void;
    /**
     * Toggles inline code on the current selection.
     */
    code: () => void;
    /**
     * Toggles subscript on the current selection.
     */
    subscript: () => void;
    /**
     * Toggles superscript on the current selection.
     */
    superscript: () => void;
    /**
     * Toggles the default highlight color on the current selection.
     */
    highlight: () => void;
    /**
     * Applies the heading of the given level (1-6); calling it again with the active level converts
     * the block back to a paragraph.
     */
    heading: (level: number) => void;
    /**
     * Converts the current block to a paragraph.
     */
    paragraph: () => void;
    /**
     * Toggles the blockquote wrapping on the current block.
     */
    blockquote: () => void;
    /**
     * Toggles a fenced code block on the current block.
     */
    codeBlock: () => void;
    /**
     * Toggles a bullet list on the current block.
     */
    bulletList: () => void;
    /**
     * Toggles an ordered list on the current block.
     */
    orderedList: () => void;
    /**
     * Toggles a checklist on the current block.
     */
    checkList: () => void;
    /**
     * Sets the alignment of the current block.
     */
    textAlign: (alignment: TextEditorTextAlign | string) => void;
    /**
     * Applies the given font family to the current selection.
     */
    fontFamily: (family: string) => void;
    /**
     * Applies the given font size to the current selection.
     */
    fontSize: (size: string) => void;
    /**
     * Adds a hyperlink, using `text` when the selection is collapsed and wrapping the selection
     * otherwise.
     */
    insertLink: (url: string, text?: string) => void;
    /**
     * Changes the href of the link around the cursor.
     */
    updateLink: (url: string) => void;
    /**
     * Unwraps the link around the cursor.
     */
    removeLink: () => void;
    /**
     * Inserts an image at the cursor from a URL.
     */
    insertImage: (src: string, attrs?: Record<string, unknown>) => void;
    /**
     * Opens the image picker and starts the image upload flow.
     */
    uploadImages: () => void;
    /**
     * Opens the document picker and starts the document upload flow.
     */
    uploadDocuments: () => void;
    /**
     * Inserts a table at the cursor.
     */
    table: (rows?: number, cols?: number) => void;
    /**
     * Inserts a horizontal rule at the cursor.
     */
    insertHorizontalRule: () => void;
    /**
     * Steps one entry back in the editor history.
     */
    undo: () => void;
    /**
     * Steps one entry forward in the editor history.
     */
    redo: () => void;
    /**
     * Opens the browser print flow for the editor content.
     */
    print: () => void;
}

/**
 * Commands exposed by the block handle menu (block mode): duplicate, copy, delete, recolor and
 * convert the block into another type.
 *
 * @group Interface
 */
export interface TextEditorBlockMenuCommands extends TextEditorColorCommands {
    /**
     * Duplicates the block.
     */
    duplicate: () => void;
    /**
     * Copies the block's content to the clipboard.
     */
    copyToClipboard: () => void;
    /**
     * Deletes the block.
     */
    deleteBlock: () => void;
    /**
     * Converts the block into another block type.
     */
    turnInto: {
        /**
         * Converts the block to a paragraph.
         */
        text: () => void;
        /**
         * Converts the block to a level 1 heading.
         */
        heading1: () => void;
        /**
         * Converts the block to a level 2 heading.
         */
        heading2: () => void;
        /**
         * Converts the block to a level 3 heading.
         */
        heading3: () => void;
        /**
         * Converts the block to a bullet list.
         */
        bulletList: () => void;
        /**
         * Converts the block to an ordered list.
         */
        orderedList: () => void;
        /**
         * Converts the block to a checklist.
         */
        checkList: () => void;
        /**
         * Converts the block to a blockquote.
         */
        blockquote: () => void;
        /**
         * Converts the block to a code block.
         */
        codeBlock: () => void;
    };
}

/**
 * Commands available from the slash (`/`) command menu for inserting or converting content.
 *
 * @group Interface
 */
export interface TextEditorSlashMenuCommands {
    /**
     * Inserts/converts to a plain text paragraph.
     */
    text: () => void;
    /**
     * Inserts/converts to a heading of the given level (1-6).
     */
    heading: (level: number) => void;
    /**
     * Inserts/converts to a bullet list.
     */
    bulletList: () => void;
    /**
     * Inserts/converts to an ordered list.
     */
    orderedList: () => void;
    /**
     * Inserts/converts to a checklist.
     */
    checkList: () => void;
    /**
     * Inserts/converts to a blockquote.
     */
    blockquote: () => void;
    /**
     * Inserts/converts to a code block.
     */
    code: () => void;
    /**
     * Inserts a horizontal rule (divider).
     */
    divider: () => void;
    /**
     * Inserts a table.
     */
    table: () => void;
    /**
     * Opens the image picker / starts the image upload flow.
     */
    uploadImages: () => void;
    /**
     * Opens the document picker / starts the document upload flow.
     */
    uploadDocuments: () => void;
}

/**
 * Command for the mention popup: select a mention item, inserting the matching chip into the
 * document.
 *
 * @group Interface
 */
export interface TextEditorMentionCommands<TItem = unknown> {
    /**
     * Selects a mention item, inserting its mention chip into the document.
     */
    select: (data: TItem) => void;
}

/**
 * Commands for the active table column: insert before/after, delete, reorder, recolor and align.
 *
 * @group Interface
 */
export interface TextEditorTableColumnCommands extends TextEditorColorCommands {
    /**
     * Inserts a new column before the active column.
     */
    insertBefore: () => void;
    /**
     * Inserts a new column after the active column.
     */
    insertAfter: () => void;
    /**
     * Deletes the active column.
     */
    delete: () => void;
    /**
     * Duplicates the active column.
     */
    duplicate: () => void;
    /**
     * Moves the active column one position to the left.
     */
    moveLeft: () => void;
    /**
     * Moves the active column one position to the right.
     */
    moveRight: () => void;
    /**
     * Toggles the active column between header and body cells.
     */
    toggleHeader: () => void;
    /**
     * Sets the text alignment for the active column.
     */
    align: (value: string) => void;
}

/**
 * Commands for the active table row: insert before/after, delete, reorder, recolor and align.
 *
 * @group Interface
 */
export interface TextEditorTableRowCommands extends TextEditorColorCommands {
    /**
     * Inserts a new row before the active row.
     */
    insertBefore: () => void;
    /**
     * Inserts a new row after the active row.
     */
    insertAfter: () => void;
    /**
     * Deletes the active row.
     */
    delete: () => void;
    /**
     * Deletes the entire table.
     */
    deleteTable: () => void;
    /**
     * Duplicates the active row.
     */
    duplicate: () => void;
    /**
     * Moves the active row one position up.
     */
    moveUp: () => void;
    /**
     * Moves the active row one position down.
     */
    moveDown: () => void;
    /**
     * Toggles the active row between header and body cells.
     */
    toggleHeader: () => void;
    /**
     * Sets the text alignment for the active row.
     */
    align: (value: string) => void;
}

/**
 * Commands for the active table cell (or multi-cell selection): clear contents, merge, split,
 * recolor, align and toggle the header.
 *
 * @group Interface
 */
export interface TextEditorTableCellCommands extends TextEditorColorCommands {
    /**
     * Clears the contents of the active cell(s).
     */
    clearContents: () => void;
    /**
     * Merges the selected cells into one.
     */
    mergeCells: () => void;
    /**
     * Splits a merged cell back into individual cells.
     */
    splitCell: () => void;
    /**
     * Toggles the active cell(s) between header and body cells.
     */
    toggleHeader: () => void;
    /**
     * Sets the text alignment for the active cell(s).
     */
    align: (value: string) => void;
}

/**
 * Commands driving the floating table controls: add one row at the bottom, add one column at the
 * inline end.
 *
 * @group Interface
 */
export interface TextEditorTableControlsCommands {
    /**
     * Appends a row to the active table.
     */
    addRow: () => void;
    /**
     * Appends a column to the active table.
     */
    addColumn: () => void;
}

/**
 * Controls for a named submenu (e.g. nested toolbar/menu panels): open the panel anchored to an
 * element, read which one is open, and close it.
 *
 * @group Interface
 */
export interface TextEditorSubmenu {
    /**
     * Opens the named submenu anchored to the given element.
     */
    open: (name: string, anchor?: HTMLElement) => void;
    /**
     * Closes the submenu.
     */
    close: () => void;
    /**
     * Name of the open submenu, or null when none is open.
     */
    active: () => string | null;
    /**
     * Element the open submenu is anchored to, or null when none is open.
     */
    anchor: () => HTMLElement | null;
}

/**
 * Upload slot entry - represents a single file in the upload UI.
 *
 * @group Interface
 */
export interface UploadSlotEntry {
    /**
     * Unique identifier for the upload slot.
     */
    id: string;
    /**
     * Original name of the file being uploaded.
     */
    fileName: string;
    /**
     * Size of the file in bytes.
     */
    fileSize: number;
    /**
     * Human-readable file size (e.g. "1.2 MB").
     */
    fileSizeFormatted: string;
    /**
     * Upload progress as a percentage (0-100).
     */
    progress: number;
    /**
     * Current state of the upload.
     */
    status: 'uploading' | 'complete' | 'error' | 'cancelled';
    /**
     * Aborts the in-progress upload for this slot.
     */
    cancel: () => void;
}

/**
 * Payload of the `reject` output: the files client-side validation turned away, and why.
 *
 * @group Interface
 */
export interface TextEditorUploadRejectEvent {
    /**
     * The rejected files.
     */
    files: File[];
    /**
     * Why the files were rejected.
     */
    reason: TextEditorUploadRejectReason;
}

/**
 * Payload of the `uploadError` output: the file whose transport rejected, and the error it rejected
 * with.
 *
 * @group Interface
 */
export interface TextEditorUploadErrorEvent {
    /**
     * The file whose upload failed.
     */
    file: File;
    /**
     * The error the handler rejected with.
     */
    error: unknown;
}

/**
 * Payload emitted on every transaction while the slash menu is active.
 *
 * @group Interface
 */
export interface TextEditorSlashMenuUpdate {
    /**
     * Whether the slash menu is currently active.
     */
    active: boolean;
    /**
     * Text typed after the `/` trigger.
     */
    text: string;
    /**
     * Caret position the menu anchors to, or null when inactive.
     */
    position: CaretPosition | null;
}

/**
 * Payload emitted on every transaction while a mention is active.
 *
 * @group Interface
 */
export interface TextEditorMentionUpdate<TItem = unknown> extends TextEditorSlashMenuUpdate {
    /**
     * Candidates resolved by the mention handler for the current query.
     */
    items: TItem[];
}

/**
 * Payload emitted when the hovered block changes in block mode.
 *
 * @group Interface
 */
export interface TextEditorBlockHoverEvent {
    /**
     * The hovered block element, or null when the pointer left every block.
     */
    element: HTMLElement | null;
    /**
     * Index of the hovered block.
     */
    index: number;
}

/**
 * Context provided to TextEditor plugins via {@link https://optimus.openng.org/texteditor | defineTextEditorPlugin}.
 *
 * @group Interface
 */
export interface TextEditorPluginContext<TOptions = unknown> {
    /**
     * Options passed to the plugin at registration time.
     */
    options?: TOptions;
    /**
     * Returns the plain text of the current selection.
     */
    getSelectedText: () => string;
    /**
     * Replaces the current selection with the given content, optionally interpreted as HTML.
     */
    replaceSelection: (content: string, asHtml?: boolean) => void;
    /**
     * Returns the editor's content DOM element, or null before mount.
     */
    getEditorElement: () => HTMLElement | null;
    /**
     * The current ProseMirror EditorState, or null before mount.
     */
    getState: () => EditorState | null;
    /**
     * The live ProseMirror EditorView, or null before mount.
     */
    getView: () => EditorView | null;
    /**
     * Attaches a ProseMirror plugin to the live editor; returns a remover.
     */
    registerProseMirrorPlugin: (plugin: Plugin) => () => void;
    /**
     * Runs a ProseMirror command against the editor.
     */
    runCommand: (command: Command) => boolean;
    /**
     * Registers a cleanup callback run when the editor unmounts.
     */
    onUnmounted: (fn: () => void) => void;
}

/**
 * Return type from a TextEditor plugin's install function.
 *
 * @group Interface
 */
export interface TextEditorPluginExpose {
    /**
     * Named commands contributed by the plugin, merged into the editor's command surface under the
     * plugin's namespace.
     */
    commands?: Record<string, (...args: any[]) => unknown>;
}

/**
 * Schema and ProseMirror contributions a plugin makes when the editor state is built.
 *
 * @group Interface
 */
export interface TextEditorPluginOptions<TOptions = unknown> {
    /**
     * Nodes and marks contributed to the per-instance schema.
     */
    schema?: {
        /**
         * Node specs added to the schema, keyed by node name.
         */
        nodes?: Record<string, NodeSpec>;
        /**
         * Mark specs added to the schema, keyed by mark name.
         */
        marks?: Record<string, MarkSpec>;
    };
    /**
     * ProseMirror plugins contributed to the initial editor state.
     */
    prosemirrorPlugins?: (schema: Schema, options: TOptions) => Plugin[];
}

/**
 * A plugin definition created by `defineTextEditorPlugin`.
 *
 * @group Interface
 */
export interface TextEditorPlugin<TOptions = unknown> {
    /**
     * Namespace the plugin's commands are exposed under, as `pluginCommands[name]`.
     */
    name: string;
    /**
     * Runs once when the editor mounts and returns the commands the plugin contributes.
     */
    install: (context: TextEditorPluginContext<TOptions>) => TextEditorPluginExpose | void;
    /**
     * Schema and ProseMirror contributions applied when the editor state is built.
     */
    options?: TextEditorPluginOptions<TOptions>;
}

/**
 * A plugin as passed to the `plugins` input: the definition on its own, or a `[plugin, options]`
 * tuple carrying its configuration.
 *
 * @group Types
 */
export type TextEditorPluginRegistration<TOptions = any> = TextEditorPlugin<TOptions> | [TextEditorPlugin<TOptions>, TOptions];

/**
 * Commands contributed by plugins, keyed by plugin name.
 *
 * @group Types
 */
export type TextEditorPluginCommands = Record<string, Record<string, (...args: any[]) => unknown>>;

/**
 * Defines valid pass-through options in TextEditor component.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface TextEditorPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the body's DOM element.
     */
    body?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the hidden input's DOM element.
     */
    hiddenInput?: PassThroughOption<HTMLInputElement, I>;
}

/**
 * Defines valid pass-through options in TextEditor component.
 * @see {@link TextEditorPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type TextEditorPassThrough<I = unknown> = PassThrough<I, TextEditorPassThroughOptions<I>>;

/**
 * Defines valid pass-through options in the TextEditor part components.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface TextEditorPartPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in the TextEditor part components.
 * @see {@link TextEditorPartPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type TextEditorPartPassThrough<I = unknown> = PassThrough<I, TextEditorPartPassThroughOptions<I>>;
