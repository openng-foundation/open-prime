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
        props: { yAxis: { showTicks: false } } as Record<string, Record<string, unknown>>
    }
];

@Component({
    selector: 'reference-responsive-custom-rules-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>rules</i> to define condition-based overrides. Each rule specifies pixel conditions (<i>maxWidth</i>, <i>minWidth</i>, <i>maxHeight</i>, <i>minHeight</i>) and a <i>props</i> object mapping feature names to their override
                values. All matching rules are applied. Last rule wins on conflicting keys.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [responsive]="true" [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="sales" name="Sales" color="#5daeea" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="returns" name="Returns" color="#ff7a66" />
                    <p-chart-x-axis />
                    <p-chart-y-axis label="Amount ($K)" />
                    <p-chart-legend position="bottom" />
                    <p-chart-tooltip />
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
export class ResponsiveCustomRulesDoc {
    readonly rules = rules;

    readonly data = [
        { month: 'Jan', sales: 42, returns: 5 },
        { month: 'Feb', sales: 55, returns: 8 },
        { month: 'Mar', sales: 48, returns: 6 },
        { month: 'Apr', sales: 63, returns: 9 },
        { month: 'May', sales: 58, returns: 7 },
        { month: 'Jun', sales: 72, returns: 10 }
    ];
}
