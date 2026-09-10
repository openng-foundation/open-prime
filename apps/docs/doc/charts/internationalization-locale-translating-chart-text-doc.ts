import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, registerLocale } from '@openng/optimus-ui/charts';
import { de } from '@openng/optimus-ui/charts/locales';

registerLocale('de', de);

@Component({
    selector: 'internationalization-locale-translating-chart-text-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>locale</i> formats numbers and dates on its own, because those come from <i>Intl</i>. Prose does not. Screen-reader descriptions, data-table headers, the export menu, and keyboard hints are written sentences, so a catalogue has to
                be registered before they change language. Fourteen ship with the library: <i>ar</i>, <i>de</i>, <i>es</i>, <i>fr</i>, <i>he</i>, <i>it</i>, <i>ja</i>, <i>ko</i>, <i>nl</i>, <i>pl</i>, <i>pt</i>, <i>ru</i>, <i>tr</i>, <i>zh</i>.
                English is built in.
            </p>
            <p>Most of a catalogue is announced rather than drawn. The export menu above shows German labels, and the rest reaches the accessibility tree.</p>
            <p>
                Registration is global, and order does not matter: a catalogue registered after a chart has mounted re-resolves that chart's text. The catalogue follows the same cascade as the number format, taking the <i>locale</i> prop first, then
                the nearest ancestor <i>[lang]</i> attribute, then <i>'en'</i>. A regional tag falls back to its base language, so registering <i>de</i> also serves <i>de-AT</i> and <i>de-CH</i>. Only imported catalogues reach the bundle.
            </p>
            <p><i>text</i> overrides single entries and merges over the resolved language.</p>
            <p>
                Every catalogue except English is machine-drafted and has not been reviewed by a native speaker. <i>zh</i> covers Simplified Chinese. The Italian catalogue exports <i>it</i>, which collides with the <i>it</i> of Vitest, Jest, and
                Mocha, so rename it at the import site inside a spec file.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="400" locale="de" [numberFormat]="numberFormat">
                    <p-chart-bar [data]="data" categoryXField="quarter" valueYField="revenue" name="Umsatz" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-legend />
                    <p-chart-tooltip />
                    <p-chart-export-menu />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocaleTranslatingChartTextDoc {
    readonly numberFormat: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' };

    readonly data = [
        { quarter: 'Q1', revenue: 1284500 },
        { quarter: 'Q2', revenue: 1567800 },
        { quarter: 'Q3', revenue: 1421200 },
        { quarter: 'Q4', revenue: 1892400 }
    ];
}
