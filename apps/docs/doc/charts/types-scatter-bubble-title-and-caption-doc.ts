import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-title-and-caption-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartTitle</i> to display a title above the chart and <i>ChartCaption</i> for a descriptive line beneath it. Adding both reduces the available chart area.</p>
            <p>For full configuration see <a href="/charts/configuration/title-caption">Title &amp; Caption</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="pipeline" [data]="data" valueXField="readiness" valueYField="value" color="#4ecdc4" [markerSize]="7" />
                        <p-chart-x-axis label="Implementation readiness" />
                        <p-chart-y-axis label="Projected value score" />
                        <p-chart-title text="Roadmap bets — readiness vs value" />
                        <p-chart-caption text="Each point is a candidate initiative scored by product, design, and engineering leads" />
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
export class ScatterBubbleTitleAndCaptionDoc {
    readonly data = [
        { readiness: 34, value: 42 },
        { readiness: 41, value: 49 },
        { readiness: 48, value: 57 },
        { readiness: 52, value: 61 },
        { readiness: 59, value: 68 },
        { readiness: 63, value: 72 },
        { readiness: 69, value: 76 },
        { readiness: 74, value: 82 },
        { readiness: 79, value: 87 },
        { readiness: 84, value: 91 },
        { readiness: 88, value: 95 },
        { readiness: 93, value: 98 }
    ];
}
