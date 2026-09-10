export * from './charts.types';
export * from './charts-context.types';
export * from './charts-series.types';
export * from './charts-feature.types';
export * from './charts-root.types';
export * from './charts-passthrough.types';

/*
 * The short aliases the reference exports alongside the `Chart`-prefixed names. Both spellings
 * appear in its own examples, so both have to resolve -- and an alias is cheaper than asking every
 * caller to pick one.
 */
export type {
    ChartAccessibilityProps as AccessibilityProps,
    ChartHoverProps as HoverProps,
    ChartLegendProps as LegendProps,
    ChartTooltipProps as TooltipProps,
    ChartDataLabelsProps as DataLabelsProps,
    ChartZoomProps as ZoomProps,
    ChartNavigatorProps as NavigatorProps,
    ChartExportMenuProps as ExportMenuProps,
    ChartResponsiveProps as ResponsiveProps,
    ChartDecimationProps as DecimationProps,
    ChartTitleProps as TitleProps,
    ChartCaptionProps as CaptionProps
} from './charts-feature.types';
