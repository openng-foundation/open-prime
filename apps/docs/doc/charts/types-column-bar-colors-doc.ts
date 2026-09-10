import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Pass an array to <i>color</i> to assign a custom palette. Bars cycle through colors by index. For conditional coloring, pass a function that receives each data item and returns a color string.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="priority" valueYField="tickets" [color]="barColors" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Open tickets" />
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
export class ColumnBarColorsDoc {
    readonly data = [
        { priority: 'Critical', tickets: 42 },
        { priority: 'High', tickets: 68 },
        { priority: 'Medium', tickets: 91 },
        { priority: 'Low', tickets: 57 },
        { priority: 'Backlog', tickets: 24 }
    ];

    readonly barColors = ['#e5484d', '#ffad5a', '#ffd166', '#5daeea', '#94a3b8'];
}
