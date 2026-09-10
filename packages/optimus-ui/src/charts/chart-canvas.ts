/**
 * The Canvas chart root.
 *
 * Canvas draws every mark into one element, so a hundred thousand points cost one node instead of a
 * hundred thousand. What that buys in throughput it gives up in everything the DOM was providing:
 * CSS cannot reach a painted mark, a screen reader cannot walk the marks, and a test cannot query
 * them. `ChartAccessibility` exists to put the second of those back.
 *
 * It paints the same scene the SVG root materializes, so the geometry is identical by construction
 * rather than by careful duplication.
 */
import { NgTemplateOutlet, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, viewChild, type ElementRef } from '@angular/core';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { ChartExportOptions, ChartOverlaySurface, RendererType } from '@openng/optimus-ui/types/charts';
import { buildPdf, dataUrlToBytes, downloadBlob, markupToBlob, recanvas, resolveExportBackground, wrapRasterInSvg } from './core/export';
import { measureTextWidth } from './core/layout';
import { seriesColorAt } from './core/palette';
import { paintSvgNode } from './core/svg-node';
import { ChartRootBase } from './chart-root-base';
import { CHART_CONTEXT } from './charts-registry';
import { ChartA11yView } from './features/chart-a11y-view';
import { ChartTextStack } from './features/chart-title';
import { canvasOverlaySurface, createOverlayRegistry } from './charts-plugins';
import { buildDrawContext, buildScene, isClipped } from './render/build-scene';
import { hitTest } from './render/hit-test';
import { ChartsStyle } from './style/chartsstyle';

