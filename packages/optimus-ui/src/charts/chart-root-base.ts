/**
 * The shared half of `ChartSvg` and `ChartCanvas`.
 *
 * Both roots take the same inputs, own the same state and expose the same imperative surface. What
 * differs is only the surface they paint onto, which each subclass supplies. Keeping the split here
 * rather than duplicating it is what makes "swap the root, keep the children" true rather than
 * merely documented.
 */
import { isPlatformServer } from '@angular/common';
import { DestroyRef, Directive, ElementRef, NgZone, booleanAttribute, computed, effect, inject, input, numberAttribute, output, signal, untracked, type Signal } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type {
    AnimationSpec,
    AnimationTransitions,
    ChartExportOptions,
    ChartPluginEntry,
    ChartPointEvent,
    ChartRootApi,
    ChartState as PublicChartState,
    ChartText,
    ChartTheme,
    ChartUpdateDataOptions,
    ChartsPassThrough,
    DatasetRegistration,
    HoverState,
    InstalledChartPlugin,
    NamedAnimationSpec,
    RendererType,
    SyncConfig
} from '@openng/optimus-ui/types/charts';
import { resolveEasing } from './core/easing';
import { resolveDirection } from './core/format';
import { resolveSize } from './core/layout';
import { seriesColorAt } from './core/palette';
import { CHART_CONTEXT, CHART_GROUP, type ChartContext, type ChartGroupMember, nextDatasetId } from './charts-registry';
import { createChartState, type ChartStateHandle } from './charts-state';
import type { SceneStamp } from './render/build-scene';
import { installPlugins, type PluginHost } from './charts-plugins';

/** The size a chart falls back to before its container has ever been measured. */
const FALLBACK_SIZE = { width: 600, height: 400 };

/** Default animation timings, matching the documented defaults. */
const DEFAULT_ANIMATION: Required<Pick<AnimationSpec, 'duration' | 'easing' | 'delay' | 'loop' | 'limit'>> = {
    duration: 1000,
    easing: 'easeOutQuart',
    delay: 0,
    loop: false,
    limit: 5000
};

/**
 * The base class both chart roots extend.
 *
 * It is not a component itself -- each root declares its own selector, template and style so the
 * two stay independently tree-shakable -- but it still needs the `@Directive` decorator: Angular
 * only recognises `input()` on a decorated class, so an undecorated base holding inputs fails to
 * compile rather than silently dropping them.
 */
@Directive({ standalone: true })
export abstract class ChartRootBase extends BaseComponent<ChartsPassThrough> implements ChartRootApi {
    /**
     * Which renderer this root is. The subclass fixes it, and the parts read it off the context to
     * branch on the seams that only exist in one of them.
     *
     * Named `rendererType` rather than `renderer` because `BaseComponent` already owns `renderer`,
     * which is Angular's `Renderer2`.
     */
    abstract readonly rendererType: RendererType;

    /* ------------------------------------------------------------------------------------------
     * Inputs
     * --------------------------------------------------------------------------------------- */

