import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-responsive-auto-adaptive-scaling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>The built-in auto-adaptive system scales chart elements across four tiers based on container width. All font values scale proportionally when a global <i>fontSize</i> is set on <i>ChartSvg</i> or <i>ChartCanvas</i>.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Element</th>
                            <th>xs (≤300px)</th>
                            <th>sm (≤500px)</th>
                            <th>md (≤700px)</th>
                            <th>lg (&gt;700px)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Chart title font</td>
                            <td>12px</td>
                            <td>13px</td>
                            <td>14px</td>
                            <td>17px</td>
                        </tr>
                        <tr>
                            <td>Caption font</td>
                            <td>10px</td>
                            <td>11px</td>
                            <td>12px</td>
                            <td>13px</td>
                        </tr>
                        <tr>
                            <td>Chart padding</td>
                            <td>6px</td>
                            <td>8px</td>
                            <td>10px</td>
                            <td>10px</td>
                        </tr>
                        <tr>
                            <td>Tick label font</td>
                            <td>10px</td>
                            <td>11px</td>
                            <td>12px</td>
                            <td>12px (cartesian only)</td>
                        </tr>
                        <tr>
                            <td>Legend item font</td>
                            <td>10px</td>
                            <td>11px</td>
                            <td>12px</td>
                            <td>13px</td>
                        </tr>
                        <tr>
                            <td>Data label font</td>
                            <td>10px</td>
                            <td>10px</td>
                            <td>11px</td>
                            <td>12px</td>
                        </tr>
                        <tr>
                            <td>Data label rotation</td>
                            <td>-90°</td>
                            <td>-90°</td>
                            <td>0°</td>
                            <td>0° (cartesian only)</td>
                        </tr>
                        <tr>
                            <td>Legend repositioned to bottom</td>
                            <td>✓</td>
                            <td>✓</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>Set <i>disableAutoAdaptive</i> to <i>true</i> to turn off all scaling and lock to <i>lg</i> tier defaults.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveAutoAdaptiveScalingDoc {}
