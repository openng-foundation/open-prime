import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'internationalization-locale-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                <i>locale</i> is a BCP 47 locale string set once on the chart root. Axis tick labels and tooltip values use this locale so formatting is consistent across both surfaces. Data labels render the raw value by default; pass a custom
                <i>formatter</i> to <i>ChartDataLabels</i> for locale-aware data labels.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocaleImportDoc {}
