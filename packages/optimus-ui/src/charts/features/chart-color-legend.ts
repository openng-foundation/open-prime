/**
 * ChartColorLegend.
 *
 * A heatmap has no value axis: the colour *is* the value axis, so this is the only thing that makes
 * one readable. It resolves its scale from the chart rather than being told it -- a legend that had
 * to repeat the heatmap's own `colorScale` would be one edit away from lying about the data.
 *
 * With nothing to resolve it renders nothing, which is why it is safe to leave in a template whose
 * series changes.
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { ChartColorLegendProps, ColorLegendRenderContext, Position } from '@openng/optimus-ui/types/charts';
import { readPath } from '../core/accessor';
import { evenStops, interpolateScale, resolveColorScale } from '../core/color';
import { formatNumberTick } from '../core/format';
import { DEFAULT_HEAT_RANGE } from '../core/palette';
import { CHART_CONTEXT } from '../charts-registry';
import { ChartColorLegendDef } from './chart-defs';

/** The scale the legend resolved, whether from the chart or from its own inputs. */
interface ResolvedScale {
    scale: number[];
    range: string[];
    min: number;
    max: number;
}

/**
 * Shows the value-to-colour ramp of a heatmap or a value-coloured treemap.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-color-legend',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (resolved(); as scale) {
            <div class="p-chart-color-legend" data-slot="chart-color-legend" [attr.data-position]="position()" [style]="rootStyle()">
                @if (barDef()) {
                    <ng-container [ngTemplateOutlet]="barDef()!.template" [ngTemplateOutletContext]="{ $implicit: renderContext(), ctx: renderContext() }" />
                } @else {
                    <div class="p-chart-color-legend-bar" data-slot="chart-color-legend-bar" [style]="barStyle()">
                        @if (showIndicator() && indicator() !== null) {
                            <span class="p-chart-color-legend-indicator" data-slot="chart-color-legend-indicator" [style]="indicatorStyle()"></span>
                        }
                    </div>
                    <div class="p-chart-color-legend-labels" data-slot="chart-color-legend-labels" [style]="labelsStyle()">
                        @for (label of labels(); track $index) {
                            <span class="p-chart-color-legend-label">{{ label }}</span>
                        }
                    </div>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-color-legend-host' }
})
export class ChartColorLegend {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** A projected template that replaces the gradient bar. */
    readonly barDef = contentChild(ChartColorLegendDef);

    /**
     * Legend placement relative to the chart.
     * @defaultValue 'bottom'
     * @group Props
     */
    readonly position = input<Position>('bottom');
    /**
     * Value breakpoints for the gradient. Auto-detected from the chart when unset.
     * @group Props
     */
    readonly colorScale = input<number[] | undefined>(undefined);
    /**
     * Colours mapped to the breakpoints.
     * @group Props
     */
    readonly colorRange = input<string[] | undefined>(undefined);
    /**
     * Number of value labels along the bar.
     * @defaultValue 3
     * @group Props
     */
    readonly ticks = input(3, { transform: numberAttribute });
    /**
     * Custom formatter for the tick labels.
     * @group Props
     */
    readonly formatLabel = input<((value: number) => string) | undefined>(undefined);
    /**
     * Number of discrete colour blocks. Omit for a smooth gradient.
     * @group Props
     */
    readonly steps = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Width of the gradient bar in pixels.
     * @defaultValue 16
     * @group Props
     */
    readonly width = input(16, { transform: numberAttribute });
    /**
     * Height of the gradient bar in pixels.
     * @defaultValue 12
     * @group Props
     */
    readonly height = input(12, { transform: numberAttribute });
    /**
     * Corner radius of the gradient bar.
     * @defaultValue 4
     * @group Props
     */
    readonly borderRadius = input(4, { transform: numberAttribute });
    /**
     * Font size of the tick labels.
     * @defaultValue 11
     * @group Props
     */
    readonly labelSize = input(11, { transform: numberAttribute });
    /**
     * Colour of the tick labels.
     * @defaultValue '#6b7280'
     * @group Props
     */
    readonly labelColor = input('#6b7280');
    /**
     * Show a value indicator that follows the hovered cell.
     * @defaultValue true
     * @group Props
     */
    readonly showIndicator = input(true, { transform: booleanAttribute });
    /**
     * Colour of the hover indicator.
     * @defaultValue '#374151'
     * @group Props
     */
    readonly indicatorColor = input('#374151');
    /**
     * Space reserved for the legend in the chart layout.
     * @defaultValue 36
     * @group Props
     */
    readonly reservedSize = input(36, { transform: numberAttribute });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartColorLegendProps>(() => ({
        position: this.position(),
        colorScale: this.colorScale(),
        colorRange: this.colorRange(),
        ticks: this.ticks(),
        formatLabel: this.formatLabel(),
        steps: this.steps(),
        width: this.width(),
        height: this.height(),
        borderRadius: this.borderRadius(),
        labelSize: this.labelSize(),
        labelColor: this.labelColor(),
        showIndicator: this.showIndicator(),
        indicatorColor: this.indicatorColor(),
        reservedSize: this.reservedSize()
    }));

    /** Whether the bar runs across or down. */
    protected readonly horizontal = computed(() => this.position() === 'top' || this.position() === 'bottom');

    /**
     * The resolved scale.
     *
     * Explicit inputs win, then the chart's own colour-carrying series. There is deliberately no
     * fallback to "some ramp over 0 to 1": a legend for a scale that does not exist would be a
     * legend for nothing.
     */
    protected readonly resolved = computed<ResolvedScale | null>(() => {
        const explicitScale = this.colorScale();
        const explicitRange = this.colorRange();

        if (explicitScale?.length && explicitRange?.length) {
            return { scale: explicitScale, range: explicitRange, min: explicitScale[0], max: explicitScale[explicitScale.length - 1] };
        }

        const source = this.sourceExtent();

        if (!source && !explicitRange?.length) return null;

        // A range with no scale gets the documented 0-to-100 domain when there is no series to take
        // one from.
        const min = explicitScale?.[0] ?? source?.min ?? 0;
        const max = explicitScale?.[explicitScale.length - 1] ?? source?.max ?? 100;
        const built = resolveColorScale({
            colorScale: explicitScale,
            colorRange: explicitRange ?? source?.range,
            min,
            max,
            fallbackRange: DEFAULT_HEAT_RANGE
        });

        return { scale: built.scale, range: built.range, min, max };
    });

    /**
     * The extent and range of whichever series carries a colour scale.
     *
     * A heatmap always does; a treemap only when `colorValueField` is set, because a treemap without
     * one encodes its values as area and has no colour ramp to explain.
     */
    private readonly sourceExtent = computed<{ min: number; max: number; range?: string[] } | null>(() => {
        for (const registration of this.context?.series() ?? []) {
            const props = registration.props() as Record<string, unknown>;

            if (registration.type === 'heatmap') {
                const field = typeof props['valueField'] === 'string' ? (props['valueField'] as string) : 'value';

                return { ...this.extentOf(props['data'], field, props['min'] as number | undefined, props['max'] as number | undefined), range: props['colorRange'] as string[] | undefined };
            }

            if (registration.type === 'treemap' && typeof props['colorValueField'] === 'string') {
                return { ...this.extentOf(props['data'], props['colorValueField'] as string, undefined, undefined), range: props['colorRange'] as string[] | undefined };
            }
        }

        return null;
    });

    /** The numeric extent of one field across a series' data. */
    private extentOf(data: unknown, field: string, explicitMin: number | undefined, explicitMax: number | undefined): { min: number; max: number } {
        let min = explicitMin ?? Number.POSITIVE_INFINITY;
        let max = explicitMax ?? Number.NEGATIVE_INFINITY;

        for (const datum of (data as unknown[] | undefined) ?? []) {
            const raw = readPath(datum, field);
            const value = typeof raw === 'number' ? raw : Number(raw);

            if (!Number.isFinite(value)) continue;
            if (explicitMin == null) min = Math.min(min, value);
            if (explicitMax == null) max = Math.max(max, value);
        }

        return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 1 };
    }

    /** The tick labels along the bar. */
    protected readonly labels = computed(() => {
        const scale = this.resolved();

        if (!scale) return [];

        const format = this.formatLabel();
        const locale = this.context?.locale();

        return evenStops(scale.min, scale.max, Math.max(this.ticks(), 2)).map((value) => (format ? format(value) : formatNumberTick(value, locale)));
    });

    /**
     * Where the hover indicator sits, as a fraction along the bar.
     *
     * `null` when nothing is hovered or the hovered mark carries no value, which is what keeps the
     * indicator from parking at zero whenever the pointer leaves the chart.
     */
    protected readonly indicator = computed<number | null>(() => {
        const hover = this.context?.hover();
        const scale = this.resolved();

        if (!hover || !scale) return null;

        const registration = this.context?.series().find((entry) => entry.id === hover.datasetId);

        if (!registration) return null;

        const props = registration.props() as Record<string, unknown>;
        const field = registration.type === 'treemap' ? ((props['colorValueField'] as string) ?? 'value') : typeof props['valueField'] === 'string' ? (props['valueField'] as string) : 'value';
        const datum = ((props['data'] as unknown[] | undefined) ?? [])[hover.index];
        const raw = readPath(datum, field);
        const value = typeof raw === 'number' ? raw : Number(raw);

        if (!Number.isFinite(value)) return null;

        const span = scale.max - scale.min || 1;

        return Math.min(Math.max((value - scale.min) / span, 0), 1);
    });

    /** The gradient the bar paints, discrete when `steps` was set. */
    protected readonly gradient = computed(() => {
        const scale = this.resolved();

        if (!scale) return 'transparent';

        const direction = this.horizontal() ? 'to right' : 'to top';
        const steps = this.steps();

        if (steps == null || steps < 2) {
            const span = scale.max - scale.min || 1;
            const stops = scale.scale.map((value, index) => `${scale.range[index] ?? scale.range[scale.range.length - 1]} ${(((value - scale.min) / span) * 100).toFixed(2)}%`);

            return `linear-gradient(${direction}, ${stops.join(', ')})`;
        }

        // Discrete blocks are hard stops on the same gradient rather than a row of elements, so the
        // bar keeps one border radius and one hit area.
        const blocks: string[] = [];

        for (let i = 0; i < steps; i++) {
            const value = scale.min + ((scale.max - scale.min) * (i + 0.5)) / steps;
            const color = interpolateScale(value, scale.scale, scale.range);

            blocks.push(`${color} ${((i / steps) * 100).toFixed(2)}%`, `${color} ${(((i + 1) / steps) * 100).toFixed(2)}%`);
        }

        return `linear-gradient(${direction}, ${blocks.join(', ')})`;
    });

    /** The context a custom bar template receives. */
    protected readonly renderContext = computed<ColorLegendRenderContext>(() => {
        const scale = this.resolved();
        const horizontal = this.horizontal();

        return {
            colorScale: scale?.scale ?? [],
            colorRange: scale?.range ?? [],
            labels: this.labels(),
            rect: { x: 0, y: 0, width: horizontal ? (this.context?.width() ?? 0) : this.width(), height: horizontal ? this.height() : (this.context?.height() ?? 0) },
            horizontal
        };
    });

    protected rootStyle(): Record<string, string | null> {
        const position = this.position();
        const horizontal = this.horizontal();

        return {
            position: 'absolute',
            display: 'flex',
            'flex-direction': horizontal ? 'column' : 'row',
            'align-items': 'center',
            gap: '4px',
            top: position === 'top' ? '0' : position === 'bottom' ? null : '50%',
            bottom: position === 'bottom' ? '0' : null,
            left: position === 'left' ? '0' : horizontal ? '50%' : null,
            right: position === 'right' ? '0' : null,
            transform: horizontal ? 'translateX(-50%)' : position === 'left' || position === 'right' ? 'translateY(-50%)' : null,
            'font-size': `${this.labelSize()}px`,
            color: this.labelColor(),
            'pointer-events': 'none'
        };
    }

    protected barStyle(): Record<string, string> {
        const horizontal = this.horizontal();

        return {
            position: 'relative',
            width: horizontal ? '160px' : `${this.width()}px`,
            height: horizontal ? `${this.height()}px` : '120px',
            'border-radius': `${this.borderRadius()}px`,
            background: this.gradient()
        };
    }

    protected labelsStyle(): Record<string, string> {
        const horizontal = this.horizontal();

        return {
            display: 'flex',
            'flex-direction': horizontal ? 'row' : 'column-reverse',
            'justify-content': 'space-between',
            width: horizontal ? '160px' : 'auto',
            height: horizontal ? 'auto' : '120px'
        };
    }

    protected indicatorStyle(): Record<string, string | null> {
        const fraction = this.indicator() ?? 0;
        const horizontal = this.horizontal();

        return {
            position: 'absolute',
            width: horizontal ? '2px' : '100%',
            height: horizontal ? '100%' : '2px',
            background: this.indicatorColor(),
            left: horizontal ? `${fraction * 100}%` : '0',
            bottom: horizontal ? null : `${fraction * 100}%`,
            top: horizontal ? '0' : null
        };
    }

    constructor() {
        if (!this.context) return;

        const removeFeature = this.context.registerFeature({ type: 'colorLegend', props: this.props });
        // The reserved band is fixed rather than measured: the legend's size follows its own inputs,
        // so there is nothing to measure that the inputs do not already say.
        const releaseSpace = this.context.reserve(computed(() => ({ edge: this.position(), size: this.resolved() ? this.reservedSize() : 0 })));

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
