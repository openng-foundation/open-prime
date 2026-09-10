/**
 *
 * Charts Design Tokens
 *
 * @module charts
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace ChartsTokenSections {
    interface Root {
        /**
         * Color of root
         *
         * @designToken charts.color
         */
        color?: string;
        /**
         * Background of root
         *
         * @designToken charts.background
         */
        background?: string;
    }

    interface Font {
        /**
         * Family of font
         *
         * @designToken charts.font.family
         */
        family?: string;
        /**
         * Size of font
         *
         * @designToken charts.font.size
         */
        size?: string;
    }

    interface Transition {
        /**
         * Duration of transition
         *
         * @designToken charts.transition.duration
         */
        duration?: string;
    }

    interface Focus {
        /**
         * Ring width of focus
         *
         * @designToken charts.focus.ring.width
         */
        ringWidth?: string;
        /**
         * Ring style of focus
         *
         * @designToken charts.focus.ring.style
         */
        ringStyle?: string;
        /**
         * Ring color of focus
         *
         * @designToken charts.focus.ring.color
         */
        ringColor?: string;
        /**
         * Ring offset of focus
         *
         * @designToken charts.focus.ring.offset
         */
        ringOffset?: string;
    }

    interface Axis {
        /**
         * Color of axis
         *
         * @designToken charts.axis.color
         */
        color?: string;
        /**
         * Title color of axis
         *
         * @designToken charts.axis.title.color
         */
        titleColor?: string;
    }

    interface Tick {
        /**
         * Label color of tick
         *
         * @designToken charts.tick.label.color
         */
        labelColor?: string;
    }

    interface Grid {
        /**
         * Color of grid
         *
         * @designToken charts.grid.color
         */
        color?: string;
        /**
         * Minor color of grid
         *
         * @designToken charts.grid.minor.color
         */
        minorColor?: string;
    }

    interface Band {
        /**
         * Fill of band
         *
         * @designToken charts.band.fill
         */
        fill?: string;
    }

    interface Title {
        /**
         * Color of title
         *
         * @designToken charts.title.color
         */
        color?: string;
    }

    interface Caption {
        /**
         * Color of caption
         *
         * @designToken charts.caption.color
         */
        color?: string;
    }

    interface DataLabel {
        /**
         * Color of data label
         *
         * @designToken charts.data.label.color
         */
        color?: string;
    }

    interface Annotation {
        /**
         * Color of annotation
         *
         * @designToken charts.annotation.color
         */
        color?: string;
    }

    interface Hover {
        /**
         * Brightness of hover
         *
         * @designToken charts.hover.brightness
         */
        brightness?: string;
    }

    interface Dim {
        /**
         * Opacity of dim
         *
         * @designToken charts.dim.opacity
         */
        opacity?: string;
    }

    interface Legend {
        /**
         * Color of legend
         *
         * @designToken charts.legend.color
         */
        color?: string;
        /**
         * Item gap of legend
         *
         * @designToken charts.legend.item.gap
         */
        itemGap?: string;
        /**
         * Item border radius of legend
         *
         * @designToken charts.legend.item.border.radius
         */
        itemBorderRadius?: string;
    }

    interface Tooltip {
        /**
         * Background of tooltip
         *
         * @designToken charts.tooltip.background
         */
        background?: string;
        /**
         * Color of tooltip
         *
         * @designToken charts.tooltip.color
         */
        color?: string;
        /**
         * Border color of tooltip
         *
         * @designToken charts.tooltip.border.color
         */
        borderColor?: string;
        /**
         * Border radius of tooltip
         *
         * @designToken charts.tooltip.border.radius
         */
        borderRadius?: string;
        /**
         * Shadow of tooltip
         *
         * @designToken charts.tooltip.shadow
         */
        shadow?: string;
        /**
         * Padding of tooltip
         *
         * @designToken charts.tooltip.padding
         */
        padding?: string;
        /**
         * Font size of tooltip
         *
         * @designToken charts.tooltip.font.size
         */
        fontSize?: string;
        /**
         * Max width of tooltip
         *
         * @designToken charts.tooltip.max.width
         */
        maxWidth?: string;
        /**
         * Header gap of tooltip
         *
         * @designToken charts.tooltip.header.gap
         */
        headerGap?: string;
        /**
         * Row gap of tooltip
         *
         * @designToken charts.tooltip.row.gap
         */
        rowGap?: string;
        /**
         * Swatch size of tooltip
         *
         * @designToken charts.tooltip.swatch.size
         */
        swatchSize?: string;
    }

    interface Crosshair {
        /**
         * Color of crosshair
         *
         * @designToken charts.crosshair.color
         */
        color?: string;
    }

    interface Direction {
        /**
         * Positive of direction
         *
         * @designToken charts.direction.positive
         */
        positive?: string;
        /**
         * Negative of direction
         *
         * @designToken charts.direction.negative
         */
        negative?: string;
        /**
         * Neutral of direction
         *
         * @designToken charts.direction.neutral
         */
        neutral?: string;
    }

    interface Navigator {
        /**
         * Background of navigator
         *
         * @designToken charts.navigator.background
         */
        background?: string;
        /**
         * Series color of navigator
         *
         * @designToken charts.navigator.series.color
         */
        seriesColor?: string;
        /**
         * Mask color of navigator
         *
         * @designToken charts.navigator.mask.color
         */
        maskColor?: string;
        /**
         * Selection color of navigator
         *
         * @designToken charts.navigator.selection.color
         */
        selectionColor?: string;
        /**
         * Selection fill of navigator
         *
         * @designToken charts.navigator.selection.fill
         */
        selectionFill?: string;
    }

    interface ZoomButton {
        /**
         * Background of zoom button
         *
         * @designToken charts.zoom.button.background
         */
        background?: string;
        /**
         * Color of zoom button
         *
         * @designToken charts.zoom.button.color
         */
        color?: string;
        /**
         * Border color of zoom button
         *
         * @designToken charts.zoom.button.border.color
         */
        borderColor?: string;
        /**
         * Disabled color of zoom button
         *
         * @designToken charts.zoom.button.disabled.color
         */
        disabledColor?: string;
        /**
         * Disabled border color of zoom button
         *
         * @designToken charts.zoom.button.disabled.border.color
         */
        disabledBorderColor?: string;
        /**
         * Border radius of zoom button
         *
         * @designToken charts.zoom.button.border.radius
         */
        borderRadius?: string;
    }

    /**
     * The categorical series palette.
     *
     * Fourteen slots, cycled once the series outnumber them. The order alternates cool and warm
     * hues early so adjacent slices, stacked segments and legend rows stay distinguishable, and
     * keeps the softer colors later so they extend a dense series without making an ordinary
     * two-series chart look busy.
     */
    interface Palette {
        /**
         * Color 0 of palette
         *
         * @designToken charts.palette.color0
         */
        color0?: string;
        /**
         * Color 1 of palette
         *
         * @designToken charts.palette.color1
         */
        color1?: string;
        /**
         * Color 2 of palette
         *
         * @designToken charts.palette.color2
         */
        color2?: string;
        /**
         * Color 3 of palette
         *
         * @designToken charts.palette.color3
         */
        color3?: string;
        /**
         * Color 4 of palette
         *
         * @designToken charts.palette.color4
         */
        color4?: string;
        /**
         * Color 5 of palette
         *
         * @designToken charts.palette.color5
         */
        color5?: string;
        /**
         * Color 6 of palette
         *
         * @designToken charts.palette.color6
         */
        color6?: string;
        /**
         * Color 7 of palette
         *
         * @designToken charts.palette.color7
         */
        color7?: string;
        /**
         * Color 8 of palette
         *
         * @designToken charts.palette.color8
         */
        color8?: string;
        /**
         * Color 9 of palette
         *
         * @designToken charts.palette.color9
         */
        color9?: string;
        /**
         * Color 10 of palette
         *
         * @designToken charts.palette.color10
         */
        color10?: string;
        /**
         * Color 11 of palette
         *
         * @designToken charts.palette.color11
         */
        color11?: string;
        /**
         * Color 12 of palette
         *
         * @designToken charts.palette.color12
         */
        color12?: string;
        /**
         * Color 13 of palette
         *
         * @designToken charts.palette.color13
         */
        color13?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<ChartsDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Charts Design Tokens_
 *
 * @group components
 * @module charts
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface ChartsDesignTokens extends DesignTokens<ChartsDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: ChartsTokenSections.Root;
    /**
     * Used to pass tokens of the font section
     */
    font?: ChartsTokenSections.Font;
    /**
     * Used to pass tokens of the transition section
     */
    transition?: ChartsTokenSections.Transition;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: ChartsTokenSections.Focus;
    /**
     * Used to pass tokens of the axis section
     */
    axis?: ChartsTokenSections.Axis;
    /**
     * Used to pass tokens of the tick section
     */
    tick?: ChartsTokenSections.Tick;
    /**
     * Used to pass tokens of the grid section
     */
    grid?: ChartsTokenSections.Grid;
    /**
     * Used to pass tokens of the band section
     */
    band?: ChartsTokenSections.Band;
    /**
     * Used to pass tokens of the title section
     */
    title?: ChartsTokenSections.Title;
    /**
     * Used to pass tokens of the caption section
     */
    caption?: ChartsTokenSections.Caption;
    /**
     * Used to pass tokens of the data label section
     */
    dataLabel?: ChartsTokenSections.DataLabel;
    /**
     * Used to pass tokens of the annotation section
     */
    annotation?: ChartsTokenSections.Annotation;
    /**
     * Used to pass tokens of the hover section
     */
    hover?: ChartsTokenSections.Hover;
    /**
     * Used to pass tokens of the dim section
     */
    dim?: ChartsTokenSections.Dim;
    /**
     * Used to pass tokens of the legend section
     */
    legend?: ChartsTokenSections.Legend;
    /**
     * Used to pass tokens of the tooltip section
     */
    tooltip?: ChartsTokenSections.Tooltip;
    /**
     * Used to pass tokens of the crosshair section
     */
    crosshair?: ChartsTokenSections.Crosshair;
    /**
     * Used to pass tokens of the direction section
     */
    direction?: ChartsTokenSections.Direction;
    /**
     * Used to pass tokens of the navigator section
     */
    navigator?: ChartsTokenSections.Navigator;
    /**
     * Used to pass tokens of the zoom button section
     */
    zoomButton?: ChartsTokenSections.ZoomButton;
    /**
     * Used to pass tokens of the palette section
     */
    palette?: ChartsTokenSections.Palette;
}
