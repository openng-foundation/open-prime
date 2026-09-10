/**
 * ChartExportMenu.
 *
 * Real DOM in both renderers, like the legend and the tooltip: it is a button and a menu, and both
 * need focus, keyboard handling and a hit target. The export itself is the root's job, since only
 * the root knows whether it is serialising an SVG tree or reading back a canvas.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ChartExportMenuProps, ExportMenuButtonOptions, ExportMenuItem, ExportMenuItemContext } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';
import { ChartExportMenuIconDef, ChartExportMenuItemDef } from './chart-defs';

/** The default menu, and the order the entries appear in. */
const DEFAULT_ITEMS: (ExportMenuItem | 'downloadCSV')[] = ['downloadPNG', 'downloadJPEG', 'downloadSVG', 'separator', 'downloadPDF'];

/** One resolved entry. */
interface MenuEntry {
    key: string;
    label: string;
    format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv';
    transparent: boolean;
}

/**
 * A download menu for the chart, in PNG, JPEG, SVG, PDF or CSV.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-export-menu',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (enabled()) {
            <div #root class="p-chart-export-menu" data-slot="chart-export-menu" [style]="rootStyle()">
                <button
                    type="button"
                    class="p-chart-export-menu-button"
                    [class]="buttonClass()"
                    data-slot="chart-export-menu-button"
                    [attr.aria-label]="label()"
                    [attr.aria-expanded]="open()"
                    aria-haspopup="menu"
                    (click)="toggle()"
                    (keydown.escape)="open.set(false)"
                >
                    @if (iconDef()) {
                        <ng-container [ngTemplateOutlet]="iconDef()!.template" [ngTemplateOutletContext]="{ $implicit: { open: open() }, ctx: { open: open() } }" />
                    } @else {
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                            <path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                        </svg>
                    }
                </button>
                @if (open()) {
                    <div class="p-chart-export-menu-list" [class]="menuClass()" data-slot="chart-export-menu-list" role="menu">
                        @for (entry of entries(); track entry.key) {
                            @if (entry.format === 'separator') {
                                <hr class="p-chart-export-menu-separator" data-slot="chart-export-menu-separator" />
                            } @else if (itemDef()) {
                                <ng-container [ngTemplateOutlet]="itemDef()!.template" [ngTemplateOutletContext]="{ $implicit: contextFor(entry, $index), ctx: contextFor(entry, $index) }" />
                            } @else {
                                <button type="button" class="p-chart-export-menu-item" data-slot="chart-export-menu-item" role="menuitem" (click)="run(entry)">{{ entry.label }}</button>
                            }
                        }
                    </div>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-export-menu-host' }
})
export class ChartExportMenu {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    private readonly root = viewChild<ElementRef<HTMLElement>>('root');

    protected readonly open = signal(false);

    /** A projected template that replaces the button's icon. */
    readonly iconDef = contentChild(ChartExportMenuIconDef);

    /** A projected template that replaces each entry. */
    readonly itemDef = contentChild(ChartExportMenuItemDef);

    /**
     * Whether the menu is shown at all.
     * @defaultValue true
     * @group Props
     */
    readonly enabled = input(true, { transform: booleanAttribute });
    /**
     * Base filename for the downloaded file, without an extension.
     * @defaultValue 'chart'
     * @group Props
     */
    readonly filename = input('chart');
    /**
     * Which entries appear, and in what order. `'separator'` inserts a divider.
     * @group Props
     */
    readonly menuItems = input<(ExportMenuItem | 'downloadCSV')[] | undefined>(undefined);
    /**
     * Pixel-density multiplier for the raster formats.
     * @defaultValue 2
     * @group Props
     */
    readonly scale = input(2, { transform: numberAttribute });
    /**
     * Background behind the exported image. `'auto'` takes the theme's background.
     * @defaultValue 'auto'
     * @group Props
     */
    readonly backgroundColor = input<string | 'auto' | 'transparent'>('auto');
    /**
     * Where the button sits within the chart.
     * @group Props
     */
    readonly buttons = input<ExportMenuButtonOptions | undefined>(undefined);
    /**
     * Extra classes for the button.
     * @group Props
     */
    readonly buttonClass = input('');
    /**
     * Extra classes for the menu.
     * @group Props
     */
    readonly menuClass = input('');

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartExportMenuProps>(() => ({
        enabled: this.enabled(),
        filename: this.filename(),
        menuItems: this.menuItems(),
        scale: this.scale(),
        backgroundColor: this.backgroundColor(),
        buttons: this.buttons(),
        buttonClass: this.buttonClass(),
        menuClass: this.menuClass()
    }));

    protected readonly label = computed(() => this.context?.text().exportMenu ?? 'Export chart');

    /**
     * The entries, resolved against the text catalogue.
     *
     * The labels come from the catalogue rather than being hard-coded, which is what makes the menu
     * translate with the rest of the chart's prose.
     */
    protected readonly entries = computed<(MenuEntry | { key: string; format: 'separator' })[]>(() => {
        const text = this.context?.text();
        const items = this.menuItems() ?? DEFAULT_ITEMS;

        return items.map((item, index) => {
            if (item === 'separator') return { key: `separator-${index}`, format: 'separator' as const };

            const transparent = item === 'downloadPNGTransparent' || item === 'downloadSVGTransparent';
            const format = item === 'downloadJPEG' ? 'jpeg' : item === 'downloadPDF' ? 'pdf' : item === 'downloadCSV' ? 'csv' : item.includes('SVG') ? 'svg' : 'png';

            return { key: `${item}-${index}`, label: text?.[item] ?? item, format, transparent } satisfies MenuEntry;
        });
    });

    protected rootStyle(): Record<string, string | null> {
        const buttons = this.buttons();
        const align = buttons?.align ?? 'right';
        const verticalAlign = buttons?.verticalAlign ?? 'top';

        return {
            position: 'absolute',
            top: verticalAlign === 'top' ? `${buttons?.y ?? 0}px` : null,
            bottom: verticalAlign === 'bottom' ? `${-(buttons?.y ?? 0)}px` : null,
            left: align === 'left' ? `${buttons?.x ?? 0}px` : null,
            right: align === 'right' ? `${-(buttons?.x ?? 0)}px` : null,
            'pointer-events': 'auto'
        };
    }

    protected toggle(): void {
        this.open.update((value) => !value);
    }

    /** The context a custom entry template receives. */
    protected contextFor(entry: MenuEntry | { key: string; format: 'separator' }, index: number): ExportMenuItemContext {
        return { item: entry.key.replace(/-\d+$/, ''), label: 'label' in entry ? entry.label : '', index };
    }

    /** Runs one entry. */
    protected async run(entry: MenuEntry): Promise<void> {
        this.open.set(false);

        const context = this.context;

        if (!context) return;

        if (entry.format === 'csv') {
            // CSV is the one entry the root cannot produce: it is the data, not the picture. The
            // state derives it, and the same derivation feeds the screen-reader table.
            downloadText(`${this.filename()}.csv`, context.toCsv());

            return;
        }

        await context.exportChart({
            format: entry.format,
            filename: this.filename(),
            scale: this.scale(),
            backgroundColor: entry.transparent ? 'transparent' : this.backgroundColor()
        });
    }

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'exportMenu', props: this.props });

        // A click anywhere else closes the menu, which is what a menu is expected to do and cannot
        // be done from the template.
        const onDocumentClick = (event: Event) => {
            if (!this.open()) return;

            const element = this.root()?.nativeElement;

            if (element && !element.contains(event.target as Node)) this.open.set(false);
        };

        if (typeof document !== 'undefined') document.addEventListener('click', onDocumentClick, true);

        this.destroyRef.onDestroy(() => {
            remove();

            if (typeof document !== 'undefined') document.removeEventListener('click', onDocumentClick, true);
        });
    }
}

/** Saves a text file. */
function downloadText(filename: string, content: string): void {
    if (typeof document === 'undefined') return;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
