/**
 * The SVG chart root.
 *
 * SVG is the right default: every mark is a real element, so it can be styled from CSS, read by a
 * screen reader, found by a test and printed at any resolution. Canvas is the trade you make when
 * the mark count or the update rate stops that being affordable.
 */
import { NgTemplateOutlet, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, viewChild, type ElementRef } from '@angular/core';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { BoxArea, ChartExportOptions, ChartOverlaySurface, RendererType, SvgNode } from '@openng/optimus-ui/types/charts';
import { buildPdf, dataUrlToBytes, downloadBlob, markupToBlob, rasterizeSvg, resolveExportBackground, serializeSvg } from './core/export';
import { measureTextWidth } from './core/layout';
import { seriesColorAt, seriesColorVariable, seriesTokenVariable } from './core/palette';
import { createSvgElement } from './core/svg-node';
import { ChartRootBase } from './chart-root-base';
import { CHART_CONTEXT } from './charts-registry';
import { ChartA11yView } from './features/chart-a11y-view';
import { ChartTextStack } from './features/chart-title';
import { createOverlayRegistry, svgOverlaySurface } from './charts-plugins';
import { buildDrawContext, buildScene, clipRefFor, isClipped } from './render/build-scene';
import { hitTest } from './render/hit-test';
import { ChartsStyle } from './style/chartsstyle';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * ChartSvg renders a chart as SVG elements. Declare the series, axes and features as children:
 * each one configures itself by existing, and removing it removes the feature.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-svg',
    standalone: true,
    imports: [ChartA11yView, NgTemplateOutlet],
    exportAs: 'pChartSvg',
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
            <svg #surface [class]="cx('surface')" [attr.width]="$width()" [attr.height]="$height()" [attr.viewBox]="$viewBox()" [attr.data-renderer]="rendererType" focusable="false">
                <defs #defs></defs>
                <g #plot [class]="cx('plot')"></g>
                <g #overlay [class]="cx('pluginOverlay')"></g>
            </svg>
            <svg [class]="cx('stamps')" data-slot="chart-stamps" [attr.width]="$width()" [attr.height]="$height()" [attr.viewBox]="$viewBox()" focusable="false" aria-hidden="true">
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
    providers: [ChartsStyle, ChartTextStack, { provide: PARENT_INSTANCE, useExisting: ChartSvg }, { provide: CHART_CONTEXT, useFactory: () => inject(ChartSvg).context }],
    host: {
        '[class]': 'cx("root")',
        'data-slot': 'chart-root',
        '[attr.data-renderer]': 'rendererType',
        '[attr.dir]': '$direction() === "rtl" ? "rtl" : null'
    },
    hostDirectives: [Bind]
})
export class ChartSvg extends ChartRootBase {
    componentName = 'Charts';

    readonly rendererType: RendererType = 'svg';

    /** @internal */
    _componentStyle = inject(ChartsStyle);

    private readonly container = viewChild<ElementRef<HTMLElement>>('container');

    private readonly surface = viewChild<ElementRef<SVGSVGElement>>('surface');

    private readonly defsRef = viewChild<ElementRef<SVGDefsElement>>('defs');

    private readonly plotRef = viewChild<ElementRef<SVGGElement>>('plot');

    private readonly overlayRef = viewChild<ElementRef<SVGGElement>>('overlay');

    protected readonly containerElement = computed(() => this.container()?.nativeElement ?? null);

    private readonly overlays = createOverlayRegistry();

    /**
     * A canvas kept only for text measurement.
     *
     * Axis label collision detection is only as good as its measurement, and `getComputedTextLength`
     * needs the text to be in the document already -- which is too late, because the measurement is
     * what decides whether to draw it. A 2D context measures the same font without rendering it.
     */
    private measureContext: CanvasRenderingContext2D | null = null;

    readonly $viewBox = computed(() => `0 0 ${this.$width()} ${this.$height()}`);

    /** The figure's accessible name, generated from the series when none was given. */
    readonly $ariaLabel = computed(() => {
        const series = this.chartState.resolvedSeries();

        if (series.length === 0) return 'Chart';

        const points = series.reduce((count, entry) => count + entry.points.length, 0);

        return series.length === 1 ? `${series[0].type} chart with ${points} data points.` : `Combination chart with ${series.length} data series.`;
    });

