import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-architecture-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                The root is <i>ChartSvg</i> or <i>ChartCanvas</i>. Every visible feature is a child component: axes, legends, tooltips, data labels. Add it to enable it, remove it to disable it. The block above lists the parts that apply to any chart
                rather than a single configuration, so a real chart uses only the subset its data calls for.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureImportDoc {}
