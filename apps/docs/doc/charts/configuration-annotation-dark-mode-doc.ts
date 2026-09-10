import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type AnnotationContext } from '@openng/optimus-ui/charts';
import { injectIsDarkMode } from '@/doc/charts/_shared/inject-chart-theme';

@Component({
    selector: 'configuration-annotation-dark-mode-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Use <i>textColor</i> for theme-aware text. It is always populated regardless of chart type and already matches the active color scheme, so text adapts to dark mode automatically. The context does not expose a dark-mode flag, so
                content that is not text (such as an adaptive background fill) detects the scheme on its own, as the demo below does.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="value" color="#7c8cff" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-annotation>
                        <ng-template pChartAnnotationDef let-ctx>
                            @let b = box(ctx);
                            @if (b) {
                                <svg:g>
                                    <svg:rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="6" [attr.fill]="b.bg" />
                                    <svg:text [attr.x]="b.x + b.w / 2" [attr.y]="b.y + b.h / 2" text-anchor="middle" dominant-baseline="central" [attr.font-size]="b.fs" font-weight="500">{{ b.text }}</svg:text>
                                </svg:g>
                            }
                        </ng-template>
                    </p-chart-annotation>
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationDarkModeDoc {
    readonly isDark = injectIsDarkMode();
    readonly data = [
        { month: 'Jan', value: 42 },
        { month: 'Feb', value: 38 },
        { month: 'Mar', value: 55 },
        { month: 'Apr', value: 47 },
        { month: 'May', value: 62 },
        { month: 'Jun', value: 58 }
    ];

    box(ctx: AnnotationContext): { x: number; y: number; w: number; h: number; bg: string; fs: number; text: string } | null {
        const { chartArea, responsive } = ctx;

        if (!chartArea) return null;

        const dark = this.isDark();

        return {
            x: chartArea.x + 8,
            y: chartArea.y + 8,
            w: responsive.pick({ xs: 92, sm: 106, md: 120 }),
            h: responsive.pick({ xs: 28, sm: 32, md: 36 }),
            bg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            fs: responsive.pick({ xs: 9, sm: 10, md: 12 }),
            text: dark ? '🌙 Dark Mode' : '☀️ Light Mode'
        };
    }
}
