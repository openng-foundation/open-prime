export const style = /*css*/ `
    .p-text-editor {
        display: flex;
        flex-direction: column;
        position: relative;
        min-width: 0;
        background: dt('texteditor.background');
        color: dt('texteditor.color');
        border: 1px solid dt('texteditor.border.color');
        border-radius: dt('texteditor.border.radius');
        overflow: hidden;
    }

    .p-text-editor-disabled {
        opacity: dt('texteditor.disabled.opacity');
        pointer-events: none;
    }

    /* The picker is the transport behind commands.uploadImages(); it never shows, and it must not
       take part in layout, or an editor with no upload UI would grow by a file input. */
    .p-text-editor-file-input {
        display: none;
    }

    .p-text-editor-mount {
        display: contents;
    }

    /******************** Toolbar ********************/

    .p-text-editor-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex: 0 0 auto;
        background: dt('texteditor.toolbar.background');
        border-bottom: 1px solid dt('texteditor.border.color');
    }

    .p-text-editor-toolbar button,
    .p-text-editor-context-toolbar button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 0 none;
        border-radius: dt('texteditor.border.radius');
        color: dt('texteditor.muted.color');
        cursor: pointer;
        transition: background dt('texteditor.transition.duration'), color dt('texteditor.transition.duration');
    }

    .p-text-editor-toolbar button:hover,
    .p-text-editor-context-toolbar button:hover {
        background: dt('texteditor.emphasis.background');
        color: dt('texteditor.emphasis.color');
    }

    .p-text-editor-toolbar button[aria-pressed='true'],
    .p-text-editor-context-toolbar button[aria-pressed='true'] {
        background: dt('texteditor.emphasis.background');
        color: dt('texteditor.accent.color');
    }

    .p-text-editor-toolbar button:disabled,
    .p-text-editor-context-toolbar button:disabled {
        opacity: dt('texteditor.disabled.opacity');
        cursor: default;
    }

    .p-text-editor :is(button, [tabindex]):focus-visible {
        outline: dt('texteditor.focus.ring.width') dt('texteditor.focus.ring.style') dt('texteditor.focus.ring.color');
        outline-offset: dt('texteditor.focus.ring.offset');
    }

    /******************** Body and content ********************/

    .p-text-editor-body {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
    }

    .p-text-editor-content {
        padding: dt('texteditor.content.padding');
        outline: 0 none;
        min-height: 100%;
        white-space: pre-wrap;
        word-wrap: break-word;
        caret-color: dt('texteditor.color');
    }

    .p-text-editor-content:focus-visible {
        outline: 0 none;
    }

    .p-text-editor-content ::selection {
        background: dt('texteditor.selection.background');
        color: dt('texteditor.selection.color');
    }

    /* The selection stays visible while focus is on a toolbar input: without it, picking a colour
       for a selection you can no longer see is guesswork. */
    .p-text-editor-selection-preserved ::selection,
    .p-text-editor-selection {
        background: dt('texteditor.selection.background');
        color: dt('texteditor.selection.color');
    }

    /******************** Content formatting ********************/

    .p-text-editor-content > * {
        margin: 1rem 0;
    }

    .p-text-editor-content > *:first-child {
        margin-top: 0;
    }

    .p-text-editor-content > *:last-child {
        margin-bottom: 0;
    }

    .p-text-editor-content :is(h1, h2, h3, h4, h5, h6) {
        font-weight: 600;
        line-height: 1.5;
        color: dt('texteditor.heading.color');
    }

    .p-text-editor-content h1 {
        font-size: 2rem;
    }

    .p-text-editor-content h2 {
        font-size: 1.5rem;
    }

    .p-text-editor-content h3 {
        font-size: 1.25rem;
    }

    .p-text-editor-content h4 {
        font-size: 1.125rem;
    }

    .p-text-editor-content h5 {
        font-size: 1rem;
    }

    .p-text-editor-content h6 {
        font-size: 0.875rem;
    }

    .p-text-editor-content ul {
        list-style: disc;
        padding-inline-start: 1.5rem;
    }

    .p-text-editor-content ol {
        list-style: decimal;
        padding-inline-start: 1.5rem;
    }

    .p-text-editor-content li {
        margin: 0.25rem 0;
    }

    .p-text-editor-content li > p {
        margin: 0;
    }

    .p-text-editor-content code {
        font-family: dt('texteditor.code.font.family');
        font-size: 0.875em;
        padding: 2px 6px;
        border-radius: dt('texteditor.border.radius');
        background: dt('texteditor.emphasis.background');
    }

    .p-text-editor-content pre {
        font-family: dt('texteditor.code.font.family');
        background: dt('texteditor.emphasis.background');
        border-radius: dt('texteditor.border.radius');
        padding: 0.75rem 1rem;
        overflow-x: auto;
    }

    .p-text-editor-content pre code {
        background: transparent;
        padding: 0;
        font-size: inherit;
    }

    .p-text-editor-content blockquote {
        border-inline-start: 3px solid dt('texteditor.accent.color');
        background: dt('texteditor.emphasis.background');
        padding: 0.5rem 1rem;
        border-radius: 0 dt('texteditor.border.radius') dt('texteditor.border.radius') 0;
    }

    .p-text-editor-content blockquote > * {
        margin: 0.5rem 0;
    }

    .p-text-editor-content a {
        color: dt('texteditor.accent.color');
        text-decoration: underline;
    }

    .p-text-editor-content img {
        max-width: 100%;
        height: auto;
        border-radius: dt('texteditor.border.radius');
    }

    .p-text-editor-content hr {
        border: 0 none;
        border-top: 1px solid dt('texteditor.border.color');
    }

    /******************** Checklists ********************/

    .p-text-editor-content ul[data-p-checked-list] {
        list-style: none;
        padding-inline-start: 0;
    }

    .p-text-editor-content li[data-p-checked] {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .p-text-editor-content li[data-p-checked] > div {
        flex: 1 1 auto;
        min-width: 0;
    }

    /* The label is not editable on purpose: a checkbox that Backspace can delete leaves an item that
       can never be ticked again. */
    .p-text-editor-content li[data-p-checked] > label {
        display: inline-flex;
        align-items: center;
        height: 1.5rem;
        user-select: none;
    }

    .p-text-editor-content li[data-p-checked] input[type='checkbox'] {
        appearance: none;
        width: 1rem;
        height: 1rem;
        margin: 0;
        border: 1px solid dt('texteditor.border.color');
        border-radius: 4px;
        background: dt('texteditor.background');
        cursor: pointer;
        position: relative;
        transition: background dt('texteditor.transition.duration'), border-color dt('texteditor.transition.duration');
    }

    .p-text-editor-content li[data-p-checked] input[type='checkbox']:checked {
        background: dt('texteditor.accent.color');
        border-color: dt('texteditor.accent.color');
    }

    .p-text-editor-content li[data-p-checked] input[type='checkbox']:checked::after {
        content: '';
        position: absolute;
        inset-inline-start: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid dt('texteditor.accent.contrast.color');
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
    }

    .p-text-editor-content li[data-p-checked='true'] > div {
        text-decoration: line-through;
        opacity: 0.6;
    }

    /******************** Placeholders ********************/

    .p-text-editor-placeholder::before {
        content: attr(data-placeholder);
        color: dt('texteditor.muted.color');
        pointer-events: none;
        height: 0;
        float: inline-start;
    }

    .p-text-editor-block-placeholder::before {
        font: inherit;
    }

    /******************** Inline decorations ********************/

    .p-text-editor-mention {
        background: dt('texteditor.highlight.background');
        color: dt('texteditor.highlight.color');
        border-radius: dt('texteditor.border.radius');
        padding: 1px 4px;
        white-space: nowrap;
    }

    .p-text-editor-mention-typing,
    .p-text-editor-slash-typing {
        color: dt('texteditor.accent.color');
    }

    .p-text-editor-image-upload-placeholder,
    .p-text-editor-document-upload-placeholder {
        height: 6rem;
        border: 1px dashed dt('texteditor.border.color');
        border-radius: dt('texteditor.border.radius');
        background: dt('texteditor.emphasis.background');
    }

    /******************** Tables ********************/

    .p-text-editor-content table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        overflow: hidden;
    }

    .p-text-editor-content :is(th, td) {
        border: 1px solid dt('texteditor.border.color');
        padding: 0.5rem 0.75rem;
        vertical-align: top;
        position: relative;
    }

    .p-text-editor-content th {
        background: dt('texteditor.emphasis.background');
        font-weight: 600;
        text-align: start;
    }

    .p-text-editor-content .selectedCell::after {
        content: '';
        position: absolute;
        inset: 0;
        background: dt('texteditor.selection.background');
        pointer-events: none;
    }

    .p-text-editor-content .column-resize-handle {
        position: absolute;
        inset-block: 0;
        inset-inline-end: -2px;
        width: 4px;
        background: dt('texteditor.accent.color');
        pointer-events: none;
    }

    .p-text-editor-table-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .p-text-editor-table-selection-outline {
        position: absolute;
        border: 1px solid dt('texteditor.accent.color');
        border-radius: 2px;
        pointer-events: none;
    }

    .p-text-editor-table-trigger {
        position: absolute;
        width: 1rem;
        height: 1rem;
        padding: 0;
        border: 0 none;
        border-radius: 999px;
        background: dt('texteditor.accent.color');
        cursor: pointer;
        pointer-events: auto;
    }

    /* The column and row triggers are the same dot in different places; both classes exist because
       a theme has to be able to reach one without the other. */
    .p-text-editor-table-trigger-col {
        transform: translateX(0);
    }

    .p-text-editor-table-trigger-row {
        transform: translateY(0);
    }

    .p-text-editor-table-trigger-cell {
        width: 0.625rem;
        height: 0.625rem;
    }

    .p-text-editor-table-add {
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed dt('texteditor.border.color');
        border-radius: dt('texteditor.border.radius');
        background: dt('texteditor.background');
        color: dt('texteditor.muted.color');
        cursor: pointer;
        pointer-events: auto;
        opacity: 0;
        transition: opacity dt('texteditor.transition.duration');
    }

    .p-text-editor-table-add-col {
        width: 1rem;
    }

    .p-text-editor-table-add-row {
        height: 1rem;
    }

    .p-text-editor-body:hover .p-text-editor-table-add {
        opacity: 1;
    }

    /******************** Block mode ********************/

    /* A gutter wide enough for the hover bar: the handles sit beside the block, and without room
       for them inside the editor they would be clipped by the root's overflow. */
    .p-text-editor-block-mode .p-text-editor-content {
        padding-inline-start: 3rem;
    }

    .p-text-editor-block {
        position: relative;
    }

    .p-text-editor-block[data-dragging] {
        opacity: 0.4;
    }

    .p-text-editor-block-content {
        outline: 0 none;
    }

    .p-text-editor-block-controls {
        display: flex;
        align-items: center;
        gap: 0.125rem;
        transform: translateX(-100%);
        padding-inline-end: 0.25rem;
        color: dt('texteditor.muted.color');
        z-index: 1100;
    }

    .p-text-editor-block-controls[data-block-type^='heading'] {
        align-items: flex-start;
        padding-block-start: 0.25rem;
    }

    /* A real 2px box with negative margins: it is visible to the user and measurable in a test,
       and the margins keep it from pushing the blocks apart as it moves between them. */
    .p-text-editor-block-drop-indicator {
        height: 2px;
        margin: -1px 0;
        border-radius: 2px;
        background: dt('texteditor.accent.color');
    }

    .p-text-editor-drop-cursor {
        border-color: dt('texteditor.accent.color');
    }

    /******************** Navigator ********************/

    .p-text-editor-navigator {
        position: absolute;
        inset-block-start: 0.75rem;
        inset-inline-end: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        align-items: flex-end;
    }

    .p-text-editor-navigator-bar {
        height: 2px;
        border-radius: 2px;
        background: dt('texteditor.muted.color');
        opacity: 0.5;
        transition: opacity dt('texteditor.transition.duration'), background dt('texteditor.transition.duration');
    }

    .p-text-editor-navigator-bar[data-level='1'] {
        width: 1.25rem;
    }

    .p-text-editor-navigator-bar[data-level='2'] {
        width: 1rem;
    }

    .p-text-editor-navigator-bar[data-level='3'] {
        width: 0.75rem;
    }

    .p-text-editor-navigator-bar[data-level='4'],
    .p-text-editor-navigator-bar[data-level='5'],
    .p-text-editor-navigator-bar[data-level='6'] {
        width: 0.5rem;
    }

    .p-text-editor-navigator-bar[data-active] {
        background: dt('texteditor.accent.color');
        opacity: 1;
    }

    /******************** Overlays ********************/

    .p-text-editor-popover-menu,
    .p-text-editor-popover-submenu,
    .p-text-editor-navigator-popover,
    .p-text-editor-context-toolbar,
    .p-text-editor-context-toolbar-more {
        position: fixed;
        z-index: 1100;
        background: dt('texteditor.overlay.background');
        border: 1px solid dt('texteditor.border.color');
        border-radius: dt('texteditor.border.radius');
        box-shadow: dt('texteditor.overlay.shadow');
        max-height: 20rem;
        overflow: auto;
        outline: 0 none;
    }

    .p-text-editor-context-toolbar {
        display: flex;
        align-items: center;
        max-height: none;
        overflow: visible;
    }

    /* A part that sets its own display beats the user agent rule for the hidden attribute, so a
       closed toolbar stayed on screen with the attribute set. */
    .p-text-editor-context-toolbar[hidden],
    .p-text-editor-context-toolbar-more[hidden],
    .p-text-editor-popover-menu[hidden],
    .p-text-editor-popover-submenu[hidden],
    .p-text-editor-navigator-popover[hidden],
    .p-text-editor-block-controls[hidden] {
        display: none;
    }

    .p-text-editor-popover-menu [role='option'],
    .p-text-editor-popover-menu [role='menuitem'],
    .p-text-editor-popover-submenu [role='menuitem'],
    .p-text-editor-navigator-popover [role='menuitem'] {
        cursor: pointer;
    }

    .p-text-editor-popover-menu [data-p-focus],
    .p-text-editor-popover-submenu [data-p-focus],
    .p-text-editor-navigator-popover [data-p-focus] {
        background: dt('texteditor.emphasis.background');
        color: dt('texteditor.emphasis.color');
    }

    .p-text-editor-anchored-overlay-enter-active {
        animation: p-text-editor-overlay-in 120ms ease-out;
    }

    .p-text-editor-anchored-overlay-leave-active {
        animation: p-text-editor-overlay-in 120ms ease-in reverse;
    }

    @keyframes p-text-editor-overlay-in {
        from {
            opacity: 0;
            transform: scale(0.96);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .p-text-editor *,
        .p-text-editor-popover-menu,
        .p-text-editor-popover-submenu,
        .p-text-editor-context-toolbar {
            animation: none !important;
            transition: none !important;
        }
    }
`;
