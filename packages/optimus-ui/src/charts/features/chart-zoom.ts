/**
 * ChartZoom.
 *
 * Zoom is a change to what the axes show, not to the data or to the marks. That is why it writes a
 * window to the chart state and stops there: every scale is rebuilt from the domain, so a zoomed
 * chart is drawn by the same painters against a narrower domain rather than by a scaled copy of
 * itself. Text stays crisp and the ticks re-nice themselves, which a transform could not do.
 *
 * The pointer handlers attach to the container rather than to this element's host, because the
 * overlay layer this renders into does not take the pointer -- and should not, or it would swallow
 * the hover.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, effect, inject, input, signal } from '@angular/core';
import type { AxisScale, ChartZoomProps, ModifierKey, ZoomButtonsConfig, ZoomDragConfig, ZoomHandle, ZoomLimits, ZoomMode, ZoomPanConfig, ZoomPinchConfig, ZoomState, ZoomWheelConfig } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_GROUP, nextGroupId } from '../charts-registry';

/** The window each axis shows, as the state holds it. */
type Window = { x: { min: number; max: number } | null; y: { min: number; max: number } | null };

/**
 * Zoom and pan on a cartesian chart.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-zoom',
    standalone: true,
    template: `
        @if (showReset() && zoomed()) {
            <button type="button" class="p-chart-zoom-reset" [class]="resetClass()" data-slot="chart-zoom-reset" [style]="resetStyle()" (click)="reset()">{{ resetText() }}</button>
        }
        @if (buttons(); as config) {
            <div class="p-chart-zoom-buttons" data-slot="chart-zoom-buttons" [style]="buttonsStyle(config)">
                <button type="button" class="p-chart-zoom-button" [class]="config.className ?? ''" data-slot="chart-zoom-in" [attr.aria-label]="text().zoomIn" (click)="zoomBy(1 / (config.factor ?? 1.25))">+</button>
                <button type="button" class="p-chart-zoom-button" [class]="config.className ?? ''" data-slot="chart-zoom-out" [attr.aria-label]="text().zoomOut" [attr.aria-disabled]="!zoomed()" (click)="zoomBy(config.factor ?? 1.25)">−</button>
                <button type="button" class="p-chart-zoom-button" [class]="config.className ?? ''" data-slot="chart-pan-left" [attr.aria-label]="text().panLeft" [attr.aria-disabled]="!zoomed()" (click)="panBy(-(config.panStride ?? 0.1))">‹</button>
                <button type="button" class="p-chart-zoom-button" [class]="config.className ?? ''" data-slot="chart-pan-right" [attr.aria-label]="text().panRight" [attr.aria-disabled]="!zoomed()" (click)="panBy(config.panStride ?? 0.1)">›</button>
            </div>
        }
        @if (dragBox(); as box) {
            <div class="p-chart-zoom-drag" data-slot="chart-zoom-drag" [style]="dragStyle(box)"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-zoom-host' }
})
export class ChartZoom {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly group = inject(CHART_GROUP, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    private readonly id = nextGroupId('zoom');

    /** The drag rectangle currently being pulled out, in pixels. */
    protected readonly dragBox = signal<{ x: number; y: number; width: number; height: number } | null>(null);

    /**
     * Which axes zoom.
     * @defaultValue 'x'
     * @group Props
     */
    readonly mode = input<ZoomMode>('x');
    /**
     * Wheel zoom, optionally requiring a modifier.
     * @defaultValue true
     * @group Props
     */
    readonly wheel = input<boolean | ZoomWheelConfig>(true);
    /**
     * Drag a rectangle to zoom into it.
     * @defaultValue false
     * @group Props
     */
    readonly drag = input<boolean | ZoomDragConfig>(false);
    /**
     * Drag to pan once zoomed.
     * @defaultValue true
     * @group Props
     */
    readonly pan = input<boolean | ZoomPanConfig>(true);
    /**
     * Pinch to zoom on touch.
     * @defaultValue true
     * @group Props
     */
    readonly pinch = input<boolean | ZoomPinchConfig>(true);
    /**
     * How far in and out the zoom may go.
     * @group Props
     */
    readonly limits = input<{ x?: ZoomLimits; y?: ZoomLimits } | undefined>(undefined);
    /**
     * Called whenever the window changes.
     * @group Props
     */
    readonly onZoomChange = input<((state: ZoomState) => void) | undefined>(undefined);
    /**
     * A holder the imperative handle is written into on mount.
     * @group Props
     */
    readonly zoomRef = input<{ current: ZoomHandle | null } | undefined>(undefined);
    /**
     * A reset button, shown only while the chart is zoomed.
     * @defaultValue false
     * @group Props
     */
    readonly resetButton = input<boolean | { text?: string; className?: string }>(false);
    /**
     * On-chart zoom and pan buttons.
     * @defaultValue false
     * @group Props
     */
    readonly zoomButtons = input<boolean | ZoomButtonsConfig>(false);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartZoomProps>(() => ({
        mode: this.mode(),
        wheel: this.wheel(),
        drag: this.drag(),
        pan: this.pan(),
        pinch: this.pinch(),
        limits: this.limits(),
        onZoomChange: this.onZoomChange(),
        zoomRef: this.zoomRef(),
        resetButton: this.resetButton(),
        zoomButtons: this.zoomButtons()
    }));

    protected readonly text = computed(() => this.context?.text() ?? ({ zoomIn: 'Zoom in', zoomOut: 'Zoom out', panLeft: 'Pan left', panRight: 'Pan right', resetZoom: 'Reset zoom' } as never));

    protected readonly showReset = computed(() => this.resetButton() !== false);

    protected readonly resetText = computed(() => {
        const config = this.resetButton();

        return (typeof config === 'object' ? config.text : undefined) ?? this.text().resetZoom;
    });

    protected readonly resetClass = computed(() => {
        const config = this.resetButton();

        return (typeof config === 'object' ? config.className : undefined) ?? '';
    });

    protected readonly buttons = computed<ZoomButtonsConfig | null>(() => {
        const config = this.zoomButtons();

        if (config === false) return null;

        return config === true ? {} : config;
    });

    /** Whether the chart is showing less than its full domain. */
    protected readonly zoomed = computed(() => {
        const window = this.context?.zoomWindow();

        return window?.x != null || window?.y != null;
    });

    protected resetStyle(): Record<string, string> {
        return { position: 'absolute', top: '0', right: '0', 'pointer-events': 'auto' };
    }

    protected buttonsStyle(_config: ZoomButtonsConfig): Record<string, string> {
        return { position: 'absolute', display: 'flex', gap: '2px', top: '0', left: '0', 'pointer-events': 'auto' };
    }

    protected dragStyle(box: { x: number; y: number; width: number; height: number }): Record<string, string> {
        return {
            position: 'absolute',
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
            background: 'color-mix(in srgb, currentColor 12%, transparent)',
            border: '1px solid currentColor',
            'pointer-events': 'none'
        };
    }

    /** Resets to the full domain. */
    protected reset(): void {
        this.apply({ x: null, y: null });
    }

    /**
     * Zooms about the middle of the current window by a factor.
     *
     * The buttons zoom about the centre rather than about the pointer, because there is no pointer:
     * a keyboard user pressing the button has not said where to zoom, and the centre is the only
     * answer that does not invent an intent.
     */
    protected zoomBy(factor: number): void {
        const current = this.currentWindow();

        if (!current) return;

        const next: Window = { x: null, y: null };

        for (const axis of ['x', 'y'] as const) {
            const window = current[axis];

            if (!window) continue;

            const centre = (window.min + window.max) / 2;
            const half = ((window.max - window.min) * factor) / 2;

            next[axis] = this.clampToDomain(axis, { min: centre - half, max: centre + half });
        }

        this.apply(next);
    }

    /** Pans by a fraction of the visible window. */
    protected panBy(fraction: number): void {
        const current = this.currentWindow();

        if (!current) return;

        const next: Window = { x: null, y: null };

        for (const axis of ['x', 'y'] as const) {
            const window = current[axis];

            if (!window) continue;

            const shift = (window.max - window.min) * fraction;

            next[axis] = this.clampToDomain(axis, { min: window.min + shift, max: window.max + shift });
        }

        this.apply(next);
    }

    /**
     * The window in force, falling back to the full domain.
     *
     * Zooming out of an unzoomed chart has to start from *something*, and the domain is what the
     * chart is currently showing -- reading it here is what lets the first wheel tick work without
     * the window having been set once already.
     */
    private currentWindow(): Window | null {
        const context = this.context;

        if (!context) return null;

        const stored = context.zoomWindow();
        const mode = this.mode();
        const next: Window = { x: null, y: null };

        for (const axis of ['x', 'y'] as const) {
            if (!this.axisEnabled(axis, mode)) continue;

            next[axis] = stored[axis] ?? this.domainOf(axis);
        }

        return next;
    }

    /** Whether an axis takes part, given the mode. */
    private axisEnabled(axis: 'x' | 'y', mode: ZoomMode): boolean {
        return mode === 'xy' || mode === axis;
    }

    /** The numeric domain of one axis, or `null` when it has none to zoom. */
    private domainOf(axis: 'x' | 'y'): { min: number; max: number } | null {
        const scale = this.scaleOf(axis);

        if (!scale || scale.type === 'band') return null;

        const [min, max] = scale.domain;

        return { min, max };
    }

    private scaleOf(axis: 'x' | 'y'): AxisScale | undefined {
        return axis === 'x' ? this.context?.xScale() : this.context?.yScale();
    }

    /**
     * Keeps a window inside the full domain and inside the configured limits.
     *
     * A window wider than the data is pointless -- there is nothing out there to see -- so zooming
     * out stops at the domain rather than continuing into empty space.
     */
    private clampToDomain(axis: 'x' | 'y', window: { min: number; max: number }): { min: number; max: number } | null {
        const domain = this.domainOf(axis);

        if (!domain) return null;

        const limits = this.limits()?.[axis];
        const full = domain.max - domain.min;
        // `'original'` means the data's own boundary, which is what stops a pan from running off
        // into empty space past the last point.
        const lowest = limits?.min === 'original' || limits?.min == null ? domain.min : limits.min;
        const highest = limits?.max === 'original' || limits?.max == null ? domain.max : limits.max;
        // Without a stated minimum, five of the smallest interval: zooming closer than that lands
        // between two points, where there is nothing to see.
        const minSpan = limits?.minRange ?? this.smallestInterval(axis) * 5;
        const span = Math.min(Math.max(window.max - window.min, minSpan), highest - lowest);
        let min = Math.min(Math.max(window.min, lowest), highest - span);

        if (!Number.isFinite(min)) min = lowest;

        // A window that covers everything is not a zoom, and saying so is what lets the reset
        // button and the axis domains agree about it.
        if (span >= full && min <= domain.min) return null;

        return { min, max: min + span };
    }

    /**
     * The smallest gap between two adjacent values on an axis.
     *
     * Read from the data rather than from the domain, because "too far in" is a property of how
     * dense the points are: a series of five yearly readings and one of a million ticks have very
     * different floors.
     */
    private smallestInterval(axis: 'x' | 'y'): number {
        const series = this.context?.series() ?? [];
        let smallest = Infinity;

        for (const registration of series) {
            const props = registration.props() as Record<string, unknown>;
            const data = (props['data'] as unknown[] | undefined) ?? [];
            const domain = this.domainOf(axis);

            if (data.length < 2 || !domain) continue;

            smallest = Math.min(smallest, (domain.max - domain.min) / (data.length - 1));
        }

        return Number.isFinite(smallest) ? smallest : 1;
    }

    /** Writes a window, tells the listener, and broadcasts it to a synced group. */
    private apply(window: Window): void {
        const context = this.context;

        if (!context) return;

        context.setZoomWindow(window);
        this.onZoomChange()?.({ x: window.x, y: window.y });
        this.group?.publishExtremes(this.id, window);
    }

    constructor() {
        // The handle is written into the holder rather than returned, so a component can call
        // `zoomRef.current.setZoomState` without the chart having to expose an output for it.
        effect(() => {
            const holder = this.zoomRef();

            if (!holder) return;

            holder.current = {
                setZoomState: (state) => this.apply({ x: state.x ?? null, y: state.y ?? null }),
                getZoomState: () => this.context?.zoomWindow() ?? { x: null, y: null },
                resetZoom: () => this.reset()
            };
        });

        if (!this.context) return;

        const remove = this.context.registerFeature({ type: `zoom:${this.id}`, props: this.props });
        const detach = this.attach();

        this.destroyRef.onDestroy(() => {
            remove();
            detach();
        });
    }

    /**
     * Attaches the pointer handlers.
     *
     * Outside Angular: a wheel event and a pan drag both fire far faster than a change-detection
     * pass is worth, and the repaint already goes through the chart's own frame loop.
     */
    private attach(): () => void {
        const context = this.context!;
        let element: HTMLElement | null = null;
        const teardown: (() => void)[] = [];

        // The container only exists once the root's view has rendered, so the attachment waits for
        // it rather than assuming it.
        const bind = () => {
            element = context.container();

            if (!element) return false;

            const onWheel = (event: WheelEvent) => {
                const config = this.wheel();

                if (config === false) return;

                const options = config === true ? {} : config;

                if (options.enabled === false) return;
                if (options.modifierKey && !hasModifier(event, options.modifierKey)) return;

                event.preventDefault();

                const current = this.currentWindow();

                if (!current) return;

                const speed = options.speed ?? 0.1;
                const factor = event.deltaY > 0 ? 1 + speed : 1 - speed;
                const rect = element!.getBoundingClientRect();
                const next: Window = { x: null, y: null };

                for (const axis of ['x', 'y'] as const) {
                    const window = current[axis];

                    if (!window) continue;

                    // Zoom about the pointer, which is what makes a wheel zoom feel like a map:
                    // the value under the cursor stays under the cursor.
                    const scale = this.scaleOf(axis);
                    const pixel = axis === 'x' ? event.clientX - rect.left : event.clientY - rect.top;
                    const anchor = scale && scale.type !== 'band' ? scale.invert(pixel) : (window.min + window.max) / 2;
                    const min = anchor - (anchor - window.min) * factor;
                    const max = anchor + (window.max - anchor) * factor;

                    next[axis] = this.clampToDomain(axis, { min, max });
                }

                this.apply(next);
            };

            let dragStart: { x: number; y: number } | null = null;
            let panStart: { x: number; y: number; window: Window } | null = null;

            const onPointerDown = (event: PointerEvent) => {
                if (event.button !== 0) return;

                const rect = element!.getBoundingClientRect();
                const local = { x: event.clientX - rect.left, y: event.clientY - rect.top };
                const dragConfig = this.drag();

                if (dragConfig !== false) {
                    const options = dragConfig === true ? {} : dragConfig;

                    if (options.enabled !== false && (!options.modifierKey || hasModifier(event, options.modifierKey))) {
                        dragStart = local;

                        return;
                    }
                }

                // Panning only makes sense once there is somewhere to pan to, which is why it needs
                // a window rather than a domain.
                const panConfig = this.pan();

                if (panConfig === false || !this.zoomed()) return;

                const options = panConfig === true ? {} : panConfig;

                if (options.enabled === false) return;
                if (options.modifierKey && !hasModifier(event, options.modifierKey)) return;

                panStart = { ...local, window: this.currentWindow() ?? { x: null, y: null } };
            };

            const onPointerMove = (event: PointerEvent) => {
                const rect = element!.getBoundingClientRect();
                const local = { x: event.clientX - rect.left, y: event.clientY - rect.top };

                if (dragStart) {
                    const mode = this.mode();
                    const area = context.chartArea();

                    this.dragBox.set({
                        x: mode === 'y' ? area.x : Math.min(dragStart.x, local.x),
                        y: mode === 'x' ? area.y : Math.min(dragStart.y, local.y),
                        width: mode === 'y' ? area.width : Math.abs(local.x - dragStart.x),
                        height: mode === 'x' ? area.height : Math.abs(local.y - dragStart.y)
                    });

                    return;
                }

                if (!panStart) return;

                const next: Window = { x: null, y: null };

                for (const axis of ['x', 'y'] as const) {
                    const window = panStart.window[axis];
                    const scale = this.scaleOf(axis);

                    if (!window || !scale || scale.type === 'band') continue;

                    const moved = axis === 'x' ? local.x - panStart.x : local.y - panStart.y;
                    const shift = scale.invert(0) - scale.invert(moved);

                    next[axis] = this.clampToDomain(axis, { min: window.min + shift, max: window.max + shift });
                }

                this.apply(next);
            };

            const onPointerUp = () => {
                const box = this.dragBox();

                dragStart = null;
                panStart = null;
                this.dragBox.set(null);

                // A click is a drag of zero size. Treating it as a zoom would collapse the domain
                // to a point on every stray click inside the plot.
                if (!box || box.width < 4 || box.height < 4) return;

                const next: Window = { x: null, y: null };

                for (const axis of ['x', 'y'] as const) {
                    const scale = this.scaleOf(axis);

                    if (!this.axisEnabled(axis, this.mode()) || !scale || scale.type === 'band') continue;

                    const from = axis === 'x' ? box.x : box.y;
                    const to = axis === 'x' ? box.x + box.width : box.y + box.height;
                    const a = scale.invert(from);
                    const b = scale.invert(to);

                    next[axis] = this.clampToDomain(axis, { min: Math.min(a, b), max: Math.max(a, b) });
                }

                this.apply(next);
            };

            let pinchDistance = 0;

            const onTouchMove = (event: TouchEvent) => {
                const pinch = this.pinch();

                if (pinch === false || (pinch !== true && pinch.enabled === false) || event.touches.length !== 2) return;

                const [first, second] = [event.touches[0], event.touches[1]];
                const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

                if (pinchDistance > 0 && distance > 0) {
                    event.preventDefault();
                    this.zoomBy(pinchDistance / distance);
                }

                pinchDistance = distance;
            };

            const onTouchEnd = () => {
                pinchDistance = 0;
            };

            element.addEventListener('wheel', onWheel, { passive: false });
            element.addEventListener('pointerdown', onPointerDown);
            element.addEventListener('pointermove', onPointerMove);
            element.addEventListener('touchmove', onTouchMove, { passive: false });

            if (typeof window !== 'undefined') {
                window.addEventListener('pointerup', onPointerUp);
                window.addEventListener('touchend', onTouchEnd);
            }

            teardown.push(() => {
                element!.removeEventListener('wheel', onWheel);
                element!.removeEventListener('pointerdown', onPointerDown);
                element!.removeEventListener('pointermove', onPointerMove);
                element!.removeEventListener('touchmove', onTouchMove);

                if (typeof window !== 'undefined') {
                    window.removeEventListener('pointerup', onPointerUp);
                    window.removeEventListener('touchend', onTouchEnd);
                }
            });

            return true;
        };

        if (!bind()) {
            const frame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => bind()) : 0;

            teardown.push(() => {
                if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
            });
        }

        return () => {
            for (const off of teardown) off();
        };
    }
}

/** Whether the event carries the required modifier. */
function hasModifier(event: MouseEvent | WheelEvent | PointerEvent, key: ModifierKey): boolean {
    switch (key) {
        case 'alt':
            return event.altKey;
        case 'ctrl':
            return event.ctrlKey;
        case 'meta':
            return event.metaKey;
        case 'shift':
            return event.shiftKey;
        default:
            return true;
    }
}
