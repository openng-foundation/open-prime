/**
 * The chart theme helpers the demos share.
 *
 * A demo that hard-codes its colours looks wrong in the other colour scheme, and a chart is mostly
 * colour. These read the docs app's own dark-mode state so a demo can pick a palette that matches
 * the page it is on.
 */
import { computed, inject, type Signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppConfigService } from '@/service/appconfigservice';
import type { ChartTheme } from '@openng/optimus-ui/types/charts';

/** Whether the docs app is currently in dark mode. */
export function injectIsDarkMode(): Signal<boolean> {
    const config = inject(AppConfigService, { optional: true });
    const document = inject(DOCUMENT);

    return computed(() => config?.appState().darkTheme ?? document.documentElement.classList.contains('p-dark'));
}

/**
 * A theme that follows the docs app's colour scheme.
 *
 * Only the surfaces a demo would otherwise have to state twice: the rest is left to the chart's own
 * token resolution, which already follows the scheme.
 */
export function injectChartTheme(): Signal<ChartTheme> {
    const isDark = injectIsDarkMode();

    return computed<ChartTheme>(() => (isDark() ? { grid: '#27272a', tickLabel: '#a1a1aa', color: '#fafafa', background: 'transparent' } : { grid: '#e4e4e7', tickLabel: '#71717a', color: '#18181b', background: 'transparent' }));
}
