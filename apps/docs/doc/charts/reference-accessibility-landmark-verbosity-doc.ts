import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-landmark-verbosity-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>landmarkVerbosity</i> to control how many ARIA landmarks are added to the chart. <i>'all'</i> (default) adds a landmark per series for fine-grained screen reader navigation. <i>'chart'</i> adds a single chart-level landmark.
                <i>'disabled'</i> adds none, which is appropriate when the chart sits inside an already-labeled region.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="chat" name="Chat" color="#5daeea" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="email" name="Email" color="#4ecdc4" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="escalation" name="Escalations" color="#ffad5a" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend position="bottom" />
                    <p-chart-accessibility landmarkVerbosity="all" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityLandmarkVerbosityDoc {
    readonly data = [
        { month: 'Jan', chat: 42, email: 28, escalation: 18 },
        { month: 'Feb', chat: 45, email: 30, escalation: 17 },
        { month: 'Mar', chat: 48, email: 32, escalation: 16 },
        { month: 'Apr', chat: 51, email: 35, escalation: 15 },
        { month: 'May', chat: 53, email: 34, escalation: 14 },
        { month: 'Jun', chat: 56, email: 36, escalation: 13 }
    ];
}
