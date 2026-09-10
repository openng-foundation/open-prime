import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { Demo, DemosJson } from '@/domain/democode';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DemoCodeService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    /**
     * The demos loaded so far, keyed by their own selector.
     *
     * Filled a component at a time. The catalogue used to arrive as one file at startup, which put
     * every component's source on the wire before the reader had opened anything -- and charts
     * alone is hundreds of demos. A page now costs only its own component.
     */
    private demos = signal<Record<string, Demo>>({});

    /** Which components have been asked for, so a second panel does not refetch. */
    private requested = new Map<string, Promise<void>>();

    private loadedCount = signal(0);

    /**
     * Kept for the app initializer, which no longer has anything to wait for: the code panels ask
     * for what they need as they render.
     */
    async loadDemos(): Promise<void> {
        return;
    }

    /**
     * Loads one component's demos, once.
     *
     * A failure is remembered rather than retried: the panel has nothing to show either way, and a
     * missing file would otherwise be refetched by every panel on the page.
     */
    loadComponent(component: string): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return Promise.resolve();

        const existing = this.requested.get(component);

        if (existing) return existing;

        const request = firstValueFrom(this.http.get<DemosJson>(`/demos/${component}.json`))
            .then((data) => {
                this.demos.update((current) => ({ ...current, ...data.demos }));
                this.loadedCount.update((n) => n + 1);
            })
            .catch(() => {
                console.warn(`[DemoCodeService] No demo code for "${component}"`);
                this.loadedCount.update((n) => n + 1);
            });

        this.requested.set(component, request);

        return request;
    }

    /**
     * Starts the download a selector will need.
     *
     * Separate from {@link getCode} because a caller has to be able to ask *before* it can read: a
     * panel that only looked the code up would wait on a file nobody had requested.
     */
    requestFor(selector: string): void {
        const component = selector.split('-')[0];

        if (component) void this.loadComponent(component);
    }

    /**
     * Get demo code by selector (e.g., 'select-basic-demo').
     *
     * Asks for the component's file when it is not here yet and returns `null` for now; the caller
     * reads this inside an effect that also reads {@link isLoaded}, so it re-runs when the file
     * lands.
     */
    getCode(selector: string): Demo | null {
        const demos = this.demos();
        const found = demos[selector];

        if (found) return found;

        const component = selector.split('-')[0];

        if (component && !this.requested.has(component)) void this.loadComponent(component);

        return null;
    }

    /**
     * Get demo code by component and section name
     * @param component Component name (e.g., 'select')
     * @param section Section name (e.g., 'basic')
     */
    getCodeByComponent(component: string, section: string): Demo | null {
        const selector = `${component}-${section}-demo`;
        return this.getCode(selector);
    }

    /**
     * Whether anything has finished loading.
     *
     * Read alongside {@link getCode} so a panel re-renders when its component's file arrives. It
     * counts completed loads rather than reporting a boolean, because a page may need more than one
     * component and each arrival has to wake the panels waiting on it.
     */
    isLoaded = computed(() => this.loadedCount() > 0);

    /**
     * Get all demos for a component.
     */
    getDemosByComponent(component: string): Demo[] {
        void this.loadComponent(component);

        return Object.values(this.demos()).filter((demo) => demo.component === component);
    }
}
