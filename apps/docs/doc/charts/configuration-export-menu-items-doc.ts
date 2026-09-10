import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ExportMenuItem } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-export-menu-items-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>menuItems</i> to control which download options appear and in what order. Use <i>'separator'</i> to add a divider between groups. All formats work with both SVG and Canvas renderers. On Canvas charts, SVG export composites the
                canvas layers into a PNG image embedded inside an SVG wrapper. Include <i>'downloadCSV'</i> when users need the underlying chart data as spreadsheet-ready text.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="460" [height]="460">
                        <p-chart-pie [data]="data" valueField="value" categoryField="category" />
                        <p-chart-legend position="bottom" />
                        <p-chart-export-menu [menuItems]="menuItems" />
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
export class ExportMenuItemsDoc {
    readonly menuItems: ExportMenuItem[] = ['downloadPNG', 'downloadSVG', 'separator', 'downloadPDF'];

    readonly data = [
        { category: 'Electronics', value: 35 },
        { category: 'Clothing', value: 25 },
        { category: 'Food', value: 20 },
        { category: 'Books', value: 12 },
        { category: 'Other', value: 8 }
    ];
}
