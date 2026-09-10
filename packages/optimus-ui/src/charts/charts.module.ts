import { NgModule } from '@angular/core';
import { ChartCanvas } from './chart-canvas';
import { ChartGroup } from './chart-group';
import { ChartSvg } from './chart-svg';
import { ChartXAxis, ChartYAxis } from './features/chart-axis';
import {
    ChartAnnotationDef,
    ChartAxisGroupDef,
    ChartAxisTickDef,
    ChartCenterContentDef,
    ChartColorLegendDef,
    ChartDataLabelDef,
    ChartExportMenuIconDef,
    ChartExportMenuItemDef,
    ChartHeatmapCellDef,
    ChartLegendItemDef,
    ChartMarkerDef,
    ChartReferenceLineDef,
    ChartSliceDef,
    ChartTooltipDef,
    ChartTreemapCellDef
} from './features/chart-defs';
import { ChartA11yView } from './features/chart-a11y-view';
import { ChartAccessibility } from './features/chart-accessibility';
import { ChartAnnotation } from './features/chart-annotation';
import { ChartAxisCategory, ChartAxisGroup } from './features/chart-axis-group';
import { ChartBreadcrumb } from './features/chart-breadcrumb';
import { ChartColorLegend } from './features/chart-color-legend';
import { ChartDataLabels } from './features/chart-data-labels';
import { ChartDecimation } from './features/chart-decimation';
import { ChartExportMenu } from './features/chart-export-menu';
import { ChartLegend } from './features/chart-legend';
import { ChartNavigator } from './features/chart-navigator';
import { ChartReferenceBand, ChartReferenceLine } from './features/chart-reference';
import { ChartResponsive } from './features/chart-responsive';
import { ChartCaption, ChartTitle } from './features/chart-title';
import { ChartZoom } from './features/chart-zoom';
import { ChartItem, ChartTreemapGroup } from './series/chart-items';
import { ChartTooltip } from './features/chart-tooltip';
import { ChartHover } from './features/chart-hover';
import { ChartBar } from './series/chart-bar';
import { ChartOverlap, ChartRange, ChartStacked, ChartWaterfall } from './series/chart-groups';
import { ChartLine } from './series/chart-line';
import { ChartCandlestick } from './series/chart-candlestick';
import { ChartHeatmap } from './series/chart-heatmap';
import { ChartPie } from './series/chart-pie';
import { ChartPolar } from './series/chart-polar';
import { ChartRadar } from './series/chart-radar';
import { ChartScatter } from './series/chart-scatter';
import { ChartTreemap } from './series/chart-treemap';

/**
 * Every chart part in one import.
 *
 * The parts are standalone, so importing them individually works and tree-shakes better. This
 * module exists for the templates that use most of them and would rather not maintain the list.
 *
 * Note the name: `ChartModule` belongs to the chart.js-backed `p-chart`, which is a separate
 * component and stays as it is.
 */
const PARTS = [
    ChartSvg,
    ChartCanvas,
    ChartGroup,
    ChartLine,
    ChartBar,
    ChartPie,
    ChartScatter,
    ChartRadar,
    ChartPolar,
    ChartCandlestick,
    ChartHeatmap,
    ChartTreemap,
    ChartStacked,
    ChartWaterfall,
    ChartOverlap,
    ChartRange,
    ChartXAxis,
    ChartYAxis,
    ChartHover,
    ChartLegend,
    ChartColorLegend,
    ChartTooltip,
    ChartTitle,
    ChartCaption,
    ChartDataLabels,
    ChartReferenceLine,
    ChartReferenceBand,
    ChartAnnotation,
    ChartZoom,
    ChartNavigator,
    ChartExportMenu,
    ChartAccessibility,
    ChartA11yView,
    ChartResponsive,
    ChartDecimation,
    ChartBreadcrumb,
    ChartAxisGroup,
    ChartAxisCategory,
    ChartItem,
    ChartTreemapGroup,
    ChartLegendItemDef,
    ChartTooltipDef,
    ChartColorLegendDef,
    ChartExportMenuIconDef,
    ChartExportMenuItemDef,
    ChartMarkerDef,
    ChartSliceDef,
    ChartHeatmapCellDef,
    ChartTreemapCellDef,
    ChartCenterContentDef,
    ChartDataLabelDef,
    ChartAnnotationDef,
    ChartAxisTickDef,
    ChartAxisGroupDef,
    ChartReferenceLineDef
] as const;

@NgModule({
    imports: [...PARTS],
    exports: [...PARTS]
})
export class ChartsModule {}
