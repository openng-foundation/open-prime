import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-reference-lines-bands-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>stroke</i>, <i>lineStrokeWidth</i>, and <i>lineDash</i> to customize reference line appearance. Use <i>lineDash</i> for dashed patterns: <i>[6, 4]</i> draws 6px dashes with 4px gaps. Set <i>fill</i> to an opaque color and
                <i>fillOpacity</i> to control the shaded region transparency. <i>fillOpacity</i> is the only opacity control and applies on top of the fill color.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="score" color="#5daeea" />
                    <p-chart-reference-band [y1]="50" [y2]="65" fill="#10a981" [fillOpacity]="0.15" label="Target Zone" />
                    <p-chart-reference-line [y]="70" label="Limit" stroke="#ff7a66" [lineStrokeWidth]="2" [lineDash]="[6, 4]" />
                    <p-chart-reference-line [y]="40" label="Floor" stroke="#ffad5a" [lineStrokeWidth]="1" [lineDash]="[4, 2]" />
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
export class ReferenceLinesBandsStylingDoc {
    readonly data = [
        { month: 'Jan', score: 42 },
        { month: 'Feb', score: 55 },
        { month: 'Mar', score: 48 },
        { month: 'Apr', score: 63 },
        { month: 'May', score: 58 },
        { month: 'Jun', score: 72 }
    ];
}
