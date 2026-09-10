/**
 * Declarative data: `ChartItem` and `ChartTreemapGroup`.
 *
 * A `data` array is the right answer whenever the data comes from somewhere. Inline items are for
 * when it does not -- a five-bar NPS breakdown, a hand-written budget tree -- and writing those as
 * a class field just to bind it back into the template is ceremony.
 *
 * An item carries the canonical field names, so a series' own accessors keep working: the emitted
 * datum spells its value as `valueY`, `value` *and* `y`, which is what lets one item element feed a
 * bar, a line and a scatter without the author restating which field is which.
 */
import { DestroyRef, Directive, InjectionToken, computed, inject, input, numberAttribute, signal, type Signal } from '@angular/core';
import type { BorderRadius, ChartItemProps, TreemapGroupProps } from '@openng/optimus-ui/types/charts';
import { CHART_ITEM_HOST, type ItemHost } from '../charts-registry';

/** One registered item, as the host holds it. */
type ItemProps = Record<string, unknown>;

/** What a series gets for hosting inline items. */
export interface ItemRegistry {
    /**
     * The rows the items add up to, or `undefined` when there are none -- so a series can fall back
     * to its `data` input without having to tell an empty array apart from an absent one.
     */
    data: Signal<ItemProps[] | undefined>;
    /**
     * Field names for the per-item properties that at least one item actually set.
     *
     * A series is handed these as its accessor defaults, which is what makes `<p-chart-item
     * color="…" />` take effect: the series was given no `color` of its own, so the item's field
     * becomes the accessor. An item cannot override a colour the series states explicitly, and
     * should not -- the series is the more general statement and the author wrote it on purpose.
     */
    overrides: Signal<{ color?: string; opacity?: string; borderColor?: string; borderRadius?: string; borderStrokeWidth?: string }>;
    /**
     * Whether the items form a hierarchy, which only `ChartTreemapGroup` produces.
     */
    hierarchical: Signal<boolean>;
    /**
     * Registers an item and returns the function that removes it.
     */
    registerItem: ItemHost['registerItem'];
}

/** The per-item properties a series can pick up as accessor defaults. */
const OVERRIDABLE = ['color', 'opacity', 'borderColor', 'borderRadius', 'borderStrokeWidth'] as const;

/**
 * Builds the registry a series provides to its `ChartItem` children.
 *
 * Registration order is document order, which is what makes the items read like the chart: the
 * first element written is the first bar drawn.
 */
export function createItemRegistry(): ItemRegistry {
    const registered = signal<readonly Signal<ItemProps>[]>([]);

    const rows = computed(() => {
        const entries = registered();

        if (entries.length === 0) return undefined;

        return entries.map((entry) => entry());
    });

    return {
        data: rows,
        overrides: computed(() => {
            const entries = rows() ?? [];
            const found: Record<string, string> = {};

            for (const name of OVERRIDABLE) {
                if (entries.some((row) => row[name] != null)) found[name] = name;
            }

            return found;
        }),
        hierarchical: computed(() => (rows() ?? []).some((row) => row['nodeId'] != null)),
        registerItem: (props) => {
            registered.update((list) => [...list, props]);

            return () => registered.update((list) => list.filter((entry) => entry !== props));
        }
    };
}

/** Mints an id for a declarative treemap group. */
let groupCounter = 0;

/**
 * The id a `ChartTreemapGroup` publishes to the items inside it.
 *
 * A separate token from the item host because the two are different relationships: the group hosts
 * the items *and* is itself an item of the treemap, and one token cannot carry both.
 */
export const TREEMAP_GROUP_ID = new InjectionToken<string>('TREEMAP_GROUP_ID');

