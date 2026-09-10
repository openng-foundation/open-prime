/**
 * Plugins: extending a chart from the outside without forking it.
 *
 * A plugin reads chart state, subscribes to frames and hover, paints an overlay above the chart and
 * can publish a public API. What it cannot do is change how the chart draws itself, which is the
 * point: an application gets an extension seam that no future version of the chart has to preserve
 * the internals for.
 */
import type { DestroyRef } from '@angular/core';
import type { BoxArea, ChartOverlaySurface, ChartPlugin, ChartPluginContext, ChartPluginEntry, ChartState, DatasetRegistration, HoverState, InstalledChartPlugin } from '@openng/optimus-ui/types/charts';

/**
 * Defines a plugin.
 *
 * A plugin that takes configuration is better written as a function returning this, so the options
 * are ordinary parameters and get type checked where the plugin is created. The `[plugin, options]`
 * tuple form works too but carries no type information for the options.
 *
 * ```ts
 * const trendline = (opts: { color?: string } = {}) =>
 *     defineChartPlugin('trendline', (ctx) => {
 *         ctx.registerOverlay(({ svg }) => {
 *             // draws using opts.color
 *         });
 *     });
 * ```
 */
export function defineChartPlugin<TOptions = unknown, TApi = unknown>(name: string, install: (ctx: ChartPluginContext<TOptions>) => { api: TApi } | void, options?: TOptions): ChartPlugin<TOptions, TApi> {
    return { name, install, options };
}

/** What a chart root supplies so plugins have something to read and paint onto. */
export interface PluginHost {
    getState: () => ChartState;
    getDatasets: () => Map<string, DatasetRegistration>;
    getHover: () => HoverState | null;
    onFrame: (cb: () => void) => () => void;
    onHover: (cb: (hover: HoverState | null) => void) => () => void;
    registerOverlay: (render: (surface: ChartOverlaySurface) => void) => () => void;
    getContainer: () => HTMLElement | null;
}

/**
 * Installs a chart's plugins and returns them keyed by name.
 *
 * The `plugins` input is read once, on mount. Reassigning the array afterwards deliberately has no
 * effect: a plugin may hold subscriptions, timers and DOM of its own, so re-installing on every
 * input change would make its lifetime impossible to reason about. A plugin whose configuration has
 * to change should read a signal inside `onFrame` instead.
 */
export function installPlugins(entries: readonly ChartPluginEntry[], host: PluginHost, destroyRef: DestroyRef): Record<string, InstalledChartPlugin> {
    const installed: Record<string, InstalledChartPlugin> = {};

    for (const entry of entries) {
        const [plugin, options] = Array.isArray(entry) ? entry : [entry, (entry as ChartPlugin).options];
        const typed = plugin as ChartPlugin<unknown, unknown>;
        const teardown: (() => void)[] = [];

        const ctx: ChartPluginContext<unknown> = {
            getState: host.getState,
            getDatasets: host.getDatasets,
            getHover: host.getHover,
            onFrame: (cb) => {
                const off = host.onFrame(cb);

                teardown.push(off);

                return off;
            },
            onHover: (cb) => {
                const off = host.onHover(cb);

                teardown.push(off);

                return off;
            },
            registerOverlay: (render) => {
                const off = host.registerOverlay(render);

                teardown.push(off);

                return off;
            },
            getContainer: host.getContainer,
            options,
            onUnmounted: (fn) => teardown.push(fn)
        };

        let result: { api: unknown } | void | undefined;

        try {
            result = typed.install(ctx);
        } catch {
            // One misbehaving plugin must not take the chart down with it. The chart's own
            // rendering is independent of every plugin, so the right failure mode is a chart that
            // draws without that plugin's overlay.
            for (const fn of teardown) fn();
            continue;
        }

        // Narrowed rather than optional-chained: `install` returns `{ api } | void`, and reaching
        // for `.api` on the void arm is what the compiler objects to.
        const api = result && typeof result === 'object' && 'api' in result ? result.api : undefined;

        installed[typed.name] = { name: typed.name, api };

        destroyRef.onDestroy(() => {
            for (const fn of teardown) {
                try {
                    fn();
                } catch {
                    // A throwing teardown must not stop the rest of the cleanup.
                }
            }
        });
    }

    return installed;
}

/** Bundles the overlay painters a root has to replay each frame. */
export function createOverlayRegistry() {
    const painters = new Set<(surface: ChartOverlaySurface) => void>();

    return {
        /** Registers a painter and returns the function that removes it. */
        register(render: (surface: ChartOverlaySurface) => void): () => void {
            painters.add(render);

            return () => painters.delete(render);
        },
        /** Whether anything is registered, so a root can skip the overlay layer entirely. */
        get size(): number {
            return painters.size;
        },
        /**
         * Replays every painter, asking for a fresh surface per painter.
         *
         * Each one gets its own surface so a plugin cannot clobber another's output -- under SVG
         * that means its own group, and under Canvas a saved-and-restored context.
         */
        paint(surfaceFor: (index: number) => ChartOverlaySurface): void {
            let index = 0;

            for (const painter of painters) {
                try {
                    painter(surfaceFor(index));
                } catch {
                    // As with install: a plugin's drawing error stays the plugin's problem.
                }

                index++;
            }
        }
    };
}

/** The overlay surface an SVG root hands its painters. */
export function svgOverlaySurface(group: SVGGElement, area: BoxArea): ChartOverlaySurface {
    return { svg: group, area };
}

/** The overlay surface a Canvas root hands its painters. */
export function canvasOverlaySurface(ctx: CanvasRenderingContext2D, area: BoxArea): ChartOverlaySurface {
    return { ctx, area };
}
