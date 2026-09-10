/**
 * Moving the keyboard focus between the cells of a view.
 *
 * The awkward part is that the four grids are not the same shape. A time-grid column CONTAINS its
 * cells top to bottom, so down is the next sibling and right is the next column; a month week
 * contains them left to right, so right is the next sibling and down is the next week; a mini-month
 * is a single seven-wide grid, so down is seven cells along. Rather than teach each renderer its own
 * arrow handling, the shape is read off the DOM: a cell marks itself `data-nav-cell` and its nearest
 * known container says which way the cells run.
 *
 * A roving tabindex keeps the grid to ONE tab stop. Tabbing into a month reaches the grid, not four
 * hundred and twenty cells, and the arrows do the rest — which is the behaviour every grid widget
 * has and the reason arrow support is worth having at all.
 *
 * @module scheduler-keyboard
 */

/** Attribute a cell marks itself navigable with. */
export const SCHEDULER_NAV_CELL = 'data-nav-cell';

/** How the cells run inside a container. */
type CellAxis = 'column' | 'row' | 'grid';

/** The containers a cell can live in, most specific first. */
const CONTAINERS: { selector: string; axis: CellAxis; columns?: number }[] = [
    { selector: '.p-scheduler-time-grid-column', axis: 'column' },
    { selector: '.p-scheduler-all-day-lanes', axis: 'row' },
    { selector: '.p-scheduler-month-week', axis: 'row' },
    { selector: '.p-scheduler-timeline-cells', axis: 'row' },
    { selector: '.p-scheduler-mini-month-grid', axis: 'grid', columns: 7 }
];

/** The container a cell belongs to, with the axis its cells run along. */
function containerOf(cell: HTMLElement): { element: HTMLElement; axis: CellAxis; columns: number; selector: string } | null {
    for (const candidate of CONTAINERS) {
        const element = cell.closest<HTMLElement>(candidate.selector);
        if (element) return { element, axis: candidate.axis, columns: candidate.columns ?? 1, selector: candidate.selector };
    }
    return null;
}

/** The navigable cells of a container, in document order. */
function cellsOf(container: HTMLElement): HTMLElement[] {
    return [...container.querySelectorAll<HTMLElement>(`[${SCHEDULER_NAV_CELL}]`)];
}

/**
 * Whether a cell can actually take the focus.
 *
 * The padding days of a mini-month are `disabled` buttons, and they stay in the ring on purpose: the
 * seven-wide arithmetic is what makes "down" mean "same weekday, next week", and removing cells from
 * the list would break it. So they are skipped when landing on them instead — moving the single tab
 * stop onto a disabled button would leave the grid unreachable by tab.
 */
function focusable(cell: HTMLElement): boolean {
    return !cell.hasAttribute('disabled') && cell.getAttribute('aria-disabled') !== 'true';
}

/** The first cell that can take the focus, scanning from `index` in `step`s of the same size. */
function firstFocusable(cells: HTMLElement[], index: number, step: number): HTMLElement | null {
    for (let at = index; at >= 0 && at < cells.length; at += step) {
        if (focusable(cells[at])) return cells[at];
    }
    return null;
}

/**
 * Which cell an arrow key should land on.
 *
 * `null` when the key is not a movement or the move would leave the grid — in which case the event
 * is left alone, so the browser's own scrolling and the surrounding page keep working.
 */
function targetFor(cell: HTMLElement, key: string, rtl: boolean): HTMLElement | null {
    const container = containerOf(cell);
    if (!container) return null;

    const cells = cellsOf(container.element);
    const index = cells.indexOf(cell);
    if (index < 0) return null;

    // In RTL the horizontal arrows are reversed: left is the one that advances.
    const horizontal = rtl ? (key === 'ArrowLeft' ? 1 : key === 'ArrowRight' ? -1 : 0) : key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
    const vertical = key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0;

    if (key === 'Home') return firstFocusable(cells, 0, 1);
    if (key === 'End') return firstFocusable(cells, cells.length - 1, -1);
    if (!horizontal && !vertical) return null;

    // Inside the container: along its axis.
    const within = container.axis === 'column' ? vertical : container.axis === 'row' ? horizontal : horizontal + vertical * container.columns;
    if (within) {
        // Keep going in the same direction while the cells cannot take focus, so the padding of a
        // mini-month does not swallow the keypress.
        const next = firstFocusable(cells, index + within, within);
        if (next) return next;
        // Out of range in a seven-wide grid: the edge of a mini-month IS the edge, not the next
        // week, because that is where another month starts.
        return null;
    }

    // Outside the container: the same index of the neighbouring one.
    const across = container.axis === 'column' ? horizontal : vertical;
    if (!across) return null;

    const root = cell.closest<HTMLElement>('.p-scheduler-view') ?? cell.ownerDocument.body;
    const siblings = [...root.querySelectorAll<HTMLElement>(container.selector)];
    const position = siblings.indexOf(container.element);
    const neighbour = siblings[position + across];
    if (!neighbour) return null;

    const neighbourCells = cellsOf(neighbour);
    const landing = Math.min(index, neighbourCells.length - 1);
    if (landing < 0) return null;
    // From the same index forwards, and backwards when that finds nothing: the neighbour can be
    // shorter or start with padding.
    return firstFocusable(neighbourCells, landing, 1) ?? firstFocusable(neighbourCells, landing, -1);
}

/**
 * Moves the focus, and the single tab stop with it.
 *
 * Returns whether it moved, so the caller can decide about `preventDefault`: swallowing an arrow key
 * that did nothing would trap the user at the edge of the grid.
 */
export function moveCellFocus(cell: HTMLElement, key: string, rtl = false): boolean {
    const target = targetFor(cell, key, rtl);
    if (!target || typeof target.focus !== 'function') return false;

    cell.setAttribute('tabindex', '-1');
    target.setAttribute('tabindex', '0');
    target.focus();
    return true;
}
