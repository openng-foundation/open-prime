import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'internationalization-locale-custom-tick-format-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>tickFormat</i> on <i>ChartXAxis</i> or <i>ChartYAxis</i> for full control over axis label text. The function receives the raw tick value and its index and must return a string. Use this for currency symbols, percentage signs,
                or any format that <i>Intl</i> alone cannot produce.
            </p>
            <p><i>tickFormat</i> replaces locale-based formatting. Pass a function <i>(value, index) =&gt; string</i> that returns the label text. A plain string is not a format specifier; it bypasses formatting and renders the raw value.</p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocaleCustomTickFormatDoc {}
