import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-setup-quickstarts-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Explore the runnable projects in the <a href="https://github.com/primefaces/primeuipro-examples/tree/main/chart" target="_blank" rel="noopener">Charts examples repository</a>{{ '{' }}target="_blank" rel="noopener noreferrer"{{ '}' }}.
                Each quickstart includes bar, line, and pie charts using the SVG renderer and PrimeOne theme.
            </p>
            <ul>
                <li>
                    <a href="https://github.com/primefaces/primeuipro-examples/tree/main/chart/angular/cli-quickstart" target="_blank" rel="noopener">Angular CLI</a>{{ '{' }}target="_blank" rel="noopener noreferrer"{{ '}' }} - Angular CLI with the
                    PrimeOne theme.
                </li>
                <li>
                    <a href="https://github.com/primefaces/primeuipro-examples/tree/main/chart/angular/analog-quickstart" target="_blank" rel="noopener">Analog</a>{{ '{' }}target="_blank" rel="noopener noreferrer"{{ '}' }} - Analog with the PrimeOne
                    theme.
                </li>
            </ul>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupQuickstartsDoc {}
