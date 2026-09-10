import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-architecture-imperative-api-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Charts are declarative: inputs in, render out. Two situations need a manual repaint.</p>
            <p>If dark mode is toggled via a class on <i>&lt;html&gt;</i> rather than a reactive <i>theme</i> input, the canvas pixel buffer doesn't know to repaint. The DOM changed; the canvas didn't.</p>
            <p>Inputs that accept functions (<i>labelFormat</i>, <i>renderMarker</i>, and similar) are compared by reference, not by value. Replacing one named function with another won't trigger a redraw on its own.</p>
            <p><i>redraw()</i> covers both. <i>ChartSvg</i> exports itself as <i>pChartSvg</i>, and <i>ChartCanvas</i> as <i>pChartCanvas</i>, so a template reference variable reaches the method directly:</p>
            <p>
                <i>redraw()</i> re-reads every child's current inputs and repaints in a single pass. When the trigger sits outside the template, such as a theme service toggling a class on <i>&lt;html&gt;</i>, query the root with
                <i>viewChild.required(ChartSvg)</i> and call the same method.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureImperativeApiDoc {}
