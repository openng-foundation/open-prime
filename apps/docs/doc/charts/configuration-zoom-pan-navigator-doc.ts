import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-zoom-pan-navigator-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Add <i>ChartNavigator</i> alongside <i>ChartZoom</i> to display a mini overview chart below the main chart with a draggable selection window. The navigator and zoom stay in sync.</p>
            <p>For full configuration see <a href="/charts/configuration/navigator">Navigator</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomPanNavigatorDoc {}
