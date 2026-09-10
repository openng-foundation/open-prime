import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-setup-styles-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Load the base structural stylesheet once in the application styles entry. Add a theme file to control series colors and adapt to dark mode.</p>
            <p>The base file owns structural styles: legends, tooltips, zoom chrome, and accessibility indicators. The theme file controls series palette and maps chart variables to design tokens.</p>
            <p>### Default</p>
            <p>Fixed hex values. No dependency on a PrimeUI library.</p>
            <p>### PrimeOne</p>
            <p>
                Use with a PrimeUI library: <i>primeone.css</i> reads PrimeUI design tokens (<i>--p-*</i>), so a PrimeUI preset must be installed and configured for chart colors to resolve. Series colors inherit the active preset and adapt for dark
                mode automatically. For a setup with no PrimeUI dependency, use <i>default.css</i> instead.
            </p>
            <p>Use <a href="/charts/reference/theming">Theming</a> for the complete CSS variable, color-mode, and style-class reference.</p>
            <p>### Canvas</p>
            <p>
                The stylesheet covers SVG charts. <i>ChartCanvas</i> draws series colors into the bitmap instead of reading CSS, so it takes a theme object through the <i>theme</i> input. The library exports <i>defaultLightTheme</i> and
                <i>defaultDarkTheme</i> as a base, and <a href="/charts/reference/theming">Theming</a> covers the reactive recipe for swapping them on dark-mode toggle.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupStylesDoc {}
