import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-custom-rendering-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Custom renderers and tooltip, label, and annotation render functions run for every element on that surface. Keep the work inside them local, avoid expensive formatting in large loops, and precompute repeated values such as labels and
                colors outside the render path.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceCustomRenderingDoc {}
