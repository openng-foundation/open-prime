import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, contentChild, effect, forwardRef, inject, input, model, numberAttribute, output, signal, untracked, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Bind } from '@openng/optimus-ui/bind';
import type {
    CaretPosition,
    TableActiveState,
    TableOverlayRect,
    TextEditorBlockMenuCommands,
    TextEditorCommands,
    TextEditorFormatState,
    TextEditorHeadingEntry,
    TextEditorMentionCommands,
    TextEditorMentionHandler,
    TextEditorMentionTemplate,
    TextEditorMode,
    TextEditorPassThrough,
    TextEditorPluginCommands,
    TextEditorPluginRegistration,
    TextEditorSlashMenuCommands,
    TextEditorTableCellCommands,
    TextEditorTableColumnCommands,
    TextEditorTableRowCommands,
    TextEditorUploadErrorEvent,
    TextEditorUploadHandler,
    TextEditorUploadKind,
    TextEditorUploadRejectEvent,
    TextEditorValue,
    UploadSlotEntry
} from '@openng/optimus-ui/types/texteditor';
import type { MarkSpec, Node as ProseMirrorNode, NodeSpec, Schema } from 'prosemirror-model';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import type { Command, Plugin } from 'prosemirror-state';
import { EditorState, TextSelection } from 'prosemirror-state';
import { columnResizing, tableEditing } from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';
import { addBlockAfter, blockModePlugin, blockTypeAt, createBlockMenuCommands, moveBlock } from './core/block-mode';
import { CheckListItemView } from './core/checklist';
import { createTextEditorCommands } from './core/commands';
import { deriveFormatState } from './core/format-state';
import { collectHeadings, headingsPlugin } from './core/headings';
import { markdownInputRules } from './core/input-rules';
import { textEditorKeymap } from './core/keymap';
import { placeholderPlugin } from './core/placeholder';
import { printHtml } from './core/print';
import { createTextEditorSchema } from './core/schema';
import { isSafeLinkHref } from './core/sanitize';
import { parseBlocks, parseHtml, parseHtmlSlice, serializeBlocks, serializeHtml, serializeMarkdown, serializeText } from './core/serialize';
import { createTableCellCommands, createTableColumnCommands, createTableControlsCommands, createTableRowCommands, isCellMerged, isMultiCellSelected, tableActiveState, tableOverlayRect } from './core/tables';
import { TypeaheadState, caretPositionAt, clearTypeahead, dismissTypeahead, typeaheadPlugin } from './core/typeahead';
import { DEFAULT_DOCUMENT_TYPES, DEFAULT_IMAGE_TYPES, TEXT_EDITOR_FILE_SIZE, UploadQueue, validateFiles } from './core/uploads';
import { TEXT_EDITOR_CONTEXT } from './texteditor-contexts';
import { TextEditorRootDef } from './texteditor-defs';
import { installPlugins } from './texteditor-plugin';
import { TextEditorStyle } from './style/texteditorstyle';

/**
 * Per-instance id. A counter rather than a random value, because the same tree renders on the
 * server and on the client and `data-id` has to match across both.
 */
let instanceCount = 0;

export const TEXT_EDITOR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextEditorRoot),
    multi: true
};

/**
 * Which parts are mounted. Mounting a part is what turns its feature on, so the runtime reads this
 * set rather than a list of boolean inputs.
 */
/**
 * The placeholder overrides `p-text-editor-content` can set locally, so a demo can put the
 * checklist placeholder on the content part instead of the root.
 */
export interface TextEditorContentOptions {
    /**
     * Placeholder for the empty editor.
     */
    placeholder: () => string | null;
    /**
     * Placeholder for empty checklist items.
     */
    checklistPlaceholder: () => string | null;
}

/**
 * The mention inputs `p-text-editor-mention-menu` carries, which take precedence over the root's
 * own so a page can configure the popover where it mounts it.
 */
export interface TextEditorMentionOptions {
    /**
     * Resolves candidates for the current query.
     */
    handler: () => TextEditorMentionHandler | undefined;
    /**
     * Field the candidates are filtered on.
     */
    filterField: () => string | undefined;
    /**
     * Renders the text inserted for a selected candidate.
     */
    template: () => TextEditorMentionTemplate | undefined;
}

/**
 * The upload inputs an overlay carries, which take precedence over the root's own.
 */
export interface TextEditorUploadOptions {
    /**
     * The upload transport.
     */
    handler: () => TextEditorUploadHandler | undefined;
    /**
     * Accepted file types.
     */
    allowedTypes: () => string | undefined;
    /**
     * Maximum number of files per selection.
     */
    maxFileCount: () => number | null | undefined;
    /**
     * Maximum size per file, in bytes.
     */
    maxFileSize: () => number | null | undefined;
    /**
     * Called with the files client-side validation turned away.
     */
    onReject: (event: TextEditorUploadRejectEvent) => void;
    /**
     * Called when the transport rejects.
     */
    onError: (event: TextEditorUploadErrorEvent) => void;
    /**
     * Called when the queue drains.
     */
    onComplete: () => void;
}

export type TextEditorPartName = 'toolbar' | 'content' | 'context-toolbar' | 'block-controls' | 'block-menu' | 'slash-menu' | 'mention-menu' | 'image-upload' | 'document-upload' | 'table-controls' | 'navigator';

