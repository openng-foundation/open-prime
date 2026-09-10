import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-decimation-choosing-an-algorithm-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Situation</th>
                            <th>Recommended algorithm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Time series, trend and overall shape matter</td>
                            <td><i>'lttb'</i></td>
                        </tr>
                        <tr>
                            <td>Signal data, visible peaks and troughs matter</td>
                            <td><i>'min-max'</i></td>
                        </tr>
                        <tr>
                            <td>Dense scatter, point density and clusters matter</td>
                            <td><i>'k-means'</i> (scatter only)</td>
                        </tr>
                        <tr>
                            <td>Exact row inspection or audit-style readouts</td>
                            <td>Avoid decimation or zoom into raw detail</td>
                        </tr>
                        <tr>
                            <td>Financial OHLC, exact open/high/low/close semantics</td>
                            <td>Use candlestick instead</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DecimationChoosingAnAlgorithmDoc {}
