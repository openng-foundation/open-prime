/**
 * The chart's prose.
 *
 * `locale` formats numbers and dates without help, because `Intl` does that. Prose does not come
 * from `Intl`: a screen-reader description, a data-table header and an export menu entry are
 * written sentences, so a language has to be registered before they change. English is built in;
 * every other language arrives through {@link registerLocale}.
 *
 * Registration is global and order-independent. A catalogue registered after a chart has mounted
 * still reaches it, because the resolution reads a signal rather than a snapshot -- which is what
 * makes a lazily loaded catalogue work at all.
 */
import { signal } from '@angular/core';
import type { ChartText } from '@openng/optimus-ui/types/charts';

/** The built-in English catalogue, and the fallback for every missing key. */
export const EN_CHART_TEXT: ChartText = {
    chart: 'Chart',
    exportMenu: 'Export chart',
    downloadPNG: 'Download PNG',
    downloadJPEG: 'Download JPEG',
    downloadSVG: 'Download SVG',
    downloadPDF: 'Download PDF',
    downloadPNGTransparent: 'Download PNG (transparent)',
    downloadSVGTransparent: 'Download SVG (transparent)',
    downloadCSV: 'Download CSV',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    panLeft: 'Pan left',
    panRight: 'Pan right',
    resetZoom: 'Reset zoom',
    navigator: 'Chart navigator',
    dataTable: 'Chart data',
    category: 'Category',
    value: 'Value',
    series: 'Series',
    keyboardHint: 'Use the arrow keys to move between data points.',
    all: 'All'
};

/**
 * The registered catalogues.
 *
 * A signal rather than a plain map, so a chart that has already rendered re-resolves its text when
 * a catalogue is registered later. Anything else would make a lazily loaded language silently miss
 * the charts that were already on the page.
 */
const catalogues = signal<Record<string, Partial<ChartText>>>({});

/** Registers a language catalogue under a BCP 47 code. */
export function registerLocale(code: string, text: Partial<ChartText>): void {
    catalogues.update((current) => ({ ...current, [code.toLowerCase()]: text }));
}

/** The catalogues currently registered, exposed for the resolution to read reactively. */
export function registeredLocales(): Record<string, Partial<ChartText>> {
    return catalogues();
}

/**
 * Resolves the text a chart uses.
 *
 * The cascade is English, then the language's own catalogue, then the chart's `text` overrides. A
 * region subtag falls back to its base language, so `de-AT` finds `de` -- the alternative is that a
 * perfectly ordinary locale string silently gets English.
 */
export function resolveChartText(locale: string | undefined, overrides: Partial<ChartText> | undefined): ChartText {
    const registered = catalogues();
    const code = locale?.toLowerCase();
    const exact = code ? registered[code] : undefined;
    const base = code?.includes('-') ? registered[code.split('-')[0]] : undefined;

    return { ...EN_CHART_TEXT, ...base, ...exact, ...overrides };
}
