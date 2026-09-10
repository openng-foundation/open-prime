import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-decimation-progressive-detail-on-zoom-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                On time-axis charts, zooming in progressively reveals full-resolution data. The decimation engine is viewport-aware. It filters to the visible time window first, then decimates only the visible subset. When fewer than
                <i>samples</i> points are visible in the zoomed window, the raw undecimated points render directly with no downsampling.
            </p>
            <p>A 10,000-point dataset decimated to 500 samples at full zoom will show every real data point once the user zooms in far enough that fewer than 500 points are in the visible window.</p>
            <p>
                This progressive detail behavior applies to <strong>time axes only</strong>. It does not make the full-range view exact; it gives users a path from a summarized overview to raw points as they zoom in. Category-axis zoom clips the view
                visually but does not trigger viewport-aware decimation. The same decimated dataset renders regardless of zoom level.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationProgressiveDetailOnZoomDoc {}
