import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-demo-source-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Chart demo source is included through the generated documentation data. When an assistant needs the code behind a rendered example, reference the page that owns the demo instead of asking it to infer behavior from screenshots.</p>
            <p>The raw markdown keeps demo names in place, and <i>/llms-full.txt</i> expands chart demo content during the documentation build.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsDemoSourceDoc {}
