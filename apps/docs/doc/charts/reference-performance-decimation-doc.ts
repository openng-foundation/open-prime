import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-decimation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDecimation</i> to downsample a high-point series before it renders. It preserves the overall shape (<i>'lttb'</i>), the peaks and troughs (<i>'min-max'</i>), or scatter density (<i>'k-means'</i>), and only engages once the
                dataset passes <i>threshold</i> points (target output is <i>samples</i>, default <i>500</i>).
            </p>
            <p>
                On time axes the engine is viewport-aware: it filters to the visible window first, so zooming in progressively reveals full-resolution data once fewer than <i>samples</i> points are on screen. For scatter and other analytical views,
                document whether the chart is showing raw points or a visual summary so users do not mistake a decimated mark for a canonical source row. See <a href="/charts/configuration/decimation">Decimation</a> for the full configuration.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceDecimationDoc {}
