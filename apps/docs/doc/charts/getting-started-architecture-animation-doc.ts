import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'getting-started-architecture-animation-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Each renderer runs its own animation loop. Entrance animations play on mount, update animations interpolate when data changes, and exit animations play when a series is removed.</p>
            <p>For timing, easing, and per-series configuration, see <a href="/charts/configuration/animation">Animation</a>.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureAnimationDoc {}
