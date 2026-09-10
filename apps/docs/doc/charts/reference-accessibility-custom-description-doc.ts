import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-custom-description-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>description</i> to provide a custom screen reader summary of the chart. When omitted the chart auto-generates a description from the data, series names, and chart type. Set <i>typeDescription</i> to override the chart type
                label when the auto-detected description is too broad, or for treemap and heatmap charts where the auto-generated label is the raw internal identifier. Set <i>headingLevel</i> to control the heading element used for the visually
                hidden screen reader section. The default is <i>'h4'</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="completion" color="#5ccf9f" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Onboarding completion trend" />
                    <p-chart-accessibility description="Line chart showing onboarding completion from January to June 2026. Completion improved from 42 percent in January to 72 percent in June, with a brief dip in April." />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityCustomDescriptionDoc {
    readonly data = [
        { month: 'Jan', completion: 42 },
        { month: 'Feb', completion: 48 },
        { month: 'Mar', completion: 55 },
        { month: 'Apr', completion: 52 },
        { month: 'May', completion: 65 },
        { month: 'Jun', completion: 72 }
    ];
}