    /**
     * Chart width in pixels, which is a maximum while responsive, or `'auto'` to size fully from
     * the container.
     * @group Props
     */
    readonly width = input<number | 'auto' | undefined>(undefined);
    /**
     * Chart height in pixels, which is a maximum while responsive, or `'auto'`.
     * @group Props
     */
    readonly height = input<number | 'auto' | undefined>(undefined);
    /**
     * Enable responsive sizing.
     * @defaultValue true
     * @group Props
     */
    readonly responsive = input(true, { transform: booleanAttribute });
    /**
     * Aspect ratio to hold during a resize, as width over height.
     * @group Props
     */
    readonly aspectRatio = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Resize debounce delay in milliseconds. Left unset the chart follows the animation frame.
     * @group Props
     */
    readonly debounceDelay = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Text direction.
     * @defaultValue 'auto'
     * @group Props
     */
    readonly dir = input<'auto' | 'ltr' | 'rtl'>('auto');
    /**
     * Global font family for every piece of chart text.
     * @group Props
     */
    readonly fontFamily = input<string | undefined>(undefined);
    /**
     * Global base font size in pixels for every piece of chart text.
     * @group Props
     */
    readonly fontSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Scale the chart text with the user's root font size. Turn it off when the application already
     * derives `fontSize` from the root font, or the scale is applied twice.
     * @defaultValue true
     * @group Props
     */
    readonly scaleWithRootFont = input(true, { transform: booleanAttribute });
    /**
     * BCP 47 locale string, which every number and date formatter in the chart goes through.
     * @group Props
     */
    readonly locale = input<string | undefined>(undefined);
    /**
     * Number formatting for every numeric surface: axis ticks, tooltips, data labels, the colour
     * legend and screen-reader prose. An axis `tickFormat` still wins over it, since that is the
     * more specific statement.
     * @group Props
     */
    readonly numberFormat = input<Intl.NumberFormatOptions | undefined>(undefined);
    /**
     * Overrides individual catalogue strings, merged over the resolved language.
     * @group Props
     */
    readonly text = input<Partial<ChartText> | undefined>(undefined);
    /**
     * Sync configuration, read when the chart sits inside a `ChartGroup`.
     * @group Props
     */
    readonly sync = input<boolean | SyncConfig | undefined>(undefined);
    /**
     * Theme object. This is how a Canvas chart is themed, since it cannot read CSS custom
     * properties; an SVG chart accepts it too.
     * @group Props
     */
    readonly theme = input<ChartTheme | undefined>(undefined);
    /**
     * Animation configuration. Pass `false` to switch every animation off.
     * @group Props
     */
    readonly animation = input<boolean | AnimationSpec | undefined>(undefined);
    /**
     * Named animation entries, each driving a specific set of renderer inputs.
     * @group Props
     */
    readonly animations = input<Record<string, NamedAnimationSpec> | undefined>(undefined);
    /**
     * State-change transitions.
     * @group Props
     */
    readonly transitions = input<AnimationTransitions | undefined>(undefined);
    /**
     * Plugins to install when the chart mounts.
     * @group Props
     */
    readonly plugins = input<ChartPluginEntry[] | undefined>(undefined);
    /**
     * Fires as the hover moves, and with `null` when it leaves.
     *
     * Nullable rather than only firing on entry, because a listener that never heard about the
     * pointer leaving could not clear its own highlight -- which is exactly what a synced dashboard
     * uses this for.
     * @group Emits
     */
    readonly pointHover = output<ChartPointEvent | null>();

    /* ------------------------------------------------------------------------------------------
     * Injected
     * --------------------------------------------------------------------------------------- */

    protected readonly zone = inject(NgZone);

    protected readonly destroyRef = inject(DestroyRef);

    protected readonly hostRef = inject(ElementRef) as ElementRef<HTMLElement>;

    protected readonly group = inject(CHART_GROUP, { optional: true });

    /** The element the chart measures itself against. The subclass points this at its container. */
    protected abstract readonly containerElement: Signal<HTMLElement | null>;

    /* ------------------------------------------------------------------------------------------
     * Measured size
     * --------------------------------------------------------------------------------------- */

    protected readonly measured = signal({ width: 0, height: 0 });

    /**
     * The pixel size the chart renders at.
     *
     * A container that has not been measured yet reports zero, so the first frame falls back to a
     * sensible box rather than computing every scale against a zero-width range and drawing
     * nothing.
     */
    readonly $size = computed(() => {
        const container = this.measured();
        const resolved = resolveSize({
            containerWidth: container.width,
            containerHeight: container.height,
            width: this.width(),
            height: this.height(),
            responsive: this.responsive(),
            aspectRatio: this.aspectRatio()
        });

        return {
            width: resolved.width || (typeof this.width() === 'number' ? (this.width() as number) : FALLBACK_SIZE.width),
            height: resolved.height || (typeof this.height() === 'number' ? (this.height() as number) : FALLBACK_SIZE.height)
        };
    });

