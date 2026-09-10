import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type ChartTheme } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-theming-svg-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                SVG charts are class-driven: every visual element carries a stable class (<i>p-chart-axis-line</i>, <i>p-chart-grid-line</i>, <i>p-chart-tick-label</i>, <i>p-chart-color-0</i> … <i>p-chart-color-13</i>, etc.) and reads its color from
                a CSS custom property.
            </p>
            <p>Import the stylesheet once at the app root:</p>
            <p>Override any variable at any scope (<i>:root</i>, a section, or a single chart wrapper) and the chart picks it up without a JS re-render.</p>
            <p>### Series Palette</p>
            <p>Each series picks up <i>--p-chart-color-N</i> (14 slots by default, indexed by series order). Override a slot inline on any wrapper to retheme the charts inside it.</p>
            <p>### Chrome (Axes, Grid, Labels)</p>
            <p>Chrome elements read semantic aliases. Override an alias to restyle that element without changing the series palette.</p>
            <div class="doc-tablewrapper">
                <table class="doc-table">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Used by</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i>--p-chart-axis</i></td>
                            <td>Axis lines, tick marks, axis titles</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-grid</i></td>
                            <td>Major grid lines</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-grid-minor</i></td>
                            <td>Minor grid lines</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-tick-label-color</i></td>
                            <td>Axis tick labels</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-data-label-color</i></td>
                            <td>Bar/line/point data labels</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-annotation-color</i></td>
                            <td>Annotations, reference labels</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-title-color</i></td>
                            <td>Chart title</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-caption-color</i></td>
                            <td>Chart caption</td>
                        </tr>
                        <tr>
                            <td><i>--p-chart-band-fill</i></td>
                            <td>Alternate band fill</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p>### Hover &amp; Dim Effects</p>
            <p>
                Hover and optional dimming are class-driven (<i>.p-chart-point-hover</i>, <i>.p-chart-point-inactive</i>, <i>.p-chart-series-inactive</i>) and read coefficients from <i>--p-chart-hover-brightness</i> (default <i>1.1</i>) and
                <i>--p-chart-dim-opacity</i> (default <i>1</i>). Set <i>--p-chart-dim-opacity</i> below <i>1</i> globally, or pass <i>dimOpacity</i> to <i>ChartHover</i>, when non-hovered marks should fade.
            </p>
            <p>### Light &amp; Dark</p>
            <p>
                Tokens use the CSS <i>light-dark()</i> function, so dark mode follows the page's <i>color-scheme</i>. With a PrimeUI library, <i>color-scheme: dark</i> on <i>.p-dark</i> flips the entire chart palette with no JS required. With the
                standalone <i>default.css</i>, set <i>color-scheme</i> on a parent element (for example <i>color-scheme: light dark</i>, switching to <i>dark</i> for dark mode), since the chart styles do not set it.
            </p>
            <p>### More Than 14 Series Colors</p>
            <p>By default colors cycle back to slot 0 after the 14th series. For charts with more than 14 series, define additional <i>--p-chart-color-N</i> slots in CSS:</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460" [theme]="theme">
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="north" name="North" [borderRadius]="4" />
                    <p-chart-bar [data]="data" categoryXField="month" valueYField="south" name="South" [borderRadius]="4" />
                    <p-chart-line [data]="data" categoryXField="month" valueYField="west" name="West" [lineStrokeWidth]="3" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemingSvgDoc {
    readonly data = [
        { month: 'Jan', north: 540, south: 320, west: 410 },
        { month: 'Feb', north: 620, south: 480, west: 380 },
        { month: 'Mar', north: 810, south: 620, west: 540 },
        { month: 'Apr', north: 730, south: 580, west: 620 },
        { month: 'May', north: 900, south: 720, west: 690 },
        { month: 'Jun', north: 680, south: 540, west: 760 }
    ];

    readonly theme: ChartTheme = {
        series: ['#5daeea', '#4ecdc4', '#7c8cff']
    };
}
