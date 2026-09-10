/**
 * ChartDataLabels.
 *
 * Labels are opt-in and configuration-free at the point of use: the element's presence is what
 * turns them on, and its inputs are the only place their appearance is stated. There is no
 * `showDataLabels` on the series, which is what keeps a series' API about the data it draws.
 *
 * The component itself paints nothing. It registers, and the root's scene builder reads the
 * registration -- because labelling needs to see every series at once to resolve collisions, and a
 * component that only knows about itself cannot.
 */
import { Directive, DestroyRef, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import type { ChartDataLabelsProps, DataLabelContext, FieldAccessor, FillValue, FontWeight } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT } from '../charts-registry';
import { ChartDataLabelDef } from './chart-defs';

/**
 * Prints the value on each mark. Add it to turn labels on; remove it and they are gone.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-data-labels',
    standalone: true,
    host: { class: 'p-chart-data-labels-host' }
})
export class ChartDataLabels {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /** A projected template that replaces each label. SVG only. */
    readonly labelDef = contentChild(ChartDataLabelDef);

    /**
     * What to put in each label.
     * @defaultValue 'value'
     * @group Props
     */
    readonly display = input<'value' | 'percentage' | 'both' | 'none' | 'label' | 'label-percentage'>('value');
    /**
     * Custom label text, which overrides `display`. It receives the value, the percentage from 0 to
     * 100, the category label and the row datum.
     * @group Props
     */
    readonly formatter = input<((value: number, percentage?: number, label?: string, datum?: unknown) => string) | undefined>(undefined);
    /**
     * Label font size in pixels, per label when given an array, a callback or a field name.
     * @group Props
     */
    readonly fontSize = input<FieldAccessor<unknown, number> | undefined>(undefined);
    /**
     * Label font family.
     * @group Props
     */
    readonly fontFamily = input<string | undefined>(undefined);
    /**
     * Label font weight.
     * @defaultValue 'normal'
     * @group Props
     */
    readonly fontWeight = input<FontWeight>('normal');
    /**
     * Label text colour. Defaults to a colour contrasting with the mark the label sits on.
     * @group Props
     */
    readonly color = input<FieldAccessor<unknown, FillValue> | undefined>(undefined);
    /**
     * Line height multiplier.
     * @defaultValue 1.2
     * @group Props
     */
    readonly lineHeight = input(1.2, { transform: numberAttribute });
    /**
     * Custom label renderer, which replaces the default layout outright.
     * @group Props
     */
    readonly render = input<((context: DataLabelContext) => unknown) | undefined>(undefined);
    /**
     * Hide labels on slices or segments below this percentage. Pie, donut, polar and radar.
     * @defaultValue 5
     * @group Props
     */
    readonly minPercentage = input(5, { transform: numberAttribute });
    /**
     * Leader line style for the outside labels.
     * @defaultValue 'angled'
     * @group Props
     */
    readonly lineStyle = input<'angled' | 'straight' | 'none'>('angled');
    /**
     * Outside label alignment. `'labelLine'` puts the label at the line's end, `'edge'` aligns it
     * flush to the chart boundary.
     * @defaultValue 'labelLine'
     * @group Props
     */
    readonly alignTo = input<'labelLine' | 'edge'>('labelLine');
    /**
     * Gap between the slice edge and the start of the leader line.
     * @defaultValue 10
     * @group Props
     */
    readonly distance = input(10, { transform: numberAttribute });
    /**
     * Gap between the end of the leader line and the label text.
     * @defaultValue 4
     * @group Props
     */
    readonly textGap = input(4, { transform: numberAttribute });
    /**
     * Horizontal distance from the leader line's elbow to the text anchor.
     * @defaultValue 15
     * @group Props
     */
    readonly horizontalOffset = input(15, { transform: numberAttribute });
    /**
     * Outside-label connector stroke colour.
     * @group Props
     */
    readonly connectorColor = input<FieldAccessor<unknown, FillValue> | undefined>(undefined);
    /**
     * Outside-label connector stroke width in pixels.
     * @defaultValue 1
     * @group Props
     */
    readonly connectorWidth = input<FieldAccessor<unknown, number>>(1);
    /**
     * Gap between the slice edge and the start of the leader line. An alias of `distance`.
     * @group Props
     */
    readonly leaderOffset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Gap between the end of the leader line and the label text. An alias of `textGap`.
     * @group Props
     */
    readonly textOffset = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartDataLabelsProps>(() => ({
        display: this.display(),
        formatter: this.formatter(),
        fontSize: this.fontSize(),
        fontFamily: this.fontFamily(),
        fontWeight: this.fontWeight(),
        color: this.color(),
        lineHeight: this.lineHeight(),
        render: this.render(),
        minPercentage: this.minPercentage(),
        lineStyle: this.lineStyle(),
        alignTo: this.alignTo(),
        // The aliases win when set, because an author who wrote `leaderOffset` meant it and never
        // also wrote `distance`.
        distance: this.leaderOffset() ?? this.distance(),
        textGap: this.textOffset() ?? this.textGap(),
        horizontalOffset: this.horizontalOffset(),
        connectorColor: this.connectorColor(),
        connectorWidth: this.connectorWidth()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'dataLabels', props: this.props });

        this.destroyRef.onDestroy(remove);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
