import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-filename-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>filename</i> to control the default filename used when saving. The extension is appended based on the selected format.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="expansion" color="#5ccf9f" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Expansion Trend Report" />
                    <p-chart-export-menu filename="expansion-trend-2026" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportFilenameDoc {
    readonly data = [
        { month: 'Jan', expansion: 42 },
        { month: 'Feb', expansion: 48 },
        { month: 'Mar', expansion: 55 },
        { month: 'Apr', expansion: 52 },
        { month: 'May', expansion: 65 },
        { month: 'Jun', expansion: 72 }
    ];
}
