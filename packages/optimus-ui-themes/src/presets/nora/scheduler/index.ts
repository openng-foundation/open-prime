import type { SchedulerDesignTokens, SchedulerTokenSections } from '@openng/optimus-ui-themes/types/scheduler';

export const root: SchedulerTokenSections.Root = {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{border.radius.md}'
};

export const accent: SchedulerTokenSections.Accent = {
    color: '{primary.color}'
};

export const header: SchedulerTokenSections.Header = {
    padding: '0.75rem 1rem',
    gap: '0.75rem',
    background: '{content.background}'
};

export const title: SchedulerTokenSections.Title = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '{text.color}'
};

export const gutter: SchedulerTokenSections.Gutter = {
    width: '4rem',
    fontSize: '0.75rem',
    color: '{text.muted.color}'
};

export const day: SchedulerTokenSections.Day = {
    // A floor and not a width: in a wide container the column grows with 1fr. At 8rem a week asked
    // for 840px and produced horizontal scroll inside a 730px panel — seven days cut in half read
    // worse than seven narrow days.
    minWidth: '6rem',
    hoverBackground: '{content.hover.background}',
    headerPadding: '0.5rem'
};

export const slot: SchedulerTokenSections.Slot = {
    height: '1.75rem'
};

export const allDay: SchedulerTokenSections.AllDay = {
    rowHeight: '1.375rem'
};

export const otherMonth: SchedulerTokenSections.OtherMonth = {
    color: '{text.muted.color}'
};

export const focus: SchedulerTokenSections.Focus = {
    ringColor: '{primary.color}'
};

export const event: SchedulerTokenSections.Event = {
    color: '{text.color}',
    borderAccent: '{primary.color}',
    borderRadius: '{border.radius.sm}',
    fontSize: '0.75rem',
    timeFontSize: '0.6875rem',
    paddingX: '0.375rem',
    paddingY: '0.125rem',
    // 18% of the event's colour over the background: enough to tell categories apart at a glance
    // and low enough that the text keeps its contrast in both light and dark.
    fillOpacity: '18%'
};

export const business: SchedulerTokenSections.Business = {
    background: '{content.background}'
};

/**
 * A blocked window is hatched rather than filled with a flat colour: a solid fill reads like the
 * out-of-hours shading or like today's tint, and "this cannot happen here" has to look different
 * from "this does not usually happen here".
 */
/**
 * An available window is tinted with the accent at very low opacity: it has to be visible BELOW the
 * events without competing with them, and a colour of its own would make it a third thing to learn.
 */
export const slotAvailable: SchedulerTokenSections.SlotAvailable = {
    background: 'color-mix(in srgb, {primary.color}, transparent 94%)'
};

export const blocked: SchedulerTokenSections.Blocked = {
    background: 'repeating-linear-gradient(135deg, color-mix(in srgb, {text.muted.color}, transparent 88%) 0 4px, transparent 4px 8px)'
};

export const month: SchedulerTokenSections.Month = {
    dayMinWidth: '6rem',
    cellMinHeight: '5.5rem',
    cellPadding: '0.25rem',
    numberFontSize: '0.8125rem',
    numberHeight: '1.5rem'
};

// Geometry in PX and not in rem: these numbers are layout decisions (rail width, row height, grid
// gap) and have to come out the same even when the host application uses a different typographic
// base — this documentation site runs at 14px where most run at 16px. FONT sizes do stay in rem, so
// they keep scaling with the host.
export const miniMonth: SchedulerTokenSections.MiniMonth = {
    gap: '16px',
    padding: '8px',
    gridPadding: '6px',
    // The card's MINIMUM width, not a fixed one: the year grid is auto-fill, so in a narrow panel it
    // drops a column instead of squeezing all twelve mini-months. With four fixed columns the day
    // cell fell to 19px and the numbers touched.
    minWidth: '180px',
    daySize: '17px',
    fontSize: '1rem',
    borderRadius: '8px'
};

/**
 * The mini-month weekend is drawn in the primary colour. It is the only place that needs it: the
 * month view has columns and a header to tell you which day you are on, but in a 17px grid with no
 * visible header the colour is what lets you find Saturday at a glance.
 */
export const miniMonthWeekend: SchedulerTokenSections.MiniMonthWeekend = {
    color: '{primary.color}'
};

