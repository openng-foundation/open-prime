/**
 *
 * TaskBoard Design Tokens
 *
 * @module taskboard
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace TaskBoardTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken taskboard.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken taskboard.color
         */
        color?: string;
        /**
         * Border color of root
         *
         * @designToken taskboard.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken taskboard.border.radius
         */
        borderRadius?: string;
        /**
         * Small border radius, used by the collapse controls
         *
         * @designToken taskboard.border.radius.sm
         */
        borderRadiusSm?: string;
    }
    interface Hover {
        /**
         * Background of a hovered control
         *
         * @designToken taskboard.hover.background
         */
        background?: string;
    }
    interface Empty {
        /**
         * Color of the muted text: empty states, counts, secondary card copy
         *
         * @designToken taskboard.empty.color
         */
        color?: string;
    }
    interface Columns {
        /**
         * Padding of the columns viewport
         *
         * @designToken taskboard.columns.padding
         */
        padding?: string;
    }
    interface Column {
        /**
         * Gap between columns
         *
         * @designToken taskboard.column.gap
         */
        gap?: string;
        /**
         * Minimum width of a column
         *
         * @designToken taskboard.column.min.width
         */
        minWidth?: string;
        /**
         * Maximum width of a column
         *
         * @designToken taskboard.column.max.width
         */
        maxWidth?: string;
        /**
         * Background of a column body
         *
         * @designToken taskboard.column.background
         */
        background?: string;
        /**
         * Border radius of a column
         *
         * @designToken taskboard.column.border.radius
         */
        borderRadius?: string;
        /**
         * Minimum height of a column header
         *
         * @designToken taskboard.column.header.min.height
         */
        headerMinHeight?: string;
        /**
         * Padding of a column body
         *
         * @designToken taskboard.column.body.padding
         */
        bodyPadding?: string;
        /**
         * Padding of a column footer
         *
         * @designToken taskboard.column.footer.padding
         */
        footerPadding?: string;
        /**
         * Shadow cast by a pinned column over the scrolled content
         *
         * @designToken taskboard.column.pinned.shadow
         */
        pinnedShadow?: string;
        /**
         * Shadow cast by a pinned column in right-to-left layouts
         *
         * @designToken taskboard.column.pinned.shadow.rtl
         */
        pinnedShadowRtl?: string;
    }
    interface ColumnStatus {
        /**
         * Colour of the strip above a `todo` column
         *
         * @designToken taskboard.column.status.todo.color
         */
        todoColor?: string;
        /**
         * Colour of the strip above an `in-progress` column
         *
         * @designToken taskboard.column.status.in.progress.color
         */
        inProgressColor?: string;
        /**
         * Colour of the strip above a `done` column
         *
         * @designToken taskboard.column.status.done.color
         */
        doneColor?: string;
        /**
         * Colour of the strip above a `blocked` column
         *
         * @designToken taskboard.column.status.blocked.color
         */
        blockedColor?: string;
    }
    interface Card {
        /**
         * Gap between the cards of a column
         *
         * @designToken taskboard.card.gap
         */
        gap?: string;
        /**
         * Border radius of a card
         *
         * @designToken taskboard.card.border.radius
         */
        borderRadius?: string;
        /**
         * Colour of the ring drawn around a selected card
         *
         * @designToken taskboard.card.selected.ring.color
         */
        selectedRingColor?: string;
    }
    interface DropIndicator {
        /**
         * Colour of the insertion marker
         *
         * @designToken taskboard.drop.indicator.color
         */
        color?: string;
    }
    interface DragPreview {
        /**
         * Shadow of the travelling preview
         *
         * @designToken taskboard.drag.preview.shadow
         */
        shadow?: string;
        /**
         * Tilt of the travelling preview
         *
         * @designToken taskboard.drag.preview.rotation
         */
        rotation?: string;
    }
    interface Focus {
        /**
         * Colour of the focus ring
         *
         * @designToken taskboard.focus.ring.color
         */
        ringColor?: string;
        /**
         * Width of the focus ring
         *
         * @designToken taskboard.focus.ring.width
         */
        ringWidth?: string;
    }
    interface Swimlane {
        /**
         * Width of the row header column
         *
         * @designToken taskboard.swimlane.header.width
         */
        headerWidth?: string;
        /**
         * Background of a row header
         *
         * @designToken taskboard.swimlane.header.background
         */
        headerBackground?: string;
        /**
         * Minimum height of a row
         *
         * @designToken taskboard.swimlane.min.height
         */
        minHeight?: string;
        /**
         * Minimum height of a cell
         *
         * @designToken taskboard.swimlane.cell.min.height
         */
        cellMinHeight?: string;
        /**
         * Colour of the grid and card borders
         *
         * @designToken taskboard.swimlane.border.color
         */
        borderColor?: string;
    }
    interface Scrollbar {
        /**
         * Width of the board and column scrollbars
         *
         * @designToken taskboard.scrollbar.width
         */
        width?: string;
        /**
         * Colour of the scrollbar thumb
         *
         * @designToken taskboard.scrollbar.thumb
         */
        thumb?: string;
        /**
         * Colour of the scrollbar track
         *
         * @designToken taskboard.scrollbar.track
         */
        track?: string;
    }
    interface Transition {
        /**
         * Duration of the layout transitions
         *
         * @designToken taskboard.transition.duration
         */
        duration?: string;
        /**
         * Timing function of the layout transitions
         *
         * @designToken taskboard.transition.timing
         */
        timing?: string;
    }
    interface Wip {
        /**
         * Colour of the text on the drag count badge and the exceeded WIP badge
         *
         * @designToken taskboard.wip.exceeded.count.color
         */
        exceededCountColor?: string;
    }
    interface Meta {
        /**
         * Border colour of a neutral column badge
         *
         * @designToken taskboard.meta.neutral.border.color
         */
        neutralBorderColor?: string;
        /**
         * Background of a neutral column badge
         *
         * @designToken taskboard.meta.neutral.background
         */
        neutralBackground?: string;
        /**
         * Colour of a neutral column badge
         *
         * @designToken taskboard.meta.neutral.color
         */
        neutralColor?: string;
        /**
         * Border colour of an informative column badge
         *
         * @designToken taskboard.meta.info.border.color
         */
        infoBorderColor?: string;
        /**
         * Background of an informative column badge
         *
         * @designToken taskboard.meta.info.background
         */
        infoBackground?: string;
        /**
         * Colour of an informative column badge
         *
         * @designToken taskboard.meta.info.color
         */
        infoColor?: string;
        /**
         * Border colour of a column badge one card short of its limit
         *
         * @designToken taskboard.meta.warning.border.color
         */
        warningBorderColor?: string;
        /**
         * Background of a column badge one card short of its limit
         *
         * @designToken taskboard.meta.warning.background
         */
        warningBackground?: string;
        /**
         * Colour of a column badge one card short of its limit
         *
         * @designToken taskboard.meta.warning.color
         */
        warningColor?: string;
        /**
         * Border colour of a column badge at or past its limit
         *
         * @designToken taskboard.meta.danger.border.color
         */
        dangerBorderColor?: string;
        /**
         * Background of a column badge at or past its limit
         *
         * @designToken taskboard.meta.danger.background
         */
        dangerBackground?: string;
        /**
         * Colour of a column badge at or past its limit
         *
         * @designToken taskboard.meta.danger.color
         */
        dangerColor?: string;
    }
    type ColorScheme = CS<TaskBoardDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

export interface TaskBoardDesignTokens extends DesignTokens<TaskBoardDesignTokens> {
    root?: TaskBoardTokenSections.Root;
    hover?: TaskBoardTokenSections.Hover;
    empty?: TaskBoardTokenSections.Empty;
    columns?: TaskBoardTokenSections.Columns;
    column?: TaskBoardTokenSections.Column;
    columnStatus?: TaskBoardTokenSections.ColumnStatus;
    card?: TaskBoardTokenSections.Card;
    dropIndicator?: TaskBoardTokenSections.DropIndicator;
    dragPreview?: TaskBoardTokenSections.DragPreview;
    focus?: TaskBoardTokenSections.Focus;
    swimlane?: TaskBoardTokenSections.Swimlane;
    scrollbar?: TaskBoardTokenSections.Scrollbar;
    transition?: TaskBoardTokenSections.Transition;
    wip?: TaskBoardTokenSections.Wip;
    meta?: TaskBoardTokenSections.Meta;
}
