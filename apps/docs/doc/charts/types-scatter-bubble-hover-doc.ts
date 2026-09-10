import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-scatter-bubble-hover-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                <i>ChartHover</i> brightens the hovered point while the rest stay at normal opacity. Set <i>brightness</i> to control the lightening factor, and set <i>dimOpacity</i> below <i>1</i> when you intentionally want non-hovered points to
                fade. Use <i>hoverPointRadius</i> on <i>ChartScatter</i> to control how much the marker enlarges; the default is <i>markerSize × 1.3</i>.
            </p>
            <p>For full configuration see <a href="/charts/configuration/hover">Hover</a>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-scatter id="enterprise" [data]="enterpriseData" valueXField="onboardingDays" valueYField="health" name="Enterprise" color="#7c8cff" [markerSize]="7" />
                        <p-chart-scatter id="mid-market" [data]="midMarketData" valueXField="onboardingDays" valueYField="health" name="Mid-market" color="#4ecdc4" [markerSize]="7" />
                        <p-chart-x-axis label="Onboarding duration (days)" />
                        <p-chart-y-axis label="Account health score" />
                        <p-chart-hover />
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
export class ScatterBubbleHoverDoc {
    readonly enterpriseData = [
        { onboardingDays: 12, health: 82 },
        { onboardingDays: 16, health: 77 },
        { onboardingDays: 21, health: 72 },
        { onboardingDays: 28, health: 64 },
        { onboardingDays: 35, health: 58 },
        { onboardingDays: 42, health: 51 },
        { onboardingDays: 49, health: 46 }
    ];
    readonly midMarketData = [
        { onboardingDays: 8, health: 88 },
        { onboardingDays: 13, health: 83 },
        { onboardingDays: 18, health: 79 },
        { onboardingDays: 24, health: 73 },
        { onboardingDays: 31, health: 67 },
        { onboardingDays: 38, health: 62 },
        { onboardingDays: 45, health: 54 }
    ];
}
