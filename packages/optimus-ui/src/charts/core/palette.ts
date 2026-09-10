/**
 * The default palettes and theme objects.
 *
 * The 14-color categorical order is deliberate: cool and warm hues alternate early so adjacent
 * slices, stacked segments and legend rows stay distinguishable, and the softer secondary colors sit
 * later so they extend a dense series without making an ordinary two-series chart look busy. The
 * dark ramp keeps the same hue families with a modest lift, so marks stay readable rather than going
 * neon.
 */
import type { ChartTheme } from '@openng/optimus-ui/types/charts';

/** The categorical series palette, light mode. */
export const LIGHT_SERIES_PALETTE = ['#5daeea', '#ffad5a', '#ffd166', '#4ecdc4', '#7c8cff', '#c084fc', '#ff6fae', '#9ccc3c', '#ff7a66', '#36b7d6', '#a78bfa', '#5ccf9f', '#fda4af', '#94a3b8'] as const;

/** The categorical series palette, dark mode. */
export const DARK_SERIES_PALETTE = ['#6bbbed', '#ffb76d', '#ffdc7a', '#61d8cf', '#909dff', '#cc99fd', '#ff82ba', '#aad64c', '#ff8b76', '#4fc7df', '#b79dfb', '#6fdaad', '#fdb1bb', '#a8b5c6'] as const;

/** The default heat gradient, used by a heatmap or a value-colored treemap given no color range. */
export const DEFAULT_HEAT_RANGE = ['#ffd166', '#ffad5a', '#ff7a66'] as const;

/** Theme defaults for light mode. Spread it to build a custom theme. */
export const defaultLightTheme: Required<Pick<ChartTheme, 'series'>> & ChartTheme = {
    series: [...LIGHT_SERIES_PALETTE],
    axes: ['#64748b', '#64748b'],
    grid: '#e2e8f0',
    gridMinor: '#f1f5f9',
    tickLabel: '#64748b',
    dataLabel: '#334155',
    annotation: '#334155',
    titleColor: '#0f172a',
    captionColor: '#64748b',
    bandFill: '#0f172a',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#cbd5e1',
    tooltipColor: '#0f172a',
    legendColor: '#334155',
    crosshairColor: '#94a3b8',
    background: 'transparent',
    border: '#e2e8f0',
    color: '#0f172a',
    positive: '#10a981',
    negative: '#e5484d',
    hoverBrightness: 1.1,
    dimOpacity: 1
};

/** Theme defaults for dark mode. Spread it to build a custom theme. */
export const defaultDarkTheme: Required<Pick<ChartTheme, 'series'>> & ChartTheme = {
    series: [...DARK_SERIES_PALETTE],
    axes: ['#94a3b8', '#94a3b8'],
    grid: '#243447',
    gridMinor: '#172235',
    tickLabel: '#94a3b8',
    dataLabel: '#e2e8f0',
    annotation: '#e2e8f0',
    titleColor: '#f8fafc',
    captionColor: '#94a3b8',
    bandFill: '#f8fafc',
    tooltipBackground: '#111827',
    tooltipBorder: '#3b4a5f',
    tooltipColor: '#f8fafc',
    legendColor: '#dbeafe',
    crosshairColor: '#64748b',
    background: 'transparent',
    border: '#243447',
    color: '#f8fafc',
    positive: '#3dd6a5',
    negative: '#ff6369',
    hoverBrightness: 1.12,
    dimOpacity: 1
};

/**
 * Picks a series color by index, cycling once the series outnumber the palette. Cycling rather than
 * repeating the last color keeps a 20-series chart legible instead of collapsing its tail into one
 * indistinguishable block.
 */
export function seriesColorAt(palette: readonly string[], index: number): string {
    if (palette.length === 0) return LIGHT_SERIES_PALETTE[0];

    return palette[((index % palette.length) + palette.length) % palette.length];
}

/**
 * The CSS custom property an SVG series reads its color from. The Canvas renderer has no DOM to
 * resolve these against and goes through the theme object instead.
 */
export function seriesColorVariable(index: number, paletteSize: number = LIGHT_SERIES_PALETTE.length): string {
    return `--p-chart-color-${((index % paletteSize) + paletteSize) % paletteSize}`;
}

/**
 * The design-token custom property behind a palette slot.
 *
 * This is the theme preset's variable rather than the public override name, so it serves as the
 * middle level of precedence: an application override beats it, and it beats the built-in literal.
 */
export function seriesTokenVariable(index: number, paletteSize: number = LIGHT_SERIES_PALETTE.length): string {
    return `--p-charts-palette-color${((index % paletteSize) + paletteSize) % paletteSize}`;
}

/**
 * The stable classes an SVG mark carries so a stylesheet can reach it.
 *
 * Two of them, and they answer different questions. `p-chart-color-N` says which palette slot the
 * mark took, which is what a theme override targets; `p-chart-series-N` says which series it is,
 * which is what an application targeting *its own* second series needs -- and those differ the
 * moment the palette wraps or a series is hidden.
 */
export function seriesColorClass(index: number, paletteSize: number = LIGHT_SERIES_PALETTE.length): string {
    return `p-chart-color-${((index % paletteSize) + paletteSize) % paletteSize} p-chart-series-${index}`;
}

/** Merges a partial theme over the built-in defaults for the active color scheme. */
export function resolveTheme(theme: ChartTheme | undefined, isDark: boolean): ChartTheme {
    const base = isDark ? defaultDarkTheme : defaultLightTheme;

    if (!theme) return base;

    return { ...base, ...theme, series: theme.series?.length ? theme.series : base.series };
}
