import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-zoom-and-navigator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                For large ranges, render a windowed view instead of every point at once. <i>ChartZoom</i> adds wheel and drag-to-select zoom with panning; <i>ChartNavigator</i> adds an overview strip with a draggable selection window. Combined with
                viewport-aware decimation, users explore long time series at full detail without rendering the whole set up front.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceZoomAndNavigatorDoc {}
