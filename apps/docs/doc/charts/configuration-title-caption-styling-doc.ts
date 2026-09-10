import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-title-caption-styling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Customize font size, weight, family, style, and color using the font inputs. Set <i>color</i> to any CSS color value to override the default theme text color. Use <i>lineHeight</i> to adjust the line height multiplier applied to the
                font size. Use <i>padding</i> to control the space above and below the title or caption. Pass a number for uniform spacing or <i>{{ '{' }} top, bottom {{ '}' }}</i> for independent control.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <p-chart-svg [height]="460">
                    <p-chart-line [data]="data" categoryXField="month" valueYField="activation" color="#7c8cff" curve="smooth" />
                    <p-chart-x-axis />
                    <p-chart-y-axis />
                    <p-chart-title text="Activation Trend" [fontSize]="20" fontWeight="bold" fontFamily="Georgia, serif" fontStyle="italic" color="#7c8cff" />
                    <p-chart-caption text="H1 2026 enterprise cohort" [fontSize]="13" color="#94a3b8" />
                    <p-chart-tooltip />
                </p-chart-svg>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCaptionStylingDoc {
    readonly data = [
        { month: 'Jan', activation: 84 },
        { month: 'Feb', activation: 97 },
        { month: 'Mar', activation: 110 },
        { month: 'Apr', activation: 103 },
        { month: 'May', activation: 128 },
        { month: 'Jun', activation: 145 }
    ];
}