/**
 * TextEditor is a compound rich text editor: the root owns the document, the commands and the
 * state, and every visible surface is a part the application fills with its own widgets.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-root',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (rootDef(); as def) {
            <ng-container *ngTemplateOutlet="def.template; context: rootSlotContext()" />
        } @else {
            <ng-content />
        }
        @if (name()) {
            <input type="hidden" [attr.name]="name()" [attr.required]="required() ? '' : null" [value]="hiddenInputValue()" />
        }
        <input #filePicker type="file" multiple class="p-text-editor-file-input" [attr.accept]="pickerAccept()" (change)="onFilesPicked($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        TextEditorStyle,
        TEXT_EDITOR_VALUE_ACCESSOR,
        { provide: PARENT_INSTANCE, useExisting: TextEditorRoot },
        {
            provide: TEXT_EDITOR_CONTEXT,
            useFactory: () => {
                const root = inject(TextEditorRoot);

                return {
                    commands: root.commands,
                    state: root.state,
                    pluginCommands: root.pluginCommands,
                    headings: root.headings,
                    value: root.value,
                    disabled: root.$disabled,
                    readonly: root.readonly,
                    getHTML: () => root.getHTML(),
                    getJSON: () => root.getJSON(),
                    getBlocks: () => root.getBlocks(),
                    getText: () => root.getText(),
                    getMarkdown: () => root.getMarkdown(),
                    setValue: (value: TextEditorValue) => root.setValue(value)
                };
            }
        }
    ],
    host: {
        '[class]': 'cx("root")',
        'data-scope': 'texteditor',
        'data-part': 'root',
        '[attr.data-id]': 'instanceId',
        '[attr.data-mode]': 'mode()',
        '[attr.data-disabled]': '$disabled() ? "" : null',
        '[attr.data-readonly]': 'readonly() ? "" : null',
        '(dragover)': 'onRootDragOver($event)',
        '(drop)': 'onRootDrop($event)'
    },
    hostDirectives: [Bind]
})
export class TextEditorRoot extends BaseEditableHolder<TextEditorPassThrough> {
    componentName = 'TextEditor';

    /** @internal */
    _componentStyle = inject(TextEditorStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /**
     * Per-instance id, stable across server and client renders.
     */
    readonly instanceId = `p-text-editor-${++instanceCount}`;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Editor value: an HTML string in classic mode, one HTML string per block in block mode.
     * Supports `[(value)]`.
     * @group Props
     */
    readonly value = model<TextEditorValue | undefined>(undefined);
    /**
     * Editor mode: `classic` for a toolbar editor, `block` for a Notion-like block editor.
     * @defaultValue 'classic'
     * @group Props
     */
    readonly mode = input<TextEditorMode>('classic');
    /**
     * Enables markdown input rules (e.g. `#` heading, `**bold**`, `-` list).
     * @defaultValue false
     * @group Props
     */
    readonly markdown = input(false, { transform: booleanAttribute });
    /**
     * Placeholder text displayed inside an empty editor.
     * @group Props
     */
    readonly placeholder = input<string | null>(null);
    /**
     * Placeholder text displayed inside empty checklist items.
     * @group Props
     */
    readonly checklistPlaceholder = input<string | null>(null);
    /**
     * Placeholder text displayed after `/` when slash commands are active.
     * @group Props
     */
    readonly slashPlaceholder = input<string | null>(null);
    /**
     * Keeps content selectable and copyable but blocks edits.
     * @defaultValue false
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Enables the document navigator minimap.
     * @defaultValue false
     * @group Props
     */
    readonly navigator = input(false, { transform: booleanAttribute });
    /**
     * Array of editor plugins. The set is frozen when the editor state is built, so every plugin
     * must be present on the initial render.
     * @group Props
     */
    readonly plugins = input<TextEditorPluginRegistration[]>([]);
    /**
     * Accessible name for the editor region (WCAG 4.1.2).
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined);
    /**
     * ID(s) of the element(s) labelling the editor region.
     * @group Props
     */
    readonly ariaLabelledby = input<string | undefined>(undefined);
    /**
     * Upload handler fallback used when the image and document handlers are not set.
     * @group Props
     */
    readonly uploadHandler = input<TextEditorUploadHandler | undefined>(undefined);
    /**
     * Image upload handler; takes precedence over `uploadHandler`.
     * @group Props
     */
    readonly imageUploadHandler = input<TextEditorUploadHandler | undefined>(undefined);
    /**
     * Document upload handler; takes precedence over `uploadHandler`.
     * @group Props
     */
    readonly documentUploadHandler = input<TextEditorUploadHandler | undefined>(undefined);
    /**
     * Accepted file types for image uploads.
     * @defaultValue 'image/*'
     * @group Props
     */
    readonly allowedImageTypes = input<string>(DEFAULT_IMAGE_TYPES);
    /**
     * Accepted file types for document uploads.
     * @defaultValue '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'
     * @group Props
     */
    readonly allowedDocumentTypes = input<string>(DEFAULT_DOCUMENT_TYPES);
    /**
     * Maximum number of images allowed per upload selection.
     * @group Props
     */
    readonly imageMaxFileCount = input<number | null>(null, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });
    /**
     * Maximum image file size in bytes per file.
     * @group Props
     */
    readonly imageMaxFileSize = input<number | null>(null, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });
    /**
     * Maximum number of documents allowed per upload selection.
     * @group Props
     */
    readonly documentMaxFileCount = input<number | null>(null, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });
    /**
     * Maximum document file size in bytes per file.
     * @defaultValue TEXT_EDITOR_FILE_SIZE.TEN_MB
     * @group Props
     */
    readonly documentMaxFileSize = input<number | null>(TEXT_EDITOR_FILE_SIZE.TEN_MB, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });
    /**
     * Handler for fetching mention suggestions. Receives the current query.
     * @group Props
     */
    readonly mentionHandler = input<TextEditorMentionHandler | undefined>(undefined);
    /**
     * Field name used to filter mention items.
     * @defaultValue 'name'
     * @group Props
     */
    readonly mentionFilterField = input<string>('name');
    /**
     * Template function rendering the text inserted for a selected mention.
     * @group Props
     */
    readonly mentionTemplate = input<TextEditorMentionTemplate | undefined>(undefined);
    /**
     * Minimum column width in pixels for table column resize.
     * @defaultValue 40
     * @group Props
     */
    readonly minTableColumnWidth = input(40, { transform: numberAttribute });
    /**
     * Default column width in pixels when inserting a new table or adding columns.
     * @defaultValue 120
     * @group Props
     */
    readonly defaultTableColumnWidth = input(120, { transform: numberAttribute });
    /**
     * Color applied by the one-click highlight toggle and the `==` input rule.
     * @defaultValue 'rgba(250, 204, 21, 0.4)'
     * @group Props
     */
    readonly defaultHighlightColor = input<string>('rgba(250, 204, 21, 0.4)');
    /**
     * Debounce, in milliseconds, applied to `valueChange`.
     * @defaultValue 0
     * @group Props
     */
    readonly valueChangeDebounce = input(0, { transform: numberAttribute });

    /**
     * Emitted once when the editor view is created and ready.
     * @group Emits
     */
    readonly editorCreate = output<void>();
    /**
     * Emitted when the editor gains focus.
     * @group Emits
     */
    readonly editorFocus = output<void>();
    /**
     * Emitted when the editor loses focus.
     * @group Emits
     */
    readonly editorBlur = output<void>();
    /**
     * Emitted when the selection changes without a document edit.
     * @group Emits
     */
    readonly selectionUpdate = output<void>();
    /**
     * Emitted when editor format state changes.
     * @group Emits
     */
    readonly formatStateChange = output<TextEditorFormatState>();
    /**
     * Emitted when an incoming value cannot be parsed; the editor falls back to an empty document.
     * @group Emits
     */
    readonly parseError = output<{ error: unknown }>();
    /**
     * Emitted when the context toolbar should be shown.
     * @group Emits
     */
    readonly contextToolbarRequest = output<CaretPosition>();
    /**
     * Emitted on every transaction while the slash menu is active.
     * @group Emits
     */
    readonly slashMenuRequest = output<{ active: boolean; text: string; position: CaretPosition | null }>();
    /**
     * Emitted on every transaction while a mention is active.
     * @group Emits
     */
    readonly mentionRequest = output<{ active: boolean; text: string; items: unknown[]; position: CaretPosition | null }>();
    /**
     * Emitted when document headings change.
     * @group Emits
     */
    readonly navigatorHeadingsChange = output<TextEditorHeadingEntry[]>();
    /**
     * Emitted when the navigator's active heading index changes during scrolling.
     * @group Emits
     */
    readonly navigatorActiveIndexChange = output<number>();
    /**
     * Emitted when the hovered block changes (block mode).
     * @group Emits
     */
    readonly blockHoverChange = output<{ element: HTMLElement | null; index: number }>();
    /**
     * Emitted when a block drag starts (block mode).
     * @group Emits
     */
    readonly blockDragStart = output<number>();
    /**
     * Emitted when a block drag ends (block mode).
     * @group Emits
     */
    readonly blockDragEnd = output<void>();
    /**
     * Emitted when the image upload placeholder is inserted and the upload UI should be shown.
     * @group Emits
     */
    readonly imageUploadRequest = output<void>();
    /**
     * Emitted when image upload entries change.
     * @group Emits
     */
    readonly imageUploadStateChange = output<UploadSlotEntry[]>();
    /**
     * Emitted when an image upload handler rejects.
     * @group Emits
     */
    readonly imageUploadError = output<TextEditorUploadErrorEvent>();
    /**
     * Emitted when all image uploads complete.
     * @group Emits
     */
    readonly imageUploadComplete = output<void>();
    /**
     * Emitted when images are rejected by client-side validation.
     * @group Emits
     */
    readonly imageReject = output<TextEditorUploadRejectEvent>();
    /**
     * Emitted when the document upload placeholder is inserted and the upload UI should be shown.
     * @group Emits
     */
    readonly documentUploadRequest = output<void>();
    /**
     * Emitted when document upload entries change.
     * @group Emits
     */
    readonly documentUploadStateChange = output<UploadSlotEntry[]>();
    /**
     * Emitted when a document upload handler rejects.
     * @group Emits
     */
    readonly documentUploadError = output<TextEditorUploadErrorEvent>();
    /**
     * Emitted when all document uploads complete.
     * @group Emits
     */
    readonly documentUploadComplete = output<void>();
    /**
     * Emitted when documents are rejected by client-side validation.
     * @group Emits
     */
    readonly documentReject = output<TextEditorUploadRejectEvent>();
    /**
     * Emitted when the table active state changes.
     * @group Emits
     */
    readonly tableActiveStateChange = output<TableActiveState | null>();
    /**
     * Emitted when the table overlay rect changes.
     * @group Emits
     */
    readonly tableOverlayRectChange = output<TableOverlayRect | null>();
    /**
     * Emitted when the table column trigger dot is clicked.
     * @group Emits
     */
    readonly tableColumnMenuRequest = output<{ colIndex: number; event: MouseEvent }>();
    /**
     * Emitted when the table row trigger dot is clicked.
     * @group Emits
     */
    readonly tableRowMenuRequest = output<{ rowIndex: number; event: MouseEvent }>();
    /**
     * Emitted when the table cell trigger dot is clicked.
     * @group Emits
     */
    readonly tableCellMenuRequest = output<MouseEvent>();

    readonly rootDef = contentChild(TextEditorRootDef);

    private readonly filePicker = viewChild<ElementRef<HTMLInputElement>>('filePicker');

    /**
     * The live view. Everything that touches the document goes through it, and everything is a
     * no-op until it exists - which is also what makes the whole surface safe to call during SSR.
     */
    private view: EditorView | null = null;

    private schema: Schema | null = null;

    private contentElement: HTMLElement | null = null;

    private contentOptions: TextEditorContentOptions | null = null;

    private mentionOptions: TextEditorMentionOptions | null = null;

    private readonly uploadOptions: Partial<Record<TextEditorUploadKind, TextEditorUploadOptions>> = {};

    private readonly mountedParts = signal(new Set<TextEditorPartName>());

    private readonly focused = signal(false);

    private readonly formatState = signal<TextEditorFormatState>({});

    private readonly headingEntries = signal<TextEditorHeadingEntry[]>([]);

    private readonly pluginCommandMap = signal<TextEditorPluginCommands>({});

    private readonly hoveredBlock = signal(-1);

    private readonly hoveredElement = signal<HTMLElement | null>(null);

    private readonly blockMenuRequest = signal<{ index: number; anchor: HTMLElement | null } | null>(null);

    private readonly blockControlsHovered = signal(false);

    private blockHoverTimer: ReturnType<typeof setTimeout> | null = null;

    private readonly draggedBlock = signal<number | null>(null);

    private readonly dropIndicator = signal<number | null>(null);

    private readonly typeahead = signal<{ trigger: 'slash' | 'mention' | null; active: boolean; text: string; position: CaretPosition | null }>({ trigger: null, active: false, text: '', position: null });

    private readonly mentionItems = signal<unknown[]>([]);

    private readonly typeaheadBlock = signal(-1);

    private readonly overlayRect = signal<TableOverlayRect | null>(null);

    private readonly contextCaret = signal<CaretPosition | null>(null);

    private readonly contextRangeKey = signal<string | null>(null);

    private readonly tableState = signal<TableActiveState | null>(null);

    private readonly tableColumnMenu = signal<{ colIndex: number; anchor: HTMLElement | null } | null>(null);

    private readonly tableRowMenu = signal<{ rowIndex: number; anchor: HTMLElement | null } | null>(null);

    private readonly tableCellMenu = signal<{ anchor: HTMLElement | null } | null>(null);

    private readonly imageUploads = signal<UploadSlotEntry[]>([]);

    private readonly documentUploads = signal<UploadSlotEntry[]>([]);

    private readonly openUploads = signal<Record<TextEditorUploadKind, boolean>>({ image: false, document: false });

    private pickerKind: TextEditorUploadKind = 'image';

    /**
     * File types the shared native picker accepts, switched with the overlay it was opened for.
     *
     * @internal
     */
    readonly pickerAccept = signal<string>(DEFAULT_IMAGE_TYPES);

    private lastEmitted: TextEditorValue | undefined;

    private valueChangeTimer: ReturnType<typeof setTimeout> | null = null;

    private mentionRequestId = 0;

    private pluginCleanups: Array<() => void> = [];

    private readonly imageQueue = new UploadQueue({
        kind: 'image',
        handler: () => this.uploadOptions.image?.handler() ?? this.imageUploadHandler() ?? this.uploadHandler(),
        onChange: (entries) => {
            this.imageUploads.set(entries);
            this.imageUploadStateChange.emit(entries);
        },
        onUploaded: (_file, url) => this.insertUploaded('imageUploadPlaceholder', (schema) => schema.nodes['image']?.createAndFill({ src: url }) ?? null),
        onError: (file, error) => {
            this.imageUploadError.emit({ file, error });
            this.uploadOptions.image?.onError({ file, error });
        },
        onComplete: () => {
            this.removePlaceholder('imageUploadPlaceholder');
            this.setUploadOpen('image', false);
            this.imageUploadComplete.emit();
            this.uploadOptions.image?.onComplete();
        }
    });

    private readonly documentQueue = new UploadQueue({
        kind: 'document',
        handler: () => this.uploadOptions.document?.handler() ?? this.documentUploadHandler() ?? this.uploadHandler(),
        onChange: (entries) => {
            this.documentUploads.set(entries);
            this.documentUploadStateChange.emit(entries);
        },
        onUploaded: (file, url) =>
            this.insertUploaded('documentUploadPlaceholder', (schema) => {
                const link = schema.marks['link'];
                const paragraph = schema.nodes['paragraph'];

                if (!link || !paragraph || !isSafeLinkHref(url)) return null;

                return paragraph.create(null, schema.text(file.name, [link.create({ href: url })]));
            }),
        onError: (file, error) => {
            this.documentUploadError.emit({ file, error });
            this.uploadOptions.document?.onError({ file, error });
        },
        onComplete: () => {
            this.removePlaceholder('documentUploadPlaceholder');
            this.setUploadOpen('document', false);
            this.documentUploadComplete.emit();
            this.uploadOptions.document?.onComplete();
        }
    });

    /**
     * The imperative command surface, rebuilt only when the view is replaced.
     */
    readonly commands = signal<TextEditorCommands>(
        createTextEditorCommands({
            getView: () => this.view,
            requestImageUpload: () => this.openUpload('image'),
            requestDocumentUpload: () => this.openUpload('document'),
            print: () => this.printDocument(),
            defaultHighlightColor: () => this.defaultHighlightColor(),
            defaultTableColumnWidth: () => this.defaultTableColumnWidth()
        })
    );

    /**
     * The formatting snapshot at the current selection.
     */
    readonly state = this.formatState.asReadonly();

    /**
     * The document's heading outline.
     */
    readonly headings = this.headingEntries.asReadonly();

    /**
     * Commands contributed by plugins, namespaced by plugin name.
     */
    readonly pluginCommands = this.pluginCommandMap.asReadonly();

    /**
     * Value carried by the hidden input a native `<form>` submits.
     */
    readonly hiddenInputValue = computed(() => {
        const value = this.value();

        return Array.isArray(value) ? value.join('') : (value ?? '');
    });

    /**
     * The slot surface handed to `pTextEditorRootDef`.
     */
    readonly rootSlotContext = computed(() => {
        const props = {
            state: this.formatState(),
            commands: this.commands(),
            pluginCommands: this.pluginCommandMap(),
            headings: this.headingEntries(),
            value: this.value(),
            disabled: !!this.$disabled(),
            readonly: this.readonly(),
            getHTML: () => this.getHTML(),
            getJSON: () => this.getJSON(),
            getBlocks: () => this.getBlocks(),
            getText: () => this.getText(),
            getMarkdown: () => this.getMarkdown(),
            setValue: (value: TextEditorValue) => this.setValue(value)
        };

        return { ...props, $implicit: props };
    });

    constructor() {
        super();

        /* A value set from the outside lands in the document; the value the editor itself just
           emitted does not, or the round trip would loop. */
        effect(() => {
            const value = this.value();

            untracked(() => {
                if (!this.view || this.sameAsEmitted(value)) return;

                this.applyValue(value);
            });
        });

        effect(() => {
            const disabled = !!this.$disabled();
            const readonly = this.readonly();

            untracked(() => {
                void disabled;
                void readonly;
                this.refreshEditable();
            });
        });

        effect(() => {
            const markdown = this.markdown();

            untracked(() => {
                void markdown;
                this.refreshMarkdown();
            });
        });

        /* Mode decides the shape of the value and the plugin set, so it is the one input that
           genuinely needs the view rebuilt. */
        effect(() => {
            const mode = this.mode();

            untracked(() => {
                void mode;

                if (this.view) this.createView();
            });
        });
    }

    onDestroy(): void {
        /* Both timers outlive the component otherwise, and both write signals when they fire. */
        if (this.valueChangeTimer) clearTimeout(this.valueChangeTimer);

        if (this.blockHoverTimer) clearTimeout(this.blockHoverTimer);

        this.valueChangeTimer = null;
        this.blockHoverTimer = null;
        this.destroyView();
    }

    /**
     * Called by `p-text-editor-content` once its editable region exists. The view is created here
     * rather than in the root's own lifecycle, because the root has no DOM of its own to mount in.
     *
     * @internal
     */
    registerContentElement(element: HTMLElement | null, options?: TextEditorContentOptions): void {
        this.contentElement = element;
        this.contentOptions = options ?? null;

        if (element && isPlatformBrowser(this.platformId)) this.createView();
        else if (!element) this.destroyView();
    }

    /**
     * Registers a mounted part. A part turns its feature on by existing, so the runtime reads the
     * mounted set instead of a parallel list of inputs.
     *
     * @internal
     */
    registerPart(part: TextEditorPartName): () => void {
        this.mountedParts.update((parts) => new Set(parts).add(part));

        return () =>
            this.mountedParts.update((parts) => {
                const next = new Set(parts);

                next.delete(part);

                return next;
            });
    }

    /**
     * Registers the mention popover's own inputs.
     *
     * @internal
     */
    registerMentionOptions(options: TextEditorMentionOptions | null): void {
        this.mentionOptions = options;
    }

    /**
     * Registers one upload overlay's own inputs.
     *
     * @internal
     */
    registerUploadOptions(kind: TextEditorUploadKind, options: TextEditorUploadOptions | null): void {
        if (options) this.uploadOptions[kind] = options;
        else delete this.uploadOptions[kind];
    }

    /**
     * Whether the given part is mounted.
     *
     * @internal
     */
    hasPart(part: TextEditorPartName): boolean {
        return this.mountedParts().has(part);
    }

    /******************** Public API ********************/

    /**
     * Returns the live ProseMirror EditorView, or null before mount.
     *
     * @group Method
     */
    getView(): EditorView | null {
        return this.view;
    }

    /**
     * Returns the current ProseMirror EditorState, or null before mount.
     *
     * @group Method
     */
    getState(): EditorState | null {
        return this.view?.state ?? null;
    }

    /**
     * Returns the editor's content DOM element, or null before mount.
     *
     * @group Method
     */
    getEditorElement(): HTMLElement | null {
        return (this.view?.dom as HTMLElement | undefined) ?? null;
    }

    /**
     * Returns the full set of imperative editing commands.
     *
     * @group Method
     */
    getCommands(): TextEditorCommands {
        return this.commands();
    }

    /**
     * Serializes the current document to HTML.
     *
     * @group Method
     */
    getHTML(): string {
        if (!this.view || !this.schema) return typeof this.value() === 'string' ? (this.value() as string) : '';

        return serializeHtml(this.schema, this.view.state.doc, this.document);
    }

    /**
     * The ProseMirror document as JSON (loss-less).
     *
     * @group Method
     */
    getJSON(): unknown {
        return this.view?.state.doc.toJSON() ?? { type: 'doc', content: [] };
    }

    /**
     * Serializes as the array-of-block-HTML representation used by block mode.
     *
     * @group Method
     */
    getBlocks(): string[] {
        if (!this.view || !this.schema) return Array.isArray(this.value()) ? (this.value() as string[]) : [];

        return serializeBlocks(this.schema, this.view.state.doc, this.document);
    }

    /**
     * Plain-text projection of the document.
     *
     * @group Method
     */
    getText(): string {
        return this.view ? serializeText(this.view.state.doc) : '';
    }

    /**
     * Markdown projection of the document.
     *
     * @group Method
     */
    getMarkdown(): string {
        return this.view ? serializeMarkdown(this.view.state.doc) : '';
    }

    /**
     * Returns the plain text of the current selection.
     *
     * @group Method
     */
    getSelectedText(): string {
        if (!this.view) return '';

        const { from, to } = this.view.state.selection;

        return this.view.state.doc.textBetween(from, to, ' ');
    }

    /**
     * Replaces the editor content with the given value.
     *
     * @group Method
     */
    setValue(value: TextEditorValue): void {
        this.applyValue(value);
    }

    /**
     * Replaces the current selection with the given content, optionally interpreted as HTML.
     *
     * @group Method
     */
    replaceSelection(content: string, asHtml = false): void {
        if (!this.view || !this.schema) return;

        const { state } = this.view;

        if (!asHtml) {
            this.view.dispatch(state.tr.insertText(content));

            return;
        }

        this.view.dispatch(state.tr.replaceSelection(parseHtmlSlice(this.schema, content, this.document)).scrollIntoView());
    }

    /**
     * Runs a ProseMirror command against the editor; returns whether it applied.
     *
     * @group Method
     */
    runCommand(command: Command): boolean {
        if (!this.view) return false;

        return command(this.view.state, this.view.dispatch, this.view);
    }

    /**
     * Attaches a ProseMirror plugin to the live editor; returns a remover function.
     *
     * @group Method
     */
    registerProseMirrorPlugin(plugin: Plugin): () => void {
        if (!this.view) return () => undefined;

        const view = this.view;

        view.updateState(view.state.reconfigure({ plugins: [...view.state.plugins, plugin] }));

        return () => {
            if (!this.view) return;

            this.view.updateState(this.view.state.reconfigure({ plugins: this.view.state.plugins.filter((entry) => entry !== plugin) }));
        };
    }

    /**
     * Re-applies the ProseMirror `editable` predicate after `disabled` or `readonly` changed.
     *
     * @group Method
     */
    refreshEditable(): void {
        this.view?.setProps({ editable: () => this.isEditable() });
    }

    /**
     * Adds or removes the markdown input-rules plugin live after the `markdown` input changed.
     *
     * @group Method
     */
    refreshMarkdown(): void {
        if (!this.view || !this.schema) return;

        const rules = markdownInputRules(this.schema, () => this.defaultHighlightColor());
        const withoutRules = this.view.state.plugins.filter((plugin) => !(plugin.spec as { markdownRules?: boolean }).markdownRules);

        if (!this.markdown()) {
            this.view.updateState(this.view.state.reconfigure({ plugins: withoutRules }));

            return;
        }

        (rules.spec as { markdownRules?: boolean }).markdownRules = true;
        this.view.updateState(this.view.state.reconfigure({ plugins: [...withoutRules, rules] }));
    }

    /**
     * Visually preserves the current selection while focus moves to external UI, such as a colour
     * input in the toolbar.
     *
     * @group Method
     */
    preserveSelection(): void {
        this.getEditorElement()?.classList.add('p-text-editor-selection-preserved');
    }

    /**
     * Points the editor's `aria-activedescendant` at the active option of an open type-ahead menu.
     *
     * @group Method
     */
    setComboboxActiveDescendant(id: string | null): void {
        const element = this.getEditorElement();

        if (!element) return;

        /* While a type-ahead is open the editing region is a combobox pointing at the highlighted
           option; when it closes it goes back to being a plain textbox. */
        if (id) {
            element.setAttribute('aria-activedescendant', id);
            element.setAttribute('role', 'combobox');
            element.setAttribute('aria-autocomplete', 'list');
            element.setAttribute('aria-expanded', 'true');

            return;
        }

        element.removeAttribute('aria-activedescendant');
        element.removeAttribute('aria-autocomplete');
        element.removeAttribute('aria-expanded');
        element.setAttribute('role', 'textbox');
    }

    /**
     * Returns all headings in the document, used by the navigator minimap.
     *
     * @group Method
     */
    getDocumentHeadings(): TextEditorHeadingEntry[] {
        return this.view ? collectHeadings(this.view.state.doc) : [];
    }

    /**
     * Scrolls the heading at the given position into view.
     *
     * @group Method
     */
    scrollToHeading(pos: number, headings: TextEditorHeadingEntry[] = this.headingEntries()): void {
        if (!this.view) return;

        const node = this.view.nodeDOM(pos) as HTMLElement | null;

        node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.updateActiveHeading(headings);
    }

    /**
     * Moves focus to the heading at the given document position.
     *
     * @group Method
     */
    focusHeading(pos: number): void {
        if (!this.view) return;

        this.view.dispatch(this.view.state.tr.setSelection(TextSelection.near(this.view.state.doc.resolve(pos + 1))));
        this.view.focus();
    }

    /**
     * Recomputes which heading is currently active based on scroll position.
     *
     * @group Method
     */
    updateActiveHeading(headings: TextEditorHeadingEntry[] = this.headingEntries()): void {
        if (!this.view || !headings.length) return;

        const top = this.getEditorElement()?.getBoundingClientRect().top ?? 0;
        let active = 0;

        headings.forEach((heading, index) => {
            const node = this.view?.nodeDOM(heading.pos) as HTMLElement | null;

            if (node && node.getBoundingClientRect().top - top <= 8) active = index;
        });

        if (active !== this.activeHeadingIndex()) {
            this.activeHeading.set(active);
            this.navigatorActiveIndexChange.emit(active);
        }
    }

    /**
     * Internal handler invoked on navigator scroll to sync the active heading.
     *
     * @group Method
     */
    onNavigatorScroll(headings: TextEditorHeadingEntry[] = this.headingEntries()): void {
        this.updateActiveHeading(headings);
    }

    private readonly activeHeading = signal(0);

    /**
     * Index of the heading currently in view.
     *
     * @internal
     */
    readonly activeHeadingIndex = this.activeHeading.asReadonly();

    /******************** Block mode ********************/

    /**
     * Returns the block type name at the given index (block mode).
     *
     * @group Method
     */
    getBlockType(index: number): string {
        return this.view ? blockTypeAt(this.view, index) : 'text';
    }

    /**
     * Inserts a new empty block immediately after the block at the given index (block mode).
     *
     * @group Method
     */
    addBlockAfter(index: number): void {
        if (this.view) addBlockAfter(this.view, index);
    }

    /**
     * Moves a block from one index to another, reordering the document (block mode).
     *
     * @group Method
     */
    moveBlock(fromIndex: number, toIndex: number): void {
        if (this.view) moveBlock(this.view, fromIndex, toIndex);
    }

    /**
     * Internal handler invoked when a block drag starts (block mode).
     *
     * @group Method
     */
    onBlockDragStart(index: number, event: DragEvent): void {
        this.draggedBlock.set(index);
        this.dropIndicator.set(null);
        /* An empty payload makes some browsers cancel the drag before it starts, and the index is
           the only thing a drop needs to know. */
        event.dataTransfer?.setData('text/plain', String(index));

        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';

        this.refreshDecorations();
        this.blockDragStart.emit(index);
    }

    /**
     * Internal handler invoked when a block drag ends (block mode).
     *
     * @group Method
     */
    onBlockDragEnd(): void {
        /* A drop applies the move; reaching here with the drag still open means the drag was
           cancelled - Escape, or a release outside the editor - and the last indicator the pointer
           happened to travel over must not reorder anything. */
        if (this.draggedBlock() == null) return;

        this.draggedBlock.set(null);
        this.dropIndicator.set(null);
        this.refreshDecorations();
        this.blockDragEnd.emit();
    }

    /**
     * Moves the dragged block to the indicator's position and clears the drag state.
     */
    private applyBlockDrop(from: number, clientY?: number): void {
        const to = this.dropIndicator() ?? (clientY != null ? this.dropIndexAt(clientY) : null);

        this.draggedBlock.set(null);
        this.dropIndicator.set(null);

        if (to != null) this.moveBlock(from, to);
        else this.refreshDecorations();

        this.blockDragEnd.emit();
    }

    /**
     * Returns the command set for the block handle menu at the given block index (block mode).
     *
     * @group Method
     */
    getBlockMenuCommands(blockIndex: number, onDismiss: () => void): TextEditorBlockMenuCommands {
        return createBlockMenuCommands(
            () => this.view,
            () => blockIndex,
            onDismiss
        );
    }

    /******************** Type-ahead menus ********************/

    /**
     * Returns the command set for the slash menu at the given block index.
     *
     * @group Method
     */
    getSlashMenuCommands(blockIndex: number, onDismiss: () => void): TextEditorSlashMenuCommands {
        const withClear = (action: () => void) => () => {
            if (this.view) {
                clearTypeahead(this.view);
                this.focusBlock(blockIndex);
            }

            action();
            onDismiss();
        };
        const commands = this.commands();

        return {
            text: withClear(() => commands.paragraph()),
            heading: (level: number) => withClear(() => commands.heading(level))(),
            bulletList: withClear(() => commands.bulletList()),
            orderedList: withClear(() => commands.orderedList()),
            checkList: withClear(() => commands.checkList()),
            blockquote: withClear(() => commands.blockquote()),
            code: withClear(() => commands.codeBlock()),
            divider: withClear(() => commands.insertHorizontalRule()),
            table: withClear(() => commands.table()),
            uploadImages: withClear(() => commands.uploadImages()),
            uploadDocuments: withClear(() => commands.uploadDocuments())
        };
    }

    /**
     * Puts the caret inside a top-level block, so a command picked from a menu acts on the block the
     * menu belongs to even when the selection drifted while the menu was open.
     */
    private focusBlock(index: number): void {
        if (!this.view || index < 0 || index >= this.view.state.doc.childCount) return;

        let pos = 0;

        this.view.state.doc.forEach((node, offset, childIndex) => {
            if (childIndex === index) pos = offset;
        });

        const node = this.view.state.doc.child(index);

        if (!node.isTextblock && node.type.name !== 'blockquote') return;

        this.view.dispatch(this.view.state.tr.setSelection(TextSelection.near(this.view.state.doc.resolve(pos + 1))));
    }

    /**
     * Returns the command set for the mention popup.
     *
     * @group Method
     */
    getMentionCommands(onDismiss: () => void, options: { filterField: string; template: (data: unknown) => string }): TextEditorMentionCommands {
        return {
            select: (data: unknown) => {
                if (!this.view || !this.schema) return;

                const label = options.template(data);
                const mention = this.schema.nodes['mention'];

                clearTypeahead(this.view);

                if (mention) {
                    const node = mention.create({ label, data });

                    this.view.dispatch(this.view.state.tr.replaceSelectionWith(node, false).insertText(' '));
                }

                onDismiss();
                this.view.focus();
            }
        };
    }

    /**
     * Filters mention items by the given field and filter text.
     *
     * @group Method
     */
    getFilteredMentionItems(items: unknown[], filterField: string, filterText: string): unknown[] {
        const query = (filterText ?? '').toLowerCase();

        if (!query) return items;

        return items.filter((item) =>
            String((item as Record<string, unknown>)?.[filterField] ?? '')
                .toLowerCase()
                .includes(query)
        );
    }

    /******************** Tables ********************/

    /**
     * Returns the active table state when the cursor is inside a table, or null otherwise.
     *
     * @group Method
     */
    getTableActiveState(): TableActiveState | null {
        return this.view ? tableActiveState(this.view) : null;
    }

    /**
     * Returns the geometry used to position the table editing overlay, or null when not in a table.
     *
     * @group Method
     */
    getTableOverlayRect(): TableOverlayRect | null {
        return this.overlayRect();
    }

    /**
     * Recomputes and emits the table overlay rect.
     *
     * @group Method
     */
    updateTableOverlayRect(): void {
        const rect = this.view ? tableOverlayRect(this.view) : null;

        this.overlayRect.set(rect);
        this.tableOverlayRectChange.emit(rect);
    }

    /**
     * Returns true when more than one table cell is currently selected.
     *
     * @group Method
     */
    getIsMultiCellSelected(): boolean {
        return this.view ? isMultiCellSelected(this.view.state) : false;
    }

    /**
     * Returns true when the active cell is a merged cell.
     *
     * @group Method
     */
    getIsCellMerged(): boolean {
        return this.view ? isCellMerged(this.view.state) : false;
    }

    /**
     * Returns the command set for the active table column.
     *
     * @group Method
     */
    getTableColumnCommands(colIndex: number, onDismiss: () => void): TextEditorTableColumnCommands {
        return createTableColumnCommands(
            () => this.view,
            () => colIndex,
            onDismiss
        );
    }

    /**
     * Returns the command set for the active table row.
     *
     * @group Method
     */
    getTableRowCommands(rowIndex: number, onDismiss: () => void): TextEditorTableRowCommands {
        return createTableRowCommands(
            () => this.view,
            () => rowIndex,
            onDismiss
        );
    }

    /**
     * Returns the command set for the active table cell (or multi-cell selection).
     *
     * @group Method
     */
    getTableCellCommands(onDismiss: () => void): TextEditorTableCellCommands {
        return createTableCellCommands(() => this.view, onDismiss);
    }

    /**
     * Adds a row to the given table element at the current cursor position.
     *
     * @group Method
     */
    onTableAddRow(table: HTMLTableElement): void {
        void table;
        createTableControlsCommands(() => this.view).addRow();
    }

    /**
     * Adds a column to the given table element at the current cursor position.
     *
     * @group Method
     */
    onTableAddColumn(table: HTMLTableElement): void {
        void table;
        createTableControlsCommands(() => this.view).addColumn();
    }

    /******************** Uploads ********************/

    /**
     * Filters out files that fail image validation, returning the accepted ones.
     *
     * @group Method
     */
    validateImageFiles(files: File[]): File[] {
        const options = this.uploadOptions.image;
        const result = validateFiles(files, {
            allowedTypes: options?.allowedTypes() ?? this.allowedImageTypes(),
            maxFileCount: options?.maxFileCount() ?? this.imageMaxFileCount(),
            maxFileSize: options?.maxFileSize() ?? this.imageMaxFileSize()
        });

        if (result.reason) {
            this.imageReject.emit({ files: result.rejected, reason: result.reason });
            options?.onReject({ files: result.rejected, reason: result.reason });
        }

        return result.accepted;
    }

    /**
     * Filters out files that fail document validation, returning the accepted ones.
     *
     * @group Method
     */
    validateDocumentFiles(files: File[]): File[] {
        const options = this.uploadOptions.document;
        const result = validateFiles(files, {
            allowedTypes: options?.allowedTypes() ?? this.allowedDocumentTypes(),
            maxFileCount: options?.maxFileCount() ?? this.documentMaxFileCount(),
            maxFileSize: options?.maxFileSize() ?? this.documentMaxFileSize()
        });

        if (result.reason) {
            this.documentReject.emit({ files: result.rejected, reason: result.reason });
            options?.onReject({ files: result.rejected, reason: result.reason });
        }

        return result.accepted;
    }

    /**
     * Starts uploading the given image files and inserts an upload placeholder.
     *
     * @group Method
     */
    startImageUploads(files: File[]): void {
        const accepted = this.validateImageFiles(files);

        if (!accepted.length) return;

        this.insertPlaceholder('imageUploadPlaceholder');
        this.imageUploadRequest.emit();
        this.imageQueue.start(accepted);
    }

    /**
     * Starts uploading the given document files and inserts an upload placeholder.
     *
     * @group Method
     */
    startDocumentUploads(files: File[]): void {
        const accepted = this.validateDocumentFiles(files);

        if (!accepted.length) return;

        this.insertPlaceholder('documentUploadPlaceholder');
        this.documentUploadRequest.emit();
        this.documentQueue.start(accepted);
    }

    /**
     * Cancels any in-progress image uploads and clears the upload UI.
     *
     * @group Method
     */
    dismissImageUpload(): void {
        this.imageQueue.dismiss();
        this.removePlaceholder('imageUploadPlaceholder');
        this.setUploadOpen('image', false);
    }

    /**
     * Cancels any in-progress document uploads and clears the upload UI.
     *
     * @group Method
     */
    dismissDocumentUpload(): void {
        this.documentQueue.dismiss();
        this.removePlaceholder('documentUploadPlaceholder');
        this.setUploadOpen('document', false);
    }

    /**
     * The upload entries of one overlay.
     *
     * @internal
     */
    uploadEntries(kind: TextEditorUploadKind) {
        return kind === 'image' ? this.imageUploads : this.documentUploads;
    }

    /**
     * Whether one overlay is open. The overlays are opened by a command or by a drop, not by being
     * mounted: a dropzone permanently on screen would take a third of the editor with it.
     *
     * @internal
     */
    isUploadOpen(kind: TextEditorUploadKind): boolean {
        return this.openUploads()[kind];
    }

    /**
     * Opens or closes one overlay.
     *
     * @internal
     */
    setUploadOpen(kind: TextEditorUploadKind, open: boolean): void {
        this.openUploads.update((state) => ({ ...state, [kind]: open }));
    }

    /**
     * Opens the file picker for one overlay.
     *
     * @internal
     */
    openUpload(kind: TextEditorUploadKind): void {
        this.pickerKind = kind;
        const options = this.uploadOptions[kind];

        this.pickerAccept.set(options?.allowedTypes() ?? (kind === 'image' ? this.allowedImageTypes() : this.allowedDocumentTypes()));

        if (kind === 'image') this.imageUploadRequest.emit();
        else this.documentUploadRequest.emit();

        /* The native picker is the fallback: with an overlay mounted, the application owns the
           interaction, and opening a system dialog on top of it would fight the UI it chose. */
        if (this.hasPart(kind === 'image' ? 'image-upload' : 'document-upload')) {
            this.setUploadOpen(kind, true);

            return;
        }

        this.filePicker()?.nativeElement.click();
    }

    /**
     * Handles a file selection from the shared native picker.
     *
     * @internal
     */
    onFilesPicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);

        input.value = '';

        if (!files.length) return;

        if (this.pickerKind === 'image') this.startImageUploads(files);
        else this.startDocumentUploads(files);
    }

    /******************** Internal state readers ********************/

    /**
     * State of the open type-ahead, read by the slash and mention parts.
     *
     * @internal
     */
    readonly typeaheadState = this.typeahead.asReadonly();

    /**
     * Index of the block the open type-ahead was triggered in.
     *
     * @internal
     */
    readonly typeaheadBlockIndex = this.typeaheadBlock.asReadonly();

    /**
     * Candidates resolved for the open mention.
     *
     * @internal
     */
    readonly mentionCandidates = this.mentionItems.asReadonly();

    /**
     * Index of the hovered block, read by the block controls.
     *
     * @internal
     */
    readonly hoveredBlockIndex = this.hoveredBlock.asReadonly();

    /**
     * The hovered block's element, which the hover bar positions itself against.
     *
     * @internal
     */
    readonly hoveredBlockElement = this.hoveredElement.asReadonly();

    /**
     * Which block the handle menu was opened from, and the handle it is anchored to.
     *
     * @internal
     */
    readonly blockMenuAnchor = this.blockMenuRequest.asReadonly();

    /**
     * Tracks the hovered block, and keeps the hover bar up while the pointer is on the bar itself.
     *
     * The bar lives outside the block it belongs to, so moving the pointer onto it would otherwise
     * read as leaving the block - and the handle would disappear under the cursor on the way to it.
     */
    private setHoveredBlock(element: HTMLElement | null, index: number): void {
        if (this.blockHoverTimer) clearTimeout(this.blockHoverTimer);

        if (index >= 0) {
            this.hoveredBlock.set(index);
            this.hoveredElement.set(element);
            this.blockHoverChange.emit({ element, index });

            return;
        }

        this.blockHoverTimer = setTimeout(() => {
            if (this.blockControlsHovered() || this.draggedBlock() != null || this.blockMenuRequest()) return;

            this.hoveredBlock.set(-1);
            this.hoveredElement.set(null);
            this.blockHoverChange.emit({ element: null, index: -1 });
        }, 150);
    }

    /**
     * Reports whether the pointer is on the hover bar, which keeps it from hiding itself.
     *
     * @internal
     */
    setBlockControlsHovered(hovered: boolean): void {
        this.blockControlsHovered.set(hovered);

        if (!hovered) this.setHoveredBlock(null, -1);
    }

    /**
     * Opens the block handle menu for one block.
     *
     * @internal
     */
    openBlockMenu(index: number, anchor: HTMLElement | null): void {
        this.blockMenuRequest.set({ index, anchor });
    }

    /**
     * Closes the block handle menu.
     *
     * @internal
     */
    closeBlockMenu(): void {
        this.blockMenuRequest.set(null);
    }

    /**
     * Geometry of the active table, read by the table parts.
     *
     * @internal
     */
    readonly tableRect = this.overlayRect.asReadonly();

    /**
     * Caret the floating context toolbar anchors to, or null when there is no selection to format.
     *
     * @internal
     */
    readonly contextToolbarPosition = this.contextCaret.asReadonly();

    /**
     * Identifies the selection the floating toolbar belongs to, so a widget can remember that the
     * user dismissed it for THIS selection without depending on the caret object staying the same -
     * it is re-measured whenever the page scrolls.
     *
     * @internal
     */
    readonly contextSelectionKey = this.contextRangeKey.asReadonly();

    /**
     * Row and column geometry of the active table, read by the overlay and the table menus.
     *
     * @internal
     */
    readonly activeTable = this.tableState.asReadonly();

    /**
     * Which column menu is open, and the trigger it is anchored to.
     *
     * @internal
     */
    readonly columnMenuAnchor = this.tableColumnMenu.asReadonly();

    /**
     * Which row menu is open, and the trigger it is anchored to.
     *
     * @internal
     */
    readonly rowMenuAnchor = this.tableRowMenu.asReadonly();

    /**
     * Whether the cell menu is open, and the trigger it is anchored to.
     *
     * @internal
     */
    readonly cellMenuAnchor = this.tableCellMenu.asReadonly();

    /**
     * Opens the column menu from its trigger dot.
     *
     * @internal
     */
    openTableColumnMenu(colIndex: number, event: MouseEvent): void {
        this.tableColumnMenu.set({ colIndex, anchor: event.currentTarget as HTMLElement });
        this.tableColumnMenuRequest.emit({ colIndex, event });
    }

    /**
     * Opens the row menu from its trigger dot.
     *
     * @internal
     */
    openTableRowMenu(rowIndex: number, event: MouseEvent): void {
        this.tableRowMenu.set({ rowIndex, anchor: event.currentTarget as HTMLElement });
        this.tableRowMenuRequest.emit({ rowIndex, event });
    }

    /**
     * Opens the cell menu from its trigger dot.
     *
     * @internal
     */
    openTableCellMenu(event: MouseEvent): void {
        this.tableCellMenu.set({ anchor: event.currentTarget as HTMLElement });
        this.tableCellMenuRequest.emit(event);
    }

    /**
     * Closes every table menu.
     *
     * @internal
     */
    closeTableMenus(): void {
        this.tableColumnMenu.set(null);
        this.tableRowMenu.set(null);
        this.tableCellMenu.set(null);
    }

    /**
     * Whether the editor is rendered right to left, read from the document rather than from an
     * input: direction is inherited, and an editor inside an RTL page is RTL.
     *
     * @internal
     */
    isRtl(): boolean {
        if (!isPlatformBrowser(this.platformId)) return false;

        return this.document.defaultView?.getComputedStyle(this.el.nativeElement).direction === 'rtl';
    }

    /**
     * Whether the editor accepts edits.
     *
     * @internal
     */
    isEditable(): boolean {
        return !this.$disabled() && !this.readonly();
    }

    /******************** View lifecycle ********************/

    private createView(): void {
        if (!this.contentElement || !isPlatformBrowser(this.platformId)) return;

        this.destroyView();

        const pluginNodes: Record<string, NodeSpec> = {};
        const pluginMarks: Record<string, MarkSpec> = {};
        const registrations = this.plugins() ?? [];

        for (const registration of registrations) {
            const plugin = Array.isArray(registration) ? registration[0] : registration;

            Object.assign(pluginNodes, plugin.options?.schema?.nodes ?? {});
            Object.assign(pluginMarks, plugin.options?.schema?.marks ?? {});
        }

        const schema = createTextEditorSchema(pluginNodes, pluginMarks);

        this.schema = schema;

        const doc = this.parseValue(this.value(), schema);
        const plugins = this.buildPlugins(schema, registrations);
        const state = EditorState.create({ doc, plugins });

        this.view = new EditorView(this.contentElement, {
            state,
            editable: () => this.isEditable(),
            attributes: {
                class: 'p-text-editor-content',
                'data-scope': 'texteditor',
                'data-part': 'content',
                role: 'textbox',
                'aria-multiline': 'true',
                ...(this.ariaLabel() ? { 'aria-label': this.ariaLabel()! } : {}),
                ...(this.ariaLabelledby() ? { 'aria-labelledby': this.ariaLabelledby()! } : {}),
                ...(this.isEditable() ? {} : { 'aria-readonly': 'true' })
            },
            nodeViews: {
                checkListItem: (node, view, getPos) => new CheckListItemView(node, view, getPos)
            },
            /* Copying out of the editor puts markdown on the clipboard, through the same serializer
               `getMarkdown()` uses, so a document pasted into a markdown field keeps its structure
               instead of arriving as one flat line. */
            clipboardTextSerializer: (slice) => {
                try {
                    return serializeMarkdown(schema.topNodeType.create(null, slice.content));
                } catch {
                    return slice.content.textBetween(0, slice.content.size, '\n\n');
                }
            },
            handleDOMEvents: {
                focus: () => {
                    this.focused.set(true);
                    this.getEditorElement()?.classList.remove('p-text-editor-selection-preserved');
                    this.editorFocus.emit();

                    return false;
                },
                blur: () => {
                    this.focused.set(false);
                    this.editorBlur.emit();

                    return false;
                },
                drop: (view, event) => this.handleDrop(event),
                dragover: (view, event) => this.handleDragOver(event)
            },
            dispatchTransaction: (transaction) => {
                if (!this.view) return;

                const previous = this.view.state;
                const next = previous.apply(transaction);

                this.view.updateState(next);
                this.afterTransaction(previous, next, transaction.docChanged);
            }
        });

        this.document.defaultView?.addEventListener('scroll', this.onViewportChange, { capture: true, passive: true });
        this.document.defaultView?.addEventListener('resize', this.onViewportChange, { passive: true });

        this.pluginCleanups = installPlugins(registrations, {
            getSelectedText: () => this.getSelectedText(),
            replaceSelection: (content, asHtml) => this.replaceSelection(content, asHtml),
            getEditorElement: () => this.getEditorElement(),
            getState: () => this.getState(),
            getView: () => this.getView(),
            registerProseMirrorPlugin: (plugin) => this.registerProseMirrorPlugin(plugin),
            runCommand: (command) => this.runCommand(command),
            setCommands: (commands) => this.pluginCommandMap.set(commands)
        });

        this.lastEmitted = this.serializeValue();
        this.afterTransaction(state, state, false);
        this.editorCreate.emit();
    }

    private destroyView(): void {
        this.document.defaultView?.removeEventListener('scroll', this.onViewportChange, { capture: true } as EventListenerOptions);
        this.document.defaultView?.removeEventListener('resize', this.onViewportChange);

        for (const cleanup of this.pluginCleanups) cleanup();

        this.pluginCleanups = [];
        this.view?.destroy();
        this.view = null;
    }

    /**
     * The plugin stack. Order matters: the keymap has to see keys before the base keymap, and the
     * type-ahead has to see them before either.
     */
    private buildPlugins(schema: Schema, registrations: TextEditorPluginRegistration[]): Plugin[] {
        const plugins: Plugin[] = [
            typeaheadPlugin({
                slashEnabled: () => this.hasPart('slash-menu'),
                mentionEnabled: () => this.hasPart('mention-menu'),
                onUpdate: (trigger, active, text, position) => this.onTypeaheadUpdate(trigger, active, text, position),
                onKeyDown: (event, state) => this.onTypeaheadKeyDown(event, state)
            }),
            ...textEditorKeymap(schema, () => this.defaultHighlightColor()),
            history(),
            dropCursor({ class: 'p-text-editor-drop-cursor' }),
            gapCursor(),
            placeholderPlugin({
                placeholder: () => this.contentOptions?.placeholder() ?? this.placeholder(),
                checklistPlaceholder: () => this.contentOptions?.checklistPlaceholder() ?? this.checklistPlaceholder(),
                slashPlaceholder: () => (this.hasPart('slash-menu') ? this.slashPlaceholder() : null),
                blockMode: () => this.mode() === 'block'
            }),
            headingsPlugin((headings) => {
                this.headingEntries.set(headings);
                this.navigatorHeadingsChange.emit(headings);
            })
        ];

        if (schema.nodes['table']) {
            plugins.push(tableEditing({ allowTableNodeSelection: true }));

            /* Drag-to-resize is left out under RTL: the handle drags from the wrong edge there.
               Widths set programmatically or imported from HTML still render. */
            if (!this.isRtl()) plugins.push(columnResizing({ cellMinWidth: this.minTableColumnWidth(), defaultCellMinWidth: this.defaultTableColumnWidth() }));
        }

        if (this.mode() === 'block') {
            plugins.push(
                blockModePlugin({
                    onHoverChange: (element, index) => this.setHoveredBlock(element, index),
                    dropIndicatorIndex: () => this.dropIndicator(),
                    draggedIndex: () => this.draggedBlock()
                })
            );
        }

        if (this.markdown()) {
            const rules = markdownInputRules(schema, () => this.defaultHighlightColor());

            (rules.spec as { markdownRules?: boolean }).markdownRules = true;
            plugins.push(rules);
        }

        for (const registration of registrations) {
            const plugin = Array.isArray(registration) ? registration[0] : registration;
            const options = Array.isArray(registration) ? registration[1] : undefined;

            plugins.push(...(plugin.options?.prosemirrorPlugins?.(schema, options) ?? []));
        }

        return plugins;
    }

    /**
     * Everything that has to happen after a transaction: the derived state, the emitted value, and
     * the geometry the floating surfaces are positioned from.
     */
    private afterTransaction(previous: EditorState, next: EditorState, docChanged: boolean): void {
        const state = deriveFormatState(next, this.focused());

        /* ProseMirror dispatches outside Angular's own event paths, and in a zoneless application a
           selection-only transaction otherwise leaves every toolbar showing the previous state:
           marking the editor notifies the scheduler, and the tick then refreshes the widgets whose
           templates read the signals below. */
        this.cd.markForCheck();
        this.formatState.set(state);
        this.formatStateChange.emit(state);
        this.updateTableOverlayRect();

        const table = this.getTableActiveState();

        this.tableState.set(table);
        this.tableActiveStateChange.emit(table);

        /* The floating toolbar tracks the selection and closes on any document edit: a bar hovering
           over text the user is still changing gets in the way of the change.

           The caret object is replaced only when the selected range actually changes, so a widget
           can remember "the user dismissed the toolbar for this selection" by identity - with a new
           object on every transaction, a dismissed toolbar sprang back on the next one. */
        const range = next.selection.empty ? null : `${next.selection.from}-${next.selection.to}`;

        if (docChanged || !range) {
            this.contextRangeKey.set(null);
            this.contextCaret.set(null);
        } else if (this.view && this.contextRangeKey() !== range) {
            const caret = caretPositionAt(this.view, next.selection.from);

            this.contextRangeKey.set(range);
            this.contextCaret.set(caret);

            if (this.hasPart('context-toolbar')) this.contextToolbarRequest.emit(caret);
        }

        if (!docChanged && !previous.selection.eq(next.selection)) this.selectionUpdate.emit();

        if (docChanged) this.emitValue();
    }

    private emitValue(): void {
        const value = this.serializeValue();

        this.lastEmitted = value;

        /* `value` is a model, so setting it is what emits `valueChange`: a second output would
           fire twice for one edit. */
        const emit = () => {
            this.value.set(value);
            this.onModelChange(value);
            this.onModelTouched();
        };

        if (this.valueChangeTimer) clearTimeout(this.valueChangeTimer);

        if (!this.valueChangeDebounce()) {
            emit();

            return;
        }

        this.valueChangeTimer = setTimeout(emit, this.valueChangeDebounce());
    }

    private serializeValue(): TextEditorValue {
        return this.mode() === 'block' ? this.getBlocks() : this.getHTML();
    }

    private sameAsEmitted(value: TextEditorValue | undefined): boolean {
        if (Array.isArray(value) && Array.isArray(this.lastEmitted)) return value.length === this.lastEmitted.length && value.every((entry, index) => entry === (this.lastEmitted as string[])[index]);

        return value === this.lastEmitted;
    }

    /**
     * Turns the bound value into a document. A value the schema cannot make sense of falls back to
     * an empty document and surfaces through `parseError` rather than throwing into the render.
     */
    private parseValue(value: TextEditorValue | undefined, schema: Schema): ProseMirrorNode {
        try {
            if (Array.isArray(value)) return parseBlocks(schema, value, this.document);

            return parseHtml(schema, value ?? '', this.document);
        } catch (error) {
            this.parseError.emit({ error });

            return schema.topNodeType.createAndFill()!;
        }
    }

    private applyValue(value: TextEditorValue | undefined): void {
        if (!this.view || !this.schema) return;

        const doc = this.parseValue(value, this.schema);
        const transaction = this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, doc.content);

        transaction.setMeta('addToHistory', false);
        this.lastEmitted = value;
        this.view.dispatch(transaction);
    }

    /******************** Type-ahead plumbing ********************/

    private onTypeaheadUpdate(trigger: 'slash' | 'mention', active: boolean, text: string, position: CaretPosition | null): void {
        this.typeahead.set({ trigger: active ? trigger : null, active, text, position });
        /* The block the trigger was typed in, remembered while the menu is open: a command picked
           from the palette belongs to that block, not to whichever one the pointer happens to be
           hovering when the user presses Enter. */
        this.typeaheadBlock.set(active && this.view ? this.view.state.selection.$from.index(0) : -1);

        if (trigger === 'slash') {
            this.slashMenuRequest.emit({ active, text, position });

            return;
        }

        if (!active) {
            this.mentionRequestId++;
            this.mentionItems.set([]);
            this.mentionRequest.emit({ active, text, items: [], position });

            return;
        }

        const handler = this.mentionOptions?.handler() ?? this.mentionHandler();
        const filterField = this.mentionOptions?.filterField() ?? this.mentionFilterField();
        /* An async handler can answer out of order, and a slow earlier query would then overwrite
           the candidates for what the user is typing now. */
        const requestId = ++this.mentionRequestId;

        void Promise.resolve(handler?.(text) ?? []).then((items) => {
            if (requestId !== this.mentionRequestId) return;

            const filtered = this.getFilteredMentionItems(items, filterField, text);

            this.mentionItems.set(filtered);
            this.mentionRequest.emit({ active, text, items: filtered, position });
        });
    }

    private onTypeaheadKeyDown(event: KeyboardEvent, state: TypeaheadState): boolean {
        void state;

        if (event.key !== 'Escape') return false;

        if (this.view) dismissTypeahead(this.view);

        return true;
    }

    /**
     * Closes the open type-ahead, the `dismiss` both menu parts expose.
     *
     * @internal
     */
    dismissTypeahead(): void {
        if (this.view) dismissTypeahead(this.view);
    }

    /******************** Drag and drop ********************/

    private handleDragOver(event: DragEvent): boolean {
        if (this.draggedBlock() == null || this.mode() !== 'block') return false;

        event.preventDefault();

        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

        const index = this.dropIndexAt(event.clientY);

        if (index !== this.dropIndicator()) {
            this.dropIndicator.set(index);
            /* The indicator is a decoration, and a decoration only redraws when the view updates:
               without this the line never appears and the drag looks like it is doing nothing. */
            this.refreshDecorations();
        }

        return true;
    }

    /**
     * Which boundary the pointer is closest to, in block indexes.
     *
     * Measured against every block rather than against the block under the pointer: the gaps
     * between blocks, the gutter the hover bar lives in and the empty space under the last block
     * are all places a user drops on, and none of them is inside a block.
     */
    private dropIndexAt(clientY: number): number {
        const blocks = Array.from(this.getEditorElement()?.querySelectorAll<HTMLElement>(':scope > [data-block-index]') ?? []);

        for (const block of blocks) {
            const rect = block.getBoundingClientRect();

            if (clientY < rect.top + rect.height / 2) return Number(block.getAttribute('data-block-index'));
        }

        return blocks.length;
    }

    /**
     * Redraws the decorations without touching the document, for the drag state the block plugin
     * reads straight off the signals.
     */
    private refreshDecorations(): void {
        this.view?.setProps({});
    }

    /**
     * A block dropped anywhere on the component: the gutter the hover bar lives in and the padding
     * around the content are outside the content element, so the view's own `drop` never sees them.
     * The move is applied once - whichever handler runs first clears the drag.
     *
     * @internal
     */
    onRootDragOver(event: DragEvent): void {
        this.handleDragOver(event);
    }

    /**
     * @internal
     */
    onRootDrop(event: DragEvent): void {
        const dragged = this.draggedBlock();

        if (dragged == null || this.mode() !== 'block') return;

        event.preventDefault();
        this.applyBlockDrop(dragged, event.clientY);
    }

    private handleDrop(event: DragEvent): boolean {
        /* A block drag ends here rather than in `dragend`: the drop is the event that carries the
           position, and relying on dragend alone loses the move when the pointer is released over
           the content. */
        const dragged = this.draggedBlock();

        if (dragged != null && this.mode() === 'block') {
            event.preventDefault();
            this.applyBlockDrop(dragged, event.clientY);

            return true;
        }

        const files = Array.from(event.dataTransfer?.files ?? []);

        if (!files.length) return false;

        event.preventDefault();

        const images = files.filter((file) => file.type.startsWith('image/'));
        const documents = files.filter((file) => !file.type.startsWith('image/'));

        if (images.length) {
            this.setUploadOpen('image', true);
            this.startImageUploads(images);
        }

        if (documents.length) {
            this.setUploadOpen('document', true);
            this.startDocumentUploads(documents);
        }

        return true;
    }

    /******************** Upload placeholders ********************/

    private insertPlaceholder(nodeName: 'imageUploadPlaceholder' | 'documentUploadPlaceholder'): void {
        const type = this.schema?.nodes[nodeName];

        if (!this.view || !type) return;

        this.view.dispatch(this.view.state.tr.replaceSelectionWith(type.create()));
    }

    /**
     * Turns the placeholder into the uploaded content, in place.
     *
     * Replacing the node is what makes the result land where the user started the upload: inserting
     * at the selection instead meant inserting at whatever position was left after the placeholder
     * was removed, which for a document was a position where text is not even allowed.
     */
    private insertUploaded(nodeName: 'imageUploadPlaceholder' | 'documentUploadPlaceholder', build: (schema: Schema) => ProseMirrorNode | null): void {
        if (!this.view || !this.schema) return;

        const node = build(this.schema);

        if (!node) return;

        let placeholder = -1;

        this.view.state.doc.descendants((child, pos) => {
            if (placeholder >= 0) return false;

            if (child.type.name === nodeName) placeholder = pos;

            return placeholder < 0;
        });

        const transaction = placeholder >= 0 ? this.view.state.tr.replaceWith(placeholder, placeholder + 1, node) : this.view.state.tr.replaceSelectionWith(node, false);
        const after = TextSelection.near(transaction.doc.resolve(Math.min(transaction.selection.to + 1, transaction.doc.content.size)));

        this.view.dispatch(transaction.setSelection(after).scrollIntoView());
    }

    private removePlaceholder(nodeName: 'imageUploadPlaceholder' | 'documentUploadPlaceholder'): void {
        if (!this.view) return;

        const positions: number[] = [];

        this.view.state.doc.descendants((node, pos) => {
            if (node.type.name === nodeName) positions.push(pos);
        });

        if (!positions.length) return;

        const transaction = this.view.state.tr;

        for (const pos of positions.reverse()) transaction.delete(transaction.mapping.map(pos), transaction.mapping.map(pos + 1));

        this.view.dispatch(transaction);
    }

    /**
     * Re-measures the caret the floating surfaces are anchored to. Their coordinates are viewport
     * coordinates, and scrolling moves the text under a popover that would otherwise stay put.
     */
    private readonly onViewportChange = (): void => {
        if (!this.view) return;

        const from = this.view.state.selection.from;

        if (this.contextCaret()) this.contextCaret.set(caretPositionAt(this.view, from));

        const typeahead = this.typeahead();

        if (typeahead.active) this.typeahead.set({ ...typeahead, position: caretPositionAt(this.view, from) });
    };

    private printDocument(): void {
        printHtml(this.getHTML(), this.document);
    }

    /******************** Angular Forms ********************/

    /**
     * Writes a value coming from a form control into the document.
     */
    override writeControlValue(value: TextEditorValue): void {
        this.value.set(value);

        if (this.view) this.applyValue(value);
    }
}
