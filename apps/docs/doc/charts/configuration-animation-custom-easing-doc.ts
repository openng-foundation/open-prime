import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { registerEasing, ChartsModule, type EasingFunctionName } from '@openng/optimus-ui/charts';
import { ButtonDirective } from '@openng/optimus-ui/button';

registerEasing('easeOutCustom', (t) => 1 - Math.pow(1 - t, 4));
const easeOutCustom = 'easeOutCustom' as EasingFunctionName;

@Component({
    selector: 'configuration-animation-custom-easing-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule, ButtonDirective],
    template: `
        <app-docsectiontext>
            <p>Register a custom easing function once at app startup using <i>registerEasing</i>, then reference it by name in <i>animation.easing</i> across the app.</p>
            <p>Use <i>getEasing</i> to retrieve a registered function by name, when applying the same curve in canvas <i>animate</i> callbacks inside <i>renderMarker</i>.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex mb-2">
                    <button pButton type="button" severity="secondary" class="!text-surface-900 dark:!text-surface-100" (click)="replayKey.update((v) => v + 1)">Replay</button>
                </div>
                @for (k of [replayKey()]; track k) {
                    <p-chart-svg [height]="460" [animation]="{ duration: 800, easing: easing }">
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="signups" color="#5ccf9f" [borderRadius]="4" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                    </p-chart-svg>
                }
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationCustomEasingDoc {
    readonly replayKey = signal(0);
    readonly easing = easeOutCustom;

    readonly data = [
        { month: 'Jan', signups: 540 },
        { month: 'Feb', signups: 620 },
        { month: 'Mar', signups: 810 },
        { month: 'Apr', signups: 730 },
        { month: 'May', signups: 900 },
        { month: 'Jun', signups: 680 }
    ];
}
