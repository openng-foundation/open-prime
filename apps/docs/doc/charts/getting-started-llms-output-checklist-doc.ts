import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-output-checklist-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Ask the assistant to return:</p>
            <ul>
                <li>imports from <i>@primeui/angular-chart</i>;</li>
                <li><i>ChartModule</i>, or a justified focused standalone import set;</li>
                <li>a <i>&lt;p-chart&gt;</i> template with only the required inputs and outputs;</li>
                <li>the series and configuration parts the chart type needs;</li>
                <li>style imports only when setup is part of the task;</li>
                <li>a note about which behavior remains Chart-owned.</li>
            </ul>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsOutputChecklistDoc {}
