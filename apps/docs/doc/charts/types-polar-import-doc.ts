import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-polar-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Polar charts arrange radial bars around a circular axis, where bar length scales to each value. Good for cyclical comparisons like time-of-day or directional data. Set <i>innerRadius</i> to create a hollow center for the classic wind
                rose look.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolarImportDoc {}
