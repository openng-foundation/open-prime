import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-background-color-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>backgroundColor</i> to control the background of exported images. Use <i>'transparent'</i> for PNG exports without a background when embedding charts on colored pages. Use <i>'auto'</i> (default) to match the current chart
                background. Pass a color string to force a specific background regardless of the page theme.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="visitors" color="#7c8cff" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-export-menu backgroundColor="#eef6ff" />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportBackgroundColorDoc {
    readonly data = [
        { month: 'Jan', visitors: 186 },
        { month: 'Feb', visitors: 305 },
        { month: 'Mar', visitors: 237 },
        { month: 'Apr', visitors: 73 },
        { month: 'May', visitors: 209 },
        { month: 'Jun', visitors: 214 }
    ];
}
