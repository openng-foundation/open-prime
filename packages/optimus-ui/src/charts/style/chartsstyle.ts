import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/charts';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: 'p-chart p-component',
    container: 'p-chart-container',
    surface: 'p-chart-surface',
    plot: 'p-chart-plot',
    pluginOverlay: 'p-chart-plugin-overlay',
    overlays: 'p-chart-overlays',
    stamps: 'p-chart-stamps',
    screenReader: 'p-chart-sr-only'
};

@Injectable()
export class ChartsStyle extends BaseStyle {
    name = 'charts';

    style = style;

    classes = classes;
}

/**
 *
 * Charts is a unified chart system: SVG and Canvas rendering from the same compound API, with axes,
 * legends, tooltips, animation, decimation and fully replaceable surfaces.
 *
 * [Live Demo](https://optimus.openng.org/charts/)
 *
 * @module chartsstyle
 *
 */
export enum ChartsClasses {
    /** Class name of the root element */
    root = 'p-chart',
    /** Class name of the sizing container element */
    container = 'p-chart-container',
    /** Class name of the SVG or canvas surface element */
    surface = 'p-chart-surface',
    /** Class name of the plot group element */
    plot = 'p-chart-plot',
    /** Class name of a scene layer group */
    layer = 'p-chart-layer',
    /** Class name of the plugin overlay group */
    pluginOverlay = 'p-chart-plugin-overlay',
    /** Class name of the HTML overlay layer */
    overlays = 'p-chart-overlays',
    stamps = 'p-chart-stamps',
    /** Class name of the visually hidden screen reader region */
    screenReader = 'p-chart-sr-only',
    /** Class name of an axis group */
    axis = 'p-chart-axis',
    /** Class name of an axis line */
    axisLine = 'p-chart-axis-line',
    /** Class name of an axis tick mark */
    axisTick = 'p-chart-tick',
    /** Class name of an axis tick label */
    tickLabel = 'p-chart-tick-label',
    /** Class name of an axis title */
    axisTitle = 'p-chart-axis-title',
    /** Class name of a major grid line */
    gridLine = 'p-chart-grid-line',
    /** Class name of a minor grid line */
    gridLineMinor = 'p-chart-grid-line-minor',
    /** Class name of an alternating band */
    band = 'p-chart-band',
    /** Class name of a series group */
    series = 'p-chart-series',
    /** Class name of a line path */
    line = 'p-chart-line',
    /** Class name of a line halo path */
    lineBorder = 'p-chart-line-border',
    /** Class name of a per-segment line path */
    lineSegment = 'p-chart-line-segment',
    /** Class name of an area fill path */
    area = 'p-chart-area',
    /** Class name of a point marker */
    marker = 'p-chart-marker',
    /** Class name of a bar */
    bar = 'p-chart-bar',
    /** Class name applied to the hovered mark */
    pointHover = 'p-chart-point-hover',
    /** Class name applied to a dimmed mark */
    pointInactive = 'p-chart-point-inactive',
    /** Class name applied to a dimmed series */
    seriesInactive = 'p-chart-series-inactive'
}

export interface ChartsStyle extends BaseStyle {}
