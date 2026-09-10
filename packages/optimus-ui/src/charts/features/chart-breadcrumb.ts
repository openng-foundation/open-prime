/**
 * ChartBreadcrumb.
 *
 * The trail a treemap drilldown leaves. It is real DOM because every level in it is a link back,
 * and it lives here rather than inside `ChartTreemap` because the treemap draws cells: a breadcrumb
 * belongs to the chart's chrome, alongside the legend and the title.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, computed, inject, input } from '@angular/core';
import type { ChartBreadcrumbProps } from '@openng/optimus-ui/types/charts';
import { CHART_CONTEXT, CHART_DRILLDOWN } from '../charts-registry';

/**
 * The drilldown trail, with each level a step back up.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-breadcrumb',
    standalone: true,
    template: `
        @if (trail().length > 1) {
            <nav class="p-chart-breadcrumb" data-slot="chart-breadcrumb" [style]="rootStyle()" [attr.aria-label]="label()">
                @for (step of trail(); track step.id; let last = $last) {
                    @if (last) {
                        <span class="p-chart-breadcrumb-current" data-slot="chart-breadcrumb-current" aria-current="page">{{ step.label }}</span>
                    } @else {
                        <button type="button" class="p-chart-breadcrumb-item" data-slot="chart-breadcrumb-item" (click)="goTo(step.id)">{{ step.label }}</button>
                        <span class="p-chart-breadcrumb-separator" data-slot="chart-breadcrumb-separator" aria-hidden="true">{{ separator() }}</span>
                    }
                }
            </nav>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-breadcrumb-host' }
})
export class ChartBreadcrumb {
    private readonly context = inject(CHART_CONTEXT, { optional: true });

    private readonly drilldown = inject(CHART_DRILLDOWN, { optional: true });

    private readonly destroyRef = inject(DestroyRef);

    /**
     * Text between the steps.
     * @defaultValue ' / '
     * @group Props
     */
    readonly separator = input(' / ');

    /** The feature's current inputs, as the root reads them. */
    readonly props = computed<ChartBreadcrumbProps>(() => ({ separator: this.separator() }));

    protected readonly label = computed(() => this.context?.text().dataTable ?? 'Breadcrumb');

    /**
     * The trail.
     *
     * The root step is always present, so a chart drilled one level deep shows "All / Engineering"
     * rather than just the level it is in -- the way back is the only reason the trail exists.
     */
    protected readonly trail = computed(() => {
        const path = this.drilldown?.path() ?? [];
        const root = { id: null as string | null, label: this.drilldown?.rootLabel$() ?? this.context?.text().all ?? 'All' };

        return [root, ...path].map((step, index) => ({ id: step.id, label: step.label, depth: index }));
    });

    protected rootStyle(): Record<string, string> {
        return { position: 'absolute', top: '0', left: '0', display: 'flex', 'align-items': 'center', gap: '2px', 'pointer-events': 'auto' };
    }

    /** Drills back to a level. */
    protected goTo(id: string | null): void {
        this.drilldown?.drillTo(id);
    }

    constructor() {
        if (!this.context) return;

        const remove = this.context.registerFeature({ type: 'breadcrumb', props: this.props });
        const releaseSpace = this.context.reserve(computed(() => ({ edge: 'top' as const, size: this.trail().length > 1 ? 24 : 0 })));

        this.destroyRef.onDestroy(() => {
            remove();
            releaseSpace();
        });
    }
}
