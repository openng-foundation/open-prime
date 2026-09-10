import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-basic-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartExportMenu</i> to show an export button in the chart corner. Clicking it opens a dropdown menu with download options. The button sits in the top-right corner by default, 10px inset from the edges.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="arr" color="#5daeea" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-export-menu />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportBasicDoc {
    readonly data = [
        { quarter: 'Q1', arr: 120 },
        { quarter: 'Q2', arr: 185 },
        { quarter: 'Q3', arr: 156 },
        { quarter: 'Q4', arr: 210 }
    ];
}
