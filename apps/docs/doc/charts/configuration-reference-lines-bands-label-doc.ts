import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-reference-lines-bands-label-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>label</i> on either component to display text alongside the line or band. Set <i>labelPosition</i> to control placement: <i>start</i>, <i>center</i>, or <i>end</i> along the line direction. Labels default to <i>end</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="value" color="#5daeea" curve="smooth" />
                    <p-chart-reference-line [y]="70" label="End (default)" stroke="#ff7a66" [lineDash]="[6, 4]" labelPosition="end" />
                    <p-chart-reference-line [y]="55" label="Center" stroke="#10a981" [lineDash]="[6, 4]" labelPosition="center" />
                    <p-chart-reference-line [y]="40" label="Start" stroke="#ffad5a" [lineDash]="[6, 4]" labelPosition="start" />
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
export class ReferenceLinesBandsLabelDoc {
    readonly data = [
        { month: 'Jan', value: 42 },
        { month: 'Feb', value: 55 },
        { month: 'Mar', value: 48 },
        { month: 'Apr', value: 63 },
        { month: 'May', value: 58 },
        { month: 'Jun', value: 72 }
    ];
}
