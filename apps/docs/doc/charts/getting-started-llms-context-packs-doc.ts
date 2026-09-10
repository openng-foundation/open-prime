import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-llms-context-packs-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Use a small pack instead of the full docs when the task is narrow.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Include</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>First install</td>
                            <td>Setup, Architecture, Theming, and the target chart type.</td>
                        </tr>
                        <tr>
                            <td>Build one chart type</td>
                            <td>Architecture and the matching page under Types.</td>
                        </tr>
                        <tr>
                            <td>Configure axes and scales</td>
                            <td>Architecture, Axes, and the active chart type page.</td>
                        </tr>
                        <tr>
                            <td>Add tooltips or legends</td>
                            <td>Tooltip, Legend, Hover, and the active chart type page.</td>
                        </tr>
                        <tr>
                            <td>Annotate a chart</td>
                            <td>Annotation, Reference Lines and Bands, Data Labels, and Title and Caption.</td>
                        </tr>
                        <tr>
                            <td>Add interaction</td>
                            <td>Zoom and Pan, Navigator, Hover, and Export.</td>
                        </tr>
                        <tr>
                            <td>Style a chart</td>
                            <td>Theming, Data Labels, and the active chart type page.</td>
                        </tr>
                        <tr>
                            <td>Diagnose performance</td>
                            <td>Performance, Decimation, Responsive, and Tree Shaking.</td>
                        </tr>
                        <tr>
                            <td>Check accessibility</td>
                            <td>Accessibility, Theming, and the active chart type page.</td>
                        </tr>
                        <tr>
                            <td>Explain generated demo code</td>
                            <td>The docs page that owns the demo, plus <i>/llms-full.txt</i> when shared demo data is needed.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmsContextPacksDoc {}
