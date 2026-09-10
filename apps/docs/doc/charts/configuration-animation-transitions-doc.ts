import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'configuration-animation-transitions-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p><i>transitions</i> configures state-change animation timing for hover, show/hide, and container resize events. The input shape is accepted; triggers are not yet wired.</p>
            <p>Hover colors are configured on <i>&lt;p-chart-hover&gt;</i> or per-series <i>hoverColor</i>. <i>transitions.active</i> controls only the timing of the transition, not the target color.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationTransitionsDoc {}
