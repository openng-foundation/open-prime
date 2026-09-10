/**
 * ChartLegend.
 *
 * The legend is real DOM in both renderers, not a painted mark. It has to be: the rows are
 * focusable, clickable and selectable, and a legend painted into a canvas would have none of those.
 * That is also why it lives in the overlay layer rather than in the scene.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, booleanAttribute, computed, contentChild, effect, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { Alignment, ChartLegendProps, LegendClickContext, LegendItemRenderContext, Position } from '@openng/optimus-ui/types/charts';
import { isGradient } from '../core/color';
import { seriesColorAt } from '../core/palette';
import { CHART_CONTEXT, CHART_GROUP } from '../charts-registry';
import { ChartLegendItemDef } from './chart-defs';

/** One row of the legend, resolved from the registered series. */
interface LegendRow {
    key: string;
    label: string;
    color: string;
    datasetId: string;
    dataIndex?: number;
    visible: boolean;
    type: 'dataset' | 'item';
    seriesType: string;
    iconShape: 'circle' | 'square' | 'line';
}

/**
 * Lists the series with a swatch each, and toggles their visibility on click.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-legend',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div #root [class]="rootClass()" [style]="rootStyle()" role="list" [attr.data-slot]="'chart-legend'">
            @for (row of rows(); track row.key) {
                @if (itemTemplate()) {
                    <ng-container [ngTemplateOutlet]="itemTemplate()!" [ngTemplateOutletContext]="{ $implicit: contextFor(row), ctx: contextFor(row) }" />
                } @else {
                    <button
                        type="button"
                        class="p-chart-legend-item"
                        data-slot="chart-legend-item"
                        role="listitem"
                        [attr.data-series]="row.datasetId"
                        [attr.data-state]="row.visible ? 'visible' : 'hidden'"
                        [attr.aria-pressed]="row.visible"
                        [disabled]="!interactive()"
                        [style.opacity]="row.visible ? 1 : 0.4"
                        (click)="toggle(row)"
                        (mouseenter)="hovered.set(row.key)"
                        (mouseleave)="hovered.set(null)"
                    >
                        <span
                            class="p-chart-legend-swatch"
                            data-slot="chart-legend-swatch"
                            [attr.data-shape]="row.iconShape"
                            [style.background]="row.color"
                            [style.width.px]="swatchWidth(row)"
                            [style.height.px]="swatchHeight(row)"
                            [style.border-radius]="swatchRadius(row)"
                        ></span>
                        <span class="p-chart-legend-label" data-slot="chart-legend-label">{{ row.label }}</span>
                    </button>
                }
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-legend-host' }
})
export class ChartLegend {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly group = inject(CHART_GROUP, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    protected readonly hovered = signal<string | null>(null);

    private readonly root = viewChild<ElementRef<HTMLElement>>('root');

    /**
     * The legend's own measured size.
     *
     * The reservation is the legend's actual size capped at the maximum, not the maximum itself:
     * reserving 150px for a legend that needs 57 hands a third of the chart to empty space. There
     * is no feedback loop in measuring it, because the legend's size follows its content and the
     * font, never the plot area it is reserving against.
     */
    private readonly measured = signal({ width: 0, height: 0 });

    /** A projected template that replaces each row. */
    readonly itemDef = contentChild(ChartLegendItemDef);

    protected readonly itemTemplate = computed(() => this.itemDef()?.template ?? null);

    /**
     * Legend placement relative to the chart.
     * @defaultValue 'bottom'
     * @group Props
     */
    readonly position = input<Position>('bottom');
    /**
     * Horizontal placement, the control that matters for a top or bottom legend. Defaults to
     * `'start'` at the left and right positions.
     * @group Props
     */
    readonly align = input<Alignment | undefined>(undefined);
    /**
     * Vertical alignment within the chart area, for a left or right legend.
     * @defaultValue 'top'
     * @group Props
     */
    readonly verticalAlign = input<'top' | 'middle' | 'bottom'>('top');
    /**
     * Stack the items horizontally or vertically. Defaults to `'vertical'` at the left and right
     * positions.
     * @group Props
     */
    readonly layout = input<'horizontal' | 'vertical' | undefined>(undefined);
    /**
     * Enable click-to-toggle series visibility.
     * @defaultValue true
     * @group Props
     */
    readonly interactive = input(true, { transform: booleanAttribute });
    /**
     * Maximum legend width, for left and right legends only.
     * @defaultValue 150
     * @group Props
     */
    readonly maxWidth = input(150, { transform: numberAttribute });
    /**
     * Maximum legend height, for top and bottom legends only.
     * @defaultValue 100
     * @group Props
     */
    readonly maxHeight = input(100, { transform: numberAttribute });
    /**
     * Legend container width, for left and right legends only. Locking it keeps the chart area from
     * shifting as the items change.
     * @group Props
     */
    readonly width = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Legend container height, for top and bottom legends only.
     * @group Props
     */
    readonly height = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Label font size in pixels.
     * @group Props
     */
    readonly fontSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Label font family.
     * @group Props
     */
    readonly fontFamily = input<string | undefined>(undefined);
    /**
     * Label font weight.
     * @group Props
     */
    readonly fontWeight = input<'normal' | 'bold' | number | undefined>(undefined);
    /**
     * Label text colour.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Legend icon marker size in pixels.
     * @defaultValue 12
     * @group Props
     */
    readonly iconSize = input(12, { transform: numberAttribute });
    /**
     * Legend icon shape. `'auto'` follows the mark: a line for line and area, a dot for scatter,
     * bubble, pie and donut, a box otherwise.
     * @defaultValue 'auto'
     * @group Props
     */
    readonly iconShape = input<'circle' | 'square' | 'line' | 'auto'>('auto');
    /**
     * Spacing between legend entries in pixels.
     * @defaultValue 8
     * @group Props
     */
    readonly itemGap = input(8, { transform: numberAttribute });
    /**
     * Shared legend mode. Only read when the legend sits inside a `ChartGroup` rather than inside a
     * single chart.
     * @defaultValue 'dataset'
     * @group Props
     */
    readonly mode = input<'dataset' | 'category' | 'both'>('dataset');
    /**
     * Custom item renderer, called once per legend item.
     * @group Props
     */
    readonly render = input<((context: LegendItemRenderContext) => unknown) | undefined>(undefined);
    /**
     * Click handler. Setting it takes over from the default show/hide toggle.
     * @group Props
     */
    readonly onClick = input<((context: LegendClickContext) => void) | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartLegendProps>(() => ({
        position: this.position(),
        align: this.align(),
        verticalAlign: this.verticalAlign(),
        layout: this.layout(),
        interactive: this.interactive(),
        maxWidth: this.maxWidth(),
        maxHeight: this.maxHeight(),
        width: this.width(),
        height: this.height(),
        fontSize: this.fontSize(),
        fontFamily: this.fontFamily(),
        fontWeight: this.fontWeight(),
        color: this.color(),
        iconSize: this.iconSize(),
        iconShape: this.iconShape(),
        itemGap: this.itemGap(),
        mode: this.mode(),
        render: this.render(),
        onClick: this.onClick()
    }));

    /** Whether the items stack across or down. */
    protected readonly $layout = computed(() => this.layout() ?? (this.position() === 'left' || this.position() === 'right' ? 'vertical' : 'horizontal'));

    /**
     * The rows.
     *
     * A pie or donut legend lists its slices rather than the single series, because "the one series"
     * is not what a reader of a pie wants to toggle -- the slices are.
     */
    protected readonly rows = computed<LegendRow[]>(() => {
        const charts = this.group ? this.group.members().map((member) => member.context) : this.context ? [this.context] : [];
        const rows: LegendRow[] = [];

        for (const context of charts) {
            const palette = context.theme().series ?? [];

            for (const registration of context.series()) {
                const props = registration.props() as Record<string, unknown>;
                const index = registration.seriesIndex();
                const color = typeof props['color'] === 'string' ? (props['color'] as string) : isGradient(props['color'] as never) ? seriesColorAt(palette, index) : seriesColorAt(palette, index);
                const perItem = registration.type === 'pie' || registration.type === 'donut' || registration.type === 'polar';

                if (perItem) {
                    const data = (props['data'] as Record<string, unknown>[] | undefined) ?? [];
                    const categoryField = typeof props['categoryField'] === 'string' ? (props['categoryField'] as string) : 'category';

                    data.forEach((datum, dataIndex) => {
                        rows.push({
                            key: `${registration.id}:${dataIndex}`,
                            label: String(datum?.[categoryField] ?? dataIndex),
                            color: seriesColorAt(palette, dataIndex),
                            datasetId: registration.id,
                            dataIndex,
                            visible: context.isItemVisible(registration.id, dataIndex),
                            type: 'item',
                            seriesType: registration.type,
                            iconShape: this.shapeFor(registration.type)
                        });
                    });

                    continue;
                }

                rows.push({
                    key: registration.id,
                    // A series with no name still needs a row, or toggling it becomes impossible.
                    label: (props['name'] as string | undefined) ?? registration.id,
                    color,
                    datasetId: registration.id,
                    visible: context.isDatasetVisible(registration.id),
                    type: 'dataset',
                    seriesType: registration.type,
                    iconShape: this.shapeFor(registration.type)
                });
            }
        }

        return rows;
    });

    /** The swatch shape for a series type, when `iconShape` is on auto. */
    private shapeFor(seriesType: string): 'circle' | 'square' | 'line' {
        const explicit = this.iconShape();

        if (explicit !== 'auto') return explicit;

        if (seriesType === 'line') return 'line';
        if (seriesType === 'scatter' || seriesType === 'pie' || seriesType === 'donut') return 'circle';

        return 'square';
    }

    protected rootClass(): string {
        return `p-chart-legend p-chart-legend-${this.position()} p-chart-legend-${this.$layout()}`;
    }

    /**
     * The legend's own box.
     *
     * It is positioned absolutely in the overlay layer rather than laid out in flow, because the
     * space it occupies was already reserved from the plot area -- letting it also take part in flow
     * would reserve it twice.
     */
    protected rootStyle(): Record<string, string | null> {
        const position = this.position();
        const vertical = position === 'left' || position === 'right';
        const align = this.align() ?? (vertical ? 'start' : 'center');

        return {
            position: 'absolute',
            display: 'flex',
            'flex-direction': this.$layout() === 'vertical' ? 'column' : 'row',
            'flex-wrap': this.$layout() === 'vertical' ? 'nowrap' : 'wrap',
            gap: `${this.itemGap()}px`,
            'align-items': vertical ? 'flex-start' : 'center',
            'justify-content': align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
            overflow: 'auto',
            top: position === 'top' ? '0' : vertical ? this.verticalOffset() : null,
            bottom: position === 'bottom' ? '0' : null,
            left: position === 'left' ? '0' : vertical ? null : '0',
            right: position === 'right' ? '0' : vertical ? null : '0',
            'max-width': vertical ? `${this.maxWidth()}px` : null,
            'max-height': vertical ? null : `${this.maxHeight()}px`,
            width: vertical && this.width() != null ? `${this.width()}px` : null,
            height: !vertical && this.height() != null ? `${this.height()}px` : null,
            'font-size': `${this.fontSize() ?? this.context?.fontSize() ?? 12}px`,
            'font-family': this.fontFamily() ?? this.context?.fontFamily() ?? null,
            'font-weight': this.fontWeight() != null ? String(this.fontWeight()) : null,
            color: this.color() ?? this.context?.theme().legendColor ?? null
        };
    }

    private verticalOffset(): string {
        switch (this.verticalAlign()) {
            case 'middle':
                return '50%';
            case 'bottom':
                return 'auto';
            default:
                return '0';
        }
    }

    protected swatchWidth(row: LegendRow): number {
        return row.iconShape === 'line' ? this.iconSize() : this.iconSize();
    }

    protected swatchHeight(row: LegendRow): number {
        // A line swatch is a thin bar rather than a box, so it reads as the mark it stands for.
        return row.iconShape === 'line' ? Math.max(2, Math.round(this.iconSize() / 4)) : this.iconSize();
    }

    protected swatchRadius(row: LegendRow): string {
        if (row.iconShape === 'circle') return '50%';
        if (row.iconShape === 'line') return '1px';

        return '2px';
    }

    /** The context a custom row template or render function receives. */
    protected contextFor(row: LegendRow): LegendItemRenderContext {
        return {
            type: row.type,
            datasetId: row.datasetId,
            index: row.dataIndex,
            label: row.label,
            color: row.color,
            visible: row.visible,
            isHovered: this.hovered() === row.key,
            onClick: () => this.toggle(row),
            onMouseEnter: () => this.hovered.set(row.key),
            onMouseLeave: () => this.hovered.set(null)
        };
    }

    /** Applies a row click. */
    protected toggle(row: LegendRow): void {
        if (!this.interactive()) return;

        const handler = this.onClick();

        if (handler) {
            // A custom handler replaces the toggle rather than running alongside it, so an
            // application that wants a drilldown does not also get a hidden series.
            handler({ datasetId: row.datasetId, index: row.dataIndex, label: row.label, type: row.seriesType });

            return;
        }

        const targets = this.group ? this.group.members().map((member) => member.context) : this.context ? [this.context] : [];

        for (const context of targets) {
            if (row.dataIndex != null) context.toggleItems(row.datasetId, [row.dataIndex]);
            else context.toggleDataset(row.datasetId);
        }
    }

    constructor() {
        effect((onCleanup) => {
            const element = this.root()?.nativeElement;

            if (!element || typeof ResizeObserver === 'undefined') return;

            const observer = new ResizeObserver((entries) => {
                const box = entries[0]?.contentRect;

                if (!box) return;

                const current = this.measured();

                // Sub-pixel noise would otherwise re-run layout on every scroll.
                if (Math.abs(current.width - box.width) < 0.5 && Math.abs(current.height - box.height) < 0.5) return;

                this.measured.set({ width: box.width, height: box.height });
            });

            observer.observe(element);
            this.measured.set({ width: element.offsetWidth, height: element.offsetHeight });

            onCleanup(() => observer.disconnect());
        });

        if (!this.context) return;

        const removeFeature = this.context.registerFeature({ type: 'legend', props: this.props });
        // The legend reserves a fixed band rather than measuring itself, so the plot area does not
        // resize every time a series is toggled and the labels change width.
        const releaseSpace = this.context.reserve(
            computed(() => {
                const position = this.position();
                const vertical = position === 'left' || position === 'right';
                const gap = 8;
                const box = this.measured();

                // An explicit width or height wins outright -- that is what it is for: locking the
                // band so the plot does not shift as items are toggled. Otherwise the legend takes
                // what it measured, capped at the maximum, and falls back to the maximum only until
                // it has been measured at all.
                if (vertical) {
                    const explicit = this.width();
                    const size = explicit ?? (box.width > 0 ? Math.min(box.width, this.maxWidth()) : this.maxWidth());

                    return { edge: position, size: size + gap };
                }

                const explicit = this.height();
                const size = explicit ?? (box.height > 0 ? Math.min(box.height, this.maxHeight()) : this.maxHeight());

                return { edge: position, size: size + gap };
            })
        );

        this.destroyRef.onDestroy(() => {
            removeFeature();
            releaseSpace();
        });
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
