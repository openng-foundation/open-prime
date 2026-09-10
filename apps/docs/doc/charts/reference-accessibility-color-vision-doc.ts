import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'reference-accessibility-color-vision-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Color alone can be difficult to distinguish for viewers with color vision deficiency. Set <i>patterns</i> to <i>true</i> to make every series distinguishable by texture in addition to color. Filled marks receive a cycled texture
                pattern, line series receive distinct dash styles, and heatmaps switch to a colorblind-safe sequential scale. An explicit color, gradient, or pattern is always respected, so <i>patterns</i> fills the default without overriding a
                deliberate choice.
            </p>
            <p>Patterns travel through the same fill pipeline as solid colors, so the legend and tooltip show the pattern, and the SVG and Canvas renderers produce matching output.</p>
            <p>A pattern can also be set directly, per series or per item, without enabling the full auto-mode. A <i>PatternFill</i> is a <i>FillValue</i>, accepted anywhere a color is, so assigning one to a mark's <i>color</i> sets the texture.</p>
            <p>
                <i>color</i> is the solid fill of the shape. The texture is knocked out of that fill as transparent grooves, so the mark reads as a filled color carrying a distinguishing texture rather than sparse lines on an empty background. Set
                <i>backgroundColor</i> for an opaque two-tone pattern, where the texture is painted in the second color instead of left transparent. The built-in patterns are <i>dots</i>, <i>lines-horizontal</i>, <i>lines-vertical</i>,
                <i>diagonal</i>, <i>diagonal-reverse</i>, <i>grid</i>, <i>crosshatch</i>, and <i>zigzag</i>. Set <i>size</i> to change the tile size and <i>strokeWidth</i> to change the texture line weight.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex justify-center mb-2">
                    <button
                        class="px-3 py-1 text-xs font-mono font-medium tracking-wide uppercase rounded-md border border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:border-surface-200 dark:hover:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                        (click)="colorblind.set(!colorblind())"
                    >
                        {{ colorblind() ? 'Colorblind mode' : 'Normal mode' }}
                    </button>
                </div>
                <div style="display: flex; justify-content: center">
                    <p-chart-svg [width]="480" [height]="460">
                        <p-chart-pie [data]="data" valueField="share" categoryField="browser" />
                        <p-chart-legend />
                        <p-chart-tooltip />
                        <p-chart-accessibility [patterns]="colorblind()" description="Browser market share as a pie chart: Chrome 63 percent, Safari 20 percent, Edge 9 percent, Firefox 5 percent, Other 3 percent." />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityColorVisionDoc {
    readonly colorblind = signal(true);

    readonly data = [
        { browser: 'Chrome', share: 63 },
        { browser: 'Safari', share: 20 },
        { browser: 'Edge', share: 9 },
        { browser: 'Firefox', share: 5 },
        { browser: 'Other', share: 3 }
    ];
}
