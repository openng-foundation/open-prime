import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Charts auto-generate screen reader descriptions from data when no <i>ChartAccessibility</i> component is mounted. Add <i>ChartAccessibility</i> to override descriptions, adjust verbosity, configure keyboard navigation, and style focus
                indicators.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="segment" valueYField="cases" name="Closed cases" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-accessibility />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityBasicDoc {
    readonly data = [
        { segment: 'Enterprise', cases: 128 },
        { segment: 'Commercial', cases: 185 },
        { segment: 'Partner', cases: 142 },
        { segment: 'Self-serve', cases: 216 }
    ];
}
