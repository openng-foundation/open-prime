import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-export-export-notes-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                PDF export is client-side with no external dependencies. Both SVG and Canvas mode charts produce a rasterized PDF. SVG charts rasterize to canvas first, then embed as JPEG. The result is pixel-perfect at the export <i>scale</i> but
                not true vector. Text is baked into the pixel data and fonts are not embedded separately.
            </p>
            <p>
                Canvas SVG export composites the canvas layers into a PNG image which is embedded as an <i>&lt;image&gt;</i> element inside an SVG wrapper. The file uses the <i>.svg</i> format but contains raster pixel data, not vector paths, and it
                is faithful in web browsers.
            </p>
            <p>
                CSV export downloads the underlying chart data, not a rendered image. It uses the framework-neutral data-table model that also powers the visually hidden screen reader table, so column names follow the chart type: category/value for
                cartesian and radial charts, x/y for scatter charts, row/column/value for heatmaps, and time/open/high/low/close for candlestick charts. When <i>ChartAccessibility</i> provides <i>dataTableCellFormatter</i>, CSV export applies the
                same cell formatting so downloaded values match the accessible table.
            </p>
            <p>The screen reader table can be capped with <i>dataTableMaxRows</i> to avoid a very large hidden DOM table, but CSV export builds the table without that row cap so the downloaded file contains every chart row.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportExportNotesDoc {}