    readonly $width = computed(() => this.$size().width);

    readonly $height = computed(() => this.$size().height);

    /**
     * The height to put on the container element, or `null` to let CSS govern it.
     *
     * Deliberately not `$height()`. The container is what gets measured, so sizing it from that
     * measurement is a feedback loop: it can only ever report the size it already has, never the
     * space available to it. CSS gives it 100% of its parent, and this only intervenes in the two
     * cases CSS cannot cover -- an explicit pixel `height`, or a parent that gives it no height at
     * all, where a fallback is better than an invisible chart.
     */
    readonly $containerHeight = computed(() => {
        const explicit = this.height();

        if (typeof explicit === 'number') return explicit;

        return this.measured().height > 0 ? null : FALLBACK_SIZE.height;
    });

    /** The width to put on the container element, or `null` to let CSS govern it. */
    readonly $containerWidth = computed(() => {
        const explicit = this.width();

        if (typeof explicit === 'number') return explicit;

        return null;
    });

    /* ------------------------------------------------------------------------------------------
     * Theme and typography
     * --------------------------------------------------------------------------------------- */

    private readonly darkMode = signal(false);

    /**
     * The resolved base font size.
     *
     * Scaling with the root font is on by default, because a user who has raised their browser font
     * size has asked for larger text everywhere, and a chart that ignores that is the one element
     * on the page they cannot read.
     */
    readonly $fontSize = computed(() => {
        const explicit = this.fontSize();
        const base = explicit ?? 12;

        if (!this.scaleWithRootFont() || isPlatformServer(this.platformId)) return base;

        const rootSize = this.rootFontSize();

        // Rounded to whole pixels: a fractional font size renders blurry, and the derived sizes --
        // axis titles, data labels -- inherit the fraction and compound it.
        return rootSize == null ? base : Math.round(base * (rootSize / 16));
    });

    readonly $fontFamily = computed(() => this.fontFamily() ?? 'system-ui, sans-serif');

    private readonly rootFontSizeSignal = signal<number | null>(null);

    private rootFontSize(): number | null {
        return this.rootFontSizeSignal();
    }

    readonly $direction = computed<'ltr' | 'rtl'>(() => {
        const explicit = this.dir();

        if (explicit === 'ltr' || explicit === 'rtl') return explicit;

        return this.documentDirection();
    });

    private readonly documentDirectionSignal = signal<'ltr' | 'rtl'>('ltr');

    private documentDirection(): 'ltr' | 'rtl' {
        return this.documentDirectionSignal();
    }

    /* ------------------------------------------------------------------------------------------
     * State
     * --------------------------------------------------------------------------------------- */

    /** The chart's computed state: registry, domains, scales and layout. */
    readonly chartState: ChartStateHandle = createChartState({
        renderer: this.rendererOf(),
        width: this.$width,
        height: this.$height,
        theme: this.theme,
        isDark: this.darkMode,
        fontFamily: this.$fontFamily,
        fontSize: this.$fontSize,
        direction: this.$direction,
        locale: computed(() => this.locale()),
        numberFormat: computed(() => this.numberFormat()),
        text: computed(() => this.text()),
        container: () => this.containerElement(),
        exportChart: (options) => this.toImage(options),
        requestRender: () => this.requestRender()
    });

