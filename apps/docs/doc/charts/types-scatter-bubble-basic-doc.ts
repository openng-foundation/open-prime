import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>valueXField</i> and <i>valueYField</i> to map numeric data fields. Add <i>ChartXAxis</i> and <i>ChartYAxis</i> to render axes with labels and gridlines.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="activation" [data]="data" valueXField="setupHours" valueYField="activation" color="#5daeea" [markerSize]="7" />
                        <p-chart-x-axis label="Setup time (hours)" />
                        <p-chart-y-axis label="First-week activation (%)" />
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
export class ScatterBubbleBasicDoc {
    readonly data = [
        { setupHours: 4, activation: 84 },
        { setupHours: 6, activation: 78 },
        { setupHours: 8, activation: 72 },
        { setupHours: 11, activation: 68 },
        { setupHours: 13, activation: 61 },
        { setupHours: 16, activation: 58 },
        { setupHours: 19, activation: 49 },
        { setupHours: 21, activation: 44 },
        { setupHours: 25, activation: 38 },
        { setupHours: 29, activation: 34 },
        { setupHours: 32, activation: 29 },
        { setupHours: 36, activation: 24 }
    ];
}
