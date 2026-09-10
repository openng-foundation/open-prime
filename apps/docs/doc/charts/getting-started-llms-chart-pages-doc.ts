import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-chart-pages-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Point the assistant at the Chart index first, then add the exact page that matches the task.</p>
            <p>Use focused pages for implementation work. Setup covers installation and style imports. Architecture covers the chart data model, chart type selection, the compound API, dual SVG/Canvas rendering, and the feature surface.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsChartPagesDoc {}
