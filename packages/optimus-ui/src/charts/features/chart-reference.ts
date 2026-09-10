/**
 * ChartReferenceLine and ChartReferenceBand.
 *
 * Both are painted into the scene rather than laid over it in DOM, because both are read against
 * the data: a target line has to be clipped to the plot and scaled by the same axes as the series,
 * or it is not a reference to anything. That is also why several of each can coexist -- a chart with
 * a floor, a target and a ceiling is three lines, not one line with three values -- so each
 * instance registers under its own suffixed feature type.
 */
import { DestroyRef, Directive, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { Alignment, AnnotationContext, BandFill, ChartReferenceBandProps, ChartReferenceLineProps, FontWeight, ReferencePlacement } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, nextGroupId } from '../charts-registry';
import { ChartReferenceLineDef } from './chart-defs';

/**
 * A threshold line at a value or a category.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-reference-line',
    standalone: true,
    host: { class: 'p-chart-reference-line-host' }
})
export class ChartReferenceLine {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** A projected template that replaces the line. SVG only. */
    readonly lineDef = contentChild(ChartReferenceLineDef);

    /**
     * Horizontal position: a category, a timestamp or a numeric value. Draws a vertical line.
     * @group Props
     */
    readonly x = input<string | number | undefined>(undefined);
    /**
     * Vertical position: a numeric value on a value axis, or a category on a band axis. Draws a
     * horizontal line.
     * @group Props
     */
    readonly y = input<string | number | undefined>(undefined);
    /**
     * Y axis `y` is measured against. Only needed on a multi-axis chart.
     * @group Props
     */
    readonly yAxisId = input<string | undefined>(undefined);
    /**
     * Label text shown alongside the line.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * Placement of the label along the line.
     * @defaultValue 'end'
     * @group Props
     */
    readonly labelPosition = input<Alignment>('end');
    /**
     * Label text colour. Follows `stroke` when that was set explicitly, the theme otherwise.
     * @group Props
     */
    readonly labelColor = input<string | undefined>(undefined);
    /**
     * Label font size in pixels.
     * @defaultValue 11
     * @group Props
     */
    readonly labelFontSize = input(11, { transform: numberAttribute });
    /**
     * Label font weight.
     * @defaultValue 500
     * @group Props
     */
    readonly labelFontWeight = input<FontWeight>(500);
    /**
     * Background fill behind the label, which renders a rounded pill when set.
     * @group Props
     */
    readonly labelBackground = input<string | undefined>(undefined);
    /**
     * Opacity of the label background.
     * @defaultValue 1
     * @group Props
     */
    readonly labelBackgroundOpacity = input(1, { transform: numberAttribute });
    /**
     * Padding between the label text and the background edge.
     * @defaultValue 5
     * @group Props
     */
    readonly labelPadding = input(5, { transform: numberAttribute });
    /**
     * Corner radius of the label background pill.
     * @defaultValue 4
     * @group Props
     */
    readonly labelBorderRadius = input(4, { transform: numberAttribute });
    /**
     * Line colour.
     * @defaultValue '#94a3b8'
     * @group Props
     */
    readonly stroke = input<string | undefined>(undefined);
    /**
     * Line stroke width in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly lineStrokeWidth = input(1, { transform: numberAttribute });
    /**
     * Dash pattern, such as `[6, 4]`.
     * @group Props
     */
    readonly lineDash = input<number[] | undefined>(undefined);
    /**
     * Z-order relative to the series.
     * @defaultValue 'afterData'
     * @group Props
     */
    readonly placement = input<ReferencePlacement>('afterData');
    /**
     * Custom renderer, which replaces the default line outright.
     * @group Props
     */
    readonly render = input<((context: AnnotationContext) => unknown) | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartReferenceLineProps>(() => ({
        x: this.x(),
        y: this.y(),
        yAxisId: this.yAxisId(),
        label: this.label(),
        labelPosition: this.labelPosition(),
        labelColor: this.labelColor(),
        labelFontSize: this.labelFontSize(),
        labelFontWeight: this.labelFontWeight(),
        labelBackground: this.labelBackground(),
        labelBackgroundOpacity: this.labelBackgroundOpacity(),
        labelPadding: this.labelPadding(),
        labelBorderRadius: this.labelBorderRadius(),
        stroke: this.stroke(),
        lineStrokeWidth: this.lineStrokeWidth(),
        lineDash: this.lineDash(),
        placement: this.placement(),
        render: this.render()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: `referenceLine:${nextGroupId('reference')}`, props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}

/**
 * A shaded strip between two values or categories.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-reference-band',
    standalone: true,
    host: { class: 'p-chart-reference-band-host' }
})
export class ChartReferenceBand {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Band start on the x axis.
     * @group Props
     */
    readonly x1 = input<string | number | undefined>(undefined);
    /**
     * Band end on the x axis.
     * @group Props
     */
    readonly x2 = input<string | number | undefined>(undefined);
    /**
     * Band start on the y axis.
     * @group Props
     */
    readonly y1 = input<string | number | undefined>(undefined);
    /**
     * Band end on the y axis.
     * @group Props
     */
    readonly y2 = input<string | number | undefined>(undefined);
    /**
     * Y axis `y1` and `y2` are measured against. Only needed on a multi-axis chart.
     * @group Props
     */
    readonly yAxisId = input<string | undefined>(undefined);
    /**
     * Label text shown inside the band.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * Placement of the label along the band.
     * @defaultValue 'center'
     * @group Props
     */
    readonly labelPosition = input<Alignment>('center');
    /**
     * Label text colour.
     * @group Props
     */
    readonly labelColor = input<string | undefined>(undefined);
    /**
     * Label font size in pixels.
     * @defaultValue 11
     * @group Props
     */
    readonly labelFontSize = input(11, { transform: numberAttribute });
    /**
     * Label font weight.
     * @defaultValue 500
     * @group Props
     */
    readonly labelFontWeight = input<FontWeight>(500);
    /**
     * Band fill: a colour, or `{ color, opacity }`.
     * @defaultValue '#0000001a'
     * @group Props
     */
    readonly fill = input<BandFill | undefined>(undefined);
    /**
     * Band fill opacity.
     * @defaultValue 1
     * @group Props
     */
    readonly fillOpacity = input(1, { transform: numberAttribute });
    /**
     * Border stroke drawn around the band rectangle.
     * @group Props
     */
    readonly stroke = input<string | undefined>(undefined);
    /**
     * Z-order relative to the series.
     * @defaultValue 'beforeData'
     * @group Props
     */
    readonly placement = input<ReferencePlacement>('beforeData');

    /** The feature's current inputs. */
    readonly props = computed<ChartReferenceBandProps>(() => ({
        x1: this.x1(),
        x2: this.x2(),
        y1: this.y1(),
        y2: this.y2(),
        yAxisId: this.yAxisId(),
        label: this.label(),
        labelPosition: this.labelPosition(),
        labelColor: this.labelColor(),
        labelFontSize: this.labelFontSize(),
        labelFontWeight: this.labelFontWeight(),
        fill: this.fill(),
        fillOpacity: this.fillOpacity(),
        stroke: this.stroke(),
        placement: this.placement()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: `referenceBand:${nextGroupId('band')}`, props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}
