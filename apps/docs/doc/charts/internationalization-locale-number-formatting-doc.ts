import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const BASE_BTN = 'px-3 py-1 text-xs font-mono tracking-wide uppercase rounded-md border cursor-pointer transition-colors ';
const ACTIVE_BTN = 'font-semibold text-primary border-primary/30 bg-primary/10';
const INACTIVE_BTN = 'font-medium text-surface-500 dark:text-surface-400 border-transparent hover:text-surface-900 dark:hover:text-surface-100 hover:border-surface-200 dark:hover:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800';

@Component({
    selector: 'internationalization-locale-number-formatting-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>locale</i> to change how numeric axis labels and tooltip values are formatted. Number formatting follows <i>Intl.NumberFormat</i> conventions. Digit grouping, decimal separator, and notation all adapt to the locale.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div>
                    <div class="inline-flex gap-1 mb-4">
                        @for (loc of locales; track loc) {
                            <button [class]="baseBtn + (activeLocale() === loc ? activeBtn : inactiveBtn)" (click)="activeLocale.set(loc)">{{ loc }}</button>
                        }
                    </div>
                    <p-chart-svg [height]="400" [locale]="activeLocale()">
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="revenue" name="Revenue" />
                        <p-chart-bar [data]="data" categoryXField="quarter" valueYField="expenses" name="Expenses" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-legend />
                        <p-chart-tooltip />
                    </p-chart-svg>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocaleNumberFormattingDoc {
    readonly locales = ['en-US', 'de-DE', 'fr-FR', 'ja-JP'];
    readonly activeLocale = signal('de-DE');
    readonly baseBtn = BASE_BTN;
    readonly activeBtn = ACTIVE_BTN;
    readonly inactiveBtn = INACTIVE_BTN;

    readonly data = [
        { quarter: 'Q1', revenue: 1284500, expenses: 942300 },
        { quarter: 'Q2', revenue: 1567800, expenses: 1103400 },
        { quarter: 'Q3', revenue: 1421200, expenses: 1034600 },
        { quarter: 'Q4', revenue: 1892400, expenses: 1287100 }
    ];
}
