/**
 * ChartTitle and ChartCaption.
 *
 * Both are real DOM rather than painted text, for the same reason the legend is: a title is the
 * chart's heading, and a heading that a screen reader cannot read and a user cannot select is not
 * one. Painting it into a canvas would take away both.
 *
 * They are one file because the caption's default placement is defined in terms of the title's --
 * "stacks adjacent to `ChartTitle`" -- and that coupling is better stated once than reconstructed
 * from two places.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, Directive, ElementRef, Injectable, ViewEncapsulation, booleanAttribute, computed, effect, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import type { Alignment, BlockPadding, ChartCaptionProps, ChartTitleProps, FontWeight } from '@openng/optimus-ui/types/charts';
import { TIER_FONT_SIZES, responsiveTier } from '../core/layout';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * The coupling between the title and the caption.
 *
 * The caption needs the title's height to sit under it, and the two are siblings rather than parent
 * and child, so neither can reach the other through the injector on its own. Providing this on the
 * chart root gives them exactly one shared thing and nothing more.
 */
@Injectable()
export class ChartTextStack {
    /** The title's measured height, or zero when there is no title. */
    readonly titleHeight = signal(0);

    /** Which edge the title took. */
    readonly titleEdge = signal<'top' | 'bottom'>('top');

    /** The title's alignment, which the caption inherits when it has none of its own. */
    readonly titleAlignment = signal<Alignment>('center');
}

/**
 * Auto-adaptive font sizing.
 *
 * With no `fontSize` given the text scales with the container, because a 17px title on a 280px
 * sparkline is most of the chart.
 */
function adaptiveSize(width: number, kind: 'title' | 'caption'): number {
    return TIER_FONT_SIZES[responsiveTier(width)][kind];
}

/** Resolves the block padding shorthand into the two edges it stands for. */
function resolvePadding(padding: BlockPadding | undefined, fallback: number): { top: number; bottom: number } {
    if (padding == null) return { top: fallback, bottom: fallback };
    if (typeof padding === 'number') return { top: padding, bottom: padding };

    return { top: padding.top ?? fallback, bottom: padding.bottom ?? fallback };
}

/** What the title and the caption share. */
@Directive({ standalone: true })
export abstract class ChartTextBlockBase {
    protected readonly context = inject(CHART_CONTEXT, { optional: true });

    protected readonly stack = inject(ChartTextStack, { optional: true });

    protected readonly destroyRef = inject(DestroyRef);

    protected readonly element = viewChild<ElementRef<HTMLElement>>('block');

    /** The block's own measured height, which is what it reserves. */
    protected readonly measured = signal(0);

    /**
     * The text.
     * @group Props
     */
    readonly text = input.required<string>();
    /**
     * Font size in pixels. Omit for the responsive auto-scaling.
     * @group Props
     */
    readonly fontSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Font family.
     * @group Props
     */
    readonly fontFamily = input<string | undefined>(undefined);
    /**
     * Font style.
     * @defaultValue 'normal'
     * @group Props
     */
    readonly fontStyle = input<'normal' | 'italic'>('normal');
    /**
     * Line height multiplier applied to the font size.
     * @defaultValue 1.2
     * @group Props
     */
    readonly lineHeight = input(1.2, { transform: numberAttribute });
    /**
     * Text colour.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Space above and below.
     * @group Props
     */
    readonly padding = input<BlockPadding | undefined>(undefined);
    /**
     * Horizontal offset in pixels, applied after alignment.
     * @group Props
     */
    readonly offsetX = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Vertical offset in pixels.
     * @group Props
     */
    readonly offsetY = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

    /** Which kind of block this is, which drives the adaptive size and the default weight. */
    protected abstract readonly kind: 'title' | 'caption';

    /** The edge the block sits on. */
    protected abstract edge(): 'top' | 'bottom';

    /** The horizontal alignment in force. */
    protected abstract alignment(): Alignment;

    /** The resolved font size, adaptive unless one was set. */
    protected readonly resolvedSize = computed(() => this.fontSize() ?? adaptiveSize(this.context?.width() ?? 0, this.kind));

    /** The resolved padding. */
    protected readonly resolvedPadding = computed(() => resolvePadding(this.padding(), this.kind === 'title' ? 8 : 4));

    /** Measures the block so the layout can reserve exactly what it takes. */
    protected observeSize(): void {
        effect((onCleanup) => {
            const element = this.element()?.nativeElement;

            if (!element || typeof ResizeObserver === 'undefined') return;

            const observer = new ResizeObserver((entries) => {
                const height = entries[0]?.contentRect.height;

                if (height == null) return;
                // Sub-pixel noise would otherwise re-run the whole layout on every scroll.
                if (Math.abs(this.measured() - height) < 0.5) return;

                this.measured.set(height);
            });

            observer.observe(element);
            this.measured.set(element.offsetHeight);

            onCleanup(() => observer.disconnect());
        });
    }

    /** The block's own box in the overlay layer. */
    protected blockStyle(offsetTop: number): Record<string, string | null> {
        const edge = this.edge();
        const align = this.alignment();
        const padding = this.resolvedPadding();
        const size = this.resolvedSize();

        return {
            position: 'absolute',
            left: '0',
            right: '0',
            top: edge === 'top' ? `${offsetTop + (this.offsetY() ?? 0)}px` : null,
            bottom: edge === 'bottom' ? `${offsetTop - (this.offsetY() ?? 0)}px` : null,
            display: 'flex',
            'justify-content': align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center',
            'padding-top': `${padding.top}px`,
            'padding-bottom': `${padding.bottom}px`,
            'padding-left': this.offsetX() != null && align !== 'end' ? `${this.offsetX()}px` : null,
            'padding-right': this.offsetX() != null && align === 'end' ? `${this.offsetX()}px` : null,
            'font-size': `${size}px`,
            'line-height': String(this.lineHeight()),
            'font-family': this.fontFamily() ?? this.context?.fontFamily() ?? null,
            'font-style': this.fontStyle(),
            'pointer-events': 'none'
        };
    }
}

