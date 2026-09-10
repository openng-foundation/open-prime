/**
 * ChartGroup: the synchronization bus.
 *
 * Wrap any number of chart roots in it and set `sync` on the ones that should participate. It takes
 * no inputs of its own, because what to sync is a per-chart decision: one chart in a dashboard may
 * want to follow the shared zoom while another shows a fixed reference range.
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { CHART_GROUP, type ChartGroupContext, type ChartGroupMember } from './charts-registry';

/**
 * Links several charts so they share crosshair position, zoom range and series visibility. Place a
 * `ChartLegend` inside the group but outside the individual charts to get one legend controlling
 * all of them.
 *
 * @group Components
 */
@Component({
    selector: 'p-chart-group',
    standalone: true,
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-chart-group', 'data-slot': 'chart-group' },
    providers: [
        { provide: PARENT_INSTANCE, useExisting: ChartGroup },
        { provide: CHART_GROUP, useFactory: () => inject(ChartGroup).groupContext }
    ]
})
export class ChartGroup {
    private readonly registry = signal<readonly ChartGroupMember[]>([]);

    /**
     * Guards against a broadcast loop.
     *
     * Applying an event to a member can make that member publish one of its own -- a synced zoom
     * sets the other chart's window, which is itself a zoom change. Without this flag two charts
     * would bounce a single gesture back and forth until the stack ran out.
     */
    private broadcasting = false;

    /** What the member charts inject. */
    readonly groupContext: ChartGroupContext = {
        join: (member) => {
            this.registry.update((list) => [...list, member]);

            return () => this.registry.update((list) => list.filter((entry) => entry !== member));
        },
        publishExtremes: (sourceId, state) => this.broadcast(sourceId, (member) => member.applyExtremes(state)),
        publishHighlight: (sourceId, payload) => this.broadcast(sourceId, (member) => member.applyHighlight(payload)),
        publishVisibility: (sourceId, datasetId, visible) => this.broadcast(sourceId, (member) => member.applyVisibility(datasetId, visible)),
        members: this.registry
    };

    /** Delivers an event to every member except the one that raised it. */
    private broadcast(sourceId: string, apply: (member: ChartGroupMember) => void): void {
        if (this.broadcasting) return;

        this.broadcasting = true;

        try {
            for (const member of this.registry()) {
                if (member.id === sourceId) continue;
                apply(member);
            }
        } finally {
            this.broadcasting = false;
        }
    }
}
