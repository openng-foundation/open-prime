import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-performance-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Animation is auto-disabled once the chart's total point count (summed across all series) exceeds the animation <i>limit</i>, so large datasets paint without tweening jank.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Setting</th>
                            <th>Effect</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>limit</i></td>
                            <td>Auto-disables animation past this total point count across the chart (default <i>5000</i>)</td>
                        </tr>
                        <tr>
                            <td><i>[animation]="false"</i></td>
                            <td>Disables all animation; use for high-frequency or streaming updates</td>
                        </tr>
                        <tr>
                            <td>Fixed axis <i>min</i>/<i>max</i></td>
                            <td>Holds the scale steady so updates animate values, not the domain</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceAnimationDoc {}
