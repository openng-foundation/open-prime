import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ExportMenuButtonOptions } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-button-position-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>buttons</i> to control where the export button appears. Use <i>align</i> for horizontal placement and <i>verticalAlign</i> for vertical placement. Use <i>x</i> and <i>y</i> for pixel-level offset adjustments. In RTL layouts the
                button flips to the left side.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="backlog" color="#ffad5a" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-export-menu [buttons]="buttons" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportButtonPositionDoc {
    readonly buttons: ExportMenuButtonOptions = { align: 'left', verticalAlign: 'bottom' };

    readonly data = [
        { month: 'Jan', backlog: 186 },
        { month: 'Feb', backlog: 305 },
        { month: 'Mar', backlog: 237 },
        { month: 'Apr', backlog: 73 },
        { month: 'May', backlog: 209 },
        { month: 'Jun', backlog: 214 }
    ];
}
