import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-scatter-bubble-decimation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Add <i>ChartDecimation</i> to downsample large scatter datasets before rendering. Set <i>algorithm</i> to <i>'lttb'</i> (shape-preserving), <i>'min-max'</i> (peak-preserving), or <i>'k-means'</i> (cluster-based, optimized for
                scatter). Set <i>samples</i> to control the target output point count.
            </p>
            <p>For full configuration see <a href="/charts/configuration/decimation">Decimation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScatterBubbleDecimationDoc {}
