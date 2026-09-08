import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'philosophy-trademark-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Optimus UI is not affiliated with, endorsed by, or sponsored by PrimeTek. PrimeNG, PrimeFaces, PrimeReact, PrimeVue and PrimeFlex are their trademarks. The rename from the inherited names — the packages, the CSS layer, the icon
                library — is a trademark matter, not a technical one, and it is why we ship a <a href="https://v1.optimus.openng.org/migration/primeng" target="_blank" rel="noopener noreferrer" class="doc-link">migration schematic</a> rather than
                asking you to rewrite imports by hand.
            </p>
            <p>
                References to PrimeNG remain throughout this documentation and the source, and they are deliberate. Attribution is the point: this library is PrimeTek's decade of work plus whatever the community adds on top. Pretending otherwise
                would be both dishonest and useless to anyone trying to find their way around a familiar API.
            </p>
            <p>The code we forked was published under the MIT license, and we distribute it under those same terms, with the original copyright notices intact.</p>
        </app-docsectiontext>
    `
})
export class PhilosophyTrademarkDoc {}
