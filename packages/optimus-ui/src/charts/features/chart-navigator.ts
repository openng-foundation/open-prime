/**
 * ChartNavigator.
 *
 * A mini chart under the main one, with a draggable window. It answers a question zoom alone
 * cannot: once you have zoomed in, where are you? The navigator always shows the whole series, so
 * the window is read against the full shape rather than against nothing.
 *
 * It draws its own SVG rather than going through the scene, because it is not part of the plot: it
 * has its own vertical scale, its own domain -- always the full one -- and it must keep showing the
 * whole series while the chart's scales are showing a slice of it.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import type { ChartNavigatorProps, EasingFunctionName, Padding } from '@openng/optimus-ui/types/charts';
import { monotonePath } from '../core/curve';
import { CHART_CONTEXT, CHART_GROUP, nextGroupId } from '../charts-registry';

/** The window the navigator shows, as a fraction of the full domain. */
interface Handle {
    from: number;
    to: number;
}

/**
 * An overview strip with a draggable selection window.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-navigator',
    standalone: true,
    template: `
        @if (enabled() && shape(); as path) {
            <div
                #root
                class="p-chart-navigator"
                data-slot="chart-navigator"
                [style]="rootStyle()"
                role="slider"
                [attr.aria-label]="label()"
                [attr.aria-valuemin]="0"
                [attr.aria-valuemax]="100"
                [attr.aria-valuenow]="percent()"
                tabindex="0"
                (keydown)="onKeyDown($event)"
            >
                <svg [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()" focusable="false" aria-hidden="true">
                    @if (backgroundColor()) {
                        <rect [attr.width]="width()" [attr.height]="height()" [attr.fill]="backgroundColor()" />
                    }
                    <path [attr.d]="path.area" [attr.fill]="color() ?? 'currentColor'" [attr.fill-opacity]="opacity()" />
                    <path [attr.d]="path.line" fill="none" [attr.stroke]="color() ?? 'currentColor'" stroke-width="1" />
                    <rect [attr.x]="0" [attr.width]="handleLeft()" [attr.height]="height()" [attr.fill]="maskColor()" />
                    <rect [attr.x]="handleRight()" [attr.width]="width() - handleRight()" [attr.height]="height()" [attr.fill]="maskColor()" />
                    <rect
                        [attr.x]="handleLeft()"
                        [attr.width]="handleRight() - handleLeft()"
                        [attr.height]="height()"
                        [attr.fill]="selectionFill() ?? 'transparent'"
                        [attr.stroke]="selectionColor() ?? 'currentColor'"
                        stroke-width="1"
                        data-slot="chart-navigator-window"
                        (pointerdown)="startDrag($event, 'window')"
                    />
                    @for (edge of ['left', 'right']; track edge) {
                        <rect
                            [attr.x]="(edge === 'left' ? handleLeft() : handleRight()) - handleWidth() / 2"
                            [attr.width]="handleWidth()"
                            [attr.height]="height()"
                            [attr.fill]="selectionColor() ?? 'currentColor'"
                            [attr.data-slot]="'chart-navigator-handle-' + edge"
                            style="cursor: ew-resize"
                            (pointerdown)="startDrag($event, edge === 'left' ? 'from' : 'to')"
                        />
                    }
                </svg>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-navigator-host' }
})
export class ChartNavigator {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly group = inject(CHART_GROUP, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    private readonly id = nextGroupId('navigator');

    private readonly root = viewChild<ElementRef<HTMLElement>>('root');

    /** The window while a drag is in progress, before it is committed. */
    private readonly dragging = signal<{ kind: 'window' | 'from' | 'to'; startX: number; handle: Handle } | null>(null);

    /**
     * Which series the strip shows. Defaults to the first.
     * @group Props
     */
    readonly series = input<string | string[] | undefined>(undefined);
    /**
     * Strip height in pixels.
     * @defaultValue 48
     * @group Props
     */
    readonly height = input(48, { transform: numberAttribute });
    /**
     * Gap between the chart and the strip.
     * @defaultValue 8
     * @group Props
     */
    readonly gap = input(8, { transform: numberAttribute });
    /**
     * Line and fill colour of the overview series.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Fill opacity of the overview series.
     * @defaultValue 0.25
     * @group Props
     */
    readonly opacity = input(0.25, { transform: numberAttribute });
    /**
     * Border colour of the selection window.
     * @group Props
     */
    readonly selectionColor = input<string | undefined>(undefined);
    /**
     * Fill of the selection window.
     * @group Props
     */
    readonly selectionFill = input<string | undefined>(undefined);
    /**
     * Colour over the parts outside the selection.
     * @defaultValue 'rgba(0,0,0,0.06)'
     * @group Props
     */
    readonly maskColor = input('rgba(0,0,0,0.06)');
    /**
     * Strip background.
     * @group Props
     */
    readonly backgroundColor = input<string | undefined>(undefined);
    /**
     * Grid colour inside the strip.
     * @group Props
     */
    readonly gridColor = input<string | undefined>(undefined);
    /**
     * Label colour inside the strip.
     * @group Props
     */
    readonly labelColor = input<string | undefined>(undefined);
    /**
     * Width of the drag handles in pixels.
     * @defaultValue 8
     * @group Props
     */
    readonly handleWidth = input(8, { transform: numberAttribute });
    /**
     * Gap between the grip lines drawn on a handle.
     * @defaultValue 2
     * @group Props
     */
    readonly gripLineGap = input(2, { transform: numberAttribute });
    /**
     * Padding inside the strip.
     * @group Props
     */
    readonly padding = input<number | Partial<Padding> | undefined>(undefined);
    /**
     * Animation applied when the window moves.
     * @group Props
     */
    readonly animation = input<boolean | { duration?: number; easing?: EasingFunctionName } | undefined>(undefined);
    /**
     * Whether the navigator is shown at all.
     * @defaultValue true
     * @group Props
     */
    readonly enabled = input(true, { transform: booleanAttribute });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartNavigatorProps>(() => ({
        series: this.series(),
        height: this.height(),
        gap: this.gap(),
        color: this.color(),
        opacity: this.opacity(),
        selectionColor: this.selectionColor(),
        selectionFill: this.selectionFill(),
        maskColor: this.maskColor(),
        backgroundColor: this.backgroundColor(),
        gridColor: this.gridColor(),
        labelColor: this.labelColor(),
        handleWidth: this.handleWidth(),
        gripLineGap: this.gripLineGap(),
        padding: this.padding(),
        animation: this.animation(),
        enabled: this.enabled()
    }));

    protected readonly label = computed(() => this.context?.text().navigator ?? 'Chart navigator');

    protected readonly width = computed(() => this.context?.width() ?? 0);

    /**
     * The window, as fractions of the full domain.
     *
     * Fractions rather than values, because the strip's pixel geometry is what the drag works in
     * and the domain may be a time range, a log scale or plain numbers. Converting once, here, keeps
     * the handles from needing to know which.
     */
    protected readonly handle = computed<Handle>(() => {
        const drag = this.dragging();

        if (drag) return drag.handle;

        const window = this.context?.zoomWindow().x;
        const domain = this.fullDomain();

        if (!window || !domain) return { from: 0, to: 1 };

        const span = domain.max - domain.min || 1;

        return { from: (window.min - domain.min) / span, to: (window.max - domain.min) / span };
    });

    protected readonly handleLeft = computed(() => this.handle().from * this.width());

    protected readonly handleRight = computed(() => this.handle().to * this.width());

    protected readonly percent = computed(() => Math.round(((this.handle().from + this.handle().to) / 2) * 100));

    /**
     * The overview shape.
     *
     * Built from the series' own values against the strip's height, at the *full* domain -- which is
     * the whole point of a navigator. Reusing the chart's x scale would make the strip zoom with the
     * chart and stop showing where you are.
     */
    protected readonly shape = computed<{ line: string; area: string } | null>(() => {
        const context = this.context;
        const width = this.width();
        const height = this.height();

        if (!context || width <= 0) return null;

        const wanted = this.series();
        const names = wanted == null ? [] : Array.isArray(wanted) ? wanted : [wanted];
        const resolved = context.series();
        const chosen = names.length > 0 ? resolved.filter((entry) => names.includes(entry.id)) : resolved.slice(0, 1);
        const props = chosen[0]?.props() as Record<string, unknown> | undefined;
        const data = (props?.['data'] as Record<string, unknown>[] | undefined) ?? [];

        if (data.length < 2) return null;

        const field = typeof props?.['valueYField'] === 'string' ? (props['valueYField'] as string) : 'value';
        const values = data.map((datum) => {
            const raw = datum[field];
            const value = typeof raw === 'number' ? raw : Number(raw);

            return Number.isFinite(value) ? value : null;
        });
        const present = values.filter((value): value is number => value != null);

        if (present.length < 2) return null;

        const min = Math.min(...present, 0);
        const max = Math.max(...present);
        const span = max - min || 1;
        const step = width / (values.length - 1);
        const points = values.map((value, index) => ({ x: index * step, y: value == null ? height : height - ((value - min) / span) * height }));
        const line = monotonePath(points);

        return { line, area: `${line} L ${width} ${height} L 0 ${height} Z` };
    });

    protected rootStyle(): Record<string, string> {
        return { position: 'absolute', bottom: '0', left: '0', right: '0', height: `${this.height()}px`, 'pointer-events': 'auto', cursor: 'grab' };
    }

    /** The full numeric domain, which the strip always shows. */
    private fullDomain(): { min: number; max: number } | null {
        const domains = this.context?.domains();
        const domain = domains?.get('x:default') ?? [...(domains?.values() ?? [])].find((entry) => entry.kind === 'value');

        // A category axis has no numeric window to slide, so it has no navigator either -- the
        // honest answer is nothing rather than an index range pretending to be a domain.
        if (!domain || domain.kind !== 'value') return null;

        const [min, max] = domain.extent;

        return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
    }

    /** Starts a drag on the window or on one of its edges. */
    protected startDrag(event: PointerEvent, kind: 'window' | 'from' | 'to'): void {
        event.preventDefault();
        this.dragging.set({ kind, startX: event.clientX, handle: this.handle() });
    }

    /**
     * Moves the window with the arrow keys.
     *
     * A navigator that could only be dragged would be a zoom control a keyboard user cannot reach,
     * which is the same as not having one.
     */
    protected onKeyDown(event: KeyboardEvent): void {
        const handle = this.handle();
        const width = handle.to - handle.from;
        const stride = event.shiftKey ? width : width / 4;
        let next: Handle | null = null;

        if (event.key === 'ArrowLeft') next = { from: handle.from - stride, to: handle.to - stride };
        if (event.key === 'ArrowRight') next = { from: handle.from + stride, to: handle.to + stride };
        if (event.key === 'Home') next = { from: 0, to: width };
        if (event.key === 'End') next = { from: 1 - width, to: 1 };

        if (!next) return;

        event.preventDefault();
        this.commit(clampHandle(next));
    }

    /** Writes a window back as a domain range. */
    private commit(handle: Handle): void {
        const context = this.context;
        const domain = this.fullDomain();

        if (!context || !domain) return;

        const span = domain.max - domain.min;
        // A full-width window is not a zoom, so it clears rather than pinning the axis to exactly
        // its own domain -- which would leave the reset button showing on an unzoomed chart.
        const window = handle.from <= 0.001 && handle.to >= 0.999 ? null : { min: domain.min + handle.from * span, max: domain.min + handle.to * span };

        context.setZoomWindow({ x: window, y: context.zoomWindow().y });
        this.group?.publishExtremes(this.id, { x: window, y: context.zoomWindow().y });
    }

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'navigator', props: this.props });
        const releaseSpace = this.context.reserve(computed(() => ({ edge: 'bottom' as const, size: this.enabled() ? this.height() + this.gap() : 0 })));

        // The drag continues outside the strip, which is what makes dragging the window to the edge
        // of the chart work rather than stopping the moment the pointer leaves the handle.
        const onMove = (event: PointerEvent) => {
            const drag = this.dragging();
            const width = this.width();

            if (!drag || width <= 0) return;

            const delta = (event.clientX - drag.startX) / width;
            const handle = drag.handle;
            const next =
                drag.kind === 'window'
                    ? { from: handle.from + delta, to: handle.to + delta }
                    : drag.kind === 'from'
                      ? { from: Math.min(handle.from + delta, handle.to - 0.02), to: handle.to }
                      : { from: handle.from, to: Math.max(handle.to + delta, handle.from + 0.02) };

            this.commit(clampHandle(next, drag.kind === 'window'));
        };

        const onUp = () => this.dragging.set(null);

        if (typeof window !== 'undefined') {
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        this.destroyRef.onDestroy(() => {
            remove();
            releaseSpace();

            if (typeof window !== 'undefined') {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
            }
        });
    }
}

/**
 * Keeps a window inside the strip.
 *
 * Dragging the whole window shifts it and keeps its width; dragging an edge moves only that edge.
 * The difference matters at the ends: a window pushed past the edge should stop, not shrink.
 */
function clampHandle(handle: Handle, preserveWidth = false): Handle {
    const width = Math.min(handle.to - handle.from, 1);

    if (preserveWidth) {
        const from = Math.min(Math.max(handle.from, 0), 1 - width);

        return { from, to: from + width };
    }

    return { from: Math.max(handle.from, 0), to: Math.min(handle.to, 1) };
}
