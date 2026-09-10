import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-practical-limits-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Area</th>
                            <th>Guidance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Points per series</td>
                            <td>Decimate once a series passes a few thousand points</td>
                        </tr>
                        <tr>
                            <td>Series count</td>
                            <td>Keep the number of simultaneous series modest; shared tooltips hit-test every one</td>
                        </tr>
                        <tr>
                            <td>Renderer</td>
                            <td>Stay on SVG by default; move to Canvas for large or streaming data</td>
                        </tr>
                        <tr>
                            <td>Markers</td>
                            <td>Hide point markers (<i>[showMarkers]="false"</i>) on dense series; per-point drawing dominates</td>
                        </tr>
                        <tr>
                            <td>Tooltips &amp; hover</td>
                            <td>Default <i>item</i> mode tests the nearest point; <i>shared</i> tests every series, so scope it accordingly</td>
                        </tr>
                        <tr>
                            <td>Custom renderers</td>
                            <td>Render and tooltip functions run per element; keep them lightweight</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformancePracticalLimitsDoc {}
