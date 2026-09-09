import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { CONTEXT_TOOLBAR_CONTEXT } from '@openng/optimus-ui/texteditor';
import {
    ToolbarBackgroundColorUI,
    ToolbarBlockquoteUI,
    ToolbarBoldUI,
    ToolbarBulletListUI,
    ToolbarCheckListUI,
    ToolbarClearFormatUI,
    ToolbarCodeBlockUI,
    ToolbarCodeUI,
    ToolbarDocumentUploadUI,
    ToolbarFontFamilyUI,
    ToolbarFontSizeUI,
    ToolbarForegroundColorUI,
    ToolbarHeadingUI,
    ToolbarHighlightUI,
    ToolbarHorizontalRuleUI,
    ToolbarImageInsertUI,
    ToolbarImageUploadUI,
    ToolbarItalicUI,
    ToolbarLinkUI,
    ToolbarOrderedListUI,
    ToolbarPrintUI,
    ToolbarRedoUI,
    ToolbarStrikethroughUI,
    ToolbarSubscriptUI,
    ToolbarSuperscriptUI,
    ToolbarTableInsertUI,
    ToolbarTextAlignUI,
    ToolbarUnderlineUI,
    ToolbarUndoUI
} from './toolbar-buttons';

/** The complete static toolbar: every formatting control the editor exposes, in one widget. */
@Component({
    selector: 'toolbar-ui',
    standalone: true,
    imports: [
        ToolbarBoldUI,
        ToolbarItalicUI,
        ToolbarUnderlineUI,
        ToolbarStrikethroughUI,
        ToolbarSuperscriptUI,
        ToolbarSubscriptUI,
        ToolbarHeadingUI,
        ToolbarFontFamilyUI,
        ToolbarFontSizeUI,
        ToolbarTextAlignUI,
        ToolbarForegroundColorUI,
        ToolbarBackgroundColorUI,
        ToolbarBulletListUI,
        ToolbarOrderedListUI,
        ToolbarCheckListUI,
        ToolbarCodeUI,
        ToolbarBlockquoteUI,
        ToolbarHighlightUI,
        ToolbarClearFormatUI,
        ToolbarLinkUI,
        ToolbarImageInsertUI,
        ToolbarImageUploadUI,
        ToolbarDocumentUploadUI,
        ToolbarTableInsertUI,
        ToolbarPrintUI,
        ToolbarHorizontalRuleUI,
        ToolbarUndoUI,
        ToolbarRedoUI
    ],
    template: `
        <div class="p-text-editor-ui-toolbar">
            <bold-ui />
            <italic-ui />
            <underline-ui />
            <strikethrough-ui />
            <superscript-ui />
            <subscript-ui />
            <code-ui />
            <blockquote-ui />
            <font-family-ui />
            <font-size-ui />
            <heading-ui />
            <text-align-ui />
            <foreground-color-ui />
            <background-color-ui />
            <highlight-ui />
            <clear-format-ui />
            <bullet-list-ui />
            <ordered-list-ui />
            <check-list-ui />
            <link-ui />
            <image-insert-ui />
            <image-upload-ui />
            <document-upload-ui />
            <print-ui />
            <horizontal-rule-ui />
            <table-insert-ui />
            <undo-ui />
            <redo-ui />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ToolbarUI {}

/** The floating toolbar's widget: inline formatting for the current selection, plus an overflow trigger. */
@Component({
    selector: 'context-toolbar-ui',
    standalone: true,
    imports: [ToolbarBoldUI, ToolbarItalicUI, ToolbarUnderlineUI, ToolbarStrikethroughUI, ToolbarCodeUI, ToolbarHighlightUI, ToolbarLinkUI],
    template: `
        <div class="p-text-editor-ui-toolbar">
            <bold-ui />
            <italic-ui />
            <underline-ui />
            <strikethrough-ui />
            <code-ui />
            <highlight-ui />
            <link-ui />
            <button type="button" class="p-text-editor-ui-button" aria-label="More" [attr.aria-expanded]="ctx.moreActive()" (click)="ctx.toggleMore($event)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                </svg>
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ContextToolbarUI {
    readonly ctx = inject(CONTEXT_TOOLBAR_CONTEXT);
}

/** The overflow panel's widget. */
@Component({
    selector: 'context-toolbar-more-ui',
    standalone: true,
    imports: [ToolbarBulletListUI, ToolbarOrderedListUI, ToolbarCheckListUI, ToolbarBlockquoteUI, ToolbarCodeBlockUI, ToolbarHorizontalRuleUI],
    template: `
        <div class="p-text-editor-ui-toolbar">
            <bullet-list-ui />
            <ordered-list-ui />
            <check-list-ui />
            <blockquote-ui />
            <code-block-ui />
            <horizontal-rule-ui />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ContextToolbarMoreUI {}
