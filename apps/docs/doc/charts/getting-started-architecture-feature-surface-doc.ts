import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-architecture-feature-surface-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Add features after the chart type and data model are clear.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Solves</th>
                            <th>Documentation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Zoom &amp; Pan</td>
                            <td>Exploring dense datasets without losing context.</td>
                            <td><a href="/charts/configuration/zoom-pan">Zoom &amp; Pan</a></td>
                        </tr>
                        <tr>
                            <td>Data Labels</td>
                            <td>Showing exact values directly on marks.</td>
                            <td><a href="/charts/configuration/data-labels">Data Labels</a></td>
                        </tr>
                        <tr>
                            <td>Annotations</td>
                            <td>Adding text, lines, and bands to highlight regions.</td>
                            <td><a href="/charts/configuration/annotation">Annotations</a></td>
                        </tr>
                        <tr>
                            <td>Tooltip</td>
                            <td>Showing data detail on hover.</td>
                            <td><a href="/charts/configuration/tooltip">Tooltip</a></td>
                        </tr>
                        <tr>
                            <td>Legend</td>
                            <td>Toggling series visibility and labeling multiple series.</td>
                            <td><a href="/charts/configuration/legend">Legend</a></td>
                        </tr>
                        <tr>
                            <td>Axes</td>
                            <td>Scale, ticks, labels, and multiple axes.</td>
                            <td><a href="/charts/configuration/axes">Axes</a></td>
                        </tr>
                        <tr>
                            <td>Reference Lines &amp; Bands</td>
                            <td>Marking thresholds, averages, and target ranges.</td>
                            <td><a href="/charts/configuration/reference-lines-bands">Reference Lines &amp; Bands</a></td>
                        </tr>
                        <tr>
                            <td>Navigator</td>
                            <td>Zooming a visible window over a large time range.</td>
                            <td><a href="/charts/configuration/navigator">Navigator</a></td>
                        </tr>
                        <tr>
                            <td>Export</td>
                            <td>Saving the chart as an image.</td>
                            <td><a href="/charts/configuration/export">Export</a></td>
                        </tr>
                        <tr>
                            <td>Accessibility</td>
                            <td>Keyboard navigation and ARIA for Canvas mode.</td>
                            <td><a href="/charts/reference/accessibility">Accessibility</a></td>
                        </tr>
                        <tr>
                            <td>Theming</td>
                            <td>Custom colors, fonts, and style tokens.</td>
                            <td><a href="/charts/reference/theming">Theming</a></td>
                        </tr>
                        <tr>
                            <td>Responsive</td>
                            <td>Adapting layout to container size.</td>
                            <td><a href="/charts/reference/responsive">Responsive</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureFeatureSurfaceDoc {}
