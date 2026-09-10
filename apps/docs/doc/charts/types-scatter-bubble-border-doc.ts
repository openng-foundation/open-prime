import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-border-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>pointBorderColor</i> and <i>pointBorderStrokeWidth</i> to add an outline stroke around each marker. A white border helps separate overlapping points and makes multi-series charts easier to read at a glance.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="group-a" [data]="groupA" valueXField="usage" valueYField="health" name="Expansion fit" color="#5daeea" [markerSize]="8" pointBorderColor="#64748b" [pointBorderStrokeWidth]="2" />
                        <p-chart-scatter id="group-b" [data]="groupB" valueXField="usage" valueYField="health" name="Churn watch" color="#ff7a66" [markerSize]="8" pointBorderColor="#64748b" [pointBorderStrokeWidth]="2" />
                        <p-chart-x-axis label="Feature usage depth (%)" />
                        <p-chart-y-axis label="Account health score" />
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
export class ScatterBubbleBorderDoc {
    readonly groupA = [
        { usage: 42, health: 72 },
        { usage: 51, health: 78 },
        { usage: 58, health: 82 },
        { usage: 66, health: 86 },
        { usage: 73, health: 88 },
        { usage: 81, health: 91 }
    ];
    readonly groupB = [
        { usage: 38, health: 55 },
        { usage: 47, health: 61 },
        { usage: 55, health: 58 },
        { usage: 63, health: 66 },
        { usage: 72, health: 64 },
        { usage: 78, health: 69 }
    ];
}
