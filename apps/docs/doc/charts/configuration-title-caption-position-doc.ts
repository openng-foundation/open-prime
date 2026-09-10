import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-title-caption-position-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>position="bottom"</i> to place the title below the chart area. When positioned at the bottom, <i>ChartCaption</i> sits between the chart and the title.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="margin" color="#10a981" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Services Margin by Quarter" position="bottom" />
                    <p-chart-caption text="FY 2026 operating plan" />
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
export class TitleCaptionPositionDoc {
    readonly data = [
        { quarter: 'Q1', margin: 128 },
        { quarter: 'Q2', margin: 154 },
        { quarter: 'Q3', margin: 142 },
        { quarter: 'Q4', margin: 189 }
    ];
}
