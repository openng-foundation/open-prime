import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'types-candlestick-import-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>
                Candlestick and OHLC charts visualize price movement over time. Each mark encodes open, high, low, and close for a time period. Positive marks rise (close &gt; open), negative marks fall. Set <i>variant</i> to <i>"ohlc"</i> for
                tick-based bars or <i>"hollow"</i> for hollow candlestick bodies.
            </p>
        </app-docsectiontext>
        <app-code></app-code>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandlestickImportDoc {}
