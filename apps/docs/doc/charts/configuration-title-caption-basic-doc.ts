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
    selector: 'configuration-title-caption-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTitle</i> to display a title above the chart. Set <i>text</i> to the label to show. The title reduces the chart area height to make room for itself.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Expansion ARR Run Rate" />
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
export class TitleCaptionBasicDoc {
    readonly data = ARR;
}
