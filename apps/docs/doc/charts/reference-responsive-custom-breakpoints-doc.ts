import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-responsive-custom-breakpoints-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>breakpoints</i> to override the container width thresholds used by the auto-adaptive system. Override only the necessary breakpoints. Unset ones keep their defaults.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [responsive]="true" [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="product" name="Feature adoption (%)" color="#5ccf9f" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-responsive [breakpoints]="{ xs: 250, sm: 400, md: 600 }" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveCustomBreakpointsDoc {
    readonly data = [
        { quarter: 'Q1', product: 42 },
        { quarter: 'Q2', product: 58 },
        { quarter: 'Q3', product: 65 },
        { quarter: 'Q4', product: 72 }
    ];
}
