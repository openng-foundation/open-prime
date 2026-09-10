/**
 * The template seams.
 *
 * Each of these marks an `<ng-template>` as replacing one surface of a chart. They exist as
 * separate directives rather than as one directive with a `slot` input so a template can only be
 * projected where its context type actually applies -- a legend row template in a tooltip slot
 * would compile and then fail at runtime.
 *
 * Two families of seam:
 *
 * - The HTML overlay seams -- legend row, tooltip body, breadcrumb, export menu -- work under both
 *   renderers, because that chrome is real DOM either way.
 * - The seams stamped into the plot -- markers, slices, cells, axis ticks -- are SVG-only. Under
 *   Canvas the matching `render*` function input takes their place, since there is no element tree
 *   to stamp a template into.
 */
import { Directive, TemplateRef, inject } from '@angular/core';
import type {
    AxisGroupRenderContext,
    AxisTickRenderContext,
    CenterContentContext,
    ColorLegendRenderContext,
    DataLabelContext,
    ExportMenuIconContext,
    ExportMenuItemContext,
    HeatmapCellContext,
    LegendItemRenderContext,
    PointRenderContext,
    SliceRenderContext,
    TooltipRenderContext,
    TreemapCellContext
} from '@openng/optimus-ui/types/charts';

/** A template seam, with the context its consumers get. */
abstract class ChartDef<C> {
    /** The projected template. */
    readonly template: TemplateRef<C> = inject(TemplateRef);
}

/**
 * Replaces each legend row. Works under both renderers.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartLegendItemDef]', standalone: true })
export class ChartLegendItemDef extends ChartDef<LegendItemRenderContext> {}

/**
 * Replaces the tooltip body. Works under both renderers.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartTooltipDef]', standalone: true })
export class ChartTooltipDef extends ChartDef<TooltipRenderContext> {}

/**
 * Replaces the colour legend's gradient bar. Works under both renderers.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartColorLegendDef]', standalone: true })
export class ChartColorLegendDef extends ChartDef<ColorLegendRenderContext> {}

/**
 * Replaces the export menu's button icon. Works under both renderers.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartExportMenuIconDef]', standalone: true })
export class ChartExportMenuIconDef extends ChartDef<ExportMenuIconContext> {}

/**
 * Replaces each export menu entry. Works under both renderers.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartExportMenuItemDef]', standalone: true })
export class ChartExportMenuItemDef extends ChartDef<ExportMenuItemContext> {}

/**
 * Replaces each point marker. SVG only: under Canvas, pass `renderMarker` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartMarkerDef]', standalone: true })
export class ChartMarkerDef extends ChartDef<PointRenderContext> {}

/**
 * Replaces the content inside each pie or donut slice. SVG only: under Canvas, pass
 * `renderContent` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartSliceDef]', standalone: true })
export class ChartSliceDef extends ChartDef<SliceRenderContext> {}

/**
 * Replaces the content of each heatmap cell. SVG only: under Canvas, pass `renderContent` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartHeatmapCellDef]', standalone: true })
export class ChartHeatmapCellDef extends ChartDef<HeatmapCellContext> {}

/**
 * Replaces the content of each treemap cell. SVG only: under Canvas, pass `renderContent` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartTreemapCellDef]', standalone: true })
export class ChartTreemapCellDef extends ChartDef<TreemapCellContext> {}

/**
 * Replaces the content in the middle of a donut or gauge. SVG only.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartCenterContentDef]', standalone: true })
export class ChartCenterContentDef extends ChartDef<CenterContentContext> {}

/**
 * Replaces each data label. SVG only: under Canvas, pass `render` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartDataLabelDef]', standalone: true })
export class ChartDataLabelDef extends ChartDef<DataLabelContext> {}

/**
 * Draws an annotation. SVG only: the template is stamped into the plot, so it must return
 * `svg:`-prefixed markup. Under Canvas, pass `render` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartAnnotationDef]', standalone: true })
export class ChartAnnotationDef extends ChartDef<AxisTickRenderContext> {}

/**
 * Replaces each axis tick label. SVG only: under Canvas, pass `render` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartAxisTickDef]', standalone: true })
export class ChartAxisTickDef extends ChartDef<AxisTickRenderContext> {}

/**
 * Replaces an axis group header. SVG only: under Canvas, pass `render` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartAxisGroupDef]', standalone: true })
export class ChartAxisGroupDef extends ChartDef<AxisGroupRenderContext> {}

/**
 * Replaces the reference line. SVG only: under Canvas, pass `render` instead.
 *
 * @group Templates
 */
@Directive({ selector: '[pChartReferenceLineDef]', standalone: true })
export class ChartReferenceLineDef extends ChartDef<AxisTickRenderContext> {}
