import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-live-updates-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Streaming charts update on an interval or socket. Use <i>ChartCanvas</i>, keep a fixed-length rolling window, and hold the axis domain fixed with <i>min</i>/<i>max</i> so each tick animates the values rather than re-fitting the scale.
                Lower or disable animation when ticks arrive faster than they can settle, and update the bound <i>data</i> with a fresh array each tick so the chart diffs and repaints. On line and area charts, <i>updateMode</i> (default
                <i>'auto'</i>) detects whether a tick appends a point or scrolls the window and animates only the new segment instead of re-tweening the whole series.
            </p>
            <p>
                Bound memory deliberately. A stream that appends forever will eventually overwhelm any renderer, so cap the chart-facing array (<i>next.slice(-windowSize)</i>, a ring buffer, or a worker-owned viewport cache) and dispose timers or
                socket subscriptions when the chart unmounts. If users need historical replay, keep the full log outside the chart and load a selected range back into the viewport.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceLiveUpdatesDoc {}
