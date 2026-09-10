import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-tree-shaking-standalone-imports-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Import the renderer and the chart types being drawn, and list them in the component's <i>imports</i> array:</p>
            <p>
                The bundler keeps only the imported components. Every chart type and customization has a standalone name: <i>ChartSvg</i>, <i>ChartCanvas</i>, <i>ChartLine</i>, <i>ChartBar</i>, <i>ChartPie</i>, <i>ChartRadar</i>, <i>ChartScatter</i>,
                <i>ChartCandlestick</i>, <i>ChartHeatmap</i>, <i>ChartTreemap</i>, <i>ChartPolar</i>, plus customizations (<i>ChartTooltip</i>, <i>ChartLegend</i>, <i>ChartZoom</i>, axes, and so on). Each wrapper imports its renderer from a narrow
                <i>chart-core</i> subpath, so naming <i>ChartLine</i> never reaches the candlestick or treemap renderers.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeShakingStandaloneImportsDoc {}
