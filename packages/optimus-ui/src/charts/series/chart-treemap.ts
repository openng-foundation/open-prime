/**
 * ChartTreemap: nested rectangles sized by value.
 *
 * A treemap has no axes at all -- position carries nothing and area carries the value -- which makes
 * the tiling algorithm the whole of the geometry.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, booleanAttribute, computed, contentChild, inject, input, numberAttribute, signal } from '@angular/core';
import type { BorderJoinStyle, DashAccessor, FieldAccessor, FillValue, TreemapCellContext, TreemapLevelConfig, TreemapSeriesProps } from '@openng/optimus-ui/types/charts';
import type { DrilldownContext } from '../charts-registry';
import { CHART_CONTEXT, CHART_DRILLDOWN, CHART_ITEM_HOST, nextDatasetId } from '../charts-registry';
import { createItemRegistry } from './chart-items';
import { ChartTreemapCellDef } from '../features/chart-defs';

/**
 * A treemap series.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-treemap',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { style: 'display: none' },
    providers: [
        { provide: CHART_ITEM_HOST, useExisting: ChartTreemap },
        { provide: CHART_DRILLDOWN, useExisting: ChartTreemap }
    ]
})
export class ChartTreemap<T = unknown> implements DrilldownContext {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * The levels drilled into, root excluded.
     *
     * The treemap holds it rather than the chart, because the hierarchy is the treemap's: a chart
     * with no treemap in it has nothing to drill.
     */
    private readonly drillPath = signal<readonly { id: string; label: string }[]>([]);

    /** @internal The trail, as `ChartBreadcrumb` reads it. */
    readonly path = this.drillPath.asReadonly();

    /** @internal What the root level is called. */
    readonly rootLabel$ = computed(() => this.rootLabel() ?? 'All');

    /**
     * @internal Drills to a level, or back to the root with `null`.
     *
     * Drilling to a level already in the path truncates back to it, which is what makes a
     * breadcrumb step work: clicking the second crumb of four means "go back there", not "go
     * deeper into it again".
     */
    drillTo(id: string | null): void {
        if (id == null) {
            this.drillPath.set([]);

            return;
        }

        this.drillPath.update((path) => {
            const at = path.findIndex((step) => step.id === id);

            return at >= 0 ? path.slice(0, at + 1) : path;
        });
        this.context?.requestRender();
    }

    /**
     * Inline `ChartItem` children, which stand in for a `data` array.
     *
     * `data` wins when both are present: an explicit array is the more deliberate statement, and
     * silently merging the two would make the order of the result depend on nothing visible.
     */
    protected readonly items = createItemRegistry();

    /** @internal Registers an inline item. Called through `CHART_ITEM_HOST`. */
    readonly registerItem = this.items.registerItem;

    /** A projected template that replaces the content of each cell. */
    readonly cellDef = contentChild(ChartTreemapCellDef);

    /**
     * Data array. Mutually exclusive with `ChartTreemapGroup` and `ChartItem` children.
     * @group Props
     */
    readonly data = input<T[] | undefined>(undefined);
    /**
     * Field name for the cell display label.
     * @defaultValue 'category'
     * @group Props
     */
    readonly categoryField = input<string | undefined>(undefined);
    /**
     * Field name for the numeric value that determines the cell area.
     * @defaultValue 'value'
     * @group Props
     */
    readonly valueField = input<string | undefined>(undefined);
    /**
     * Field name holding each item's own unique id. Pair it with `parentField` for a flat
     * adjacency-list hierarchy; without both, the data is read as a flat list.
     * @group Props
     */
    readonly nodeId = input<string | undefined>(undefined);
    /**
     * Field name holding each item's parent id.
     * @group Props
     */
    readonly parentField = input<string | undefined>(undefined);
    /**
     * Cell fill colour. An array cycles by group index.
     * @group Props
     */
    readonly color = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Cell fill opacity, from 0 to 1.
     * @defaultValue 1
     * @group Props
     */
    readonly opacity = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Field name for the numeric value that maps cells onto a colour gradient.
     * @group Props
     */
    readonly colorValueField = input<string | undefined>(undefined);
    /**
     * Multi-stop colour array. Without `colorScale`, the breakpoints come from the data extremes.
     * @group Props
     */
    readonly colorRange = input<string[] | undefined>(undefined);
    /**
     * Explicit breakpoints for the colour interpolation, one per `colorRange` stop.
     * @group Props
     */
    readonly colorScale = input<number[] | undefined>(undefined);
    /**
     * Cell border stroke colour.
     * @group Props
     */
    readonly borderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Cell border stroke width in pixels.
     * @group Props
     */
    readonly borderStrokeWidth = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Cell border dash pattern. Also accepts the named shortcuts.
     * @group Props
     */
    readonly borderDash = input<DashAccessor<T> | undefined>(undefined);
    /**
     * Cell border dash phase offset.
     * @group Props
     */
    readonly borderDashOffset = input<FieldAccessor<T, number> | undefined>(undefined);
    /**
     * Label text colour. Defaults to whichever of dark or light reads against the cell fill.
     * @group Props
     */
    readonly labelColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-cell fill colour on hover.
     * @group Props
     */
    readonly hoverColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Per-cell border colour on hover.
     * @group Props
     */
    readonly hoverBorderColor = input<FieldAccessor<T, FillValue> | undefined>(undefined);
    /**
     * Tiling algorithm. `squarify` keeps cells near square, which is what makes their areas
     * comparable; `slice` and `dice` cut along one axis only.
     * @defaultValue 'squarify'
     * @group Props
     */
    readonly layout = input<'squarify' | 'slice' | 'dice' | 'sliceDice'>('squarify');
    /**
     * Gap between sibling cells in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly spacing = input(2, { transform: numberAttribute });
    /**
     * Padding around parent container regions, in pixels.
     * @defaultValue 3
     * @group Props
     */
    readonly groupPadding = input(3, { transform: numberAttribute });
    /**
     * Per-depth styling overrides.
     * @group Props
     */
    readonly levels = input<TreemapLevelConfig[] | undefined>(undefined);
    /**
     * Corner radius of the cells, in pixels.
     * @defaultValue 2
     * @group Props
     */
    readonly borderRadius = input(2, { transform: numberAttribute });
    /**
     * Minimum cell dimension, in pixels, for the label to be drawn at all. A label clipped to a
     * cell too small for it is a fragment of a word, which is worse than no label.
     * @defaultValue 30
     * @group Props
     */
    readonly labelMinSize = input(30, { transform: numberAttribute });
    /**
     * Show the parent header labels. On by default once `parentField` is set.
     * @group Props
     */
    readonly showGroupLabel = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
    /**
     * Height of the parent header labels, in pixels.
     * @defaultValue 18
     * @group Props
     */
    readonly groupLabelHeight = input(18, { transform: numberAttribute });
    /**
     * Enable click-to-drill navigation into the parent groups.
     * @defaultValue false
     * @group Props
     */
    readonly drilldown = input(false, { transform: booleanAttribute });
    /**
     * `'nested'` keeps parent headers visible with children inside; `'flat'` draws parents as solid
     * cells you click to drill into.
     * @defaultValue 'nested'
     * @group Props
     */
    readonly drilldownMode = input<'nested' | 'flat'>('nested');
    /**
     * Top-level breadcrumb label.
     * @group Props
     */
    readonly rootLabel = input<string | undefined>(undefined);
    /**
     * In nested mode, hovering a leaf's label reports the leaf while hovering its background reports
     * the parent.
     * @defaultValue true
     * @group Props
     */
    readonly interactByLeaf = input(true, { transform: booleanAttribute });
    /**
     * Custom cell content renderer.
     * @group Props
     */
    readonly renderContent = input<((context: TreemapCellContext<T>) => unknown) | undefined>(undefined);
    /**
     * Dataset label, used in the tooltip.
     * @group Props
     */
    readonly name = input<string | undefined>(undefined);
    /**
     * Unique dataset identifier. Generated when unset.
     * @group Props
     */
    readonly id = input<string | undefined>(undefined);
    /**
     * Rendering z-order.
     * @group Props
     */
    readonly order = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Field that identifies a datum across updates, so an animation can follow a row rather than a
     * position.
     * @group Props
     */
    readonly keyField = input<string | undefined>(undefined);
    /**
     * Border alignment relative to the cell edge.
     * @group Props
     */
    readonly borderAlign = input<'center' | 'inner' | undefined>(undefined);
    /**
     * How border segments meet at a cell's corners.
     * @group Props
     */
    readonly borderJoinStyle = input<BorderJoinStyle | undefined>(undefined);

    /** The dataset id, generated once so it survives every input change. */
    readonly datasetId = this.id() ?? nextDatasetId('treemap');

    /** The series' current inputs, as the root reads them. */
    readonly props = computed<TreemapSeriesProps<T>>(() => ({
        // An inline item's datum is shaped by the item, not by `T`, which is why the cast is here
        // rather than in the registry: only the series knows what it declared `T` to be.
        data: this.data() ?? (this.items.data() as T[] | undefined),
        categoryField: this.categoryField(),
        valueField: this.valueField(),
        nodeId: this.nodeId() ?? (this.items.hierarchical() ? 'nodeId' : undefined),
        parentField: this.parentField() ?? (this.items.hierarchical() ? 'parentId' : undefined),
        color: this.color() ?? this.items.overrides().color,
        opacity: this.opacity(),
        colorValueField: this.colorValueField(),
        colorRange: this.colorRange(),
        colorScale: this.colorScale(),
        borderColor: this.borderColor(),
        borderStrokeWidth: this.borderStrokeWidth(),
        borderDash: this.borderDash(),
        borderDashOffset: this.borderDashOffset(),
        labelColor: this.labelColor(),
        hoverColor: this.hoverColor(),
        hoverBorderColor: this.hoverBorderColor(),
        layout: this.layout(),
        spacing: this.spacing(),
        groupPadding: this.groupPadding(),
        levels: this.levels(),
        borderRadius: this.borderRadius(),
        labelMinSize: this.labelMinSize(),
        showGroupLabel: this.showGroupLabel(),
        groupLabelHeight: this.groupLabelHeight(),
        drilldown: this.drilldown(),
        drilldownMode: this.drilldownMode(),
        rootLabel: this.rootLabel(),
        interactByLeaf: this.interactByLeaf(),
        renderContent: this.renderContent(),
        name: this.name(),
        id: this.datasetId,
        order: this.order(),
        keyField: this.keyField(),
        borderAlign: this.borderAlign(),
        borderJoinStyle: this.borderJoinStyle()
    }));

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerSeries({
            templates: computed(() => ({ treemapCell: this.cellDef()?.template ?? null })),
            id: this.datasetId,
            type: 'treemap',
            props: this.props as never,
            seriesIndex: computed(() => this.context!.series().findIndex((entry) => entry.id === this.datasetId))
        });

        this.destroyRef.onDestroy(remove);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/** Accepts a boolean input while letting `undefined` stay `undefined`, so a per-type default can win. */
function optionalBoolean(value: unknown): boolean | undefined {
    if (value == null || value === '') return undefined;

    return booleanAttribute(value);
}
