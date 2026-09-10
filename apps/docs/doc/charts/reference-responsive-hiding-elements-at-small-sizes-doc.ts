import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ResponsiveRule } from '@openng/optimus-ui/charts';

const rules: ResponsiveRule[] = [
    {
        maxWidth: 500,
        props: { legend: { enabled: false } } as Record<string, Record<string, unknown>>
    },
    {
        maxWidth: 350,
        props: {
            yAxis: { visible: false },
            dataLabels: { enabled: false }
        } as Record<string, Record<string, unknown>>
    }
];

@Component({
    selector: 'reference-responsive-hiding-elements-at-small-sizes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use rules to hide the legend, tooltip, or data labels at small container sizes, or to remove axes entirely to maximize the plot area. Axis hiding is layout-aware. The plot area expands to fill the reclaimed space rather than leaving a
                gap.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [responsive]="true" [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="sales" name="Sales" color="#5daeea" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="target" name="Target" color="#ffd166" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="($K)" />
                    <p-chart-legend position="bottom" />
                    <p-chart-title text="Monthly Sales vs Target" />
                    <p-chart-responsive [rules]="rules" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveHidingElementsAtSmallSizesDoc {
    readonly rules = rules;

    readonly data = [
        { month: 'Jan', sales: 42, target: 50 },
        { month: 'Feb', sales: 55, target: 50 },
        { month: 'Mar', sales: 48, target: 50 },
        { month: 'Apr', sales: 63, target: 55 },
        { month: 'May', sales: 58, target: 55 },
        { month: 'Jun', sales: 72, target: 55 }
    ];
}
