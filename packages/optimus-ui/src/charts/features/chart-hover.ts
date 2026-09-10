/**
 * ChartHover: the shared hover treatment.
 *
 * Without this part a chart still tracks the pointer -- the tooltip and the crosshair need it --
 * but no mark changes appearance. That split is deliberate: brightening is a visual decision an
 * author opts into, while knowing what the pointer is over is infrastructure.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import type { ChartHoverProps, HoverClickContext } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';

/**
 * Applies a visual treatment to the hovered mark.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-hover',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' }
})
export class ChartHover {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Brightness multiplier on the hovered item, where 1 is no change. Ignored once
     * `backgroundColor` is set.
     * @defaultValue 1.1
     * @group Props
     */
    readonly brightness = input(1.1, { transform: numberAttribute });
    /**
     * Opacity of the non-hovered items while something is hovered, from 0 to 1. At 1 nothing fades,
     * which is the default: fading everything else on every pointer move makes a dense chart
     * flicker, so dimming is something you ask for.
     * @defaultValue 1
     * @group Props
     */
    readonly dimOpacity = input(1, { transform: numberAttribute });
    /**
     * Pop-out distance in pixels: it slides pie slices out of the centre and lifts bars upward.
     * @defaultValue 0
     * @group Props
     */
    readonly offset = input(0, { transform: numberAttribute });
    /**
     * Scale multiplier on the hovered item.
     * @defaultValue 1
     * @group Props
     */
    readonly scale = input(1, { transform: numberAttribute });
    /**
     * Marker radius multiplier on hover, for line, scatter and radar points. A per-series
     * `hoverPointRadius`, being absolute pixels, overrides it.
     * @defaultValue 1.3
     * @group Props
     */
    readonly radiusMultiplier = input(1.3, { transform: numberAttribute });
    /**
     * Override fill colour on hover, replacing the item's colour rather than adjusting brightness.
     * @group Props
     */
    readonly backgroundColor = input<string | undefined>(undefined);
    /**
     * Border stroke colour on hover.
     * @group Props
     */
    readonly borderColor = input<string | undefined>(undefined);
    /**
     * Border stroke width on hover.
     * @group Props
     */
    readonly borderStrokeWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Border dash pattern on hover.
     * @group Props
     */
    readonly borderDash = input<number[] | undefined>(undefined);
    /**
     * Offset into the border dash pattern.
     * @group Props
     */
    readonly borderDashOffset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Click handler for the data elements. Left unset, a click does nothing; use the legend to
     * toggle visibility.
     * @group Props
     */
    readonly onClick = input<((context: HoverClickContext) => void) | undefined>(undefined);

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartHoverProps>(() => ({
        brightness: this.brightness(),
        dimOpacity: this.dimOpacity(),
        offset: this.offset(),
        scale: this.scale(),
        radiusMultiplier: this.radiusMultiplier(),
        backgroundColor: this.backgroundColor(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        onClick: this.onClick()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'hover', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
