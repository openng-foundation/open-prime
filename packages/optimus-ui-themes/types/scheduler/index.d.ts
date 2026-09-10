/**
 *
 * Scheduler Design Tokens
 *
 * @module scheduler
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace SchedulerTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken scheduler.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken scheduler.color
         */
        color?: string;
        /**
         * Border color of root
         *
         * @designToken scheduler.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken scheduler.border.radius
         */
        borderRadius?: string;
    }
    interface Accent {
        /**
         * Color of the accented controls, such as the today button and the agenda weekday
         *
         * @designToken scheduler.accent.color
         */
        color?: string;
    }
    interface Header {
        /**
         * Padding of header
         *
         * @designToken scheduler.header.padding
         */
        padding?: string;
        /**
         * Gap of header
         *
         * @designToken scheduler.header.gap
         */
        gap?: string;
        /**
         * Background of header
         *
         * @designToken scheduler.header.background
         */
        background?: string;
    }
    interface Title {
        /**
         * Font size of title
         *
         * @designToken scheduler.title.font.size
         */
        fontSize?: string;
        /**
         * Font weight of title
         *
         * @designToken scheduler.title.font.weight
         */
        fontWeight?: string;
        /**
         * Color of title
         *
         * @designToken scheduler.title.color
         */
        color?: string;
    }
    interface Gutter {
        /**
         * Width of the time gutter
         *
         * @designToken scheduler.gutter.width
         */
        width?: string;
        /**
         * Font size of the gutter labels
         *
         * @designToken scheduler.gutter.font.size
         */
        fontSize?: string;
        /**
         * Color of the gutter labels
         *
         * @designToken scheduler.gutter.color
         */
        color?: string;
    }
    interface Day {
        /**
         * Min width of a day column
         *
         * @designToken scheduler.day.min.width
         */
        minWidth?: string;
        /**
         * Hover background of a day cell
         *
         * @designToken scheduler.day.hover.background
         */
        hoverBackground?: string;
        /**
         * Padding of a day header
         *
         * @designToken scheduler.day.header.padding
         */
        headerPadding?: string;
    }
    interface Slot {
        /**
         * Height of one time-grid row
         *
         * @designToken scheduler.slot.height
         */
        height?: string;
    }
    interface AllDay {
        /**
         * Height of one all-day row
         *
         * @designToken scheduler.all.day.row.height
         */
        rowHeight?: string;
    }
    interface Weekday {
        /**
         * Background of the weekday header
         *
         * @designToken scheduler.weekday.background
         */
        background?: string;
    }
    interface Weekend {
        /**
         * Background of a weekend cell
         *
         * @designToken scheduler.weekend.background
         */
        background?: string;
    }
    interface Today {
        /**
         * Background of today's cell
         *
         * @designToken scheduler.today.background
         */
        background?: string;
        /**
         * Color of today's cell
         *
         * @designToken scheduler.today.color
         */
        color?: string;
        /**
         * Background of the badge around today's day number
         *
         * @designToken scheduler.today.badge.background
         */
        badgeBackground?: string;
        /**
         * Color of the badge around today's day number
         *
         * @designToken scheduler.today.badge.color
         */
        badgeColor?: string;
    }
    interface OtherMonth {
        /**
         * Background of a month cell that belongs to an adjacent month
         *
         * @designToken scheduler.other.month.background
         */
        background?: string;
        /**
         * Color of a day belonging to an adjacent month
         *
         * @designToken scheduler.other.month.color
         */
        color?: string;
    }
    interface Selected {
        /**
         * Background of a selected cell
         *
         * @designToken scheduler.selected.background
         */
        background?: string;
        /**
         * Color of a selected cell
         *
         * @designToken scheduler.selected.color
         */
        color?: string;
    }
    interface Focus {
        /**
         * Color of the focus ring
         *
         * @designToken scheduler.focus.ring.color
         */
        ringColor?: string;
    }
    interface Event {
        /**
         * Background of an event
         *
         * @designToken scheduler.event.background
         */
        background?: string;
        /**
         * Hover background of an event
         *
         * @designToken scheduler.event.hover.background
         */
        hoverBackground?: string;
        /**
         * Color of an event
         *
         * @designToken scheduler.event.color
         */
        color?: string;
        /**
         * Accent border of an event
         *
         * @designToken scheduler.event.border.accent
         */
        borderAccent?: string;
        /**
         * Border radius of an event
         *
         * @designToken scheduler.event.border.radius
         */
        borderRadius?: string;
        /**
         * Font size of an event
         *
         * @designToken scheduler.event.font.size
         */
        fontSize?: string;
        /**
         * Font size of the event time
         *
         * @designToken scheduler.event.time.font.size
         */
        timeFontSize?: string;
        /**
         * Horizontal padding of an event
         *
         * @designToken scheduler.event.padding.x
         */
        paddingX?: string;
        /**
         * Vertical padding of an event
         *
         * @designToken scheduler.event.padding.y
         */
        paddingY?: string;
        /**
         * How much of the accent colour tints the event fill, as a percentage
         *
         * @designToken scheduler.event.fill.opacity
         */
        fillOpacity?: string;
    }
    interface Business {
        /**
         * Background of a business-hours cell
         *
         * @designToken scheduler.business.background
         */
        background?: string;
    }
    interface SlotAvailable {
        /**
         * Background of an available appointment slot
         *
         * @designToken scheduler.slot.available.background
         */
        background?: string;
    }
    interface Blocked {
        /**
         * Background of a cell inside a blocked interval
         *
         * @designToken scheduler.blocked.background
         */
        background?: string;
    }
    interface NonBusiness {
        /**
         * Background of a cell outside business hours
         *
         * @designToken scheduler.non.business.background
         */
        background?: string;
    }
    interface Month {
        /**
         * Min width of a month day cell
         *
         * @designToken scheduler.month.day.min.width
         */
        dayMinWidth?: string;
        /**
         * Min height of a month cell
         *
         * @designToken scheduler.month.cell.min.height
         */
        cellMinHeight?: string;
        /**
         * Padding of a month cell
         *
         * @designToken scheduler.month.cell.padding
         */
        cellPadding?: string;
        /**
         * Font size of the month day number
         *
         * @designToken scheduler.month.number.font.size
         */
        numberFontSize?: string;
        /**
         * Height of the band reserved for the day number, above the events
         *
         * @designToken scheduler.month.number.height
         */
        numberHeight?: string;
    }
    interface MiniMonth {
        /**
         * Gap between the mini-months of the year view
         *
         * @designToken scheduler.mini.month.gap
         */
        gap?: string;
        /**
         * Padding of the mini-month header
         *
         * @designToken scheduler.mini.month.padding
         */
        padding?: string;
        /**
         * Padding above the mini-month day grid
         *
         * @designToken scheduler.mini.month.grid.padding
         */
        gridPadding?: string;
        /**
         * Minimum width of a mini-month card, which is what decides how many columns the year view fits
         *
         * @designToken scheduler.mini.month.min.width
         */
        minWidth?: string;
        /**
         * Minimum size of a mini-month day cell, and height of its weekday row
         *
         * @designToken scheduler.mini.month.day.size
         */
        daySize?: string;
        /**
         * Font size of a mini-month day
         *
         * @designToken scheduler.mini.month.font.size
         */
        fontSize?: string;
        /**
         * Border radius of a mini-month card
         *
         * @designToken scheduler.mini.month.border.radius
         */
        borderRadius?: string;
    }
    interface MiniMonthWeekend {
        /**
         * Color of a weekend day number in the year view's mini-months
         *
         * @designToken scheduler.mini.month.weekend.color
         */
        color?: string;
    }
    interface Timeline {
        /**
         * Width of one timeline column
         *
         * @designToken scheduler.timeline.slot.width
         */
        slotWidth?: string;
        /**
         * Height of one timeline row
         *
         * @designToken scheduler.timeline.row.height
         */
        rowHeight?: string;
        /**
         * Height of one row of the timeline header
         *
         * @designToken scheduler.timeline.header.height
         */
        headerHeight?: string;
        /**
         * Height of an event bar on the timeline
         *
         * @designToken scheduler.timeline.event.height
         */
        eventHeight?: string;
        /**
         * Border radius of an event bar on the timeline
         *
         * @designToken scheduler.timeline.event.border.radius
         */
        eventBorderRadius?: string;
    }
    interface ResourceArea {
        /**
         * Width of the resource rail
         *
         * @designToken scheduler.resource.area.width
         */
        width?: string;
        /**
         * Background of the resource rail
         *
         * @designToken scheduler.resource.area.background
         */
        background?: string;
        /**
         * Padding of the resource rail header
         *
         * @designToken scheduler.resource.area.header.padding
         */
        headerPadding?: string;
        /**
         * Padding of a resource row
         *
         * @designToken scheduler.resource.area.row.padding
         */
        rowPadding?: string;
        /**
         * Height of a resource row
         *
         * @designToken scheduler.resource.area.row.height
         */
        rowHeight?: string;
    }
    interface Agenda {
        /**
         * Padding of an agenda date header
         *
         * @designToken scheduler.agenda.header.padding
         */
        headerPadding?: string;
        /**
         * Padding of an agenda row
         *
         * @designToken scheduler.agenda.row.padding
         */
        rowPadding?: string;
        /**
         * Width of the empty gutter to the left of an agenda row, which aligns it with the time gutter of the day and week views
         *
         * @designToken scheduler.agenda.gutter.width
         */
        gutterWidth?: string;
    }
    interface Legend {
        /**
         * Padding of the legend
         *
         * @designToken scheduler.legend.padding
         */
        padding?: string;
    }
    interface CategoryLegend {
        /**
         * Background of a legend item
         *
         * @designToken scheduler.category.legend.item.background
         */
        itemBackground?: string;
        /**
         * Color of a legend count
         *
         * @designToken scheduler.category.legend.count.color
         */
        countColor?: string;
    }
    interface MoreLink {
        /**
         * Color of the overflow link
         *
         * @designToken scheduler.more.link.color
         */
        color?: string;
    }
    interface NowIndicator {
        /**
         * Color of the current-time line
         *
         * @designToken scheduler.now.indicator.color
         */
        color?: string;
    }
    type ColorScheme = CS<SchedulerDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

