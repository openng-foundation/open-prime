import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-overview-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                PrimeUI publishes the Angular Chart docs as markdown-friendly endpoints. Use them when an assistant needs the current Chart API, compound structure, setup steps, chart types, configuration options, and reference pages without scraping
                the rendered site.
            </p>
            <p>
                Good Chart prompts give the assistant three things: the setup page, the architecture page, and the exact chart type page for the task. Add configuration or reference pages only when the task needs an axis, tooltip, legend, plugin, or
                data-attribute detail.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsOverviewDoc {}
