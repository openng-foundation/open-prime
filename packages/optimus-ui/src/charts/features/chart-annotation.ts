/**
 * ChartAnnotation.
 *
 * An annotation is arbitrary content placed in the chart's own coordinate space -- a callout on a
 * peak, a badge on the last point, a watermark. It cannot be expressed as inputs, because what it
 * draws is the whole point, so the seam is a template (SVG) or a render function (Canvas).
 *
 * It renders into its own transparent `<svg>` sized to the chart rather than into the plot's SVG
 * tree. That is what makes one annotation work under both renderers: the coordinates a template
 * reads are the same absolute pixels the Canvas root would paint at, so the same `xScale(...)` call
 * lands in the same place either way.
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, inject, input } from '@angular/core';
import type { AnnotationContext, ScaleFunction } from '@openng/optimus-ui/types/charts';
import { responsiveTier } from '../core/layout';
import { responsiveContext } from '../core/responsive';
import { CHART_CONTEXT } from '../charts-registry';
import { ChartAnnotationDef } from './chart-defs';

/**
 * Places custom content in the chart's coordinate space.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-annotation',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (template()) {
            <svg class="p-chart-annotation" data-slot="chart-annotation" [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="viewBox()" focusable="false" aria-hidden="true">
                <svg:g class="p-chart-annotations" data-slot="chart-annotations">
                    <ng-container [ngTemplateOutlet]="template()!" [ngTemplateOutletContext]="{ $implicit: annotationContext(), ctx: annotationContext() }" />
                </svg:g>
            </svg>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-annotation-host' }
})
export class ChartAnnotation {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    /** The projected template, which draws the annotation. */
    readonly annotationDef = contentChild(ChartAnnotationDef);

    /**
     * Canvas renderer. Draws to `ctx` and returns `null`; under SVG it may return a node instead.
     * @group Props
     */
    readonly render = input<((context: AnnotationContext) => unknown) | undefined>(undefined);

    protected readonly template = computed(() => this.annotationDef()?.template ?? null);

    protected readonly width = computed(() => this.context?.width() ?? 0);

    protected readonly height = computed(() => this.context?.height() ?? 0);

    protected readonly viewBox = computed(() => `0 0 ${this.width()} ${this.height()}`);

    /**
     * The context handed to the template and the render function.
     *
     * The scale lookups are `null` on the chart types that have no cartesian axes, which is what
     * the documented shape promises -- returning a scale that maps everything to `NaN` would make a
     * radial annotation fail silently instead of letting the author branch on it.
     */
    readonly annotationContext = computed<AnnotationContext>(() => {
        const context = this.context;
        const area = context?.chartArea() ?? { x: 0, y: 0, width: 0, height: 0 };
        const xScale = context?.xScale();
        const yScale = context?.yScale();
        const cartesian = xScale != null && yScale != null;
        const scales = context?.scales();

        return {
            width: this.width(),
            height: this.height(),
            chartArea: area,
            center: { x: area.x + area.width / 2, y: area.y + area.height / 2 },
            xScale: cartesian ? (value: unknown) => xScale!.scale(value) : null,
            yScale: cartesian ? (value: unknown) => yScale!.scale(value) : null,
            getScale: cartesian
                ? (axisId: string) => {
                      const found = scales?.get(`x:${axisId}`) ?? scales?.get(`y:${axisId}`);

                      return found ? (value: unknown) => found.scale(value) : undefined;
                  }
                : null,
            fontFamily: context?.fontFamily() ?? 'inherit',
            textColor: context?.textColor() ?? 'currentColor',
            isItemVisible: (datasetId: string, index: number) => context?.isItemVisible(datasetId, index) ?? true,
            isDatasetVisible: (datasetId: string) => context?.isDatasetVisible(datasetId) ?? true,
            hoveredItem: context?.hover() ? { datasetId: context.hover()!.datasetId, index: context.hover()!.index } : null,
            responsive: responsiveContext(responsiveTier(this.width()))
        } satisfies AnnotationContext & { xScale: ScaleFunction | null };
    });
}
