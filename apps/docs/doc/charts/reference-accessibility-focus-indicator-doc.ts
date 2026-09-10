import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AccessibilityProps } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-focus-indicator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                The focused data point shows a visible focus ring, configured under <i>keyboardNavigation.focusBorder</i>. Set <i>style.color</i>, <i>style.width</i>, <i>style.lineStyle</i>, and <i>style.borderRadius</i> to customize its appearance.
                Set <i>margin</i> to control the gap between the focus ring and the element. Set <i>hideBrowserFocusOutline</i> to <i>true</i> (default) to suppress the browser's native focus outline. Set <i>enabled</i> to <i>false</i> to remove the
                custom ring entirely without disabling keyboard navigation.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="api" name="API latency" color="#5daeea" [showMarkers]="true" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="checkout" name="Checkout latency" color="#4ecdc4" [showMarkers]="true" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-accessibility [keyboardNavigation]="keyboardNavigation" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityFocusIndicatorDoc {
    readonly keyboardNavigation: AccessibilityProps['keyboardNavigation'] = {
        enabled: true,
        focusBorder: {
            style: { color: '#5daeea', width: 3, lineStyle: 'solid', borderRadius: 6 },
            margin: 4
        }
    };

    readonly data = [
        { month: 'Jan', api: 186, checkout: 132 },
        { month: 'Feb', api: 205, checkout: 148 },
        { month: 'Mar', api: 237, checkout: 164 },
        { month: 'Apr', api: 173, checkout: 151 },
        { month: 'May', api: 209, checkout: 156 },
        { month: 'Jun', api: 214, checkout: 149 }
    ];
}