export interface SchedulerDesignTokens extends DesignTokens<SchedulerDesignTokens> {
    root?: SchedulerTokenSections.Root;
    accent?: SchedulerTokenSections.Accent;
    header?: SchedulerTokenSections.Header;
    title?: SchedulerTokenSections.Title;
    gutter?: SchedulerTokenSections.Gutter;
    day?: SchedulerTokenSections.Day;
    slot?: SchedulerTokenSections.Slot;
    allDay?: SchedulerTokenSections.AllDay;
    weekday?: SchedulerTokenSections.Weekday;
    weekend?: SchedulerTokenSections.Weekend;
    today?: SchedulerTokenSections.Today;
    otherMonth?: SchedulerTokenSections.OtherMonth;
    selected?: SchedulerTokenSections.Selected;
    focus?: SchedulerTokenSections.Focus;
    event?: SchedulerTokenSections.Event;
    business?: SchedulerTokenSections.Business;
    blocked?: SchedulerTokenSections.Blocked;
    slotAvailable?: SchedulerTokenSections.SlotAvailable;
    nonBusiness?: SchedulerTokenSections.NonBusiness;
    month?: SchedulerTokenSections.Month;
    miniMonth?: SchedulerTokenSections.MiniMonth;
    miniMonthWeekend?: SchedulerTokenSections.MiniMonthWeekend;
    timeline?: SchedulerTokenSections.Timeline;
    resourceArea?: SchedulerTokenSections.ResourceArea;
    agenda?: SchedulerTokenSections.Agenda;
    legend?: SchedulerTokenSections.Legend;
    categoryLegend?: SchedulerTokenSections.CategoryLegend;
    moreLink?: SchedulerTokenSections.MoreLink;
    nowIndicator?: SchedulerTokenSections.NowIndicator;
}
