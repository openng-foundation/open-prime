import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';
import { ButtonDirective } from '@openng/optimus-ui/button';

@Component({
    selector: 'configuration-animation-duration-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule, ButtonDirective],
    template: `
        <app-docsectiontext>
            <p>Set <i>animation.duration</i> to control the animation length in milliseconds. The default is 1000ms.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex mb-2">
                    <button pButton type="button" severity="secondary" class="!text-surface-900 dark:!text-surface-100" (click)="replayKey.update((v) => v + 1)">Replay</button>
                </div>
                @for (k of [replayKey()]; track k) {
                    <p-chart-svg [height]="460" [animation]="{ duration: 1200 }">
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="signups" color="#7c8cff" [borderRadius]="4" />
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
export class AnimationDurationDoc {
    readonly replayKey = signal(0);

    readonly data = [
        { month: 'Jan', signups: 540 },
        { month: 'Feb', signups: 620 },
        { month: 'Mar', signups: 810 },
        { month: 'Apr', signups: 730 },
        { month: 'May', signups: 900 },
        { month: 'Jun', signups: 680 }
    ];
}
