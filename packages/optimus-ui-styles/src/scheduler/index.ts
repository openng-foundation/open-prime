export const style = /*css*/ `
    .p-scheduler {
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: dt('scheduler.background');
        color: dt('scheduler.color');
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.border.radius');
        overflow: hidden;
    }

    .p-scheduler-header {
        display: flex;
        align-items: center;
        gap: dt('scheduler.header.gap');
        padding: dt('scheduler.header.padding');
        background: dt('scheduler.header.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-navigation {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    /* Genuinely centred title: flex:1 on all three sides and not only on the middle one, or the
       title drifts off centre as soon as the nav and the selector measure differently. */
    .p-scheduler-navigation,
    .p-scheduler-view-selector {
        flex: 1 0 auto;
    }

    .p-scheduler-view-selector {
        justify-content: flex-end;
    }

    /* nowrap + ellipsis and NOT wrap: the title is the header's visual anchor, and broken across
       three lines by a wide view selector it changed the height of the whole bar. If it does not
       fit, it is clipped. */
    .p-scheduler-title {
        flex: 0 1 auto;
        min-inline-size: 0;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: dt('scheduler.title.font.size');
        font-weight: dt('scheduler.title.font.weight');
        color: dt('scheduler.title.color');
    }

    .p-scheduler-view-selector {
        display: flex;
        align-items: center;
        gap: 0.125rem;
    }

    /* The label shown when there is only one view: a button that leads nowhere invites a click, so
       with a single view available the selector prints text instead. */
    .p-scheduler-view-label {
        padding: 0.25rem 0.5rem;
        font-size: 0.8125rem;
        color: dt('scheduler.gutter.color');
        white-space: nowrap;
    }

    .p-scheduler-view-button,
    .p-scheduler-today-button,
    .p-scheduler-nav-button {
        padding: 0.25rem 0.5rem;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: dt('scheduler.color');
        font-size: 0.8125rem;
        white-space: nowrap;
        cursor: pointer;
    }

    .p-scheduler-view-button:hover,
    .p-scheduler-today-button:hover,
    .p-scheduler-nav-button:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-today-button {
        color: dt('scheduler.accent.color');
        font-weight: 500;
    }

    /* PHYSICAL borders and not logical ones: the arrow is a rotated corner, and with
       border-inline-end the corner moved by itself in RTL and the rotation stopped pointing
       anywhere. In RTL it is the rotations that flip, below. */
    .p-scheduler-nav-icon {
        display: inline-block;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-top: 1.5px solid currentColor;
        border-right: 1.5px solid currentColor;
    }

    .p-scheduler-nav-icon-prev {
        transform: rotate(-135deg);
    }

    .p-scheduler-nav-icon-next {
        transform: rotate(45deg);
    }

    /* "Previous" points the way reading goes backwards, which in RTL is to the right. */
    [dir='rtl'] .p-scheduler-nav-icon-prev {
        transform: rotate(45deg);
    }

    [dir='rtl'] .p-scheduler-nav-icon-next {
        transform: rotate(-135deg);
    }

    /* Background and colour ALWAYS together: with the background alone, a theme whose highlight is
       a dark fill leaves the label invisible. */
    .p-scheduler-view-button[data-selected] {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
        font-weight: 600;
    }

    /* The semantic components are CONTEXT BOUNDARIES, not boxes: used as a definition, their host
       element lands inside the surface they replace — a flex cell, a grid — and as an inline
       element it broke that layout: the children stopped being flex items of the parent, so a
       margin-inline-start:auto pushed nothing and the gap disappeared. display:contents takes them
       out of the layout and leaves their children where the renderer expects them, without taking
       them out of the DOM: the data-slots and the test selectors are still there. */
    p-scheduler-event,
    p-scheduler-time-grid-event,
    p-scheduler-all-day-event,
    p-scheduler-month-event,
    p-scheduler-agenda-event,
    p-scheduler-day-header,
    p-scheduler-all-day-cell,
    p-scheduler-time-gutter,
    p-scheduler-time-grid-cell,
    p-scheduler-work-cell,
    p-scheduler-month-title,
    p-scheduler-month-header-cell,
    p-scheduler-month-cell,
    p-scheduler-month-cell-number,
    p-scheduler-month-day-cell,
    p-scheduler-month-more-link,
    p-scheduler-mini-month-header,
    p-scheduler-mini-month-cell,
    p-scheduler-agenda-date-header,
    p-scheduler-timeline-header-cell,
    p-scheduler-timeline-cell,
    p-scheduler-timeline-event,
    p-scheduler-resource-column-header,
    p-scheduler-resource-area-header,
    p-scheduler-resource-header,
    p-scheduler-resource,
    p-scheduler-resource-group,
    p-scheduler-resource-row,
    p-scheduler-resource-aggregate-badge {
        display: contents;
    }

    .p-scheduler-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: auto;
    }

    /* ── Time grid: day and week ─────────────────────────────────────────── */

    .p-scheduler-time-grid {
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* The column minimum comes from a variable with the token as its fallback: when the columns are
       resources rather than days there are many more of them and they need a different floor, and
       the view is what decides that. */
    .p-scheduler-time-grid-header,
    .p-scheduler-time-grid-body,
    .p-scheduler-time-grid-groups {
        display: grid;
        grid-template-columns: dt('scheduler.gutter.width') repeat(var(--p-scheduler-columns, 1), minmax(var(--p-scheduler-column-min-width, dt('scheduler.day.min.width')), 1fr));
    }

    /* The whole head sticks as one unit and the two bands stack inside it by flow. With one sticky
       band above another, both at inset-block-start: 0, the two land in the same place and the upper
       covers the lower; with the wrapper stuck, the browser measures the height and nothing depends
       on a calculation about the host's line height. */
    .p-scheduler-time-grid-head {
        position: sticky;
        inset-block-start: 0;
        z-index: 2;
        background: dt('scheduler.weekday.background');
    }

    .p-scheduler-time-grid-groups {
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-resource-column-header {
        grid-column: span var(--p-scheduler-column-span, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: dt('scheduler.day.header.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: 0.8125rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
    }

    .p-scheduler-time-grid-header {
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-day-header-cell {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 0.3rem;
        padding: dt('scheduler.day.header.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: 0.8125rem;
    }

    .p-scheduler-day-header-number {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    .p-scheduler-day-header-resource {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .p-scheduler-day-header-weekday {
        letter-spacing: 0.04em;
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-day-header-cell[data-today] .p-scheduler-day-header-weekday {
        color: inherit;
    }

    .p-scheduler-day-header-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
        font-weight: 700;
    }

    .p-scheduler-day-header-cell[data-weekend] {
        background: dt('scheduler.weekend.background');
    }

    .p-scheduler-all-day-row {
        display: grid;
        grid-template-columns: dt('scheduler.gutter.width') 1fr;
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-gutter {
        padding: 0.25rem 0.5rem;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        text-align: end;
    }

    /* The same tracks as the header and the body: with a bare 1fr, as soon as the resource columns
       overflowed horizontally the all-day events stopped lining up with their column. */
    .p-scheduler-all-day-lanes {
        position: relative;
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-columns, 1), minmax(var(--p-scheduler-column-min-width, dt('scheduler.day.min.width')), 1fr));
        min-height: calc(var(--p-scheduler-all-day-rows, 1) * dt('scheduler.all.day.row.height'));
    }

    .p-scheduler-all-day-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-event,
    .p-scheduler-month-bar {
        position: absolute;
        box-sizing: border-box;
        inset-block-start: calc(var(--p-scheduler-event-row, 0) * dt('scheduler.all.day.row.height'));
        display: flex;
        align-items: center;
        gap: 0.25rem;
        block-size: calc(dt('scheduler.all.day.row.height') - 2px);
        padding-inline: dt('scheduler.event.padding.x');
        border-radius: dt('scheduler.event.border.radius');
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        font-weight: 600;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    /* The month's bars start just below the number band. */
    .p-scheduler-month-bar {
        inset-block-start: calc(dt('scheduler.month.cell.padding') + dt('scheduler.month.number.height') + var(--p-scheduler-event-row, 0) * dt('scheduler.all.day.row.height'));
        z-index: 1;
    }

    /* A timed event inside the month is dot + title + time, with no box: half a dozen filled
       rectangles in a 6rem cell cannot be read. */


    .p-scheduler-time-gutter-spacer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-time-gutter-slot {
        position: relative;
        block-size: dt('scheduler.slot.height');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    /* The label is positioned and nowrap: broken across two lines it grows the strip and the hour
       column stops lining up with the grid — which is exactly what happened. */
    .p-scheduler-time-gutter-label {
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0.5rem;
        transform: translateY(-50%);
        white-space: nowrap;
    }

    .p-scheduler-time-gutter-slot:first-child .p-scheduler-time-gutter-label {
        transform: none;
    }

    .p-scheduler-time-grid-column {
        position: relative;
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    /* The hatching goes above the cell's background (business hours or not) and below the events,
       just like today's tint: they are two different facts about the same cell and both have to
       stay visible. */
    .p-scheduler-time-grid-cell[data-blocked],
    .p-scheduler-timeline-cell[data-blocked] {
        background-image: dt('scheduler.blocked.background');
        cursor: not-allowed;
    }

    /* The whole column is tinted, not just its header: that is what lets you find today without
       reading. It goes in a ::before above the cells and NOT as the column's background: the cells
       paint a background of their own (business hours or not) and covered the tint of the column
       behind them. The token is translucent, so the shading underneath still shows through, and the
       events — later positioned siblings — stay above it. */
    .p-scheduler-time-grid-column[data-today]::before {
        content: '';
        position: absolute;
        inset: 0;
        background: dt('scheduler.today.background');
        pointer-events: none;
    }

    .p-scheduler-time-grid-cell {
        block-size: dt('scheduler.slot.height');
        border-bottom: 1px dashed dt('scheduler.border.color');
    }

    .p-scheduler-time-grid-cell[data-major] {
        border-bottom-style: solid;
    }

    /* The out-of-hours shading only applies when the page CONFIGURED business hours: without that
       condition, a grid with no hours declared came out entirely in the "non-working" colour, which
       says the opposite of what it means. */
    .p-scheduler-time-grid-cell[data-business] {
        background: dt('scheduler.business.background');
    }

    .p-scheduler-time-grid[data-business-hours] .p-scheduler-time-grid-cell:not([data-business]) {
        background: dt('scheduler.non.business.background');
    }

    .p-scheduler-time-grid-event {
        position: absolute;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 0.0625rem;
        min-block-size: 1.25rem;
        padding: 0.1875rem 0.375rem;
        border-radius: dt('scheduler.event.border.radius');
        /* The accent tints the fill AND draws the border: the background comes from the event's own
           colour at low opacity through color-mix, not from a fixed token, so each category stays
           distinguishable. */
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        line-height: 1.25;
        cursor: pointer;
        overflow: hidden;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-title {
        font-weight: 600;
    }

    /* min-inline-size: 0 is what makes the ellipsis work inside a flex container; without it the
       title forces the width and the event overflows instead of being clipped. */
    .p-scheduler-time-grid-event > * {
        min-inline-size: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-time-grid-event[data-selected],
    .p-scheduler-month-event[data-selected],
    .p-scheduler-agenda-event[data-selected] {
        box-shadow: 0 0 0 2px dt('scheduler.focus.ring.color');
    }

    .p-scheduler-time-grid-event[data-continues-before] {
        border-start-start-radius: 0;
        border-start-end-radius: 0;
    }

    .p-scheduler-time-grid-event[data-continues-after] {
        border-end-start-radius: 0;
        border-end-end-radius: 0;
    }

    .p-scheduler-event-time {
        flex: 0 0 auto;
        font-size: dt('scheduler.event.time.font.size');
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.gutter.color');
    }



    .p-scheduler-event-title {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* An empty cell's focus ring goes INSIDE: a time-grid cell is 28px tall and an outline drawn
       outside it is covered by the next cell. Without this, arrow navigation moves an invisible
       focus, which is worse than not navigating at all. */
    [data-nav-cell]:focus-visible {
        outline: 0;
        box-shadow: inset 0 0 0 2px dt('scheduler.focus.ring.color');
        z-index: 1;
    }

    /* ── Appointment slots ───────────────────────────────────────────────── */

    /* Behind the events (lower z-index, no pointer beyond the click) and in the theme's "available"
       colour. A full slot is hatched like a blocked one, because as far as booking goes they are
       the same thing. */
    .p-scheduler-appointment-slot {
        position: absolute;
        inset-inline: 0;
        z-index: 0;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 0.0625rem 0.25rem;
        background: dt('scheduler.slot.available.background');
        border-block: 1px solid color-mix(in srgb, dt('scheduler.accent.color') 35%, transparent);
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
        cursor: pointer;
    }

    .p-scheduler-appointment-slot[data-full] {
        background-image: dt('scheduler.blocked.background');
        cursor: not-allowed;
    }

    /* data-display=grid tints the slot across the whole cell with no border and no label: for when
       what matters is the shape of the availability and not the detail. */
    .p-scheduler-appointment-slot[data-display='grid'] {
        border-block: 0;
    }

    .p-scheduler-appointment-slot[data-display='grid'] .p-scheduler-appointment-slot-label {
        display: none;
    }

    /* data-display=indicator tints nothing: a 3px bar at the column's edge, for a grid too dense to
       paint backgrounds into. */
    .p-scheduler-appointment-slot[data-display='indicator'] {
        inset-inline: auto 0;
        inline-size: 3px;
        padding: 0;
        border-block: 0;
        background: dt('scheduler.accent.color');
    }

    .p-scheduler-appointment-slot[data-display='indicator'] .p-scheduler-appointment-slot-label {
        display: none;
    }

    /* ── Drag and resize ─────────────────────────────────────────────────── */

    /* touch-action: none on the draggable surface and not on the container: without it the browser
       reads a finger drag as a scroll and the event does not move; putting it any higher would kill
       scrolling for the whole grid. */
    /* user-select: none on what can be dragged, and on the WHOLE Scheduler while a drag is under
       way: on macOS the gesture started a text selection, and from then on the browser drags the
       selection instead of letting the component follow the pointer. */
    [data-draggable],
    .p-scheduler-event-resize-handle {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
    }

    [data-draggable] {
        cursor: grab;
    }

    .p-scheduler[data-interacting] {
        user-select: none;
        -webkit-user-select: none;
    }

    [data-dragging],
    [data-resizing] {
        z-index: 4;
        cursor: grabbing;
        opacity: 0.85;
        box-shadow: 0 4px 12px -6px rgba(0, 0, 0, 0.5);
    }

    /* The handle is a 6px strip over the event's edge. It has no background: the cursor is what
       announces it, and a visible grip on every appointment fills the grid with noise. */
    .p-scheduler-event-resize-handle {
        position: absolute;
        z-index: 3;
        touch-action: none;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle {
        inset-inline: 0;
        block-size: 6px;
        cursor: ns-resize;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle[data-edge='start'] {
        inset-block-start: 0;
    }

    .p-scheduler-time-grid-event .p-scheduler-event-resize-handle[data-edge='end'] {
        inset-block-end: 0;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle {
        inset-block: 0;
        inline-size: 6px;
        cursor: ew-resize;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle[data-edge='start'] {
        inset-inline-start: 0;
    }

    .p-scheduler-timeline-event .p-scheduler-event-resize-handle[data-edge='end'] {
        inset-inline-end: 0;
    }

    .p-scheduler-now-indicator {
        position: absolute;
        inset-inline: 0;
        z-index: 2;
        block-size: 0;
        border-top: 2px solid dt('scheduler.now.indicator.color');
        pointer-events: none;
    }

    .p-scheduler-now-indicator::before {
        content: '';
        position: absolute;
        inset-block-start: -0.25rem;
        inset-inline-start: 0;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.now.indicator.color');
    }

    /* ── Month grid ──────────────────────────────────────────────────────── */

    .p-scheduler-month {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    /* Caption of one grid in a multi-month view. It sits above the weekday row and repeats the
       month name the header cannot carry once the range covers more than one. */
    .p-scheduler-month-title {
        padding: 0.5rem 0.75rem;
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        font-weight: 600;
    }

    /* Only the FIRST letter: text-transform capitalize turns the Spanish "septiembre de 2026" into
       "Septiembre De 2026", and most locales print the month lowercase. */
    .p-scheduler-month-title::first-letter {
        text-transform: uppercase;
    }

    .p-scheduler-month-header {
        display: grid;
        grid-template-columns: repeat(7, minmax(dt('scheduler.month.day.min.width'), 1fr));
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    /* The same separators as the body, minus the first: without them the weekday row floated above
       a grid that has them. */
    .p-scheduler-month-header-cell + .p-scheduler-month-header-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-month-header-cell {
        padding: 0.5rem;
        font-size: dt('scheduler.gutter.font.size');
        font-weight: 600;
        letter-spacing: 0.06em;
        color: dt('scheduler.gutter.color');
        text-align: center;
    }

    .p-scheduler-month-body {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .p-scheduler-month-week {
        position: relative;
        display: grid;
        grid-template-columns: repeat(7, minmax(dt('scheduler.month.day.min.width'), 1fr));
        flex: 1;
        min-height: calc(dt('scheduler.month.cell.min.height') + var(--p-scheduler-month-rows, 1) * dt('scheduler.all.day.row.height'));
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-all-day-event {
        z-index: 1;
    }

    .p-scheduler-month-cell {
        display: flex;
        flex-direction: column;
        padding: dt('scheduler.month.cell.padding');
        border-inline-start: 1px solid dt('scheduler.border.color');
        cursor: pointer;
    }

    .p-scheduler-month-cell:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-month-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
    }

    .p-scheduler-month-cell[data-weekend] {
        background: dt('scheduler.weekend.background');
    }

    .p-scheduler-month-cell[data-other-month] {
        background: dt('scheduler.other.month.background');
        color: dt('scheduler.other.month.color');
    }

    .p-scheduler-month-cell[data-selected] {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
    }

    /* A fixed-height band for the number: it is what the events below reserve, so its height must
       NOT depend on the content or the bars would ride over it. */
    .p-scheduler-month-cell-number {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        block-size: dt('scheduler.month.number.height');
        font-size: dt('scheduler.month.number.font.size');
        font-weight: 600;
    }

    .p-scheduler-month-cell[data-today] .p-scheduler-month-cell-number {
        /* Here the solid fill does belong, with its contrast colour: mark the day, do not invert the
           whole cell. */
        inline-size: dt('scheduler.month.number.height');
        justify-content: center;
        border-radius: 999px;
        background: dt('scheduler.today.badge.background');
        color: dt('scheduler.today.badge.color');
        font-weight: 600;
    }

    /* Today does NOT tint the month cell: the circle around the number already says so and the tint
       would fight the events' fills. In the time grid it does, because there is no number there.
       The :not() is essential: at the same specificity as the [data-selected] rule and coming
       after it, today won and selecting today was invisible. */
    .p-scheduler-month-cell[data-today]:not([data-selected]) {
        background: transparent;
    }

    .p-scheduler-month-day-cell {
        display: flex;
        flex-direction: column;
        gap: 0.0625rem;
        flex: 1;
        min-height: 0;
    }

    /* A single-day event is a row INSIDE the cell, not a positioned bar: as a bar it measured
       2h/168h of the week, which is 7px, and all you saw was the dot. */
    .p-scheduler-month-event {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        inline-size: 100%;
        min-block-size: dt('scheduler.all.day.row.height');
        padding-inline: 0.125rem;
        border: 0;
        border-radius: dt('scheduler.event.border.radius');
        background: transparent;
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        text-align: start;
        cursor: pointer;
        overflow: hidden;
    }

    .p-scheduler-month-event:hover {
        background: dt('scheduler.day.hover.background');
    }

    .p-scheduler-month-event .p-scheduler-event-title {
        flex: 0 1 auto;
        min-inline-size: 0;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-month-event .p-scheduler-event-time {
        margin-inline-start: auto;
        white-space: nowrap;
    }

    /* The cell's list starts below the bars that cross THAT day. */
    .p-scheduler-month-day-cell {
        margin-block-start: calc(var(--p-scheduler-bar-rows, 0) * dt('scheduler.all.day.row.height'));
    }

    .p-scheduler-event-dot {
        flex: 0 0 auto;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.event.border.accent');
    }

    /* Right under the last event and not at the bottom of the cell: with margin-top:auto the link
       drifted away from the list it summarises and floated in the gap. */
    .p-scheduler-month-more-link {
        align-self: flex-start;
        padding: 0 0.25rem;
        border: 0;
        background: transparent;
        color: dt('scheduler.more.link.color');
        font-size: dt('scheduler.event.font.size');
        cursor: pointer;
    }

    /* Header of a per-resource month grid, and the resource label inside a cell. */
    .p-scheduler-month-resource-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.resource.area.row.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        font-weight: 600;
    }

    /* Stacked grids need a rule between them, or the last day of one and the first of the next read
       as the same grid. */
    .p-scheduler-view-month .p-scheduler-month + .p-scheduler-month {
        border-top: 2px solid dt('scheduler.border.color');
    }

    /* Several months share the height instead of each taking a whole viewport: a grid that shrinks
       below its six rows would clip them, so it keeps its own size and the view scrolls. */
    .p-scheduler-view-month[data-month-count]:not([data-month-count='1']) .p-scheduler-month {
        flex: 0 0 auto;
    }

    .p-scheduler-month-resource-group {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding-inline: 0.125rem;
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
    }

    /* ── Agenda ───────────────────────────────────────────────────────────── */

    .p-scheduler-agenda {
        display: flex;
        flex-direction: column;
    }

    .p-scheduler-agenda-date-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.agenda.header.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        position: sticky;
        top: 0;
    }

    .p-scheduler-agenda-heading {
        display: flex;
        flex-direction: column;
    }

    .p-scheduler-agenda-date-header[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
    }

    .p-scheduler-agenda-day {
        font-size: dt('scheduler.gutter.font.size');
        font-weight: 700;
        letter-spacing: 0.06em;
        color: dt('scheduler.accent.color');
    }

    .p-scheduler-agenda-date {
        font-weight: 600;
    }

    .p-scheduler-agenda-count {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-inline-start: auto;
        min-inline-size: 1.5rem;
        block-size: 1.5rem;
        padding-inline: 0.375rem;
        border: 1px solid dt('scheduler.border.color');
        border-radius: 999px;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    /* The row is gutter + card and not a single box: the accent pressed against the container's
       edge read as a border of the panel, and the list ended up misaligned with the time gutter of
       the day and week views.
       Neither of the two carries a border: with a line under the row and another beside the
       gutter, the agenda read as a table of empty cells. What separates appointments is the air
       between cards, and what separates days is the sticky header. */
    .p-scheduler-agenda-row {
        display: grid;
        grid-template-columns: dt('scheduler.agenda.gutter.width') minmax(0, 1fr);
    }

    .p-scheduler-agenda-event {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block: 0.25rem;
        margin-inline-end: 0.5rem;
        padding: dt('scheduler.agenda.row.padding');
        border-start-end-radius: dt('scheduler.event.border.radius');
        border-end-end-radius: dt('scheduler.event.border.radius');
        /* The same tinted fill as an event in the grid: in the agenda the category's colour is the
           only hint of what each appointment is, because there is no geometry placing it. */
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        cursor: pointer;
    }

    .p-scheduler-agenda-event:hover {
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) calc(dt('scheduler.event.fill.opacity') + 8%), dt('scheduler.background'));
    }

    .p-scheduler-agenda-event .p-scheduler-event-title {
        min-inline-size: 0;
    }

    /* At the end of the row and not next to the title: the time is supporting information, and in a
       column of its own the list can be scanned vertically reading nothing but times. */
    .p-scheduler-agenda-event-time {
        flex: 0 0 auto;
        margin-inline-start: auto;
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.gutter.color');
        font-size: dt('scheduler.event.time.font.size');
    }

    .p-scheduler-agenda-empty,
    .p-scheduler-view-unavailable {
        padding: 3rem 1rem;
        text-align: center;
        color: dt('scheduler.gutter.color');
    }

    /* ── Year: twelve mini-months ────────────────────────────────────────── */

    /* auto-fill over the card's minimum width and not four fixed columns: with four fixed, a 730px
       panel left the mini-month at 150px and the day cell at 19px, which is numbers touching. This
       way the year lays out as many columns as fit — four on a wide screen, three in a docs card,
       one on a phone — and the day cell never drops below a legible size. It replaces the media
       query that was here: the threshold comes from the content and not from the viewport, which is
       what matters when the Scheduler lives inside a panel. */
    .p-scheduler-year {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(dt('scheduler.mini.month.min.width'), 1fr));
        gap: dt('scheduler.mini.month.gap');
        padding: dt('scheduler.mini.month.gap');
        overflow: auto;
    }

    /* No padding on the card: the header and the grid carry it. With padding here the interior lost
       24px of width and the mini-month came out cramped. */
    .p-scheduler-mini-month {
        display: flex;
        flex-direction: column;
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.mini.month.border.radius');
        overflow: hidden;
    }

    .p-scheduler-mini-month-header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('scheduler.mini.month.padding');
        /* A separator under the month's name: without it the header and the grid read as one block
           and the mini-month loses the air that makes it look like a calendar. */
        border-bottom: 1px solid dt('scheduler.border.color');
        font-size: 1rem;
        font-weight: 600;
        text-align: center;
    }

    /* Columns at 1fr: they take up the WHOLE width of the card. Pinning them to the day's size left
       the grid narrower than the card and off centre against the header. */
    .p-scheduler-mini-month-grid {
        display: grid;
        /* minmax(0,1fr) and not a bare 1fr: 1fr is minmax(auto,1fr) and the number's minimum width
           widens the column, so the seven of them added up to more than the card. With 0 they
           divide it exactly. NOTE: no backticks in these comments, they close the template
           literal. */
        grid-template-columns: repeat(7, minmax(0, 1fr));
        padding-block-start: dt('scheduler.mini.month.grid.padding');
    }

    .p-scheduler-mini-month-weekday {
        display: flex;
        align-items: center;
        justify-content: center;
        block-size: dt('scheduler.mini.month.day.size');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-mini-month-day {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        /* A SQUARE cell: the column sets the width (1fr of the card's width) and aspect-ratio
           matches the height to it. With a fixed block-size the cell came out rectangular and
           today's badge an oval. The min-block-size only kicks in on very narrow cards, where 1fr
           falls below a legible size for the number. */
        aspect-ratio: 1;
        min-block-size: dt('scheduler.mini.month.day.size');
        border: 0;
        /* A 50% radius: over a square cell that gives an exact circle, both on hover and for today. */
        border-radius: 50%;
        padding: 0;
        background: transparent;
        color: inherit;
        font-size: dt('scheduler.mini.month.font.size');
        line-height: 1;
        font-variant-numeric: tabular-nums;
        cursor: pointer;
    }

    .p-scheduler-mini-month-day:hover {
        background: dt('scheduler.day.hover.background');
    }

    /* The weekend in a colour of its own: in a 17px grid with no visible header that is what lets
       you find Saturday without counting columns. It does not apply to the neighbouring month,
       which is already dimmed, nor to today, which has its circle. */
    .p-scheduler-mini-month-day-weekend:not(.p-scheduler-mini-month-day-other):not([data-today]) {
        color: dt('scheduler.mini.month.weekend.color');
    }

    /* Empty but square like the rest: it only holds its place in the grid so the month starts in
       the right column and the six rows measure the same across all twelve mini-months. */
    .p-scheduler-mini-month-day-other {
        color: dt('scheduler.other.month.color');
        pointer-events: none;
    }

    /* :not(-other) because the grid is a fixed 42 days and carries days from the next month: without
       the filter, 8 September also drew its circle on August's card, in an empty cell. */
    .p-scheduler-mini-month-day[data-selected]:not([data-today]):not(.p-scheduler-mini-month-day-other) {
        background: dt('scheduler.selected.background');
        color: dt('scheduler.selected.color');
    }

    .p-scheduler-mini-month-day[data-today]:not(.p-scheduler-mini-month-day-other) {
        background: dt('scheduler.today.badge.background');
        color: dt('scheduler.today.badge.color');
        font-weight: 600;
    }

    /* The indicator goes BELOW the number, not beside it: at this size an inline dot pushes the
       figure and knocks the mini-month grid out of true. The offset is in % and not in px because
       the cell grows with the card's width, and a fixed 1px pinned it to the edge of the circle. */
    .p-scheduler-mini-month-indicator {
        position: absolute;
        inset-block-end: 12%;
        inline-size: 0.25rem;
        block-size: 0.25rem;
        border-radius: 50%;
        background: var(--p-scheduler-mini-month-indicator-background, dt('scheduler.accent.color'));
    }

    .p-scheduler-mini-month-day[data-today] .p-scheduler-mini-month-indicator {
        background: currentColor;
    }

    /* ── Timeline: the day laid out horizontally ─────────────────────────── */

    .p-scheduler-timeline {
        display: flex;
        min-height: 0;
        overflow: hidden;
    }

    /* The resource rail is sticky and NOT in a scroller of its own: two parallel scrollers have to
       be synchronised by hand and drift apart as soon as anything else moves the page. */
    .p-scheduler-resource-area {
        position: sticky;
        inset-inline-start: 0;
        z-index: 2;
        flex: 0 0 dt('scheduler.resource.area.width');
        inline-size: dt('scheduler.resource.area.width');
        background: dt('scheduler.resource.area.background');
        border-inline-end: 1px solid dt('scheduler.border.color');
    }

    /* The gap above the rail measures whatever the axis header measures: however many context bands
       the scale has, plus the column row. With a fixed 3, a month timeline — which carries only the
       period band — left the rail a whole band out of place. */
    .p-scheduler-timeline-resource .p-scheduler-resource-area-header {
        block-size: calc((var(--p-scheduler-timeline-tiers, 0) + 1) * dt('scheduler.timeline.header.height'));
    }

    .p-scheduler-resource-area-header {
        display: flex;
        align-items: center;
        block-size: dt('scheduler.timeline.header.height');
        padding: dt('scheduler.resource.area.header.padding');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        font-weight: 600;
    }

    .p-scheduler-resource {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-block-size: calc(var(--p-scheduler-timeline-rows, 1) * var(--p-scheduler-timeline-row-height, dt('scheduler.resource.area.row.height')));
        padding: dt('scheduler.resource.area.row.padding');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-resource-dot {
        flex: 0 0 auto;
        inline-size: 0.5rem;
        block-size: 0.5rem;
        border-radius: 50%;
        background: dt('scheduler.event.border.accent');
    }

    .p-scheduler-resource-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .p-scheduler-resource-count {
        margin-inline-start: auto;
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        font-variant-numeric: tabular-nums;
    }

    .p-scheduler-timeline-scroll {
        flex: 1;
        min-inline-size: 0;
        overflow: auto;
    }

    .p-scheduler-timeline-header,
    .p-scheduler-timeline-cells {
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-timeline-cols, 1), minmax(dt('scheduler.timeline.slot.width'), 1fr));
    }

    /* The bands share the axis's column template, and each cell spans the ones it owns through
       grid-column: span. It is the only thing that keeps them squared with the hours when the axis
       is 168 columns wide and scrolls horizontally. */
    .p-scheduler-timeline-tier {
        display: grid;
        grid-template-columns: repeat(var(--p-scheduler-timeline-cols, 1), minmax(dt('scheduler.timeline.slot.width'), 1fr));
        position: sticky;
        inset-block-start: calc(var(--p-scheduler-timeline-tier-index, 0) * dt('scheduler.timeline.header.height'));
        z-index: 1;
    }

    /* NO overflow: hidden. The label inside is sticky, and an ancestor with clipped overflow becomes
       its scroll container: the label stuck to the leading edge of its own cell — several screens
       away — instead of to the axis's, and the band came out empty. */
    .p-scheduler-timeline-tier-cell {
        grid-column: span var(--p-scheduler-timeline-span, 1);
        display: flex;
        align-items: center;
        block-size: dt('scheduler.timeline.header.height');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
        white-space: nowrap;
    }

    /* Sticky within its own cell: as long as the period is still in view, so is its name, even when
       the cell starts several screens back. */
    .p-scheduler-timeline-tier-label {
        position: sticky;
        inset-inline-start: 0;
        max-inline-size: 100%;
        padding-inline: 0.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-timeline-tier-cell + .p-scheduler-timeline-tier-cell {
        border-inline-start: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-tier[data-tier='period'] .p-scheduler-timeline-tier-cell {
        font-weight: 600;
    }

    .p-scheduler-timeline-tier[data-tier='day'] .p-scheduler-timeline-tier-cell {
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-timeline-tier-cell[data-today],
    .p-scheduler-timeline-header-cell[data-today] {
        background: dt('scheduler.today.background');
        color: dt('scheduler.today.color');
        font-weight: 600;
    }

    /* Stuck below the bands and not at 0: otherwise a vertical scroll rides the column row over the
       period. */
    .p-scheduler-timeline-header {
        position: sticky;
        inset-block-start: calc(var(--p-scheduler-timeline-tiers, 0) * dt('scheduler.timeline.header.height'));
        z-index: 1;
        block-size: dt('scheduler.timeline.header.height');
        background: dt('scheduler.weekday.background');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-header-cell {
        display: flex;
        align-items: center;
        padding-inline: 0.375rem;
        border-inline-start: 1px solid dt('scheduler.border.color');
        font-size: dt('scheduler.gutter.font.size');
        color: dt('scheduler.gutter.color');
        white-space: nowrap;
    }

    /* The lane measures the same as the axis — not the same as the container — because an event's
       width is a % and resolves against its positioned parent. Without this a 4 h event was drawn
       at a third of its size as soon as the timeline needed to scroll. */
    .p-scheduler-timeline-lane,
    .p-scheduler-timeline-header,
    .p-scheduler-timeline-tier,
    .p-scheduler-timeline-body {
        inline-size: max(100%, calc(var(--p-scheduler-timeline-cols, 1) * dt('scheduler.timeline.slot.width')));
    }

    /* El cuerpo es el contenedor de posicion de la linea de ahora: sin esto el absolute se escapa al
       primer ancestro posicionado —la pagina— y la linea cruza el documento entero. */
    .p-scheduler-timeline-body {
        position: relative;
    }

    .p-scheduler-timeline-lane {
        position: relative;
        min-block-size: calc(var(--p-scheduler-timeline-rows, 1) * var(--p-scheduler-timeline-row-height, dt('scheduler.timeline.row.height')));
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-timeline-cells {
        position: absolute;
        inset: 0;
    }

    .p-scheduler-timeline-cell {
        border-inline-start: 1px dashed dt('scheduler.border.color');
    }

    .p-scheduler-timeline-cell[data-major] {
        border-inline-start-style: solid;
    }

    /* Today is tinted horizontally too: it is the only hint of where the current day falls when the
       axis spans a week, a month or a year and you have to scroll to find it. */
    .p-scheduler-timeline-cell[data-today] {
        background: dt('scheduler.today.background');
    }

    .p-scheduler-timeline-event {
        position: absolute;
        box-sizing: border-box;
        inset-block-start: calc(var(--p-scheduler-event-row, 0) * dt('scheduler.timeline.row.height') + (dt('scheduler.timeline.row.height') - dt('scheduler.timeline.event.height')) / 2);
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0;
        block-size: dt('scheduler.timeline.event.height');
        padding-inline: dt('scheduler.event.padding.x');
        border-radius: dt('scheduler.timeline.event.border.radius');
        border-inline-start: 3px solid var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent'));
        background: color-mix(in srgb, var(--p-scheduler-event-border-accent, dt('scheduler.event.border.accent')) dt('scheduler.event.fill.opacity'), dt('scheduler.background'));
        color: dt('scheduler.event.color');
        font-size: dt('scheduler.event.font.size');
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
    }

    .p-scheduler-timeline-event .p-scheduler-event-title {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .p-scheduler-timeline-empty {
        padding: 3rem 1rem;
        text-align: center;
        color: dt('scheduler.gutter.color');
    }

    /* ── Legend, selection and loading ───────────────────────────────────── */

    .p-scheduler-category-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        padding: dt('scheduler.legend.padding');
        border-bottom: 1px solid dt('scheduler.border.color');
    }

    .p-scheduler-category-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.125rem 0.5rem;
        border: 1px solid dt('scheduler.border.color');
        border-radius: 999px;
        background: dt('scheduler.category.legend.item.background');
        cursor: pointer;
    }

    .p-scheduler-category-legend-item:not([data-selected]) {
        opacity: 0.45;
    }

    .p-scheduler-category-legend-swatch {
        inline-size: 0.625rem;
        block-size: 0.625rem;
        border-radius: 50%;
    }

    .p-scheduler-category-legend-count {
        font-variant-numeric: tabular-nums;
        color: dt('scheduler.category.legend.count.color');
    }

    .p-scheduler-selection-toolbar:not([data-selection-active]) {
        display: none;
    }

    .p-scheduler-selection-toolbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('scheduler.legend.padding');
        background: dt('scheduler.selected.background');
    }

    .p-scheduler-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    /* ── Overlays ─────────────────────────────────────────────────────────── */

    .p-scheduler-more-popover-panel,
    .p-scheduler-overlay-panel {
        position: absolute;
        z-index: 1000;
        min-inline-size: 12rem;
        max-inline-size: 22rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem;
        background: dt('scheduler.background');
        color: dt('scheduler.color');
        border: 1px solid dt('scheduler.border.color');
        border-radius: dt('scheduler.border.radius');
        box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.4);
    }

    .p-scheduler-more-popover-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        font-weight: 600;
    }

    .p-scheduler-more-popover-close {
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 1.125rem;
        line-height: 1;
    }

    .p-scheduler-more-popover-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.375rem;
        border: 0;
        border-radius: dt('scheduler.event.border.radius');
        background: transparent;
        color: inherit;
        text-align: start;
        cursor: pointer;
    }

    .p-scheduler-more-popover-item:hover {
        background: dt('scheduler.event.hover.background');
    }

    .p-scheduler-overlay-title {
        font-weight: 600;
    }

    .p-scheduler-overlay-time {
        font-size: dt('scheduler.event.time.font.size');
        color: dt('scheduler.gutter.color');
    }

    .p-scheduler-overlay-actions {
        display: flex;
        gap: 0.375rem;
    }

    .p-scheduler-disabled {
        pointer-events: none;
        opacity: 0.6;
    }

    /* Con data-placement=top el panel se ancla por su BASE al borde de arriba del evento: su alto no
       se conoce al calcular el offset, y trasladarlo el 100% de si mismo lo resuelve sin medir. */
    .p-scheduler-overlay-panel[data-placement='top'] {
        transform: translateY(-100%);
    }

    /* La vertical de ahora en el timeline: mismo color que la horizontal de la rejilla, porque son
       el mismo hecho en otro eje. Por encima de las celdas y por debajo de los eventos. */
    .p-scheduler-timeline-now-indicator {
        position: absolute;
        inset-block: 0;
        inline-size: 0;
        border-inline-start: 2px solid dt('scheduler.now.indicator.color');
        z-index: 1;
        pointer-events: none;
    }

    /* eventShell=none quita la CAJA del evento y nada mas: la superficie sigue posicionada, sigue
       siendo enfocable y sigue anclando los overlays, porque eso es del componente. Lo que se va es
       lo que la pagina va a dibujar ella. */
    .p-scheduler[data-event-shell='none'] .p-scheduler-time-grid-event,
    .p-scheduler[data-event-shell='none'] .p-scheduler-all-day-event,
    .p-scheduler[data-event-shell='none'] .p-scheduler-month-event,
    .p-scheduler[data-event-shell='none'] .p-scheduler-timeline-event,
    .p-scheduler[data-event-shell='none'] .p-scheduler-agenda-event {
        background: transparent;
        border: 0;
        padding: 0;
        box-shadow: none;
        color: inherit;
    }

    /* La cabecera de impresion no se ve en pantalla: la hoja necesita un titulo porque no lleva el
       header del componente, y la pantalla ya lo tiene. */
    .p-scheduler-print-header {
        display: none;
    }

    /* ── Density and lane sizing ──────────────────────────────────────────── */

    /* compact does not change the type, it changes the HEIGHTS, which is what decides how many rows
       fit on a screen. The measurements are written out here rather than declared as custom
       properties, because in this repo a stylesheet consumes variables and a component host is what
       sets them. */
    .p-scheduler[data-density='compact'] .p-scheduler-time-gutter-slot,
    .p-scheduler[data-density='compact'] .p-scheduler-time-grid-cell,
    .p-scheduler[data-density='compact'] .p-scheduler-work-cell {
        block-size: 1.375rem;
    }

    .p-scheduler[data-density='compact'] .p-scheduler-all-day-row {
        min-height: calc(var(--p-scheduler-all-day-rows, 1) * 1.125rem);
    }

    .p-scheduler[data-density='compact'] .p-scheduler-agenda-event {
        padding: 0.25rem 0.5rem;
        margin-block: 0.125rem;
    }

    .p-scheduler[data-density='compact'] .p-scheduler-month-cell {
        min-height: calc(dt('scheduler.month.cell.min.height') * 0.75 + var(--p-scheduler-month-rows, 1) * 1.125rem);
    }

    .p-scheduler[data-density='compact'] .p-scheduler-day-header-cell,
    .p-scheduler[data-density='compact'] .p-scheduler-resource-column-header,
    .p-scheduler[data-density='compact'] .p-scheduler-resource {
        padding-block: 0.125rem;
    }

    /* Without rowAutoHeight a lane is ONE row tall and the rest is clipped: that is what keeps every
       resource the same height on an operations wall, where comparing lanes matters more than seeing
       every overlap. */
    .p-scheduler:not([data-row-auto-height]) .p-scheduler-timeline-lane {
        min-block-size: var(--p-scheduler-timeline-row-height, dt('scheduler.timeline.row.height'));
        block-size: var(--p-scheduler-timeline-row-height, dt('scheduler.timeline.row.height'));
        overflow: hidden;
    }

    .p-scheduler:not([data-row-auto-height]) .p-scheduler-resource {
        min-block-size: var(--p-scheduler-timeline-row-height, dt('scheduler.resource.area.row.height'));
        block-size: var(--p-scheduler-timeline-row-height, dt('scheduler.resource.area.row.height'));
    }

    /* A group lane reads differently from a resource lane: without that, a collapsible hierarchy
       looks like a flat list with indentation. */
    .p-scheduler-resource[data-group] {
        font-weight: 600;
        background: dt('scheduler.weekday.background');
    }

    .p-scheduler-resource-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1rem;
        block-size: 1rem;
        flex: 0 0 auto;
        border: 0;
        padding: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        line-height: 1;
    }

    .p-scheduler-resource-toggle::before {
        content: '';
        inline-size: 0.375rem;
        block-size: 0.375rem;
        border-inline-end: 2px solid currentColor;
        border-block-end: 2px solid currentColor;
        /* The tip rotates rather than swapping glyph: one arrow per state is two things to keep in
           step, and in RTL the closed one points the wrong way. */
        transform: rotate(-45deg);
        transition: transform 0.15s ease;
    }

    .p-scheduler-resource-toggle[aria-expanded='true']::before {
        transform: rotate(45deg);
    }

    .p-scheduler[data-rtl] .p-scheduler-resource-toggle[aria-expanded='false']::before {
        transform: rotate(135deg);
    }

    /* ── Printing ────────────────────────────────────────────────────────── */

    /* A printed Scheduler has neither scrolling nor sticky headers: what on screen is a scrolling
       window is, on paper, all of the content at once. Without this you print the visible slice and
       nothing else, which is the classic failure of printing a calendar. */
    @media print {
        /* Imprimir ESTE horario y no la pagina que lo contiene. El resto sale del FLUJO con display:
           none y no con visibility: ocultar sin quitar el hueco deja el documento midiendo lo que
           media, o sea cincuenta hojas en blanco detras del horario. Lo que se imprime es una copia
           que print() cuelga de body, precisamente para que baste con apagar a sus hermanos. */
        html[data-p-scheduler-printing] body > *:not(#p-scheduler-print-root) {
            display: none !important;
        }

        html[data-p-scheduler-printing] #p-scheduler-print-root {
            display: block;
            margin: 0;
        }


        /* Sin color el navegador imprime los rellenos en blanco, que es lo que convierte cuarenta
           citas distintas en cuarenta citas iguales. Se puede pedir en gris a proposito. */
        .p-scheduler[data-print-color='false'] .p-scheduler-time-grid-event,
        .p-scheduler[data-print-color='false'] .p-scheduler-all-day-event,
        .p-scheduler[data-print-color='false'] .p-scheduler-month-event,
        .p-scheduler[data-print-color='false'] .p-scheduler-timeline-event,
        .p-scheduler[data-print-color='false'] .p-scheduler-agenda-event {
            background: transparent;
            border: 1px solid dt('scheduler.border.color');
            color: dt('scheduler.color');
        }

        .p-scheduler[data-print-color='false'] .p-scheduler-event-dot,
        .p-scheduler[data-print-color='false'] .p-scheduler-resource-dot {
            display: none;
        }

        /* La cabecera impresa solo existe en papel: en pantalla el titulo ya esta en el header. */
        .p-scheduler-print-header {
            display: block;
            margin-block-end: 0.75rem;
            padding-block-end: 0.5rem;
            border-bottom: 1px solid dt('scheduler.border.color');
        }

        .p-scheduler[data-print-chrome='false'] .p-scheduler-print-header {
            display: none;
        }

        .p-scheduler {
            border: 0;
            block-size: auto !important;
            max-block-size: none !important;
        }

        .p-scheduler-content,
        .p-scheduler-timeline,
        .p-scheduler-timeline-scroll,
        .p-scheduler-year {
            overflow: visible !important;
        }

        /* Sticky means nothing on paper, and on top of that it lays the header over the content of
           the first page. */
        .p-scheduler-time-grid-header,
        .p-scheduler-time-grid-groups,
        .p-scheduler-timeline-header,
        .p-scheduler-timeline-tier,
        .p-scheduler-resource-area,
        .p-scheduler-agenda-date-header {
            position: static !important;
        }

        /* The controls cannot be clicked on a sheet of paper. */
        .p-scheduler-navigation,
        .p-scheduler-view-selector,
        .p-scheduler-event-resize-handle,
        .p-scheduler-month-more-link,
        .p-scheduler-more-popover,
        .p-scheduler-quick-info,
        .p-scheduler-popover,
        .p-scheduler-context-menu,
        .p-scheduler-selection-toolbar {
            display: none !important;
        }

        /* One month per sheet: a printed calendar of several months that runs November over the
           bottom of October's page is not a calendar of either. The caption stays with its grid. */
        .p-scheduler-view-month[data-month-count]:not([data-month-count='1']) .p-scheduler-month + .p-scheduler-month {
            break-before: page;
        }

        .p-scheduler-month-title {
            break-after: avoid;
        }

        /* A week, an agenda day or a resource lane split across two pages is unreadable: that is the
           unit to keep whole. */
        .p-scheduler-month-week,
        .p-scheduler-agenda-group,
        .p-scheduler-resource,
        .p-scheduler-timeline-lane {
            break-inside: avoid;
        }

        /* The colour IS the data: without this the browser prints the category fills white and every
           event becomes the same event. */
        .p-scheduler,
        .p-scheduler * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }

    /* No motion for anyone who asks for none: the "now" indicator and the hovers need no
       animation. */
    @media (prefers-reduced-motion: reduce) {
        .p-scheduler * {
            transition: none !important;
            animation: none !important;
        }
    }
`;
