import type { ChartsDesignTokens, ChartsTokenSections } from '@openng/optimus-ui-themes/types/charts';

export const root: ChartsTokenSections.Root = {
    /*
     * The chart's own strongest text tone, not the page's body colour.
     *
     * This is what `currentColor` resolves to inside a chart, so it decides the fallback for every
     * mark and label that does not name a colour. Inheriting `{content.color}` made that depend on
     * whatever surrounded the chart -- the same chart read differently on two pages.
     */
    color: '{surface.900}',
    background: 'transparent'
};

export const font: ChartsTokenSections.Font = {
    family: 'inherit',
    size: '0.75rem'
};

export const transition: ChartsTokenSections.Transition = {
    duration: '{transition.duration}'
};

export const focus: ChartsTokenSections.Focus = {
    ringWidth: '{focus.ring.width}',
    ringStyle: '{focus.ring.style}',
    ringColor: '{focus.ring.color}',
    ringOffset: '{focus.ring.offset}'
};

export const tick: ChartsTokenSections.Tick = {};

export const grid: ChartsTokenSections.Grid = {};

export const band: ChartsTokenSections.Band = {};

export const axis: ChartsTokenSections.Axis = {};

export const title: ChartsTokenSections.Title = {};

export const caption: ChartsTokenSections.Caption = {};

export const dataLabel: ChartsTokenSections.DataLabel = {};

export const annotation: ChartsTokenSections.Annotation = {};

export const hover: ChartsTokenSections.Hover = {
    brightness: '1.1'
};

/*
 * Dimming defaults to 1, which is no fade at all.
 *
 * That is deliberate rather than an omission: fading every non-hovered mark on each pointer move
 * makes a dense chart flicker, so it is something an author opts into per chart through
 * ChartHover.dimOpacity or globally by overriding this token.
 */
export const dim: ChartsTokenSections.Dim = {
    opacity: '1'
};

export const legend: ChartsTokenSections.Legend = {
    itemGap: '0.375rem',
    itemBorderRadius: '{border.radius.none}'
};

export const tooltip: ChartsTokenSections.Tooltip = {
    borderRadius: '{overlay.popover.border.radius}',
    shadow: '{overlay.popover.shadow}',
    padding: '0.5rem 0.625rem',
    fontSize: '0.75rem',
    maxWidth: '16rem',
    headerGap: '0.25rem',
    rowGap: '0.5rem',
    swatchSize: '0.625rem'
};

export const crosshair: ChartsTokenSections.Crosshair = {};

export const direction: ChartsTokenSections.Direction = {};

export const navigator: ChartsTokenSections.Navigator = {};

export const zoomButton: ChartsTokenSections.ZoomButton = {
    borderRadius: '{border.radius.none}'
};

export const palette: ChartsTokenSections.Palette = {};

/*
 * The colours all live in colorScheme rather than in the sections above, because every one of them
 * has to differ between light and dark. The dark palette keeps the same hue families with a modest
 * lift so marks stay readable instead of going neon.
 */
export const colorScheme: ChartsTokenSections.ColorScheme = {
    light: {
        root: { color: '{surface.900}' },
        axis: { color: '{surface.500}', titleColor: '{surface.500}' },
        tick: { labelColor: '{surface.500}' },
        grid: { color: '{surface.200}', minorColor: '{surface.100}' },
        band: { fill: '{surface.900}' },
        title: { color: '{surface.900}' },
        caption: { color: '{surface.500}' },
        dataLabel: { color: '{surface.700}' },
        annotation: { color: '{surface.700}' },
        crosshair: { color: '{surface.400}' },
        legend: { color: '{surface.700}' },
        tooltip: {
            background: '{surface.0}',
            color: '{surface.900}',
            borderColor: '{surface.300}'
        },
        direction: { positive: '#10a981', negative: '#e5484d', neutral: '{surface.400}' },
        navigator: {
            background: '{surface.50}',
            seriesColor: '{surface.400}',
            maskColor: 'rgba(255, 255, 255, 0.6)',
            selectionColor: '{primary.color}',
            selectionFill: 'rgba(0, 0, 0, 0.04)'
        },
        zoomButton: {
            background: 'rgba(255, 255, 255, 0.92)',
            color: '{surface.700}',
            borderColor: '#808080',
            disabledColor: '{surface.400}',
            disabledBorderColor: 'rgba(0, 0, 0, 0.08)'
        },
        palette: {
            color0: '#5daeea',
            color1: '#ffad5a',
            color2: '#ffd166',
            color3: '#4ecdc4',
            color4: '#7c8cff',
            color5: '#c084fc',
            color6: '#ff6fae',
            color7: '#9ccc3c',
            color8: '#ff7a66',
            color9: '#36b7d6',
            color10: '#a78bfa',
            color11: '#5ccf9f',
            color12: '#fda4af',
            color13: '#94a3b8'
        }
    },
    dark: {
        root: { color: '{surface.0}' },
        axis: { color: '{surface.400}', titleColor: '{surface.400}' },
        tick: { labelColor: '{surface.400}' },
        grid: { color: '{surface.700}', minorColor: '{surface.800}' },
        band: { fill: '{surface.0}' },
        title: { color: '{surface.0}' },
        caption: { color: '{surface.400}' },
        dataLabel: { color: '{surface.200}' },
        annotation: { color: '{surface.200}' },
        crosshair: { color: '{surface.500}' },
        legend: { color: '{surface.200}' },
        tooltip: {
            background: '{surface.900}',
            color: '{surface.0}',
            borderColor: '{surface.700}'
        },
        direction: { positive: '#3dd6a5', negative: '#ff6369', neutral: '{surface.500}' },
        navigator: {
            background: '{surface.900}',
            seriesColor: '{surface.500}',
            maskColor: 'rgba(0, 0, 0, 0.5)',
            selectionColor: '{primary.color}',
            selectionFill: 'rgba(255, 255, 255, 0.06)'
        },
        zoomButton: {
            background: 'rgba(39, 39, 42, 0.92)',
            color: '{surface.200}',
            borderColor: '#808080',
            disabledColor: '{surface.500}',
            disabledBorderColor: 'rgba(255, 255, 255, 0.1)'
        },
        palette: {
            color0: '#6bbbed',
            color1: '#ffb76d',
            color2: '#ffdc7a',
            color3: '#61d8cf',
            color4: '#909dff',
            color5: '#cc99fd',
            color6: '#ff82ba',
            color7: '#aad64c',
            color8: '#ff8b76',
            color9: '#4fc7df',
            color10: '#b79dfb',
            color11: '#6fdaad',
            color12: '#fdb1bb',
            color13: '#a8b5c6'
        }
    }
};

export default {
    root,
    font,
    transition,
    focus,
    axis,
    tick,
    grid,
    band,
    title,
    caption,
    dataLabel,
    annotation,
    hover,
    dim,
    legend,
    tooltip,
    crosshair,
    direction,
    navigator,
    zoomButton,
    palette,
    colorScheme
} satisfies ChartsDesignTokens;
