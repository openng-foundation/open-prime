import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type TooltipRow, type TooltipValueContext } from '@openng/optimus-ui/charts';

const marketFlow = [
    { date: new Date('2025-05-04T00:00:00+03:00').getTime(), value: 2840000, change: 0.012 },
    { date: new Date('2025-05-05T00:00:00+03:00').getTime(), value: 2915000, change: 0.026 },
    { date: new Date('2025-05-06T00:00:00+03:00').getTime(), value: 2872000, change: -0.015 },
    { date: new Date('2025-05-07T00:00:00+03:00').getTime(), value: 3024000, change: 0.053 },
    { date: new Date('2025-05-08T00:00:00+03:00').getTime(), value: 3168000, change: 0.048 },
    { date: new Date('2025-05-11T00:00:00+03:00').getTime(), value: 3096000, change: -0.023 },
    { date: new Date('2025-05-12T00:00:00+03:00').getTime(), value: 3241000, change: 0.047 },
    { date: new Date('2025-05-13T00:00:00+03:00').getTime(), value: 3385000, change: 0.044 }
];

const currencyFormatter = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('ar-SA', { style: 'percent', signDisplay: 'exceptZero', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' });

@Component({
    selector: 'internationalization-rtl-localized-time-series-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                RTL layout can be combined with <i>locale</i> on the same chart root. This is useful for financial and operations dashboards where the axis dates, numeric values, tooltip content, legend, and overlay placement should all follow the
                same locale and reading direction.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg locale="ar-SA" dir="rtl" [height]="420" [animation]="{ duration: 300 }">
                    <p-chart-line [data]="marketFlow" categoryXField="date" valueYField="value" name="قيمة المحفظة" color="#5ccf9f" curve="smooth" [lineStrokeWidth]="2.5" [fillOpacity]="0.14" [showMarkers]="true" />
                    <p-chart-tooltip [valueFormatter]="tooltipRows" snap="x" />
                    <p-chart-hover />
                    <p-chart-legend position="bottom" />
                    <p-chart-x-axis type="time" timezone="Asia/Riyadh" [dateTimeFormats]="dateTimeFormats" label="تاريخ التسوية" />
                    <p-chart-y-axis label="ريال سعودي" [startFromZero]="false" />
                    <p-chart-title text="محفظة سوق الرياض" />
                    <p-chart-caption text="تدفقات يومية بالريال السعودي مع محور زمني وأرقام منسقة للغة العربية." />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RtlLocalizedTimeSeriesDoc {
    readonly marketFlow = marketFlow;
    readonly dateTimeFormats: Record<string, Intl.DateTimeFormatOptions> = {
        day: { day: 'numeric', month: 'short' },
        week: { day: 'numeric', month: 'short' }
    };

    readonly tooltipRows = (value: number, ctx: TooltipValueContext): TooltipRow[] => {
        const item = marketFlow[ctx.index ?? 0] ?? marketFlow[0];
        const color = item.change >= 0 ? '#10a981' : '#e5484d';

        return [
            { label: 'التاريخ', value: dateFormatter.format(item.date) },
            { label: 'القيمة', value: currencyFormatter.format(value) },
            { label: 'التغير اليومي', value: percentFormatter.format(item.change), color }
        ];
    };
}
