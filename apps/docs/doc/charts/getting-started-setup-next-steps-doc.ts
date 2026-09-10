import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-setup-next-steps-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <ul>
                <li><a href="/charts/getting-started/architecture">Architecture</a></li>
                <li><a href="/charts/getting-started/llms">LLMs</a></li>
                <li><a href="/charts/reference/theming">Theming</a></li>
                <li><a href="/charts/types/line-area">Line &amp; Area</a></li>
                <li><a href="/charts/types/column-bar">Column &amp; Bar</a></li>
                <li><a href="/charts/types/pie-donut">Pie &amp; Donut</a></li>
                <li><a href="/charts/reference/api">API</a></li>
            </ul>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupNextStepsDoc {}
