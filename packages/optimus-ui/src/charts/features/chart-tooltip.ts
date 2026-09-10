/**
 * ChartTooltip.
 *
 * Like the legend, the tooltip is real DOM in both renderers. Its content is text a reader may want
 * to select and its position has to respect the viewport, neither of which a painted card can do.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, effect, inject, input, numberAttribute, signal, type EffectRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ChartTooltipProps, CrosshairConfig, HoverState, TooltipItem, TooltipRenderContext, TooltipSnap, TooltipValueFormatter } from '@openng/optimus-ui/types/charts';
import { formatNumberTick } from '../core/format';
import { seriesColorAt } from '../core/palette';
import { CHART_CONTEXT, type ChartContext } from '../charts-registry';
import { ChartTooltipDef } from './chart-defs';

/** The tooltip card's offset from the pointer, so the cursor never sits on top of the text. */
const CURSOR_GAP = 12;

/**
 * Shows the values at the hovered position.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-tooltip',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (visible()) {
            <div class="p-chart-tooltip" data-slot="chart-tooltip" role="tooltip" [style]="cardStyle()">
                @if (bodyTemplate()) {
                    <ng-container [ngTemplateOutlet]="bodyTemplate()!" [ngTemplateOutletContext]="{ $implicit: renderContext()!, ctx: renderContext()! }" />
                } @else {
                    <div class="p-chart-tooltip-header" data-slot="chart-tooltip-header">{{ renderContext()!.label }}</div>
                    <div class="p-chart-tooltip-body" data-slot="chart-tooltip-body">
                        @for (item of renderContext()!.allSeries; track item.datasetId) {
                            <div class="p-chart-tooltip-row" data-slot="chart-tooltip-row">
                                <span class="p-chart-tooltip-swatch" [style.background]="item.color"></span>
                                <span class="p-chart-tooltip-label">{{ item.name ?? item.datasetId }}</span>
                                <span class="p-chart-tooltip-value">{{ item.formattedValue }}</span>
                            </div>
                        }
                    </div>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-tooltip-host' }
})
export class ChartTooltip {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** A projected template that replaces the card body. */
    readonly bodyDef = contentChild(ChartTooltipDef);

    protected readonly bodyTemplate = computed(() => this.bodyDef()?.template ?? null);

    /**
     * `'item'` shows the specific hovered element; `'shared'` shows every series at the snapped
     * anchor.
     * @defaultValue 'item'
     * @group Props
     */
    readonly mode = input<'item' | 'shared'>('item');
    /**
     * Point selection strategy. Left unset, each chart type picks its natural default.
     * @group Props
     */
    readonly snap = input<TooltipSnap | undefined>(undefined);
    /**
     * Show a reference line or band at the hovered position.
     * @defaultValue false
     * @group Props
     */
    readonly crosshair = input<boolean | CrosshairConfig>(false);
    /**
     * Tooltip placement relative to the chart.
     * @defaultValue 'cursor'
     * @group Props
     */
    readonly position = input<'cursor' | 'top' | 'bottom' | 'left' | 'right'>('cursor');
    /**
     * Horizontal offset in pixels, applied after `position`.
     * @group Props
     */
    readonly offsetX = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Vertical offset in pixels, applied after `position`.
     * @group Props
     */
    readonly offsetY = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Track the cursor while `position` is `'cursor'`.
     * @defaultValue true
     * @group Props
     */
    readonly followCursor = input(true, { transform: booleanAttribute });
    /**
     * Milliseconds to wait before showing. Raise it to hold the tooltip back while the cursor
     * sweeps across dense hit targets.
     * @defaultValue 0
     * @group Props
     */
    readonly showDelay = input(0, { transform: numberAttribute });
    /**
     * Milliseconds the tooltip lingers after the cursor leaves a point.
     * @defaultValue 0
     * @group Props
     */
    readonly hideDelay = input(0, { transform: numberAttribute });
    /**
     * Custom tooltip renderer, which replaces the default layout outright.
     * @group Props
     */
    readonly render = input<((context: TooltipRenderContext) => unknown) | undefined>(undefined);
    /**
     * Formats the value.
     *
     * Return a string to reformat the single value, or an array of rows to render a custom
     * multi-row body inside the default card -- which covers the common multi-metric case without
     * having to replace the whole layout with `render`. Ignored when `render` is set, since that
     * has already replaced the body the rows would go in.
     * @group Props
     */
    readonly valueFormatter = input<TooltipValueFormatter | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartTooltipProps>(() => ({
        mode: this.mode(),
        snap: this.snap(),
        crosshair: this.crosshair(),
        position: this.position(),
        offsetX: this.offsetX(),
        offsetY: this.offsetY(),
        followCursor: this.followCursor(),
        showDelay: this.showDelay(),
        hideDelay: this.hideDelay(),
        render: this.render(),
        valueFormatter: this.valueFormatter()
    }));

    /**
     * The hover the tooltip is showing, which lags the chart's own by the show and hide delays.
     *
     * The delays are honoured here rather than in the root because they are the tooltip's own
     * behaviour: the crosshair and the colour-legend indicator read the same delayed value, so the
     * three never disagree about what is hovered.
     */
    private readonly delayed = signal<{ datasetId: string; index: number; x: number; y: number } | null>(null);

    private timer: ReturnType<typeof setTimeout> | null = null;

    protected readonly visible = computed(() => this.renderContext() != null);

    /** The context the card renders from. */
    protected readonly renderContext = computed<TooltipRenderContext | null>(() => {
        const hover = this.delayed();

        if (!hover || !this.context) return null;

        const series = this.context.series();
        const palette = this.context.theme().series ?? [];
        const locale = this.context.locale();
        const primary = series.find((entry) => entry.id === hover.datasetId);

        if (!primary) return null;

        const primaryProps = primary.props() as Record<string, unknown>;
        const primaryData = (primaryProps['data'] as Record<string, unknown>[] | undefined) ?? [];
        const category = String(primaryData[hover.index]?.[categoryFieldOf(primaryProps)] ?? hover.index);
        const shared = this.mode() === 'shared';

        // In shared mode every series contributes its value at the same category, which is what
        // makes a multi-series tooltip comparable rather than a list of whatever was nearest.
        const sources = shared ? series : [primary];
        const allSeries: TooltipItem[] = [];

        for (const entry of sources) {
            if (!this.context.isDatasetVisible(entry.id)) continue;

            const props = entry.props() as Record<string, unknown>;
            const data = (props['data'] as Record<string, unknown>[] | undefined) ?? [];
            const index: number = shared ? data.findIndex((datum) => String(datum?.[categoryFieldOf(props)] ?? '') === category) : hover.index;
            const resolvedIndex = index >= 0 ? index : hover.index;
            const raw = data[resolvedIndex]?.[valueFieldOf(props)];
            const value = typeof raw === 'number' ? raw : Number(raw);

            if (!Number.isFinite(value)) continue;

            const color = typeof props['color'] === 'string' ? (props['color'] as string) : seriesColorAt(palette, entry.seriesIndex());
            const formatter = this.valueFormatter();
            const formatted = formatter
                ? formatter(value, {
                      datasetId: entry.id,
                      seriesName: (props['name'] as string | undefined) ?? entry.id,
                      seriesIndex: entry.seriesIndex(),
                      index: resolvedIndex,
                      label: category,
                      datum: data[resolvedIndex],
                      color
                  })
                : undefined;

            allSeries.push({
                datasetId: entry.id,
                name: props['name'] as string | undefined,
                label: category,
                color,
                value,
                formattedValue: typeof formatted === 'string' ? formatted : formatNumberTick(value, locale),
                // Rows returned by the formatter replace this series' single line in the card, which
                // is what lets one hovered mark report several metrics.
                rows: Array.isArray(formatted) ? formatted : undefined
            });
        }

        const primaryItem = allSeries.find((item) => item.datasetId === primary.id) ?? allSeries[0];

        if (!primaryItem) return null;

        return {
            datasetId: primary.id,
            index: hover.index,
            label: category,
            value: primaryItem.value,
            color: primaryItem.color,
            x: hover.x,
            y: hover.y,
            allSeries
        };
    });

    /** Positions the card, clamped so it cannot leave the chart. */
    protected cardStyle(): Record<string, string | null> {
        const hover = this.delayed();
        const area = this.context?.chartArea();

        if (!hover || !area) return { display: 'none' };

        const placement = this.position();
        const offsetX = this.offsetX() ?? 0;
        const offsetY = this.offsetY() ?? 0;
        const base: Record<string, string | null> = {
            position: 'absolute',
            'pointer-events': 'none',
            'z-index': '1',
            transform: null,
            left: null,
            right: null,
            top: null,
            bottom: null
        };

        if (placement === 'cursor') {
            // The card is anchored past the cursor and flipped near the right edge, so it never
            // covers the mark it is describing.
            const flip = hover.x > area.x + area.width * 0.7;

            return {
                ...base,
                left: `${hover.x + (flip ? -CURSOR_GAP : CURSOR_GAP) + offsetX}px`,
                top: `${hover.y + offsetY}px`,
                transform: flip ? 'translate(-100%, -50%)' : 'translate(0, -50%)'
            };
        }

        switch (placement) {
            case 'top':
                return { ...base, left: `${area.x + area.width / 2 + offsetX}px`, top: `${area.y + offsetY}px`, transform: 'translate(-50%, 0)' };
            case 'bottom':
                return { ...base, left: `${area.x + area.width / 2 + offsetX}px`, top: `${area.y + area.height + offsetY}px`, transform: 'translate(-50%, -100%)' };
            case 'left':
                return { ...base, left: `${area.x + offsetX}px`, top: `${area.y + area.height / 2 + offsetY}px`, transform: 'translate(0, -50%)' };
            default:
                return { ...base, left: `${area.x + area.width + offsetX}px`, top: `${area.y + area.height / 2 + offsetY}px`, transform: 'translate(-100%, -50%)' };
        }
    }

    constructor() {
        if (!this.context) return;

        const removeFeature = this.context.registerFeature({ type: 'tooltip', props: this.props });

        // The delayed hover is driven from an effect rather than from the signal directly, because
        // a delay is a side effect in time and a computed cannot express one.
        const stop = watchHover(this.context, (hover) => {
            if (this.timer != null) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            const delay = hover ? this.showDelay() : this.hideDelay();

            if (delay <= 0) {
                this.delayed.set(hover);

                return;
            }

            this.timer = setTimeout(() => {
                this.timer = null;
                this.delayed.set(hover);
            }, delay);
        });

        this.destroyRef.onDestroy(() => {
            if (this.timer != null) clearTimeout(this.timer);
            removeFeature();
            stop();
        });
    }
}

/** Reads the category field a series binds to, falling back to the documented default. */
function categoryFieldOf(props: Record<string, unknown>): string {
    const field = props['categoryXField'] ?? props['categoryYField'] ?? props['categoryField'];

    return typeof field === 'string' ? field : 'category';
}

/** Reads the value field a series binds to, falling back to the documented default. */
function valueFieldOf(props: Record<string, unknown>): string {
    const field = props['valueYField'] ?? props['valueXField'] ?? props['valueField'];

    return typeof field === 'string' ? field : 'value';
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/** Runs a callback whenever the chart's hover changes. */
function watchHover(context: ChartContext, onChange: (hover: HoverState | null) => void): () => void {
    const ref: EffectRef = effect(() => {
        const hover = context.hover();

        onChange(hover);
    });

    return () => ref.destroy();
}
