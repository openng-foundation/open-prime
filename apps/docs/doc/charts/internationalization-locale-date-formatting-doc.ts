import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

const BASE_BTN = 'px-3 py-1 text-xs font-mono tracking-wide uppercase rounded-md border cursor-pointer transition-colors ';
const ACTIVE_BTN = 'font-semibold text-primary border-primary/30 bg-primary/10';
const INACTIVE_BTN = 'font-medium text-surface-500 dark:text-surface-400 border-transparent hover:text-surface-900 dark:hover:text-surface-100 hover:border-surface-200 dark:hover:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800';

@Component({
    selector: 'internationalization-locale-date-formatting-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p><i>locale</i> also drives date axis labels on time-series charts. The axis adapts its tick labels to match the locale's date conventions. Month names, day/month order, and calendar notation all change with the locale.</p>
            <p>Use <i>dateTimeFormats</i> on <i>ChartXAxis</i> to override the default format for a specific time unit without changing the locale.</p>
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
                        <p-chart-line [data]="data" categoryXField="date" valueYField="value" name="Sales" curve="smooth" [showMarkers]="true" />
                        <p-chart-x-axis type="time" />
                        <p-chart-y-axis />
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
export class LocaleDateFormattingDoc {
    readonly locales = ['en-US', 'de-DE', 'ja-JP', 'ar-SA'];
    readonly activeLocale = signal('ja-JP');
    readonly baseBtn = BASE_BTN;
    readonly activeBtn = ACTIVE_BTN;
    readonly inactiveBtn = INACTIVE_BTN;

    readonly data = [
        { date: new Date(2024, 0, 1), value: 42 },
        { date: new Date(2024, 1, 1), value: 58 },
        { date: new Date(2024, 2, 1), value: 51 },
        { date: new Date(2024, 3, 1), value: 67 },
        { date: new Date(2024, 4, 1), value: 74 },
        { date: new Date(2024, 5, 1), value: 63 },
        { date: new Date(2024, 6, 1), value: 81 },
        { date: new Date(2024, 7, 1), value: 78 },
        { date: new Date(2024, 8, 1), value: 69 },
        { date: new Date(2024, 9, 1), value: 85 },
        { date: new Date(2024, 10, 1), value: 72 },
        { date: new Date(2024, 11, 1), value: 90 }
    ];
}
