import type { TaskBoardDesignTokens, TaskBoardTokenSections } from '@openng/optimus-ui-themes/types/taskboard';

export const root: TaskBoardTokenSections.Root = {
    color: '{text.color}',
    borderRadius: '{border.radius.lg}',
    borderRadiusSm: '{border.radius.sm}'
};

export const empty: TaskBoardTokenSections.Empty = {
    color: '{text.muted.color}'
};

export const columns: TaskBoardTokenSections.Columns = {
    padding: '0.75rem'
};

export const column: TaskBoardTokenSections.Column = {
    gap: '0.75rem',
    // A floor and a ceiling, not a width: between 280 and 380 a column fits four times on a laptop
    // and stays readable, and with `flex: 1 0` the leftover space is shared out instead of being
    // left as a gap at the end of the track.
    minWidth: '280px',
    maxWidth: '380px',
    borderRadius: '{border.radius.lg}',
    // 3.125rem is what the 1.75rem chevron needs with its 0.75rem padding without being clipped, and
    // it doubles as the usable width of a collapsed column.
    headerMinHeight: '3.125rem',
    bodyPadding: '0.5rem',
    footerPadding: '0.5rem'
};

export const columnStatus: TaskBoardTokenSections.ColumnStatus = {
    todoColor: '{blue.500}',
    inProgressColor: '{yellow.500}',
    doneColor: '{green.500}',
    blockedColor: '{red.500}'
};

export const card: TaskBoardTokenSections.Card = {
    gap: '0.5rem',
    borderRadius: '{border.radius.lg}',
    selectedRingColor: '{primary.color}'
};

export const dropIndicator: TaskBoardTokenSections.DropIndicator = {
    color: '{primary.color}'
};

export const dragPreview: TaskBoardTokenSections.DragPreview = {
    // A degree and a half: enough for the card to read as lifted off the board, little enough not to
    // misalign it from the gap it is about to fill.
    rotation: '1.5deg'
};

export const focus: TaskBoardTokenSections.Focus = {
    ringColor: '{focus.ring.color}',
    ringWidth: '2px'
};

export const swimlane: TaskBoardTokenSections.Swimlane = {
    headerWidth: '180px',
    minHeight: '120px',
    cellMinHeight: '60px'
};

export const scrollbar: TaskBoardTokenSections.Scrollbar = {
    width: 'thin',
    track: 'transparent'
};

export const transition: TaskBoardTokenSections.Transition = {
    duration: '0.2s',
    timing: 'ease'
};

export const wip: TaskBoardTokenSections.Wip = {
    exceededCountColor: '{primary.contrast.color}'
};

export const colorScheme: TaskBoardTokenSections.ColorScheme = {
    light: {
        root: {
            // The board is the ground and the columns sit on it: surface.50 behind, surface.100 in
            // front. The other way round the columns would disappear into the background.
            background: '{surface.50}',
            borderColor: '{surface.200}'
        },
        hover: {
            background: '{surface.100}'
        },
        column: {
            background: '{surface.100}',
            pinnedShadow: 'linear-gradient(to right, rgba(0, 0, 0, 0.04), transparent)',
            pinnedShadowRtl: 'linear-gradient(to left, rgba(0, 0, 0, 0.04), transparent)'
        },
        dragPreview: {
            shadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        },
        swimlane: {
            headerBackground: '{surface.50}',
            borderColor: '{surface.200}'
        },
        scrollbar: {
            thumb: '{surface.300}'
        },
        meta: {
            neutralBorderColor: '{surface.300}',
            neutralBackground: '{surface.100}',
            neutralColor: '{surface.600}',
            infoBorderColor: '{sky.300}',
            infoBackground: '{sky.50}',
            infoColor: '{sky.700}',
            warningBorderColor: '{amber.300}',
            warningBackground: '{amber.50}',
            warningColor: '{amber.700}',
            dangerBorderColor: '{red.300}',
            dangerBackground: '{red.50}',
            dangerColor: '{red.700}'
        }
    },
    dark: {
        root: {
            background: '{surface.950}',
            borderColor: '{surface.700}'
        },
        hover: {
            background: '{surface.800}'
        },
        column: {
            background: '{surface.900}',
            pinnedShadow: 'linear-gradient(to right, rgba(255, 255, 255, 0.06), transparent)',
            pinnedShadowRtl: 'linear-gradient(to left, rgba(255, 255, 255, 0.06), transparent)'
        },
        dragPreview: {
            shadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        },
        swimlane: {
            headerBackground: '{surface.900}',
            borderColor: '{surface.700}'
        },
        scrollbar: {
            thumb: '{surface.600}'
        },
        // In dark mode the badges take a translucent fill rather than a light tint of the colour: an
        // amber.50 over surface.900 is a blob, and the border already carries the meaning.
        meta: {
            neutralBorderColor: '{surface.600}',
            neutralBackground: 'color-mix(in srgb, {surface.700} 72%, transparent)',
            neutralColor: '{surface.300}',
            infoBorderColor: 'color-mix(in srgb, {sky.400} 42%, transparent)',
            infoBackground: 'color-mix(in srgb, {sky.500} 14%, transparent)',
            infoColor: '{sky.200}',
            warningBorderColor: 'color-mix(in srgb, {amber.400} 40%, transparent)',
            warningBackground: 'color-mix(in srgb, {amber.500} 14%, transparent)',
            warningColor: '{amber.200}',
            dangerBorderColor: 'color-mix(in srgb, {red.400} 42%, transparent)',
            dangerBackground: 'color-mix(in srgb, {red.500} 14%, transparent)',
            dangerColor: '{red.200}'
        }
    }
};

export default {
    root,
    empty,
    columns,
    column,
    columnStatus,
    card,
    dropIndicator,
    dragPreview,
    focus,
    swimlane,
    scrollbar,
    transition,
    wip,
    colorScheme
} satisfies TaskBoardDesignTokens;