export const timeline: SchedulerTokenSections.Timeline = {
    slotWidth: '80px',
    rowHeight: '48px',
    headerHeight: '36px',
    eventHeight: '36px',
    // Square: on a horizontal axis, rounded corners on adjacent bars leave a notch between them.
    eventBorderRadius: '0'
};

export const resourceArea: SchedulerTokenSections.ResourceArea = {
    width: '240px',
    background: '{content.background}',
    headerPadding: '12px 16px',
    rowPadding: '8px 16px',
    rowHeight: '48px'
};

export const agenda: SchedulerTokenSections.Agenda = {
    headerPadding: '0.5rem 0.75rem',
    rowPadding: '0.5rem 0.75rem',
    // The empty strip at the start of each row: it lines the list up with the time gutter of the day
    // and week views, so switching view does not shift the content sideways. At 0 it disappears.
    gutterWidth: '5rem'
};

export const legend: SchedulerTokenSections.Legend = {
    padding: '0.5rem 1rem'
};

export const categoryLegend: SchedulerTokenSections.CategoryLegend = {
    itemBackground: '{content.background}',
    countColor: '{text.muted.color}'
};

export const moreLink: SchedulerTokenSections.MoreLink = {
    color: '{primary.color}'
};

export const nowIndicator: SchedulerTokenSections.NowIndicator = {
    // Literal on purpose: `red` is a primitive palette, and a theme that replaces the primitives
    // would leave the "now" line unresolved — black, and mistakable for a border.
    color: '#ef4444'
};

/**
 * Everything that depends on the surface goes here and NOT in the body: `{surface.50}` is a
 * primitive and does not change with the scheme, so in dark mode it left the weekend columns white.
 * The tokens in the body are the ones that hold in both modes — semantic values or measurements.
 */
export const colorScheme: SchedulerTokenSections.ColorScheme = {
    light: {
        weekday: { background: '{surface.50}' },
        // The neighbouring month's days do get a tint: that is what makes the grid read as ONE
        // month with padding at both ends rather than six loose weeks. With nothing but a dimmed
        // number, the first row looked like part of the month itself.
        otherMonth: { background: '{surface.50}' },
        // The weekend is NOT tinted. With Saturday and Sunday shaded grey, the grey of "today" and
        // the grey of out-of-hours stopped meaning anything: three different things with the same
        // tint. The token stays for anyone who wants it back.
        weekend: { background: 'transparent' },
        nonBusiness: { background: '{surface.50}' },
        today: {
            // The primary at low opacity, not `{highlight.background}`: highlight is the fill for
            // "selected", and some themes (this documentation's among them) define it as a dark
            // solid, which turned today into a black band. A color-mix against `transparent`
            // composites over whatever background the cell has and gives a tint in light and in dark
            // without two separate values. A flat grey would not do either: it left today looking
            // exactly like a weekend and like an out-of-hours slot.
            background: 'color-mix(in srgb, {primary.color}, transparent 90%)',
            color: '{primary.color}',
            // The circle around the number needs a little more body than the column's tint, because
            // it is 24px across and not a whole column.
            badgeBackground: 'color-mix(in srgb, {primary.color}, transparent 85%)',
            badgeColor: '{primary.color}'
        },
        // Selection sits one step above today's highlight rather than level with it: were both to
        // use `highlight.background`, the selected day and today would be the same cell.
        selected: { background: '{highlight.focus.background}', color: '{highlight.focus.color}' },
        event: { background: '{surface.50}', hoverBackground: '{surface.100}' }
    },
    dark: {
        weekday: { background: '{surface.800}' },
        otherMonth: { background: '{surface.950}' },
        weekend: { background: 'transparent' },
        nonBusiness: { background: '{surface.900}' },
        today: {
            background: 'color-mix(in srgb, {primary.color}, transparent 88%)',
            color: '{primary.color}',
            badgeBackground: 'color-mix(in srgb, {primary.color}, transparent 82%)',
            badgeColor: '{primary.color}'
        },
        selected: { background: '{highlight.focus.background}', color: '{highlight.focus.color}' },
        event: { background: '{surface.800}', hoverBackground: '{surface.700}' }
    }
};

export default {
    root,
    accent,
    header,
    title,
    gutter,
    day,
    slot,
    allDay,
    otherMonth,
    focus,
    event,
    business,
    blocked,
    slotAvailable,
    month,
    miniMonth,
    miniMonthWeekend,
    timeline,
    resourceArea,
    agenda,
    legend,
    categoryLegend,
    moreLink,
    nowIndicator,
    colorScheme
} satisfies SchedulerDesignTokens;
