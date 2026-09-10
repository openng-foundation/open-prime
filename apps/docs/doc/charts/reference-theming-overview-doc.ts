import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'reference-theming-overview-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>PrimeUI Chart supports two renderers and they theme differently by design:</p>
            <ul>
                <li><strong>SVG</strong>: reads CSS custom properties natively. Override <i>--p-chart-*</i> variables at any scope and charts update without a JS re-render. Dark mode is handled by CSS.</li>
                <li><strong>Canvas</strong>: stays DOM-free so it works in Web Workers, OffscreenCanvas, and SSR. Theme is a plain JS object passed as an input.</li>
            </ul>
            <p>The <i>theme</i> input works on both <i>&lt;p-chart-svg&gt;</i> and <i>&lt;p-chart-canvas&gt;</i>. CSS is SVG only.</p>
            <p>Both renderers ship with matching default palettes so they look identical by default.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemingOverviewDoc {}