    /**
     * Publishes the hover as a public event.
     *
     * Derived from the state rather than emitted at each call site, so the pointer, the keyboard
     * and a synced sibling all produce the same event -- and none of them can forget to.
     */
    private readonly emitPointHover = effect(() => {
        const hover = this.chartState.context.hover();

        if (!hover) {
            this.pointHover.emit(null);

            return;
        }

        const series = this.chartState.resolvedSeries().find((entry) => entry.id === hover.datasetId);
        const point = series?.points.find((entry) => entry.dataIndex === hover.index);
        const data = (series?.registration.props() as { data?: unknown[] } | undefined)?.data;

        this.pointHover.emit({
            datasetId: hover.datasetId,
            index: hover.index,
            value: point?.value ?? null,
            label: point?.category ?? String(hover.index),
            datum: data?.[hover.index],
            x: hover.x,
            y: hover.y
        });
    });

    /**
     * The projected in-plot templates the last paint produced.
     *
     * A signal rather than imperative DOM, because these are Angular views: a slice template can
     * hold bindings, pipes and control flow, and stamping it by hand would give up all three. The
     * scene decides *where* each one goes; Angular still decides what it renders.
     */
    protected readonly $stamps = signal<readonly SceneStamp[]>([]);

    /** The transform that puts one stamp where its mark is. */
    protected stampTransform(stamp: SceneStamp): string | null {
        // Centre content is laid out against the whole circle from its own context, so it is not
        // translated: moving it would put its coordinates in two places at once.
        return stamp.slot === 'centerContent' ? null : `translate(${stamp.x}, ${stamp.y})`;
    }

    /** The context every part injects. */
    get context(): ChartContext {
        return this.chartState.context;
    }

    /** Identifier unique to this chart, used by a `ChartGroup` to address it. */
    readonly chartId = nextDatasetId('chart');

    /**
     * Reads the renderer before the field initialisers run.
     *
     * `renderer` is an abstract getter on the subclass, and the state has to be built with its
     * value, so it is read through a method the subclass can answer during construction.
     */
    protected rendererOf(): RendererType {
        return this.rendererType;
    }

    /* ------------------------------------------------------------------------------------------
     * Plugins
     * --------------------------------------------------------------------------------------- */

    private readonly installedPlugins = signal<Record<string, InstalledChartPlugin>>({});

    /**
     * The installed plugins, keyed by name, each with whatever public API it returned.
     *
     * Read through a template reference: `chart.$plugins['myPlugin']?.api`. A plugin's API is not
     * reactive on its own, so a value that has to stay live in a template should be written into a
     * signal from `onFrame` and read from there.
     */
    get $plugins(): Record<string, InstalledChartPlugin> {
        return this.installedPlugins();
    }

    /* ------------------------------------------------------------------------------------------
     * Frame loop
     * --------------------------------------------------------------------------------------- */

    private frameHandle: number | null = null;

    private animationStart: number | null = null;

    private renderQueued = false;

    private readonly frameListeners = new Set<() => void>();

    private readonly hoverListeners = new Set<(hover: HoverState | null) => void>();

    /** Resolved animation settings, or `null` when animation is switched off. */
    protected readonly $animation = computed<Required<AnimationSpec> | null>(() => {
        const input = this.animation();

        if (input === false) return null;

        const spec = typeof input === 'object' && input != null ? input : {};
        const resolved = { ...DEFAULT_ANIMATION, ...spec } as Required<AnimationSpec>;

        // Past the point-count limit the animation is dropped rather than degraded: interpolating a
        // hundred thousand marks costs more than the transition is worth, and a janky animation
        // reads as a broken chart.
        const total = this.chartState.resolvedSeries().reduce((count, series) => count + series.points.length, 0);

        return total > (resolved.limit ?? DEFAULT_ANIMATION.limit) ? null : resolved;
    });

