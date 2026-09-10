import { EnvironmentInjector, InjectionToken, Injector, Signal, computed, createEnvironmentInjector } from '@angular/core';

/**
 * Plumbing that lets a definition template both destructure its context (`let ctx`) and hand it to
 * child components through dependency injection (`injectSchedulerEventContext()`).
 *
 * The two mechanisms need different things. `*ngTemplateOutlet` covers the first: pass the context
 * object and Angular exposes its keys to the template. The second needs an `Injector` that provides
 * the context token, created per surface and attached with `ngTemplateOutletInjector`.
 *
 * The contexts are **derived, never written**. The obvious design — a writable signal per surface,
 * set while laying the view out — is illegal: the layout runs inside a `computed`, and Angular
 * throws `NG0600` on a signal write in a reactive context. So a renderer publishes one
 * `Signal<Map<key, T>>` and each surface's context is a `computed` that looks itself up in it.
 * Nothing mutates, and the child components still recompute when the layout changes.
 *
 * @module scheduler-outlet
 */

/**
 * Per-surface injectors, keyed by anything stable (an event id, a date key, a resource id).
 *
 * A renderer owns one host per slot it stamps, hands it the index of contexts, and calls
 * {@link injectorFor} FROM THE TEMPLATE — not from inside the layout computed, which is what keeps
 * injector creation out of the reactive graph.
 */
export class SchedulerContextHost<T> {
    private readonly injectors = new Map<unknown, EnvironmentInjector>();

    /**
     * @param token   Context token the child components inject.
     * @param parent  Injector the per-surface injectors inherit from, normally the renderer's.
     * @param index   The renderer's context index. Read lazily, so it may be built after the host.
     */
    constructor(
        private readonly token: InjectionToken<Signal<T>>,
        private readonly parent: EnvironmentInjector,
        private readonly index: Signal<ReadonlyMap<unknown, T>>
    ) {}

    /**
     * The injector for a surface, created on first use and reused afterwards.
     *
     * The provided signal is a `computed` over the index, so a child component created once keeps
     * seeing the current context across re-layouts instead of a stale snapshot.
     */
    injectorFor(key: unknown): Injector {
        const existing = this.injectors.get(key);
        if (existing) return existing;

        const contextSignal = computed(() => this.index().get(key) as T);
        const injector = createEnvironmentInjector([{ provide: this.token, useValue: contextSignal }], this.parent);
        this.injectors.set(key, injector);
        return injector;
    }

    /**
     * Destroys the injectors of keys no longer present in the index. Cheap to call after a render
     * pass; without it a long-lived Scheduler keeps one injector per surface it ever showed.
     */
    sweep(): void {
        const live = this.index();
        for (const [key, injector] of this.injectors) {
            if (!live.has(key)) {
                injector.destroy();
                this.injectors.delete(key);
            }
        }
    }

    /**
     * Destroys everything. Call from the renderer's `ngOnDestroy`.
     */
    destroy(): void {
        for (const injector of this.injectors.values()) {
            injector.destroy();
        }
        this.injectors.clear();
    }
}