/**
 * One inline data point.
 *
 * Goes inside any series, and inside `ChartTreemapGroup` for a treemap leaf.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-item',
    standalone: true,
    host: { style: 'display: none' }
})
export class ChartItem {
    private readonly host = inject(CHART_ITEM_HOST, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * X axis category.
     * @group Props
     */
    readonly categoryX = input<string | undefined>(undefined);
    /**
     * Y axis category, for a horizontal series.
     * @group Props
     */
    readonly categoryY = input<string | undefined>(undefined);
    /**
     * X axis numeric value.
     * @group Props
     */
    readonly valueX = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Y axis numeric value.
     * @group Props
     */
    readonly valueY = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * The value, for a series with one: a slice, a cell, a treemap leaf.
     * @group Props
     */
    readonly value = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * The category, for a series with one dimension of them.
     * @group Props
     */
    readonly category = input<string | undefined>(undefined);
    /**
     * Opening price, or the base of a floating bar.
     * @group Props
     */
    readonly open = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Highest price.
     * @group Props
     */
    readonly high = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Lowest price.
     * @group Props
     */
    readonly low = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Closing price.
     * @group Props
     */
    readonly close = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Bubble size.
     * @group Props
     */
    readonly size = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Per-item colour, which applies when the series was given none.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Per-item opacity.
     * @group Props
     */
    readonly opacity = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Per-item corner radius.
     * @group Props
     */
    readonly borderRadius = input<BorderRadius | undefined>(undefined);
    /**
     * Per-item border colour.
     * @group Props
     */
    readonly borderColor = input<string | undefined>(undefined);
    /**
     * Per-item border stroke width.
     * @group Props
     */
    readonly borderStrokeWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

    /** The parent group's id, when this item sits inside a `ChartTreemapGroup`. */
    private readonly group = inject(TREEMAP_GROUP_ID, { optional: true });

    /**
     * The datum this item stands for.
     *
     * Every canonical spelling of a value is emitted, so a series' default field name finds it
     * whichever family the series belongs to. It costs a few keys per row and removes the need for
     * an item to know what it has been placed inside.
     */
    readonly props = computed<ItemProps>(() => {
        const value = this.value() ?? this.valueY();
        const category = this.category() ?? this.categoryX() ?? this.categoryY();

        return prune({
            categoryX: this.categoryX(),
            categoryY: this.categoryY(),
            valueX: this.valueX(),
            valueY: this.valueY(),
            value,
            category,
            x: this.valueX(),
            y: value,
            row: this.categoryY(),
            open: this.open(),
            high: this.high(),
            low: this.low(),
            close: this.close(),
            size: this.size(),
            color: this.color(),
            opacity: this.opacity(),
            borderRadius: this.borderRadius(),
            borderColor: this.borderColor(),
            borderStrokeWidth: this.borderStrokeWidth(),
            // Present only inside a group, which is what makes the hierarchy declarative rather
            // than something the treemap has to infer from nesting it cannot see.
            parentId: this.group ?? undefined,
            nodeId: this.group ? `${this.group}:${category ?? ''}` : undefined
        });
    });

    constructor() {
        if (!this.host) return;

        const remove = this.host.registerItem(this.props);

        this.destroyRef.onDestroy(remove);
    }
}

/**
 * A declarative treemap parent, with `ChartItem` leaves inside it.
 *
 * @group Components
 */
@Directive({
    selector: 'p-chart-treemap-group',
    standalone: true,
    host: { style: 'display: none' },
    providers: [
        { provide: TREEMAP_GROUP_ID, useFactory: () => inject(ChartTreemapGroup).nodeId },
        { provide: CHART_ITEM_HOST, useExisting: ChartTreemapGroup }
    ]
})
export class ChartTreemapGroup implements ItemHost {
    private readonly host = inject(CHART_ITEM_HOST, { optional: true, skipSelf: true });

    private readonly destroyRef = inject(DestroyRef);

    /** This group's node id, which its children report as their parent. */
    readonly nodeId = `treemap-group-${(groupCounter += 1)}`;

    private readonly children = signal<readonly Signal<ItemProps>[]>([]);

    /**
     * Group header label.
     * @group Props
     */
    readonly label = input<string | undefined>(undefined);
    /**
     * Group colour, used for the header and for tinting the child cells.
     * @group Props
     */
    readonly color = input<string | undefined>(undefined);
    /**
     * Group opacity.
     * @group Props
     */
    readonly opacity = input<number | undefined, unknown>(undefined, { transform: optionalNumber });

    /** The group's own row, which is the parent the leaves attach to. */
    readonly props = computed<ItemProps>(() =>
        prune({
            nodeId: this.nodeId,
            category: this.label(),
            label: this.label(),
            color: this.color(),
            opacity: this.opacity(),
            // A parent's value is the sum of its children, so it deliberately carries none of its
            // own: stating one would let the header disagree with the cells inside it.
            value: undefined
        })
    );

    /**
     * Registers a child leaf.
     *
     * The group passes its children straight up to the treemap rather than holding them: the
     * treemap lays out one flat adjacency list, and the nesting is already carried by `parentId`.
     */
    registerItem(props: Signal<ItemProps>): () => void {
        this.children.update((list) => [...list, props]);

        const remove = this.host?.registerItem(props);

        return () => {
            this.children.update((list) => list.filter((entry) => entry !== props));
            remove?.();
        };
    }

    constructor() {
        if (!this.host) return;

        const remove = this.host.registerItem(this.props);

        this.destroyRef.onDestroy(remove);
    }
}

/** Drops the keys nothing was given, so a datum has only the fields it actually carries. */
function prune(row: Record<string, unknown>): ItemProps {
    const out: ItemProps = {};

    for (const [key, value] of Object.entries(row)) {
        if (value !== undefined) out[key] = value;
    }

    return out;
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}