    constructor() {
        super();

        // The container is measured outside Angular and the loop repaints on its own frames, so the
        // whole render path stays off the change-detection critical path.
        effect((onCleanup) => {
            const element = this.containerElement();

            if (!element || isPlatformServer(this.platformId)) return;

            const observer = new ResizeObserver((entries) => {
                const entry = entries[0];

                if (!entry) return;

                const box = entry.contentRect;

                this.zone.runOutsideAngular(() => this.applyMeasurement(box.width, box.height));
            });

            observer.observe(element);
            this.applyMeasurement(element.clientWidth, element.clientHeight);

            onCleanup(() => observer.disconnect());
        });

        // Any change to the resolved state schedules one frame. Five series updating in the same
        // tick therefore cost one layout and one paint, not five.
        effect(() => {
            this.chartState.resolvedSeries();
            this.chartState.layout();
            this.context.scales();
            this.context.theme();
            untracked(() => this.requestRender());
        });

        this.destroyRef.onDestroy(() => this.stopFrameLoop());
    }

    override onInit(): void {
        super.onInit?.();

        if (isPlatformServer(this.platformId)) return;

        this.readEnvironment();
    }

    override onAfterViewInit(): void {
        super.onAfterViewInit?.();

        if (isPlatformServer(this.platformId)) return;

        this.installPlugins();
        this.joinGroup();
        this.startAnimation();
    }

    override onDestroy(): void {
        this.stopFrameLoop();
        super.onDestroy?.();
    }

    /** Reads the ambient values that live on the document rather than on an input. */
    private readEnvironment(): void {
        const host = this.$el as HTMLElement | undefined;

        this.documentDirectionSignal.set(resolveDirection(this.dir(), host ?? null));

        if (typeof getComputedStyle === 'function' && this.document?.documentElement) {
            const parsed = parseFloat(getComputedStyle(this.document.documentElement).fontSize);

            this.rootFontSizeSignal.set(Number.isFinite(parsed) ? parsed : null);
        }

        this.darkMode.set(this.detectDarkMode());
    }