/**
 * ChartCanvas renders a chart into a single canvas element. The children are identical to
 * `ChartSvg`: same series, same axes, same features.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-canvas',
    standalone: true,
    imports: [ChartA11yView, NgTemplateOutlet],
    exportAs: 'pChartCanvas',
    template: `
        <div
            #container
            [class]="cx('container')"
            [attr.data-chart-container]="chartId"
            [style.height.px]="$containerHeight()"
            [style.width.px]="$containerWidth()"
            role="figure"
            aria-roledescription="chart"
            [attr.aria-label]="$ariaLabel()"
            tabindex="0"
        >
            <canvas #surface [class]="cx('surface')" [attr.data-renderer]="rendererType" [style.width.px]="$width()" [style.height.px]="$height()"></canvas>
            <svg [class]="cx('stamps')" data-slot="chart-stamps" [attr.width]="$width()" [attr.height]="$height()" [attr.viewBox]="'0 0 ' + $width() + ' ' + $height()" focusable="false" aria-hidden="true">
                @for (stamp of $stamps(); track stamp.key) {
                    <svg:g [attr.data-slot]="'chart-stamp-' + stamp.slot" [attr.transform]="stampTransform(stamp)">
                        <ng-container [ngTemplateOutlet]="stamp.template" [ngTemplateOutletContext]="{ $implicit: stamp.context, ctx: stamp.context }" />
                    </svg:g>
                }
            </svg>
            <div [class]="cx('overlays')">
                <ng-content />
            </div>
            <p-chart-a11y-view />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ChartsStyle, ChartTextStack, { provide: PARENT_INSTANCE, useExisting: ChartCanvas }, { provide: CHART_CONTEXT, useFactory: () => inject(ChartCanvas).context }],
    host: {
        '[class]': 'cx("root")',
        'data-slot': 'chart-root',
        '[attr.data-renderer]': 'rendererType',
        '[attr.dir]': '$direction() === "rtl" ? "rtl" : null'
    },
    hostDirectives: [Bind]
})
export class ChartCanvas extends ChartRootBase {
    componentName = 'Charts';

    readonly rendererType: RendererType = 'canvas';

    /** @internal */
    _componentStyle = inject(ChartsStyle);

    private readonly container = viewChild<ElementRef<HTMLElement>>('container');

    private readonly surface = viewChild<ElementRef<HTMLCanvasElement>>('surface');

    protected readonly containerElement = computed(() => this.container()?.nativeElement ?? null);

    private readonly overlays = createOverlayRegistry();

    private ctx: CanvasRenderingContext2D | null = null;

    /** The figure's accessible name, generated from the series when none was given. */
    readonly $ariaLabel = computed(() => {
        const series = this.chartState.resolvedSeries();

        if (series.length === 0) return 'Chart';

        const points = series.reduce((count, entry) => count + entry.points.length, 0);

        return series.length === 1 ? `${series[0].type} chart with ${points} data points.` : `Combination chart with ${series.length} data series.`;
    });

    constructor() {
        super();

        // The backing store is sized to the device pixel ratio and the context scaled to match, so
        // a line drawn at width 1 is one CSS pixel wide and crisp rather than one device pixel wide
        // and faint.
        effect(() => {
            const canvas = this.surface()?.nativeElement;
            const width = this.$width();
            const height = this.$height();

            if (!canvas || isPlatformServer(this.platformId)) return;

            const ratio = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;

            canvas.width = Math.max(1, Math.round(width * ratio));
            canvas.height = Math.max(1, Math.round(height * ratio));

            this.ctx = canvas.getContext('2d');
            this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
        });

        effect((onCleanup) => {
            const element = this.containerElement();

            if (!element || isPlatformServer(this.platformId)) return;

            const onMove = (event: PointerEvent) => this.handlePointer(event);
            const onLeave = () => {
                this.context.setHover(null);
                this.publishHover(null);
            };

            this.zone.runOutsideAngular(() => {
                element.addEventListener('pointermove', onMove);
                element.addEventListener('pointerleave', onLeave);
            });

            onCleanup(() => {
                element.removeEventListener('pointermove', onMove);
                element.removeEventListener('pointerleave', onLeave);
            });
        });
    }

    /** Measures text against the chart's own font, using the live context. */
    private readonly measureText = (text: string, fontSize: number, fontFamily?: string): number => measureTextWidth(text, fontSize, fontFamily ?? this.$fontFamily(), this.ctx);

    /**
     * A palette slot as a literal colour.
     *
     * Canvas has no DOM to resolve a custom property against, so the theme object is the only
     * palette it can read -- which is exactly why `theme` is the documented way to restyle a Canvas
     * chart.
     */
    private readonly seriesColor = (seriesIndex: number): string => seriesColorAt(this.context.theme().series ?? [], seriesIndex);

    /**
     * Paints the scene.
     *
     * The whole canvas is cleared and repainted each frame. There is no partial-invalidation path
     * because there is nothing to invalidate against: with the marks derived from the data and the
     * layout recomputed anyway, tracking dirty rectangles would cost more bookkeeping than the
     * repaint it saves.
     */
    protected paint(): void {
        const ctx = this.ctx;

        if (!ctx) return;

        const width = this.$width();
        const height = this.$height();
        const drawContext = buildDrawContext(this.context, this.chartId, this.measureText, this.seriesColor);
        const scene = buildScene(this.context, this.chartState.resolvedSeries(), drawContext);

        // Stamped as real SVG over the canvas, which is the only way a projected template can
        // carry bindings under a renderer that has no element tree of its own.
        this.$stamps.set(scene.stamps);

        ctx.clearRect(0, 0, width, height);

        const background = this.context.theme().background;

        if (background && background !== 'transparent') {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
        }

        for (const layer of scene.layers) {
            ctx.save();

            if (isClipped(layer.key)) {
                // Canvas has no clip-path reference, so the plot rectangle is clipped directly.
                ctx.beginPath();
                ctx.rect(drawContext.area.x, drawContext.area.y, drawContext.area.width, drawContext.area.height);
                ctx.clip();
            }

            for (const node of layer.nodes) {
                paintSvgNode(node, ctx, { fill: this.context.textColor(), fontFamily: this.$fontFamily(), fontSize: this.$fontSize() });
            }

            ctx.restore();
        }

        if (this.overlays.size > 0) {
            this.overlays.paint(() => {
                ctx.save();

                return canvasOverlaySurface(ctx, drawContext.area);
            });
            ctx.restore();
        }
    }

    protected registerOverlay(render: (surface: ChartOverlaySurface) => void): () => void {
        return this.overlays.register(render);
    }

    /**
     * Resolves the point under the pointer.
     *
     * Canvas has no elements to hit, so this is the only way to know what the pointer is over --
     * and it is the same computation the SVG root runs, which is why hover behaves identically in
     * both.
     */
    private handlePointer(event: PointerEvent): void {
        const element = this.containerElement();

        if (!element) return;

        const rect = element.getBoundingClientRect();
        const drawContext = buildDrawContext(this.context, this.chartId, this.measureText, this.seriesColor);
        const hit = hitTest(this.context, this.chartState.resolvedSeries(), drawContext, event.clientX - rect.left, event.clientY - rect.top);
        const current = this.context.hover();

        if (hit?.datasetId === current?.datasetId && hit?.index === current?.index) return;

        this.context.setHover(hit);
        this.publishHover(hit);
    }

    getElement(): HTMLCanvasElement | null {
        return this.surface()?.nativeElement ?? null;
    }

    async toDataURL(options?: ChartExportOptions): Promise<string> {
        const canvas = this.getElement();

        if (!canvas) return '';

        const format = options?.format ?? 'png';
        const width = this.$width();
        const height = this.$height();
        const background = resolveExportBackground({ format, width, height, backgroundColor: options?.backgroundColor, resolvedBackground: this.context.theme().background });
        const raster = recanvas(canvas, width, height, options?.scale ?? 2, background);
        const mime = format === 'jpeg' || format === 'pdf' ? 'image/jpeg' : 'image/png';
        const dataUrl = raster.toDataURL(mime, 0.92);

        // A Canvas chart cannot produce true vector output, so an SVG export wraps the raster in an
        // SVG envelope. That keeps the format contract without pretending the result is vector.
        if (format === 'svg') return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrapRasterInSvg(dataUrl, width, height))}`;

        return dataUrl;
    }

    async toBlob(options?: ChartExportOptions): Promise<Blob | null> {
        const format = options?.format ?? 'png';
        const dataUrl = await this.toDataURL(options);

        if (!dataUrl) return null;

        if (format === 'svg') {
            return markupToBlob(decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1)), 'svg');
        }

        const bytes = dataUrlToBytes(dataUrl);

        if (format === 'pdf') {
            return buildPdf(bytes, Math.round(this.$width()), Math.round(this.$height()));
        }

        return new Blob([bytes as BlobPart], { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' });
    }

    async toImage(options?: ChartExportOptions): Promise<void> {
        const blob = await this.toBlob(options);

        if (!blob) return;

        downloadBlob(blob, options?.filename ?? 'chart', options?.format ?? 'png');
    }
}