/**
 * A heading above or below the chart.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-title',
    standalone: true,
    template: `
        <div #block class="p-chart-title" data-slot="chart-title" role="heading" aria-level="3" [style]="style()" [style.font-weight]="fontWeight()" [style.color]="resolvedColor()">
            <span>{{ text() }}</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-title-host' }
})
export class ChartTitle extends ChartTextBlockBase {
    protected readonly kind = 'title' as const;

    /**
     * Placement relative to the chart.
     * @defaultValue 'top'
     * @group Props
     */
    readonly position = input<'top' | 'bottom'>('top');
    /**
     * Horizontal alignment within the title area.
     * @defaultValue 'center'
     * @group Props
     */
    readonly alignmentInput = input<Alignment>('center', { alias: 'alignment' });
    /**
     * Font weight.
     * @defaultValue 600
     * @group Props
     */
    readonly fontWeight = input<FontWeight>(600);
    /**
     * Overlay the title on the chart instead of reducing the plot area.
     * @defaultValue false
     * @group Props
     */
    readonly floating = input(false, { transform: booleanAttribute });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartTitleProps>(() => ({
        text: this.text(),
        position: this.position(),
        alignment: this.alignmentInput(),
        fontSize: this.fontSize(),
        fontWeight: this.fontWeight(),
        fontFamily: this.fontFamily(),
        fontStyle: this.fontStyle(),
        lineHeight: this.lineHeight(),
        color: this.color(),
        padding: this.padding(),
        floating: this.floating(),
        offsetX: this.offsetX(),
        offsetY: this.offsetY()
    }));

    protected readonly resolvedColor = computed(() => this.color() ?? this.context?.theme().titleColor ?? null);

    protected readonly style = computed(() => this.blockStyle(0));

    protected edge(): 'top' | 'bottom' {
        return this.position();
    }

    protected alignment(): Alignment {
        return this.alignmentInput();
    }

    constructor() {
        super();
        this.observeSize();

        // The caption stacks under the title, so the title has to publish where it ended up and how
        // tall it turned out to be.
        effect(() => {
            this.stack?.titleHeight.set(this.floating() ? 0 : this.measured());
            this.stack?.titleEdge.set(this.position());
            this.stack?.titleAlignment.set(this.alignmentInput());
        });

        if (!this.context) return;

        const removeFeature = this.context.registerFeature({ type: 'title', props: this.props });
        // A floating title overlays the chart, so it reserves nothing: that is the whole difference
        // between floating and not.
        const releaseSpace = this.context.reserve(computed(() => ({ edge: this.position(), size: this.floating() ? 0 : this.measured() })));

        this.destroyRef.onDestroy(() => {
            removeFeature();
            releaseSpace();
            this.stack?.titleHeight.set(0);
        });
    }
}

/**
 * A subheading, stacked with the title unless placed on its own edge.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-caption',
    standalone: true,
    template: `
        <div #block class="p-chart-caption" data-slot="chart-caption" [style]="style()" [style.font-weight]="fontWeight()" [style.color]="resolvedColor()">
            <span>{{ text() }}</span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-caption-host' }
})
export class ChartCaption extends ChartTextBlockBase {
    protected readonly kind = 'caption' as const;

    /**
     * Placement relative to the chart. Omit to stack adjacent to the title; set it to place the
     * caption on the opposite edge.
     * @group Props
     */
    readonly position = input<'top' | 'bottom' | undefined>(undefined);
    /**
     * Horizontal alignment. Inherits the title's when unset.
     * @group Props
     */
    readonly alignmentInput = input<Alignment | undefined>(undefined, { alias: 'alignment' });
    /**
     * Font weight.
     * @defaultValue 'normal'
     * @group Props
     */
    readonly fontWeight = input<FontWeight>('normal');

    /** The feature's current inputs. */
    readonly props = computed<ChartCaptionProps>(() => ({
        text: this.text(),
        position: this.position(),
        alignment: this.alignmentInput(),
        fontSize: this.fontSize(),
        fontWeight: this.fontWeight(),
        fontFamily: this.fontFamily(),
        fontStyle: this.fontStyle(),
        lineHeight: this.lineHeight(),
        color: this.color(),
        padding: this.padding(),
        offsetX: this.offsetX(),
        offsetY: this.offsetY()
    }));

    protected readonly resolvedColor = computed(() => this.color() ?? this.context?.theme().captionColor ?? this.context?.theme().tickLabel ?? null);

    /**
     * How far in from its edge the caption sits.
     *
     * Zero unless it shares the edge with the title, in which case it clears the title's height --
     * which is what "stacks adjacent" means in pixels.
     */
    protected readonly offsetFromEdge = computed(() => (this.edge() === this.stack?.titleEdge() ? (this.stack?.titleHeight() ?? 0) : 0));

    protected readonly style = computed(() => this.blockStyle(this.offsetFromEdge()));

    protected edge(): 'top' | 'bottom' {
        return this.position() ?? this.stack?.titleEdge() ?? 'top';
    }

    protected alignment(): Alignment {
        return this.alignmentInput() ?? this.stack?.titleAlignment() ?? 'center';
    }

    constructor() {
        super();
        this.observeSize();

        if (!this.context) return;

        const removeFeature = this.context.registerFeature({ type: 'caption', props: this.props });
        const releaseSpace = this.context.reserve(computed(() => ({ edge: this.edge(), size: this.measured() })));

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
