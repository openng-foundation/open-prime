import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-synced-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Synced charts coordinate multiple independent charts through <i>ChartGroup</i>. Set <i>[sync]="true"</i> on each chart to share crosshairs, zoom ranges, and legend visibility. Each chart renders its own data; the group handles the
                coordination layer.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SyncedImportDoc {}