    constructor() {
        super();

        // The pointer handlers are attached outside Angular: a hover move repaints through the
        // frame loop, and running change detection on every pointermove would be the one thing
        // guaranteed to make a dense chart feel slow.
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

    /** Measures text against the chart's own font. */
    private readonly measureText = (text: string, fontSize: number, fontFamily?: string): number => {
        if (!this.measureContext && !isPlatformServer(this.platformId)) {
            this.measureContext = this.document.createElement('canvas').getContext('2d');
        }

        return measureTextWidth(text, fontSize, fontFamily ?? this.$fontFamily(), this.measureContext);
    };

    /**
     * A palette slot, resolved through three levels of precedence.
     *
     * The public `--p-chart-color-N` wins, then the preset's `--p-charts-palette-colorN` design
     * token, then the built-in literal. That order is what makes the documented override work
     * -- setting the public property anywhere above the chart restyles it without the chart
     * knowing -- while still letting the active theme preset supply the default, and still
     * rendering correctly when neither is present.
     */
    private readonly seriesColor = (seriesIndex: number): string => {
        const palette = this.context.theme().series ?? [];
        const size = palette.length || undefined;

        return `var(${seriesColorVariable(seriesIndex, size)}, var(${seriesTokenVariable(seriesIndex, size)}, ${seriesColorAt(palette, seriesIndex)}))`;
    };

    /**
     * Materializes the scene into SVG elements.
     *
     * The plot group is rebuilt wholesale each frame rather than diffed. That sounds wasteful, but a
     * chart's marks are entirely derived from its data: there is no per-element state worth
     * preserving, and building a fragment offscreen and swapping it in costs one layout instead of
     * the many a piecemeal patch would trigger.
     */
    protected paint(): void {
        const plot = this.plotRef()?.nativeElement;
        const defs = this.defsRef()?.nativeElement;

        if (!plot || !defs) return;

        const drawContext = buildDrawContext(this.context, this.chartId, this.measureText, this.seriesColor);
        const scene = buildScene(this.context, this.chartState.resolvedSeries(), drawContext);

        this.$stamps.set(scene.stamps);
        const doc = plot.ownerDocument;
        const fragment = doc.createDocumentFragment();

        for (const layer of scene.layers) {
            const group = doc.createElementNS(SVG_NS, 'g');

            group.setAttribute('data-slot', `chart-layer-${layer.key}`);
            group.setAttribute('class', `p-chart-layer p-chart-layer-${layer.key}`);

            if (isClipped(layer.key)) group.setAttribute('clip-path', clipRefFor(drawContext));

            for (const node of layer.nodes) group.appendChild(createSvgElement(node, doc));

            fragment.appendChild(group);
        }

        plot.replaceChildren(fragment);
        defs.replaceChildren(...scene.defs.map((node: SvgNode) => createSvgElement(node, doc)));

        this.paintOverlays(drawContext.area);
    }

    /** Replays the plugin overlays into their own group above the plot. */
    private paintOverlays(area: BoxArea): void {
        const host = this.overlayRef()?.nativeElement;

        if (!host) return;

        if (this.overlays.size === 0) {
            if (host.childNodes.length) host.replaceChildren();

            return;
        }

        const doc = host.ownerDocument;
        const fragment = doc.createDocumentFragment();

        this.overlays.paint(() => {
            // Each painter gets its own group, so one plugin cannot clobber another's output.
            const group = doc.createElementNS(SVG_NS, 'g');

            fragment.appendChild(group);

            return svgOverlaySurface(group, area);
        });

        host.replaceChildren(fragment);
    }

    protected registerOverlay(render: (surface: ChartOverlaySurface) => void): () => void {
        return this.overlays.register(render);
    }

    /**
     * Resolves the point under the pointer.
     *
     * Shared with the Canvas root rather than reimplemented, so hover behaves identically in the
     * two renderers instead of merely similarly.
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

    getElement(): SVGSVGElement | null {
        return this.surface()?.nativeElement ?? null;
    }

    async toDataURL(options?: ChartExportOptions): Promise<string> {
        const svg = this.getElement();

        if (!svg) return '';

        const format = options?.format ?? 'png';
        const width = this.$width();
        const height = this.$height();
        const background = resolveExportBackground({ format, width, height, backgroundColor: options?.backgroundColor, resolvedBackground: this.context.theme().background });
        const markup = serializeSvg(svg, background, width, height);

        if (format === 'svg') return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

        const canvas = await rasterizeSvg(markup, width, height, options?.scale ?? 2, background);

        return canvas.toDataURL(format === 'jpeg' || format === 'pdf' ? 'image/jpeg' : 'image/png', 0.92);
    }

    async toBlob(options?: ChartExportOptions): Promise<Blob | null> {
        const format = options?.format ?? 'png';

        if (format === 'svg') {
            const svg = this.getElement();

            if (!svg) return null;

            const width = this.$width();
            const height = this.$height();
            const background = resolveExportBackground({ format, width, height, backgroundColor: options?.backgroundColor, resolvedBackground: this.context.theme().background });

            return markupToBlob(serializeSvg(svg, background, width, height), 'svg');
        }

        const dataUrl = await this.toDataURL(options);

        if (!dataUrl) return null;

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
