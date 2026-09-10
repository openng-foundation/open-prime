import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-reference-lines-bands-reference-line-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartReferenceLine</i> to draw a horizontal or vertical line at a fixed value. Set <i>y</i> for a horizontal threshold line. Set <i>x</i> for a vertical line at a category or timestamp. Set both <i>x</i> and <i>y</i> to draw
                intersecting lines through a specific data point.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="score" color="#5daeea" curve="smooth" [showMarkers]="true" />
                    <p-chart-reference-line [y]="60" label="Target" />
                    <p-chart-reference-line x="Apr" label="Q2 Start" stroke="#10a981" [lineDash]="[6, 4]" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferenceLinesBandsReferenceLineDoc {
    readonly data = [
        { month: 'Jan', score: 42 },
        { month: 'Feb', score: 55 },
        { month: 'Mar', score: 48 },
        { month: 'Apr', score: 63 },
        { month: 'May', score: 58 },
        { month: 'Jun', score: 72 }
    ];
}
