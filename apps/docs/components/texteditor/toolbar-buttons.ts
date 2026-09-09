import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, output } from '@angular/core';
import { TEXT_EDITOR_CONTEXT } from '@openng/optimus-ui/texteditor';

/**
 * The reference UI parts, in the shape the docs demos use them.
 *
 * TextEditor ships no toolbar of its own: the runtime owns the document and the commands, and the
 * application owns every visible surface. These widgets are that application half, kept in the docs
 * app so a reader can copy the file and edit it freely.
 */

/** One icon-only toolbar button, the shape every widget below is built from. */
@Component({
    selector: 'ui-toolbar-button',
    standalone: true,
    template: `
        <button type="button" class="p-text-editor-ui-button" [attr.aria-label]="label()" [attr.aria-pressed]="pressed()" [disabled]="disabled()" (click)="pressedChange.emit()">
            <ng-content />
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarButtonUI {
    readonly label = input.required<string>();

    readonly pressed = input<boolean | null | undefined>(undefined);

    readonly disabled = input(false);

    readonly pressedChange = output<void>();
}

/** Bold toggle. */
@Component({
    selector: 'bold-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Bold" [pressed]="!!ctx.state().bold" (pressedChange)="ctx.commands().bold()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarBoldUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Italic toggle. */
@Component({
    selector: 'italic-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Italic" [pressed]="!!ctx.state().italic" (pressedChange)="ctx.commands().italic()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5h5M9 19h5M14.5 5 10 19" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarItalicUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Underline toggle. */
@Component({
    selector: 'underline-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Underline" [pressed]="!!ctx.state().underline" (pressedChange)="ctx.commands().underline()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4v6a5 5 0 0 0 10 0V4M5 20h14" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUnderlineUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Strikethrough toggle. */
@Component({
    selector: 'strikethrough-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Strikethrough" [pressed]="!!ctx.state().strikethrough" (pressedChange)="ctx.commands().strikethrough()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M16 6.5A4 4 0 0 0 12 5c-2.5 0-4 1.3-4 3s1.7 2.6 4 3M8 17.5A4 4 0 0 0 12 19c2.5 0 4-1.3 4-3" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarStrikethroughUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Inline code toggle. */
@Component({
    selector: 'code-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Code" [pressed]="!!ctx.state().code" (pressedChange)="ctx.commands().code()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 8-5 4 5 4M15 8l5 4-5 4" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarCodeUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Subscript toggle. */
@Component({
    selector: 'subscript-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Subscript" [pressed]="!!ctx.state().subscript" (pressedChange)="ctx.commands().subscript()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 6 8 10M13 6 5 16M17 20h4c0-2-3-2-3-3.5A1.5 1.5 0 0 1 21 16" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarSubscriptUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Superscript toggle. */
@Component({
    selector: 'superscript-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Superscript" [pressed]="!!ctx.state().superscript" (pressedChange)="ctx.commands().superscript()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 8 10M13 8 5 18M17 8h4c0-2-3-2-3-3.5A1.5 1.5 0 0 1 21 4" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarSuperscriptUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Heading select, from paragraph to H6. */
@Component({
    selector: 'heading-ui',
    standalone: true,
    template: `
        <select class="p-text-editor-ui-select p-text-editor-ui-select-wide" aria-label="Block type" [value]="value()" (change)="onChange($event)">
            <option value="">Paragraph</option>
            @for (level of levels; track level) {
                <option [value]="level">Heading {{ level }}</option>
            }
        </select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarHeadingUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly levels = [1, 2, 3, 4, 5, 6];

    readonly value = computed(() => String(this.ctx.state().heading ?? ''));

    onChange(event: Event): void {
        const level = Number((event.target as HTMLSelectElement).value) || null;

        level === null ? this.ctx.commands().paragraph() : this.ctx.commands().heading(level);
    }
}

/** Alignment dropdown. */
@Component({
    selector: 'text-align-ui',
    standalone: true,
    template: `
        <select class="p-text-editor-ui-select p-text-editor-ui-select-narrow" aria-label="Text align" [value]="ctx.state().textAlign || 'left'" (change)="apply($event)">
            @for (option of options; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
            }
        </select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarTextAlignUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly options = [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justify' }
    ];

    apply(event: Event): void {
        this.ctx.commands().textAlign((event.target as HTMLSelectElement).value);
    }
}

/** Text colour picker. */
@Component({
    selector: 'foreground-color-ui',
    standalone: true,
    template: `
        <label class="p-text-editor-ui-color" aria-label="Text color">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19h14M8 15l4-10 4 10M9.5 12h5" /></svg>
            <input type="color" [value]="ctx.state().foregroundColor || '#000000'" (input)="apply($event)" />
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarForegroundColorUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    apply(event: Event): void {
        this.ctx.commands().foregroundColor((event.target as HTMLInputElement).value);
    }
}

/** Highlight colour picker. */
@Component({
    selector: 'background-color-ui',
    standalone: true,
    template: `
        <label class="p-text-editor-ui-color" aria-label="Highlight color">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 14 6-6 4 4-6 6H7z" />
                <path d="M4 20h16" />
            </svg>
            <input type="color" [value]="ctx.state().backgroundColor || '#ffff00'" (input)="apply($event)" />
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarBackgroundColorUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    apply(event: Event): void {
        this.ctx.commands().backgroundColor((event.target as HTMLInputElement).value);
    }
}

/** Font family select. */
@Component({
    selector: 'font-family-ui',
    standalone: true,
    template: `
        <select class="p-text-editor-ui-select p-text-editor-ui-select-wide" aria-label="Font family" [value]="ctx.state().fontFamily || ''" (change)="apply($event)">
            <option value="">Default</option>
            @for (font of fonts; track font) {
                <option [value]="font">{{ font }}</option>
            }
        </select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarFontFamilyUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly fonts = ['Arial', 'Georgia', 'Inter', 'Times New Roman', 'Courier New'];

    apply(event: Event): void {
        this.ctx.commands().fontFamily((event.target as HTMLSelectElement).value);
    }
}

/** Font size select. */
@Component({
    selector: 'font-size-ui',
    standalone: true,
    template: `
        <select class="p-text-editor-ui-select p-text-editor-ui-select-narrow" aria-label="Font size" [value]="ctx.state().fontSize || ''" (change)="apply($event)">
            <option value="">16px</option>
            @for (size of sizes; track size) {
                <option [value]="size">{{ size }}</option>
            }
        </select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarFontSizeUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    readonly sizes = ['12px', '14px', '18px', '24px', '32px'];

    apply(event: Event): void {
        this.ctx.commands().fontSize((event.target as HTMLSelectElement).value);
    }
}

/** Bullet list toggle. */
@Component({
    selector: 'bullet-list-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Bullet list" [pressed]="!!ctx.state().bulletList" (pressedChange)="ctx.commands().bulletList()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarBulletListUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Ordered list toggle. */
@Component({
    selector: 'ordered-list-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Ordered list" [pressed]="!!ctx.state().orderedList" (pressedChange)="ctx.commands().orderedList()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6h10M10 12h10M10 18h10M4 6h2M4 12h2l-2 3h2M4 18h2" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarOrderedListUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Checklist toggle. */
@Component({
    selector: 'check-list-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Check list" [pressed]="!!ctx.state().checkList" (pressedChange)="ctx.commands().checkList()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6h10M10 12h10M10 18h10M3 6.5 4.5 8 7 5M3 12.5 4.5 14 7 11M3 18.5 4.5 20 7 17" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarCheckListUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Blockquote toggle. */
@Component({
    selector: 'blockquote-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Blockquote" [pressed]="!!ctx.state().blockquote" (pressedChange)="ctx.commands().blockquote()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 7H5.5A2.5 2.5 0 0 0 3 9.5v2A2.5 2.5 0 0 0 5.5 14H7c0 2-1 3-2.5 3.5M20 7h-3.5A2.5 2.5 0 0 0 14 9.5v2a2.5 2.5 0 0 0 2.5 2.5H18c0 2-1 3-2.5 3.5" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarBlockquoteUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Code block toggle. */
@Component({
    selector: 'code-block-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Code block" [pressed]="!!ctx.state().codeBlock" (pressedChange)="ctx.commands().codeBlock()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="m9 10-2 2 2 2M15 10l2 2-2 2" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarCodeBlockUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Link controls: add from a prompt, remove when the cursor is inside one. */
@Component({
    selector: 'link-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Insert link" [pressed]="!!ctx.state().link" (pressedChange)="addLink()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
                <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
            </svg>
        </ui-toolbar-button>
        <ui-toolbar-button label="Remove link" [disabled]="!ctx.state().link" (pressedChange)="ctx.commands().removeLink()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M4 20 20 4" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarLinkUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    addLink(): void {
        const url = window.prompt('Link URL', this.ctx.state().linkUrl ?? 'https://');

        if (!url) return;

        this.ctx.state().link ? this.ctx.commands().updateLink(url) : this.ctx.commands().insertLink(url);
    }
}

/** Inserts an image from a URL. */
@Component({
    selector: 'image-insert-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Insert image by URL" (pressedChange)="insert()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="8.5" cy="10" r="1.5" />
                <path d="m5 17 4.5-4.5L13 16l2.5-2.5L21 19" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarImageInsertUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    insert(): void {
        const src = window.prompt('Image URL', 'https://');

        if (src) this.ctx.commands().insertImage(src);
    }
}

/** Opens the image upload flow. */
@Component({
    selector: 'image-upload-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Upload image" (pressedChange)="ctx.commands().uploadImages()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarImageUploadUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Opens the document upload flow. */
@Component({
    selector: 'document-upload-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Upload document" (pressedChange)="ctx.commands().uploadDocuments()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarDocumentUploadUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Inserts a 3x3 table. */
@Component({
    selector: 'table-insert-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Insert table" [pressed]="!!ctx.state().inTable" (pressedChange)="ctx.commands().table(3, 3)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18M3 15h18M9 4v16M15 4v16" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarTableInsertUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Inserts a horizontal rule. */
@Component({
    selector: 'horizontal-rule-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Horizontal rule" (pressedChange)="ctx.commands().insertHorizontalRule()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16" /></svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarHorizontalRuleUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Opens the browser print flow. */
@Component({
    selector: 'print-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Print" (pressedChange)="ctx.commands().print()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9V3h12v6M6 18H4v-6h16v6h-2" />
                <rect x="8" y="14" width="8" height="7" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarPrintUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Undo. */
@Component({
    selector: 'undo-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Undo" [disabled]="!ctx.state().canUndo" (pressedChange)="ctx.commands().undo()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h9a6 6 0 0 1 0 12H8" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUndoUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Redo. */
@Component({
    selector: 'redo-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Redo" [disabled]="!ctx.state().canRedo" (pressedChange)="ctx.commands().redo()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9h-9a6 6 0 0 0 0 12h5" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarRedoUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** One-click highlight, with the editor's default highlight colour. */
@Component({
    selector: 'highlight-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Highlight" [pressed]="!!ctx.state().highlight" (pressedChange)="ctx.commands().highlight()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m4 20 3-1 9-9-2-2-9 9z" />
                <path d="m14 6 4 4 2-2a2.8 2.8 0 0 0-4-4z" />
                <path d="M4 20h6" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarHighlightUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);
}

/** Clears every inline format the state reports as active on the selection. */
@Component({
    selector: 'clear-format-ui',
    standalone: true,
    imports: [ToolbarButtonUI],
    template: `
        <ui-toolbar-button label="Clear formatting" [disabled]="!ctx.state().hasSelection" (pressedChange)="clear()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 6h12M11 6 8 20M6 12h8M4 20h7" />
                <path d="m16 14 5 5m0-5-5 5" />
            </svg>
        </ui-toolbar-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarClearFormatUI {
    readonly ctx = inject(TEXT_EDITOR_CONTEXT);

    /**
     * There is no single "clear" command: the state says what is on, and each toggle turns its own
     * mark off, which is exactly what a user means by clearing the formatting of a selection.
     */
    clear(): void {
        const state = this.ctx.state();
        const commands = this.ctx.commands();

        if (state.bold) commands.bold();

        if (state.italic) commands.italic();

        if (state.underline) commands.underline();

        if (state.strikethrough) commands.strikethrough();

        if (state.code) commands.code();

        if (state.subscript) commands.subscript();

        if (state.superscript) commands.superscript();

        if (state.link) commands.removeLink();

        if (state.foregroundColor) commands.foregroundColor('');

        if (state.backgroundColor) commands.backgroundColor('');

        if (state.fontFamily) commands.fontFamily('');

        if (state.fontSize) commands.fontSize('');
    }
}
