import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-keyboard-navigation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Keyboard navigation is enabled by default when <i>ChartAccessibility</i> is mounted. Arrow keys move between data points within a series; Tab moves between series. Set <i>keyboardNavigation.enabled</i> to <i>false</i> to disable it.
            </p>
            <p>
                Series-level navigation options live under <i>keyboardNavigation.seriesNavigation</i>. Set <i>mode</i> to <i>'serialize'</i> to navigate all points as a flat list across all series instead of per-series. Set <i>skipNullPoints</i> to
                <i>false</i> to allow landing on null data points. Set <i>rememberPointFocus</i> to <i>true</i> to restore the last focused point index when switching back to a series. Set <i>pointNavigationEnabledThreshold</i> to disable per-point
                navigation when a series exceeds a given size. Set <i>keyboardNavigation.wrapAround</i> to <i>false</i> to stop at the last point instead of cycling back to the first.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="queue" valueYField="opened" color="#5daeea" name="Opened tickets" />
                    <p-chart-bar [data]="data" categoryXField="queue" valueYField="resolved" color="#ffad5a" name="Resolved tickets" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-accessibility [keyboardNavigation]="{ enabled: true }" />
                    <p-chart-hover />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityKeyboardNavigationDoc {
    readonly data = [
        { queue: 'Billing', opened: 38, resolved: 31 },
        { queue: 'Accounts', opened: 52, resolved: 46 },
        { queue: 'Platform', opened: 44, resolved: 39 },
        { queue: 'Security', opened: 29, resolved: 27 },
        { queue: 'Mobile', opened: 35, resolved: 32 }
    ];
}
