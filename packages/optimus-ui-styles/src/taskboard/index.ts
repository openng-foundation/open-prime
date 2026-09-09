export const style = /*css*/ `
    .p-taskboard {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
        background: dt('taskboard.background');
        color: dt('taskboard.color');
        border: 1px solid dt('taskboard.border.color');
        border-radius: dt('taskboard.border.radius');
        font-family: inherit;
        overflow: hidden;
        container-type: inline-size;
    }

    /* Focus lives on the cards and the columns, not on the root: the root is tabbable only so the
       keyboard can enter the board, and a ring drawn around the whole thing says nothing. */
    .p-taskboard:focus,
    .p-taskboard:focus-visible {
        outline: none;
    }

    .p-taskboard-non-scrollable {
        height: auto;
        overflow: visible;
    }

    .p-taskboard-non-scrollable .p-taskboard-columns,
    .p-taskboard-non-scrollable .p-taskboard-column-body,
    .p-taskboard-non-scrollable .p-taskboard-swimlane-grid {
        overflow: visible;
    }

    .p-taskboard-non-scrollable .p-taskboard-columns {
        height: auto;
    }

    .p-taskboard.p-taskboard-disabled {
        pointer-events: none;
        opacity: 0.6;
        user-select: none;
    }

    /* A read-only board does NOT lose the pointer. The runtime already refuses every write while
       readonly is set, and switching pointer events off here took the column scrolling, the text
       selection and any link inside a card with it. What must not happen is changing the board, not
       reading it; what stays inert is the drag, which the card no longer offers. */
    .p-taskboard.p-taskboard-readonly .p-taskboard-card {
        cursor: default;
    }

    .p-taskboard-header {
        flex-shrink: 0;
    }

    /* Over the board rather than in its flow: what is underneath keeps its size while the board
       loads, so the columns do not jump when the data lands. */
    .p-taskboard-loading {
        position: absolute;
        inset: 0;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('taskboard.background');
    }

    .p-taskboard-loading[hidden] {
        display: none;
    }

    .p-taskboard-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .p-taskboard-columns {
        display: flex;
        flex-direction: row;
        gap: dt('taskboard.column.gap');
        padding: dt('taskboard.columns.padding');
        height: 100%;
        align-items: stretch;
        overflow-x: auto;
        scrollbar-width: dt('taskboard.scrollbar.width');
        scrollbar-color: dt('taskboard.scrollbar.thumb') dt('taskboard.scrollbar.track');
    }

    .p-taskboard-columns::-webkit-scrollbar {
        height: 6px;
    }

    .p-taskboard-columns::-webkit-scrollbar-thumb {
        background: dt('taskboard.scrollbar.thumb');
        border-radius: 3px;
    }

    .p-taskboard-columns::-webkit-scrollbar-track {
        background: dt('taskboard.scrollbar.track');
    }

    /* With phase headers the container becomes a stack: the band on top, the columns track below. */
    .p-taskboard-columns-with-groups {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
    }

    .p-taskboard-columns-track {
        display: flex;
        flex: 1 1 auto;
        gap: dt('taskboard.column.gap');
        align-items: stretch;
        min-width: fit-content;
        min-height: 0;
    }

    /* Without phase headers the track must not exist as far as layout is concerned: the columns have
       to be flex items of the scroller. It is emitted anyway so the component keeps one <ng-content>,
       and Angular only ever fills the first of those. */
    .p-taskboard-columns-plain {
        display: contents;
    }

    .p-taskboard-column {
        display: flex;
        flex-direction: column;
        min-width: dt('taskboard.column.min.width');
        max-width: dt('taskboard.column.max.width');
        flex: 1 0 dt('taskboard.column.min.width');
        transition:
            min-width dt('taskboard.transition.duration') dt('taskboard.transition.timing'),
            max-width dt('taskboard.transition.duration') dt('taskboard.transition.timing'),
            flex dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    .p-taskboard-column-focused {
        outline: dt('taskboard.focus.ring.width') solid dt('taskboard.focus.ring.color');
        outline-offset: 2px;
    }

    .p-taskboard-column-header {
        flex-shrink: 0;
        box-sizing: border-box;
        position: relative;
        min-height: dt('taskboard.column.header.min.height');
        user-select: none;
    }

    .p-taskboard-column-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: dt('taskboard.card.gap');
        padding: dt('taskboard.column.body.padding');
        min-height: 0;
        overflow-y: auto;
        background: dt('taskboard.column.background');
        border-radius: 0 0 dt('taskboard.column.border.radius') dt('taskboard.column.border.radius');
        scrollbar-width: dt('taskboard.scrollbar.width');
        scrollbar-color: dt('taskboard.scrollbar.thumb') dt('taskboard.scrollbar.track');
    }

    .p-taskboard-column-body::-webkit-scrollbar {
        width: 4px;
    }

    .p-taskboard-column-body::-webkit-scrollbar-thumb {
        background: dt('taskboard.scrollbar.thumb');
        border-radius: 2px;
    }

    .p-taskboard-column-body::-webkit-scrollbar-track {
        background: dt('taskboard.scrollbar.track');
    }

    .p-taskboard-column-footer {
        flex-shrink: 0;
        padding: dt('taskboard.column.footer.padding');
    }

    /* 44px is a collapsed column: the chevron fits and nothing else, which is all a collapsed column
       has to offer. The !important beats the column's own flex-basis, which carries its width in the
       same declaration. */
    .p-taskboard-column-collapsed {
        min-width: 44px !important;
        max-width: 44px !important;
        flex: 0 0 44px !important;
        overflow: hidden;
        transition:
            min-width dt('taskboard.transition.duration') dt('taskboard.transition.timing'),
            max-width dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    .p-taskboard-column-collapsed .p-taskboard-column-header {
        text-align: center;
    }

    /* The body stays mounted and empty instead of disappearing: it is still the rectangle the pointer
       is tested against, and a column that vanished could not take focus. */
    .p-taskboard-column-collapsed .p-taskboard-column-body {
        pointer-events: none;
        overflow: hidden;
    }

    .p-taskboard-column-collapsed .p-taskboard-column-body > * {
        display: none;
    }

    .p-taskboard-column-collapsed .p-taskboard-column-footer {
        display: none;
    }

    .p-taskboard-column-collapsed > :not(.p-taskboard-column-header):not(.p-taskboard-column-body):not(.p-taskboard-column-footer):not(.p-taskboard-drop-indicator) {
        display: none;
    }

    .p-taskboard-column-collapsed .p-taskboard-drop-indicator {
        display: none;
    }

    .p-taskboard-column-collapse-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: dt('taskboard.column.header.min.height');
        padding: 0;
        border: 0;
        border-bottom: 1px solid dt('taskboard.swimlane.border.color');
        border-radius: 0;
        background: dt('taskboard.column.background');
        color: dt('taskboard.empty.color');
        cursor: pointer;
    }

    .p-taskboard-column-collapse-toggle:hover {
        color: dt('taskboard.color');
    }

    .p-taskboard-column-collapse-toggle:focus-visible {
        outline: 2px solid dt('taskboard.focus.ring.color');
        outline-offset: -2px;
    }

    .p-taskboard-column-collapse-toggle-icon {
        flex: 0 0 auto;
    }

    /* The status strip sits on the header and not on the column: the header is what stays visible
       when the column collapses. */
    .p-taskboard-column-todo > .p-taskboard-column-header {
        border-top: 3px solid dt('taskboard.column.status.todo.color');
    }

    .p-taskboard-column-in-progress > .p-taskboard-column-header {
        border-top: 3px solid dt('taskboard.column.status.in.progress.color');
    }

    .p-taskboard-column-done > .p-taskboard-column-header {
        border-top: 3px solid dt('taskboard.column.status.done.color');
    }

    .p-taskboard-column-blocked > .p-taskboard-column-header {
        border-top: 3px solid dt('taskboard.column.status.blocked.color');
    }

    .p-taskboard-column-dragging {
        opacity: 0.92;
        box-shadow: dt('taskboard.drag.preview.shadow');
        z-index: 10;
        transition: none !important;
    }

    .p-taskboard-column-reordering .p-taskboard-column:not(.p-taskboard-column-dragging) {
        transition: transform dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    .p-taskboard-column-locked {
        cursor: default;
    }

    .p-taskboard-column-pinned {
        position: sticky;
        left: 0;
        z-index: 3;
    }

    .p-taskboard-column-pinned::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: -6px;
        width: 6px;
        background: dt('taskboard.column.pinned.shadow');
        pointer-events: none;
    }

    .p-taskboard-column-add {
        display: flex;
        flex-direction: column;
        min-width: dt('taskboard.column.min.width');
        flex: 0 0 dt('taskboard.column.min.width');
    }

    /* Centred by default, because that is what an add action at the foot of a list reads as: a
       full-width target with its label in the middle, not a stray link hugging the left edge. */
    .p-taskboard-card-add {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .p-taskboard-card-add > * {
        flex: 1 1 auto;
        text-align: center;
    }

    .p-taskboard-empty-column {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        color: dt('taskboard.empty.color');
        font-size: 0.8125rem;
        text-align: center;
    }

    /* ----------------------------------------------------------------------------------------------
       Tarjeta
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-card {
        display: block;
        position: relative;
        border-radius: dt('taskboard.card.border.radius');
    }

    /* En un pseudoelemento y no en la tarjeta: el contenido proyectado tiene su propio fondo y su
       propio radio, y una sombra interior sobre el host quedaría por debajo de él. */
    .p-taskboard-card::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        border-radius: inherit;
        transition: box-shadow dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    .p-taskboard-card-draggable {
        cursor: grab;
    }

    .p-taskboard-card-draggable:active {
        cursor: grabbing;
    }

    .p-taskboard-card-dragging {
        opacity: 0.35;
        pointer-events: none;
    }

    .p-taskboard-card-disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .p-taskboard-card-selected::after {
        box-shadow: inset 0 0 0 2px dt('taskboard.card.selected.ring.color');
    }

    .p-taskboard-card-focused::after {
        box-shadow: 0 0 0 dt('taskboard.focus.ring.width') dt('taskboard.focus.ring.color');
    }

    /* Selected AND focused carries both shadows: the inner selection ring and the outer focus ring
       say different things, and a combined rule is what stops the second overwriting the first. */
    .p-taskboard-card-selected.p-taskboard-card-focused::after {
        box-shadow:
            inset 0 0 0 2px dt('taskboard.card.selected.ring.color'),
            0 0 0 dt('taskboard.focus.ring.width') dt('taskboard.focus.ring.color');
    }

    .p-taskboard-column-body > .p-taskboard-card {
        transition:
            opacity dt('taskboard.transition.duration') dt('taskboard.transition.timing'),
            transform dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    /* ----------------------------------------------------------------------------------------------
       Cabeceras de fase
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-column-group-headers {
        display: flex;
        flex-shrink: 0;
        overflow: visible;
        min-width: fit-content;
    }

    .p-taskboard-column-group-headers-inner {
        display: flex;
        gap: dt('taskboard.column.gap');
        min-width: fit-content;
    }

    /* The width comes from --p-taskboard-group-span, which the component sets inline: the number of
       columns the segment spans. That keeps the header the same size as the columns underneath it
       without anything measuring anything. */
    .p-taskboard-column-group-header {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: var(--p-taskboard-group-span, 1) 0
            calc(var(--p-taskboard-group-span, 1) * dt('taskboard.column.min.width') + (var(--p-taskboard-group-span, 1) - 1) * dt('taskboard.column.gap'));
        min-width: calc(var(--p-taskboard-group-span, 1) * dt('taskboard.column.min.width') + (var(--p-taskboard-group-span, 1) - 1) * dt('taskboard.column.gap'));
        padding: 0.5rem 1rem;
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-align: center;
        text-transform: uppercase;
        color: dt('taskboard.color');
        border-bottom: 2px solid var(--p-taskboard-column-group-color, dt('taskboard.drop.indicator.color'));
    }

    /* The narrow band repeats the label once per column: below the breakpoint only one column fits on
       screen, and a label spanning three would leave two of them unnamed. */
    .p-taskboard-column-group-mobile-headers {
        display: none;
        flex-shrink: 0;
        overflow: visible;
        min-width: fit-content;
    }

    .p-taskboard-column-group-mobile-headers-inner {
        display: flex;
        gap: dt('taskboard.column.gap');
        min-width: fit-content;
    }

    .p-taskboard-column-group-mobile-header {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 dt('taskboard.column.min.width');
        min-width: dt('taskboard.column.min.width');
        min-height: 1.75rem;
        padding: 0.35rem 0.75rem;
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-align: center;
        text-transform: uppercase;
        color: dt('taskboard.color');
        border-bottom: 2px solid var(--p-taskboard-column-group-color, dt('taskboard.drop.indicator.color'));
    }

    .p-taskboard-column-group-mobile-header-empty {
        border-bottom-color: transparent;
        color: transparent;
    }

    /* ----------------------------------------------------------------------------------------------
       Rejilla de swimlanes
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-swimlane-grid {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: auto;
    }

    .p-taskboard-column-headers {
        display: flex;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        z-index: 20;
        min-width: fit-content;
        background: dt('taskboard.background');
        border-bottom: 1px solid dt('taskboard.swimlane.border.color');
    }

    /* The corner spacer and the row headers are both sticky, and the spacer sits one level above:
       it is the only place where the two sticky axes cross. */
    .p-taskboard-column-headers-spacer {
        width: dt('taskboard.swimlane.header.width');
        min-width: dt('taskboard.swimlane.header.width');
        flex-shrink: 0;
        position: sticky;
        left: 0;
        z-index: 21;
        box-sizing: border-box;
        background: dt('taskboard.background');
    }

    .p-taskboard-column-headers-content {
        display: flex;
        flex: 1 0 auto;
        gap: dt('taskboard.column.gap');
    }

    .p-taskboard-column-headers-content > * {
        width: dt('taskboard.column.min.width');
        flex: 0 0 dt('taskboard.column.min.width');
        padding: 0 dt('taskboard.column.body.padding');
        box-sizing: border-box;
        overflow: hidden;
    }

    .p-taskboard-swimlane-row {
        display: flex;
        flex-shrink: 0;
        min-height: dt('taskboard.swimlane.min.height');
        min-width: fit-content;
        border-bottom: 1px solid dt('taskboard.swimlane.border.color');
    }

    .p-taskboard-swimlane-header {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        width: dt('taskboard.swimlane.header.width');
        min-width: dt('taskboard.swimlane.header.width');
        flex-shrink: 0;
        position: sticky;
        left: 0;
        z-index: 10;
        box-sizing: border-box;
        font-size: 0.8125rem;
        font-weight: 600;
        color: dt('taskboard.color');
        background: dt('taskboard.swimlane.header.background');
        user-select: none;
    }

    .p-taskboard-swimlane-collapse-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        flex-shrink: 0;
        padding: 0;
        border: 0;
        border-radius: dt('taskboard.border.radius.sm');
        background: transparent;
        color: dt('taskboard.empty.color');
        cursor: pointer;
        transition:
            background 0.15s ease,
            color 0.15s ease;
    }

    .p-taskboard-swimlane-collapse-toggle:hover {
        background: dt('taskboard.hover.background');
        color: dt('taskboard.color');
    }

    .p-taskboard-swimlane-collapse-toggle:focus-visible {
        outline: 2px solid dt('taskboard.focus.ring.color');
        outline-offset: 2px;
    }

    .p-taskboard-swimlane-collapse-toggle-icon {
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .p-taskboard-swimlane-collapsed .p-taskboard-swimlane-collapse-toggle-icon {
        transform: rotate(-90deg);
    }

    .p-taskboard-swimlane-body {
        display: flex;
        flex: 1 0 auto;
        gap: dt('taskboard.column.gap');
        padding: dt('taskboard.columns.padding');
    }

    .p-taskboard-swimlane-collapsed .p-taskboard-swimlane-body {
        display: none;
    }

    .p-taskboard-swimlane-cell {
        display: flex;
        flex-direction: column;
        gap: dt('taskboard.card.gap');
        width: dt('taskboard.column.min.width');
        flex: 0 0 dt('taskboard.column.min.width');
        padding: dt('taskboard.column.body.padding');
        /* 0.375rem extra at the bottom: the row is as tall as its tallest cell, and without it the
           last card sits flush against the next row's border. */
        padding-block-end: calc(dt('taskboard.column.body.padding') + 0.375rem);
        min-height: dt('taskboard.swimlane.cell.min.height');
        overflow: hidden;
    }

    /* ----------------------------------------------------------------------------------------------
       Arrastre
       ---------------------------------------------------------------------------------------------- */

    /* The press starts before the drag, and the browser is already selecting text by then: without
       this every gesture leaves a stripe of highlighted card text behind. */
    .p-taskboard-pressing {
        user-select: none;
    }

    .p-taskboard-dragging {
        cursor: grabbing;
        user-select: none;
    }

    .p-taskboard-dragging .p-taskboard-card {
        cursor: grabbing;
    }

    .p-taskboard-drag-preview {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.9;
        box-sizing: border-box;
        max-width: dt('taskboard.column.min.width');
        transform: translate(-50%, -50%) rotate(dt('taskboard.drag.preview.rotation'));
        box-shadow: dt('taskboard.drag.preview.shadow');
        will-change: transform;
        isolation: isolate;
    }

    .p-taskboard-drag-preview-body {
        display: contents;
    }

    .p-taskboard-drag-preview-badge {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.375rem;
        height: 1.375rem;
        padding: 0 0.25rem;
        font-size: 0.6875rem;
        font-weight: 700;
        border-radius: 9999px;
        background: dt('taskboard.drop.indicator.color');
        color: dt('taskboard.wip.exceeded.count.color');
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .p-taskboard-drag-confirm:not([hidden]) {
        display: block;
    }

    /* The marker reserves the gap the incoming card will occupy and the line is drawn centred inside
       it, so the list opens up instead of the line eating the space between two cards. */
    .p-taskboard-drop-indicator {
        position: relative;
        flex: 0 0 0.75rem;
        min-height: 0.75rem;
        margin: 0;
        background: transparent;
        pointer-events: none;
        transition: opacity dt('taskboard.transition.duration') dt('taskboard.transition.timing');
    }

    .p-taskboard-drop-indicator::before {
        content: '';
        position: absolute;
        inset-inline: 0.25rem;
        top: 50%;
        height: 3px;
        transform: translateY(-50%);
        border-radius: 9999px;
        background: dt('taskboard.drop.indicator.color');
        box-shadow:
            0 0 0 1px dt('taskboard.drop.indicator.color'),
            0 0 12px dt('taskboard.drop.indicator.color');
    }

    .p-taskboard-drop-indicator-runtime {
        position: fixed;
        z-index: 1100;
        box-sizing: border-box;
        height: 0.75rem;
        min-height: 0.75rem;
        flex: none;
        margin: 0;
    }

    /* In a swimlane cell the marker cannot reserve height: the row is as tall as its tallest cell, so
       opening a 12px gap would move the whole grid. It is drawn on top, taking no space. */
    .p-taskboard-swimlane-drop-indicator {
        flex: 0 0 0;
        height: 0;
        min-height: 0;
        margin-block: calc(dt('taskboard.card.gap') / -2);
        z-index: 1;
    }

    .p-taskboard-swimlane-drop-indicator::before {
        top: 1.5px;
        transform: none;
    }

    /* A marker with content of its own and the preset line are mutually exclusive: otherwise a custom
       marker ends up sitting on top of a line it never asked for. */
    .p-taskboard-drop-indicator-custom {
        flex-basis: auto;
        height: auto;
        min-height: 0;
        margin: 0;
    }

    .p-taskboard-drop-indicator-custom::before {
        display: none;
    }

    /* ----------------------------------------------------------------------------------------------
       Densidad
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-density-compact .p-taskboard-column-body {
        padding: 0.375rem;
        gap: 0.25rem;
    }

    .p-taskboard-density-comfortable .p-taskboard-column-body {
        padding: 0.75rem;
        gap: 0.625rem;
    }

    .p-taskboard-density-compact .p-taskboard-swimlane-header {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }

    .p-taskboard-density-compact .p-taskboard-swimlane-body {
        padding: 0.375rem;
    }

    .p-taskboard-density-compact .p-taskboard-swimlane-cell {
        padding: 0.375rem;
        gap: 0.25rem;
    }

    .p-taskboard-density-comfortable .p-taskboard-swimlane-header {
        padding: 1rem 1.25rem;
    }

    .p-taskboard-density-comfortable .p-taskboard-swimlane-body {
        padding: 0.75rem;
    }

    .p-taskboard-density-comfortable .p-taskboard-swimlane-cell {
        padding: 0.75rem;
        gap: 0.625rem;
    }

    /* ----------------------------------------------------------------------------------------------
       Dirección
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-rtl {
        direction: rtl;
    }

    .p-taskboard-rtl .p-taskboard-columns {
        flex-direction: row-reverse;
    }

    .p-taskboard-rtl .p-taskboard-columns-with-groups {
        flex-direction: column;
    }

    .p-taskboard-rtl .p-taskboard-column-group-headers-inner,
    .p-taskboard-rtl .p-taskboard-column-group-mobile-headers-inner,
    .p-taskboard-rtl .p-taskboard-columns-track,
    .p-taskboard-rtl .p-taskboard-column-headers-content,
    .p-taskboard-rtl .p-taskboard-swimlane-body {
        flex-direction: row-reverse;
    }

    .p-taskboard-rtl .p-taskboard-swimlane-header,
    .p-taskboard-rtl .p-taskboard-column-headers-spacer,
    .p-taskboard-rtl .p-taskboard-column-pinned {
        left: auto;
        right: 0;
    }

    .p-taskboard-rtl .p-taskboard-column-pinned::after {
        right: auto;
        left: -6px;
        background: dt('taskboard.column.pinned.shadow.rtl');
    }

    .p-taskboard-rtl .p-taskboard-drag-preview {
        transform: translate(-50%, -50%) rotate(calc(-1 * dt('taskboard.drag.preview.rotation')));
    }

    /* ----------------------------------------------------------------------------------------------
       Táctil
       ---------------------------------------------------------------------------------------------- */

    .p-taskboard-touch .p-taskboard-card {
        min-height: 44px;
    }

    .p-taskboard-touch .p-taskboard-swimlane-header {
        min-height: 48px;
    }

    .p-taskboard-touch .p-taskboard-card-draggable {
        touch-action: none;
    }

    /* ----------------------------------------------------------------------------------------------
       Anchura disponible
       ---------------------------------------------------------------------------------------------- */

    /* Container queries y no media queries: un tablero dentro de un panel estrecho es estrecho
       aunque la ventana sea ancha, y es el ancho del tablero el que decide si caben tres columnas. */
    @container (max-width: 768px) {
        .p-taskboard-column-group-headers {
            display: none;
        }

        .p-taskboard-column-group-mobile-headers {
            display: flex;
        }

        .p-taskboard-column-group-mobile-header {
            flex: 0 0 calc(100cqw - 2 * dt('taskboard.columns.padding'));
            min-width: 240px;
        }

        .p-taskboard-column,
        .p-taskboard-swimlane-cell {
            min-width: 240px;
            max-width: none;
            width: auto;
            flex: 0 0 calc(100cqw - 2 * dt('taskboard.columns.padding'));
        }

        .p-taskboard-column-headers-content > * {
            min-width: 240px;
            max-width: none;
            width: auto;
            flex: 0 0 calc(100cqw - 2 * dt('taskboard.columns.padding'));
        }

        .p-taskboard-swimlane-header,
        .p-taskboard-column-headers-spacer {
            width: 140px;
            min-width: 140px;
        }

        .p-taskboard-column-collapsed {
            min-width: 36px !important;
            max-width: 36px !important;
            flex: 0 0 36px !important;
        }
    }

    @container (max-width: 480px) {
        .p-taskboard-column,
        .p-taskboard-swimlane-cell,
        .p-taskboard-column-headers-content > * {
            min-width: 0;
            flex: 0 0 calc(100cqw - 2 * dt('taskboard.columns.padding'));
        }
    }

    /* Repuesto en viewport para los navegadores sin container queries: menos exacto, pero mejor que
       un tablero de siete columnas cortadas en un móvil. */
    @supports not (container-type: inline-size) {
        @media (max-width: 768px) {
            .p-taskboard-column-group-headers {
                display: none;
            }

            .p-taskboard-column-group-mobile-headers {
                display: flex;
            }

            .p-taskboard-column-group-mobile-header {
                flex: 0 0 85vw;
                min-width: 240px;
            }

            .p-taskboard-column,
            .p-taskboard-swimlane-cell {
                min-width: 240px;
                max-width: none;
                width: auto;
                flex: 0 0 85vw;
            }

            .p-taskboard-column-headers-content > * {
                min-width: 240px;
                max-width: none;
                width: auto;
                flex: 0 0 85vw;
            }

            .p-taskboard-swimlane-header,
            .p-taskboard-column-headers-spacer {
                width: 140px;
                min-width: 140px;
            }

            .p-taskboard-column-collapsed {
                min-width: 36px !important;
                max-width: 36px !important;
                flex: 0 0 36px !important;
            }
        }

        @media (max-width: 480px) {
            .p-taskboard-column,
            .p-taskboard-swimlane-cell,
            .p-taskboard-column-headers-content > * {
                min-width: 0;
                flex: 0 0 92vw;
            }
        }
    }

    /* ----------------------------------------------------------------------------------------------
       Preferencias del sistema
       ---------------------------------------------------------------------------------------------- */

    @media (prefers-reduced-motion: reduce) {
        .p-taskboard-column,
        .p-taskboard-column-body > .p-taskboard-card,
        .p-taskboard-card::after,
        .p-taskboard-drop-indicator,
        .p-taskboard-column-reordering .p-taskboard-column:not(.p-taskboard-column-dragging) {
            transition: none !important;
        }

        .p-taskboard-drag-preview {
            transform: translate(-50%, -50%) !important;
        }
    }

    @media (prefers-contrast: more) {
        .p-taskboard-card-focused::after {
            box-shadow: 0 0 0 3px dt('taskboard.focus.ring.color');
        }

        .p-taskboard-card-selected::after {
            box-shadow: inset 0 0 0 3px dt('taskboard.card.selected.ring.color');
        }

        .p-taskboard-card-selected.p-taskboard-card-focused::after {
            box-shadow:
                inset 0 0 0 3px dt('taskboard.card.selected.ring.color'),
                0 0 0 3px dt('taskboard.focus.ring.color');
        }

        .p-taskboard-drop-indicator::before {
            height: 4px;
        }

        .p-taskboard-swimlane-row,
        .p-taskboard-column-headers {
            border-bottom-width: 2px;
        }
    }

    /* Shadows do not render in forced-colors mode, so selected and focused have to go back to being
       outlines or they stop being distinguishable. */
    @media (forced-colors: active) {
        .p-taskboard-card-focused {
            outline: 2px solid CanvasText;
            outline-offset: 2px;
        }

        .p-taskboard-card-selected {
            outline: 2px solid Highlight;
            outline-offset: -2px;
        }

        .p-taskboard-card::after {
            box-shadow: none;
        }

        .p-taskboard-drop-indicator::before {
            background: Highlight;
            box-shadow: none;
        }

        .p-taskboard-column-body {
            background: Canvas;
        }

        .p-taskboard-swimlane-header {
            background: Canvas;
            border-right: 1px solid CanvasText;
        }

        .p-taskboard-swimlane-row,
        .p-taskboard-column-headers {
            border-bottom-color: CanvasText;
        }

        .p-taskboard-card-disabled {
            opacity: 1;
            color: GrayText;
        }

        .p-taskboard-drag-preview {
            border: 2px solid Highlight;
        }
    }

    /* ----------------------------------------------------------------------------------------------
       Impresión
       ---------------------------------------------------------------------------------------------- */

    /* Everything is hidden and only the marked board and its ancestors are shown again: a board
       inside a scroll panel would otherwise print clipped to the one visible screenful. */
    @media print {
        body.p-taskboard-print-active * {
            visibility: hidden;
        }

        body.p-taskboard-print-active .p-taskboard[data-print-target='true'],
        body.p-taskboard-print-active .p-taskboard[data-print-target='true'] * {
            visibility: visible;
        }

        body.p-taskboard-print-active .p-taskboard-print-ancestor {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
        }

        body.p-taskboard-print-active .p-taskboard-print-ancestor > :not(.p-taskboard-print-ancestor):not(.p-taskboard[data-print-target='true']) {
            display: none !important;
        }

        body.p-taskboard-print-active .p-taskboard[data-print-target='true'] {
            position: static !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            transform: none !important;
            overflow: visible !important;
        }

        .p-taskboard,
        .p-taskboard-printing {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            background: none !important;
            color: #000 !important;
            box-shadow: none !important;
            container-type: normal !important;
        }

        .p-taskboard-header {
            margin-bottom: 0.5rem;
        }

        .p-taskboard-body,
        .p-taskboard-printing .p-taskboard-body {
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
        }

        /* On paper the columns wrap instead of scrolling: a sheet has no horizontal scroll, and a row
           of seven columns comes out cut off by the margin. */
        .p-taskboard-columns,
        .p-taskboard-printing .p-taskboard-columns {
            display: flex !important;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            align-items: flex-start !important;
        }

        .p-taskboard .p-taskboard-column-group-headers,
        .p-taskboard .p-taskboard-column-group-mobile-headers,
        .p-taskboard-printing .p-taskboard-column-group-headers,
        .p-taskboard-printing .p-taskboard-column-group-mobile-headers {
            display: none !important;
        }

        .p-taskboard .p-taskboard-columns-track,
        .p-taskboard-printing .p-taskboard-columns-track {
            display: flex !important;
            flex-wrap: wrap;
            gap: 1rem;
            width: 100% !important;
            min-width: 0 !important;
            align-items: flex-start !important;
        }

        .p-taskboard-column,
        .p-taskboard-printing .p-taskboard-column {
            flex: 1 1 45% !important;
            min-width: 0 !important;
            max-width: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
            overflow: visible !important;
            border: 0 !important;
            box-shadow: none !important;
        }

        .p-taskboard-column-header,
        .p-taskboard-printing .p-taskboard-column-header {
            min-height: 0 !important;
            border: 0 !important;
            border-top: 0 !important;
            background: none !important;
        }

        .p-taskboard-column-todo,
        .p-taskboard-column-in-progress,
        .p-taskboard-column-done,
        .p-taskboard-column-blocked,
        .p-taskboard-column-todo > .p-taskboard-column-header,
        .p-taskboard-column-in-progress > .p-taskboard-column-header,
        .p-taskboard-column-done > .p-taskboard-column-header,
        .p-taskboard-column-blocked > .p-taskboard-column-header {
            border-top: none !important;
        }

        /* The body keeps its flex display, which is the whole point: the card gap comes from it, and
           flattening it to a block prints the cards touching each other and the column edges. Only
           the padding, the surface and the scrolling go. */
        .p-taskboard-column-body,
        .p-taskboard-printing .p-taskboard-column-body {
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            background: none !important;
            border: 0 !important;
            border-radius: 0 !important;
        }

        /* A collapsed column prints its cards: a saved screen state should not take work off the
           printed board. */
        .p-taskboard-column-collapsed {
            min-width: 0 !important;
            max-width: none !important;
            flex: 1 1 45% !important;
            overflow: visible !important;
        }

        .p-taskboard-column-collapsed .p-taskboard-column-body,
        .p-taskboard-column-collapsed .p-taskboard-column-body > * {
            display: flex !important;
            pointer-events: auto;
        }

        .p-taskboard-empty-column {
            color: #999 !important;
            font-style: italic;
        }

        .p-taskboard-card-draggable {
            cursor: default !important;
        }

        .p-taskboard-card-dragging {
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        .p-taskboard-card-selected,
        .p-taskboard-card-focused {
            outline: none !important;
        }

        .p-taskboard-card::after,
        .p-taskboard-card-selected::after,
        .p-taskboard-card-focused::after {
            box-shadow: none !important;
        }

        .p-taskboard-drag-preview,
        .p-taskboard-drop-indicator,
        .p-taskboard-column-footer,
        .p-taskboard-loading {
            display: none !important;
        }

        .p-taskboard-columns::-webkit-scrollbar,
        .p-taskboard-column-body::-webkit-scrollbar {
            display: none;
        }

        .p-taskboard-column-pinned {
            position: static !important;
            background: none !important;
        }

        .p-taskboard-column-pinned::after {
            display: none !important;
        }

        /* A grouped board prints the grid it is showing rather than a second, print-only copy of the
           markup: the rows and the cells already carry their identity, so unrolling them is enough
           and there is nothing to keep in step. */
        .p-taskboard .p-taskboard-swimlane-grid,
        .p-taskboard-printing .p-taskboard-swimlane-grid {
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
        }

        .p-taskboard .p-taskboard-column-headers,
        .p-taskboard-printing .p-taskboard-column-headers {
            display: none !important;
        }

        .p-taskboard .p-taskboard-swimlane-row,
        .p-taskboard-printing .p-taskboard-swimlane-row {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            min-width: 0 !important;
            overflow: visible !important;
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 0.4rem;
            border: 1px solid #d1d5db;
        }

        .p-taskboard .p-taskboard-swimlane-header,
        .p-taskboard-printing .p-taskboard-swimlane-header {
            position: static !important;
            width: 100% !important;
            min-width: 0 !important;
            padding: 0.45rem 0.6rem !important;
            border-bottom: 1px solid #d1d5db;
            background: #f8fafc !important;
            color: #000 !important;
            font-size: 0.8rem !important;
            font-weight: 700 !important;
        }

        .p-taskboard .p-taskboard-swimlane-body,
        .p-taskboard-printing .p-taskboard-swimlane-body,
        .p-taskboard .p-taskboard-swimlane-collapsed .p-taskboard-swimlane-body,
        .p-taskboard-printing .p-taskboard-swimlane-collapsed .p-taskboard-swimlane-body {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(2.25in, 1fr));
            gap: 0.4rem;
            width: 100% !important;
            min-width: 0 !important;
            padding: 0.4rem !important;
            box-sizing: border-box;
        }

        .p-taskboard .p-taskboard-swimlane-cell,
        .p-taskboard-printing .p-taskboard-swimlane-cell {
            display: flex !important;
            width: auto !important;
            min-width: 0 !important;
            min-height: 0 !important;
            flex: none !important;
            padding: 0.35rem !important;
            border: 1px solid #e5e7eb;
            border-radius: 0.25rem;
            overflow: visible !important;
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }

    /* ----------------------------------------------------------------------------------------------
       Partes visuales de serie
       ---------------------------------------------------------------------------------------------- */

    .taskboard-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        cursor: pointer;
        background: dt('taskboard.background');
        border: 1px solid dt('taskboard.swimlane.border.color');
        border-radius: dt('taskboard.column.border.radius');
        transition: box-shadow 0.2s;
    }

    .taskboard-card:hover {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .taskboard-card-title {
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.4;
        color: dt('taskboard.color');
    }

    /* Clamped to two lines: the description is a hint, and a card that grows with it breaks the
       column's density. */
    .taskboard-card-description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
        font-size: 0.75rem;
        line-height: 1.5;
        color: dt('taskboard.empty.color');
    }

    .taskboard-card-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .taskboard-card-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .taskboard-card-progress-track {
        flex: 1;
        height: 3px;
        overflow: hidden;
        background: dt('taskboard.swimlane.border.color');
        border-radius: 1.5px;
    }

    .taskboard-card-progress-fill {
        height: 100%;
        background: dt('taskboard.drop.indicator.color');
        border-radius: 1.5px;
        transition: width 0.3s;
    }

    .taskboard-card-progress-label {
        font-size: 0.6875rem;
        color: dt('taskboard.empty.color');
    }

    .taskboard-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
    }

    .taskboard-card-assignees {
        display: flex;
        align-items: center;
    }

    .taskboard-card-assignees .p-avatar {
        width: 1.5rem;
        height: 1.5rem;
        font-size: 0.6rem;
    }

    .taskboard-card-assignees .p-avatar + .p-avatar {
        margin-left: -0.375rem;
    }

    .taskboard-card-subtask-count {
        font-size: 0.6875rem;
        color: dt('taskboard.empty.color');
    }

    .taskboard-card-advanced {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        position: relative;
        min-height: 3.5rem;
        cursor: pointer;
        background: dt('taskboard.background');
        border: 1px solid dt('taskboard.swimlane.border.color');
        border-radius: dt('taskboard.column.border.radius');
        transition: border-color 0.15s;
    }

    .taskboard-card-advanced:hover {
        border-color: dt('taskboard.drop.indicator.color');
    }

    .taskboard-card-advanced-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .taskboard-card-advanced-tag {
        padding: 0.125rem 0.375rem;
        font-size: 0.6rem;
        font-weight: 600;
        line-height: 1.4;
        border-radius: 0.125rem;
    }

    /* Room on the right for the avatar, which is absolutely positioned in the corner: without it the
       title runs underneath as soon as it wraps to two lines. */
    .taskboard-card-advanced-title {
        padding-right: 2rem;
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.4;
        color: dt('taskboard.color');
    }

    .taskboard-card-advanced-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin-top: auto;
    }

    .taskboard-card-advanced-priority {
        padding: 0.125rem 0.375rem;
        font-size: 0.6rem;
        font-weight: 700;
        border-radius: 0.25rem;
    }

    .taskboard-card-advanced-subtasks,
    .taskboard-card-advanced-due {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: dt('taskboard.empty.color');
    }

    .taskboard-card-advanced-due-overdue {
        color: dt('taskboard.column.status.blocked.color');
    }

    .taskboard-card-advanced-desc-icon {
        display: flex;
        align-items: center;
        color: dt('taskboard.empty.color');
    }

    .taskboard-card-advanced-avatar {
        position: absolute;
        right: 0.5rem;
        bottom: 0.5rem;
        width: 1.5rem !important;
        height: 1.5rem !important;
        font-size: 0.6rem !important;
        font-weight: 600;
    }

    .taskboard-column-header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
        min-height: dt('taskboard.column.header.min.height');
        padding: 0.75rem 1rem;
        box-sizing: border-box;
        font-size: 0.8125rem;
        letter-spacing: 0.01em;
        background: dt('taskboard.column.background');
        border-bottom: 1px solid dt('taskboard.swimlane.border.color');
        border-radius: dt('taskboard.column.border.radius') dt('taskboard.column.border.radius') 0 0;
        user-select: none;
    }

    .taskboard-column-header-content--collapsed {
        justify-content: center;
        padding: 0;
        border-radius: 0;
    }

    .taskboard-column-header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1 1 auto;
        min-width: 0;
    }

    .taskboard-column-header-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: dt('taskboard.color');
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
    }

    .taskboard-column-header-collapse-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 1.75rem;
        height: 1.75rem;
        min-height: 1.75rem;
        padding: 0;
        border: 0;
        border-radius: 0.375rem;
        background: transparent;
        color: dt('taskboard.empty.color');
        cursor: pointer;
    }

    .taskboard-column-header-collapse-toggle:hover:not(:disabled) {
        background: dt('taskboard.hover.background');
        color: dt('taskboard.color');
    }

    .taskboard-column-header-collapse-toggle:focus-visible {
        outline: 2px solid dt('taskboard.focus.ring.color');
        outline-offset: -2px;
    }

    .taskboard-column-header-collapse-toggle:disabled {
        cursor: default;
    }

    /* Collapsed, the button IS the header: it is the only target left in 44px of width. */
    .taskboard-column-header-content--collapsed .taskboard-column-header-collapse-toggle {
        width: 100%;
        height: auto;
        min-height: dt('taskboard.column.header.min.height');
        border-radius: 0;
    }

    .taskboard-column-header-chevron {
        flex-shrink: 0;
        color: dt('taskboard.empty.color');
        transition: transform 0.2s ease;
    }

    .taskboard-column-header-chevron-collapsed {
        transform: rotate(-90deg);
    }

    .taskboard-column-header-lock,
    .taskboard-swimlane-column-header-lock {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        width: 1rem;
        height: 1rem;
        color: dt('taskboard.empty.color');
    }

    .taskboard-column-header-lock svg,
    .taskboard-swimlane-column-header-lock svg {
        flex: 0 0 auto;
    }

    .taskboard-column-header-meta-group {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        flex: 0 1 auto;
        min-width: 0;
        overflow: visible;
    }

    .taskboard-column-header-meta {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        min-height: 1.25rem;
        max-width: 8rem;
        padding: 0.125rem 0.375rem;
        border: 1px solid transparent;
        border-radius: 999px;
        font-size: 0.625rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .taskboard-column-header-meta--neutral {
        border-color: dt('taskboard.meta.neutral.border.color');
        background: dt('taskboard.meta.neutral.background');
        color: dt('taskboard.meta.neutral.color');
    }

    .taskboard-column-header-meta--info {
        border-color: dt('taskboard.meta.info.border.color');
        background: dt('taskboard.meta.info.background');
        color: dt('taskboard.meta.info.color');
    }

    .taskboard-column-header-meta--warning {
        border-color: dt('taskboard.meta.warning.border.color');
        background: dt('taskboard.meta.warning.background');
        color: dt('taskboard.meta.warning.color');
    }

    .taskboard-column-header-meta--danger {
        border-color: dt('taskboard.meta.danger.border.color');
        background: dt('taskboard.meta.danger.background');
        color: dt('taskboard.meta.danger.color');
    }

    .taskboard-swimlane-header-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
        user-select: none;
    }

    .taskboard-swimlane-header-content .p-tag,
    .taskboard-swimlane-column-header .p-tag {
        flex-shrink: 0;
    }

    .taskboard-swimlane-header-collapse-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        flex-shrink: 0;
        padding: 0;
        border: 0;
        border-radius: dt('taskboard.border.radius.sm');
        background: transparent;
        color: dt('taskboard.empty.color');
        cursor: pointer;
        transition:
            background 0.15s ease,
            color 0.15s ease;
    }

    .taskboard-swimlane-header-collapse-toggle:hover:not(:disabled) {
        background: dt('taskboard.hover.background');
        color: dt('taskboard.color');
    }

    .taskboard-swimlane-header-collapse-toggle:focus-visible {
        outline: 2px solid dt('taskboard.focus.ring.color');
        outline-offset: 2px;
    }

    .taskboard-swimlane-header-collapse-toggle:disabled {
        cursor: default;
        opacity: 0.6;
    }

    .taskboard-swimlane-header-title {
        flex: 1;
        min-width: 0;
        font-size: 0.8125rem;
        font-weight: 600;
        color: dt('taskboard.color');
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .taskboard-swimlane-header-chevron {
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .taskboard-swimlane-header-chevron-collapsed {
        transform: rotate(-90deg);
    }

    .taskboard-swimlane-column-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 0.5rem;
        font-size: 0.8125rem;
    }

    .taskboard-swimlane-column-header-title {
        font-weight: 600;
        color: dt('taskboard.color');
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ----------------------------------------------------------------------------------------------
       The supplied parts on paper
       ---------------------------------------------------------------------------------------------- */

    /* The header loses its surface and its controls: the column NAME is what a printed board needs,
       and a chevron that cannot be clicked is ink spent on nothing. */
    @media print {
        .p-taskboard .taskboard-column-header-content,
        .p-taskboard-printing .taskboard-column-header-content {
            min-height: 0 !important;
            padding: 0 0 0.35rem !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: none !important;
            justify-content: flex-start !important;
            gap: 0 !important;
        }

        .p-taskboard .taskboard-column-header-left,
        .p-taskboard-printing .taskboard-column-header-left {
            gap: 0 !important;
            min-width: 0;
        }

        .p-taskboard .taskboard-column-header-title,
        .p-taskboard-printing .taskboard-column-header-title {
            color: #000 !important;
            font-size: 0.72rem !important;
            font-weight: 700 !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
        }

        .p-taskboard .taskboard-column-header-collapse-toggle,
        .p-taskboard .taskboard-column-header-content .p-tag,
        .p-taskboard .taskboard-column-header-meta-group,
        .p-taskboard-printing .taskboard-column-header-collapse-toggle,
        .p-taskboard-printing .taskboard-column-header-content .p-tag,
        .p-taskboard-printing .taskboard-column-header-meta-group {
            display: none !important;
        }

        /* A tinted chip prints as a grey block and the label inside it disappears, so a label keeps
           only its outline on paper. */
        .p-taskboard .taskboard-card-tags .p-tag,
        .p-taskboard .taskboard-card-advanced-tag,
        .p-taskboard-printing .taskboard-card-tags .p-tag,
        .p-taskboard-printing .taskboard-card-advanced-tag {
            border: 1px solid #d1d5db !important;
            background: #fff !important;
            color: #374151 !important;
            box-shadow: none !important;
        }

        .p-taskboard .taskboard-swimlane-header-collapse-toggle,
        .p-taskboard-printing .taskboard-swimlane-header-collapse-toggle {
            display: none !important;
        }
    }

`;
