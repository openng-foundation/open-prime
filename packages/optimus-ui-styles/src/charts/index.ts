export const style = /*css*/ `
    /*
     * The chart's public styling surface.
     *
     * Every colour is read as var(--p-chart-<name>, <design token>): the public custom property
     * first, the preset's token as the fallback. So an application setting --p-chart-color-0 or
     * --p-chart-grid at any scope -- :root, a section, a single chart wrapper -- restyles an SVG
     * chart with no JavaScript re-render, and a chart nobody has overridden still follows the theme.
     *
     * Note that nothing here *declares* a custom property. The build rejects that, and rightly: a
     * component that declared its own --p-chart-grid would shadow an override coming from an outer
     * scope, which is the opposite of what the override is for.
     *
     * The Canvas renderer cannot read any of this, having no DOM for a custom property to apply to,
     * which is why it is themed through the 'theme' input instead.
     */
    .p-chart {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        color: dt('charts.color');
        font-family: dt('charts.font.family');
    }

    .p-chart-container {
        position: relative;
        margin-inline: auto;
        isolation: isolate;
        user-select: none;
        width: 100%;
        height: 100%;
    }

    .p-chart-container:focus-visible {
        outline: dt('charts.focus.ring.width') dt('charts.focus.ring.style') dt('charts.focus.ring.color');
        outline-offset: dt('charts.focus.ring.offset');
    }

    /*
     * Absolutely positioned on purpose. An <svg> in flow with no CSS height falls back to the CSS
     * default for a replaced element -- 150px -- and since the container is what gets measured, that
     * 150px became the chart's height and it never filled its parent. Out of flow, the surface
     * contributes nothing to the container's height, so the measurement is of the space available.
     */
    .p-chart-surface {
        position: absolute;
        inset: 0;
        display: block;
        overflow: visible;
    }

    /*
     * The series palette.
     *
     * A mark carries its slot class and the class supplies the colour. The public name is read
     * first and the design token is the fallback, so an application override at any scope wins over
     * the preset without either having to know about the other.
     */
    .p-chart-color-0 { color: var(--p-chart-color-0, dt('charts.palette.color0')); }
    .p-chart-color-1 { color: var(--p-chart-color-1, dt('charts.palette.color1')); }
    .p-chart-color-2 { color: var(--p-chart-color-2, dt('charts.palette.color2')); }
    .p-chart-color-3 { color: var(--p-chart-color-3, dt('charts.palette.color3')); }
    .p-chart-color-4 { color: var(--p-chart-color-4, dt('charts.palette.color4')); }
    .p-chart-color-5 { color: var(--p-chart-color-5, dt('charts.palette.color5')); }
    .p-chart-color-6 { color: var(--p-chart-color-6, dt('charts.palette.color6')); }
    .p-chart-color-7 { color: var(--p-chart-color-7, dt('charts.palette.color7')); }
    .p-chart-color-8 { color: var(--p-chart-color-8, dt('charts.palette.color8')); }
    .p-chart-color-9 { color: var(--p-chart-color-9, dt('charts.palette.color9')); }
    .p-chart-color-10 { color: var(--p-chart-color-10, dt('charts.palette.color10')); }
    .p-chart-color-11 { color: var(--p-chart-color-11, dt('charts.palette.color11')); }
    .p-chart-color-12 { color: var(--p-chart-color-12, dt('charts.palette.color12')); }
    .p-chart-color-13 { color: var(--p-chart-color-13, dt('charts.palette.color13')); }

    .p-chart-axis-line,
    .p-chart-tick {
        stroke: var(--p-chart-axis, dt('charts.axis.color'));
    }

    /* A spoke divides the rings, so it belongs to the grid rather than to the axis. */
    .p-chart-radial-spoke {
        stroke: var(--p-chart-grid, dt('charts.grid.color'));
    }

    .p-chart-tick-label {
        fill: var(--p-chart-tick-label-color, dt('charts.tick.label.color'));
    }

    /* Annotation content inherits the annotation colour, so a plain <svg:text> needs no fill. */
    .p-chart-annotations {
        fill: var(--p-chart-annotation-color, dt('charts.annotation.color'));
    }

    .p-chart-axis-title {
        fill: var(--p-chart-axis-title-color, dt('charts.axis.title.color'));
    }

    .p-chart-grid-line {
        stroke: var(--p-chart-grid, dt('charts.grid.color'));
    }

    .p-chart-grid-line-minor {
        stroke: var(--p-chart-grid-minor, dt('charts.grid.minor.color'));
    }

    .p-chart-band {
        fill: var(--p-chart-band-fill, dt('charts.band.fill'));
    }

    .p-chart-data-label {
        fill: var(--p-chart-data-label-color, dt('charts.data.label.color'));
    }

    .p-chart-annotation,
    .p-chart-reference-label {
        fill: var(--p-chart-annotation-color, dt('charts.annotation.color'));
    }

    .p-chart-crosshair {
        stroke: var(--p-chart-crosshair-color, dt('charts.crosshair.color'));
    }

    /*
     * Hover and dimming are class-driven so they cost no re-render: the frame that sets the class is
     * the frame the effect appears in. Dimming is opt-in -- the coefficient defaults to 1, which is
     * no fade -- because fading every other mark on each pointer move makes a dense chart flicker.
     */
    .p-chart-point-hover {
        filter: brightness(var(--p-chart-hover-brightness, dt('charts.hover.brightness')));
    }

    .p-chart-point-inactive,
    .p-chart-series-inactive {
        opacity: var(--p-chart-dim-opacity, dt('charts.dim.opacity'));
    }

    .p-chart-marker,
    .p-chart-bar,
    .p-chart-area,
    .p-chart-line {
        transition: filter dt('charts.transition.duration'), opacity dt('charts.transition.duration');
    }

    /*
     * The chrome that has to stay real DOM: it needs focus, text selection and hit targets, none of
     * which survive being painted into a canvas.
     */
    .p-chart-overlays {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .p-chart-overlays > * {
        pointer-events: auto;
    }

    /*
     * The projected in-plot templates.
     *
     * Real SVG over the plot rather than inside it, so a template works the same under both
     * renderers -- Canvas has no element tree to stamp into. It takes no pointer, because the mark
     * it is drawn over is the thing being hovered.
     */
    .p-chart-stamps {
        position: absolute;
        inset: 0;
        overflow: visible;
        pointer-events: none;
    }

    .p-chart-legend {
        color: var(--p-chart-legend-color, dt('charts.legend.color'));
    }

    .p-chart-legend-item {
        display: inline-flex;
        align-items: center;
        gap: dt('charts.legend.item.gap');
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        transition: opacity dt('charts.transition.duration');
    }

    .p-chart-legend-item:disabled {
        cursor: default;
    }

    .p-chart-legend-item:focus-visible {
        outline: dt('charts.focus.ring.width') dt('charts.focus.ring.style') dt('charts.focus.ring.color');
        outline-offset: dt('charts.focus.ring.offset');
        border-radius: dt('charts.legend.item.border.radius');
    }

    .p-chart-legend-swatch {
        flex: none;
        display: inline-block;
    }

    .p-chart-legend-label {
        white-space: nowrap;
    }

    .p-chart-tooltip {
        background: var(--p-chart-tooltip-background, dt('charts.tooltip.background'));
        color: var(--p-chart-tooltip-color, dt('charts.tooltip.color'));
        border: 1px solid var(--p-chart-tooltip-border-color, dt('charts.tooltip.border.color'));
        border-radius: dt('charts.tooltip.border.radius');
        box-shadow: var(--p-chart-tooltip-shadow, dt('charts.tooltip.shadow'));
        padding: dt('charts.tooltip.padding');
        font-size: dt('charts.tooltip.font.size');
        line-height: 1.4;
        max-width: dt('charts.tooltip.max.width');
    }

    .p-chart-tooltip-header {
        font-weight: 600;
        margin-bottom: dt('charts.tooltip.header.gap');
    }

    .p-chart-tooltip-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: dt('charts.tooltip.row.gap');
    }

    .p-chart-tooltip-swatch {
        width: dt('charts.tooltip.swatch.size');
        height: dt('charts.tooltip.swatch.size');
        border-radius: 2px;
    }

    .p-chart-tooltip-value {
        /* Tabular figures so the values in a shared tooltip line up column-wise. */
        font-variant-numeric: tabular-nums;
        font-weight: 600;
    }

    .p-chart-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
    }

    /*
     * Print takes the SVG at its vector resolution, which is the whole reason to prefer the SVG
     * renderer for anything that ends up on paper.
     */
    @media print {
        .p-chart-surface {
            print-color-adjust: exact;
        }
    }
`;