    /**
     * Works out whether the chart is on a dark background.
     *
     * The colour scheme is read from the computed style rather than from a media query, because an
     * application that sets `color-scheme` or toggles a class on `<html>` has overridden the
     * system preference, and the chart has to follow the page it is on.
     */
    protected detectDarkMode(): boolean {
        if (isPlatformServer(this.platformId) || typeof getComputedStyle !== 'function') return false;

        const host = (this.$el as HTMLElement | undefined) ?? this.document?.documentElement;

        if (!host) return false;

        const scheme = getComputedStyle(host).colorScheme;

        if (scheme?.includes('dark') && !scheme.includes('light')) return true;

        const root = this.document?.documentElement;

        if (root?.classList.contains('p-dark') || root?.dataset['theme'] === 'dark') return true;

        return typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)').matches : false;
    }

    private applyMeasurement(width: number, height: number): void {
        const current = this.measured();

        // Sub-pixel resize noise would otherwise recompute every scale on every scroll.
        if (Math.abs(current.width - width) < 0.5 && Math.abs(current.height - height) < 0.5) return;

        const delay = this.debounceDelay();

        if (delay == null) {
            this.measured.set({ width, height });

            return;
        }

        if (this.resizeTimer != null) clearTimeout(this.resizeTimer);

        this.resizeTimer = setTimeout(() => {
            this.resizeTimer = null;
            this.measured.set({ width, height });
        }, delay) as unknown as number;
    }

    private resizeTimer: number | null = null;

    /** Schedules one repaint on the next animation frame. */
    protected requestRender(): void {
        if (isPlatformServer(this.platformId)) {
            // With no frame loop to wait for, server-side rendering paints straight through so the
            // markup is complete in the response.
            this.paint();

            return;
        }

        if (this.renderQueued) return;

        this.renderQueued = true;

        this.zone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                this.renderQueued = false;
                this.runFrame();
            });
        });
    }

    /** Starts the entrance animation, or paints once when animation is off. */
    private startAnimation(): void {
        const spec = this.$animation();

        if (!spec) {
            this.chartState.progress.set(1);
            this.requestRender();

            return;
        }

        this.chartState.progress.set(0);
        this.animationStart = null;
        this.startFrameLoop();
    }

    private startFrameLoop(): void {
        if (this.frameHandle != null) return;

        this.zone.runOutsideAngular(() => {
            const step = (timestamp: number) => {
                const spec = this.$animation();

                if (!spec) {
                    this.chartState.progress.set(1);
                    this.frameHandle = null;
                    this.runFrame();

                    return;
                }

                if (this.animationStart == null) this.animationStart = timestamp + (spec.delay ?? 0);

                const elapsed = timestamp - this.animationStart;

                if (elapsed < 0) {
                    this.frameHandle = requestAnimationFrame(step);

                    return;
                }

                const linear = Math.min(elapsed / Math.max(spec.duration ?? 1, 1), 1);
                const eased = resolveEasing(spec.easing as never)(linear);

                this.chartState.progress.set(eased);
                this.runFrame();

                if (linear < 1) {
                    this.frameHandle = requestAnimationFrame(step);

                    return;
                }

                if (spec.loop) {
                    this.animationStart = null;
                    this.frameHandle = requestAnimationFrame(step);

                    return;
                }

                this.frameHandle = null;
            };

            this.frameHandle = requestAnimationFrame(step);
        });
    }

    private stopFrameLoop(): void {
        if (this.frameHandle != null) {
            cancelAnimationFrame(this.frameHandle);
            this.frameHandle = null;
        }

        if (this.resizeTimer != null) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
    }

    /** One frame: paint, then let the plugins paint over it. */
    private runFrame(): void {
        this.paint();

        for (const listener of this.frameListeners) listener();
    }

    /** Draws the chart. Each root supplies its own. */
    protected abstract paint(): void;

    /* ------------------------------------------------------------------------------------------
     * Plugins
     * --------------------------------------------------------------------------------------- */

    private installPlugins(): void {
        const entries = this.plugins();

        if (!entries?.length) return;

        const host: PluginHost = {
            getState: () => this.publicState(),
            getDatasets: () => this.datasetRegistrations(),
            getHover: () => this.context.hover(),
            onFrame: (cb) => {
                this.frameListeners.add(cb);

                return () => this.frameListeners.delete(cb);
            },
            onHover: (cb) => {
                this.hoverListeners.add(cb);

                return () => this.hoverListeners.delete(cb);
            },
            registerOverlay: (render) => this.registerOverlay(render),
            getContainer: () => this.containerElement()
        };

        this.installedPlugins.set(installPlugins(entries, host, this.destroyRef));
    }

    /** Registers an overlay painter. Each root layers it over its own surface. */
    protected abstract registerOverlay(render: (surface: { svg?: SVGGElement; ctx?: CanvasRenderingContext2D; area: import('@openng/optimus-ui/types/charts').BoxArea }) => void): () => void;

    /** The public view of the chart's state, as a plugin sees it. */
    protected publicState(): PublicChartState {
        return {
            chartArea: this.context.chartArea(),
            width: this.$width(),
            height: this.$height(),
            scales: this.context.scales(),
            renderer: this.rendererType,
            isDark: this.context.isDark(),
            textColor: this.context.textColor(),
            fontFamily: this.context.fontFamily(),
            descriptions: { chart: '', series: [] }
        };
    }

    /** The registered datasets, as a plugin sees them. */
    protected datasetRegistrations(): Map<string, DatasetRegistration> {
        const palette = this.context.theme().series ?? [];
        const result = new Map<string, DatasetRegistration>();

        for (const series of this.chartState.resolvedSeries()) {
            const props = series.registration.props() as Record<string, unknown>;

            result.set(series.id, {
                id: series.id,
                type: series.type,
                name: props['name'] as string | undefined,
                seriesIndex: series.seriesIndex,
                color: typeof props['color'] === 'string' ? (props['color'] as string) : seriesColorAt(palette, series.seriesIndex),
                visible: series.visible,
                data: (props['data'] as unknown[] | undefined) ?? [],
                props
            });
        }

        return result;
    }

    /* ------------------------------------------------------------------------------------------
     * Sync
     * --------------------------------------------------------------------------------------- */

    /** Resolved sync settings, or `null` when this chart opted out. */
    protected readonly $sync = computed<Required<SyncConfig> | null>(() => {
        const input = this.sync();

        if (input == null || input === false) return null;
        if (input === true) return { extremes: 'x', highlight: 'x', visibility: true };

        return { extremes: input.extremes ?? 'x', highlight: input.highlight ?? 'x', visibility: input.visibility ?? true };
    });

    private joinGroup(): void {
        if (!this.group || !this.$sync()) return;

        const member: ChartGroupMember = {
            id: this.chartId,
            context: this.context,
            applyExtremes: (state) => {
                if (!this.$sync()?.extremes) return;
                this.chartState.zoomWindow.set(state);
                this.requestRender();
            },
            applyHighlight: (payload) => {
                if (!this.$sync()?.highlight) return;
                this.applyRemoteHighlight(payload);
            },
            applyVisibility: (datasetId, visible) => {
                if (!this.$sync()?.visibility) return;
                if (this.context.isDatasetVisible(datasetId) !== visible) this.context.toggleDataset(datasetId);
            }
        };

        const leave = this.group.join(member);

        this.destroyRef.onDestroy(leave);
    }

    /**
     * Applies a cursor position broadcast by another chart in the group.
     *
     * The category is matched rather than the pixel position, because two synced charts rarely have
     * the same plot width and copying the pixel would put the crosshair on a different month.
     */
    protected applyRemoteHighlight(payload: { category?: string; value?: number; cleared?: boolean }): void {
        if (payload.cleared) {
            this.context.setHover(null);

            return;
        }

        if (payload.category == null) return;

        for (const series of this.chartState.resolvedSeries()) {
            if (!series.visible) continue;

            const index = series.points.findIndex((point) => point.category === payload.category);

            if (index < 0) continue;

            this.context.setHover({ datasetId: series.id, index, x: 0, y: 0 });

            return;
        }
    }

    /** Notifies the plugins and the group that the hover moved. */
    protected publishHover(hover: HoverState | null): void {
        for (const listener of this.hoverListeners) listener(hover);

        if (!this.group || !this.$sync()?.highlight) return;

        if (!hover) {
            this.group.publishHighlight(this.chartId, { cleared: true });

            return;
        }

        const series = this.chartState.resolvedSeries().find((entry) => entry.id === hover.datasetId);
        const category = series?.points[hover.index]?.category;

        this.group.publishHighlight(this.chartId, { category });
    }

    /* ------------------------------------------------------------------------------------------
     * Imperative surface
     * --------------------------------------------------------------------------------------- */

    /**
     * Re-reads every child's inputs and repaints in one pass.
     *
     * Charts are declarative, so this covers the two cases inputs cannot: a theme toggled by a
     * class on `<html>`, which leaves a Canvas pixel buffer none the wiser, and a function-valued
     * input swapped for another named function, which is compared by reference rather than by
     * value.
     */
    redraw(): void {
        this.readEnvironment();
        this.requestRender();
    }

    /** The underlying SVG or canvas element. */
    abstract getElement(): SVGSVGElement | HTMLCanvasElement | null;

    /** The chart as a data URL. */
    abstract toDataURL(options?: ChartExportOptions): Promise<string>;

    /** The chart as a `Blob`. */
    abstract toBlob(options?: ChartExportOptions): Promise<Blob | null>;

    /** Exports the chart as an image file, which downloads it. */
    abstract toImage(options?: ChartExportOptions): Promise<void>;

    /** Repaints against the current data, optionally without animating. */
    updateData(options?: ChartUpdateDataOptions): void {
        if (options?.animate === false) {
            this.chartState.progress.set(1);
            this.requestRender();

            return;
        }

        this.startAnimation();
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
