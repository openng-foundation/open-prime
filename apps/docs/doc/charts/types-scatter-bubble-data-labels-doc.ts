import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-data-labels-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartDataLabels</i> to display sparse point labels or values. Set <i>display</i> to <i>value</i>, <i>percentage</i>, <i>both</i>, <i>label</i>, <i>label-percentage</i>, or <i>none</i>.</p>
            <p>For full configuration see <a href="/charts/configuration/data-labels">Data Labels</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="points" [data]="data" valueXField="load" valueYField="risk" color="#7c8cff" [markerSize]="7" />
                        <p-chart-x-axis label="Hub load (%)" />
                        <p-chart-y-axis label="Delay risk (%)" />
                        <p-chart-data-labels display="label" />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubbleDataLabelsDoc {
    readonly data = [
        { label: 'ATL', load: 34, risk: 28 },
        { label: 'DFW', load: 48, risk: 39 },
        { label: 'LAX', load: 63, risk: 54 },
        { label: 'ORD', load: 71, risk: 61 },
        { label: 'SEA', load: 82, risk: 73 },
        { label: 'EWR', load: 89, risk: 82 }
    ];
}
