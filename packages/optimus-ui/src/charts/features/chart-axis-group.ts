/**
 * ChartAxisGroup and ChartAxisCategory.
 *
 * A category axis often has structure the categories themselves do not carry: twelve months are
 * four quarters, twenty cities are three regions. A group says so, and the axis draws a second row
 * of labels under the ticks.
 *
 * Membership can be stated either way -- a `categories` array or nested `ChartAxisCategory`
 * children -- because both read well in different situations: an array when the grouping comes from
 * data the author already has, elements when it is written out by hand. The input wins when both
 * are present, since it is the more explicit of the two.
 */
import { DestroyRef, Directive, InjectionToken, computed, inject, input, signal, type Signal } from '@angular/core';
import type { AxisGroupRenderContext, BracketStyle, ChartAxisCategoryProps, ChartAxisGroupProps, PartitionFillStyle, PartitionLabelStyle, SeparatorStyle } from '@openng/optimus-ui/types/charts';
import { CHART_AXIS_GROUP_HOST, type AxisGroupHost } from '../charts-registry';

/** How deep a nested `ChartAxisGroup` sits, counted from the outermost. */
export const AXIS_GROUP_DEPTH = new InjectionToken<number>('AXIS_GROUP_DEPTH');

/** What a `ChartAxisCategory` registers its value with. */
export interface AxisGroupMembers {
    add: (value: Signal<string | number | undefined>) => () => void;
}

/** The collector a group provides to its category children. */
export const AXIS_GROUP_MEMBERS = new InjectionToken<AxisGroupMembers>('AXIS_GROUP_MEMBERS');

/**
 * One category, or one bound of a value range, inside a group.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-axis-category',
    standalone: true,
    host: { style: 'display: none' }
})
export class ChartAxisCategory {
    private readonly group = inject(AXIS_GROUP_MEMBERS, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * The category, or one end of a numeric range.
     * @group Props
     */
    readonly value = input<string | number | undefined>(undefined);

    /** The part's current inputs. */
    readonly props = computed<ChartAxisCategoryProps>(() => ({ value: this.value() }));

    constructor() {
        if (!this.group) return;

        const remove = this.group.add(computed(() => this.value()));

        this.destroyRef.onDestroy(remove);
    }
}

/**
 * A header spanning several categories on an axis.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-axis-group',
    standalone: true,
    host: { style: 'display: none' },
    providers: [
        { provide: AXIS_GROUP_MEMBERS, useFactory: () => inject(ChartAxisGroup).members },
        { provide: CHART_AXIS_GROUP_HOST, useExisting: ChartAxisGroup },
        // Nesting deepens the level, which is how multi-level grouping is expressed without a
        // `depth` input the author would have to keep consistent by hand.
        { provide: AXIS_GROUP_DEPTH, useFactory: () => (inject(AXIS_GROUP_DEPTH, { optional: true, skipSelf: true }) ?? -1) + 1 }
    ]
})
export class ChartAxisGroup implements AxisGroupHost {
    private readonly host = inject(CHART_AXIS_GROUP_HOST, { optional: true, skipSelf: true });

    private readonly destroyRef = inject(DestroyRef);

    /** How deep this group sits, counted from the outermost. */
    readonly depth = inject(AXIS_GROUP_DEPTH, { optional: true }) ?? 0;

    private readonly registered = signal<readonly Signal<string | number | undefined>[]>([]);

    /** @internal The collector its `ChartAxisCategory` children register with. */
    readonly members = {
        add: (value: Signal<string | number | undefined>) => {
            this.registered.update((list) => [...list, value]);

            return () => this.registered.update((list) => list.filter((entry) => entry !== value));
        }
    };

    /**
     * Group header label.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * The categories this group spans. Takes precedence over nested children.
     * @group Props
     */
    readonly categories = input<string[] | undefined>(undefined);
    /**
     * The value range this group spans, on a value axis.
     * @group Props
     */
    readonly range = input<[number, number] | undefined>(undefined);
    /**
     * Font and colour for this group's label.
     * @group Props
     */
    readonly labelStyle = input<PartitionLabelStyle | undefined>(undefined);
    /**
     * A bracket line under the group label.
     * @group Props
     */
    readonly bracket = input<boolean | BracketStyle | undefined>(undefined);
    /**
     * A separator at the group's boundaries.
     * @group Props
     */
    readonly separator = input<boolean | SeparatorStyle | undefined>(undefined);
    /**
     * An alternating background fill over the group's region.
     * @group Props
     */
    readonly fill = input<boolean | PartitionFillStyle | undefined>(undefined);
    /**
     * Separators between the individual ticks inside the group.
     * @group Props
     */
    readonly tickSeparator = input<boolean | SeparatorStyle | undefined>(undefined);
    /**
     * Custom label renderer.
     * @group Props
     */
    readonly render = input<((context: AxisGroupRenderContext) => unknown) | undefined>(undefined);

    /**
     * The group's current inputs, with membership resolved.
     *
     * Two numeric children are read as a range rather than as two categories, which is what the
     * documented equivalence asks for: `[from, to]` and a pair of numeric `ChartAxisCategory`
     * children mean the same thing.
     */
    readonly props = computed<ChartAxisGroupProps>(() => {
        const declared = this.registered().map((entry) => entry());
        const numeric = declared.filter((value): value is number => typeof value === 'number');

        return {
            label: this.label(),
            categories: this.categories() ?? (numeric.length === declared.length && declared.length > 0 ? undefined : declared.map((value) => String(value ?? ''))),
            range: this.range() ?? (numeric.length === 2 && declared.length === 2 ? ([Math.min(...numeric), Math.max(...numeric)] as [number, number]) : undefined),
            labelStyle: this.labelStyle(),
            bracket: this.bracket(),
            separator: this.separator(),
            fill: this.fill(),
            tickSeparator: this.tickSeparator(),
            render: this.render()
        };
    });

    /** @internal Passes a nested group up to the axis, with its own depth. */
    registerGroup(props: Signal<Record<string, unknown>>, depth: number): () => void {
        return this.host?.registerGroup(props, depth) ?? (() => undefined);
    }

    constructor() {
        if (!this.host) return;

        const remove = this.host.registerGroup(this.props as Signal<Record<string, unknown>>, this.depth);

        this.destroyRef.onDestroy(remove);
    }
}
