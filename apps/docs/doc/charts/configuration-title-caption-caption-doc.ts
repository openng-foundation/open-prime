import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const ARR = [
    { month: 'Jan', arr: 42 },
    { month: 'Feb', arr: 55 },
    { month: 'Mar', arr: 48 },
    { month: 'Apr', arr: 63 },
    { month: 'May', arr: 58 },
    { month: 'Jun', arr: 71 }
];

@Component({
    selector: 'configuration-title-caption-caption-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartCaption</i> alongside <i>ChartTitle</i> to display a descriptive line. By default it stacks directly adjacent to the title and inherits its alignment. Set <i>position</i> on <i>ChartCaption</i> to place it independently.
                For example, <i>position="bottom"</i> with a top title puts the title above the chart and the caption below it.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Expansion ARR Run Rate" />
                    <p-chart-caption text="January - June 2026 pipeline-sourced accounts" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCaptionCaptionDoc {
    readonly data = ARR;
}
