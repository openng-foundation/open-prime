import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule, type Alignment } from '@openng/optimus-ui/charts';

const BASE_BTN = 'px-3 py-1 text-xs font-mono tracking-wide uppercase rounded-md border cursor-pointer transition-colors ';
const ACTIVE_BTN = 'font-semibold text-primary border-primary/30 bg-primary/10';
const INACTIVE_BTN = 'font-medium text-surface-500 dark:text-surface-400 border-transparent hover:text-surface-900 dark:hover:text-surface-100 hover:border-surface-200 dark:hover:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800';

@Component({
    selector: 'configuration-title-caption-alignment-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>alignment</i> to <i>start</i>, <i>center</i>, or <i>end</i> to control horizontal placement within the title area. Both <i>ChartTitle</i> and <i>ChartCaption</i> accept <i>alignment</i> independently.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex flex-col gap-4">
                    <div class="inline-flex gap-1">
                        @for (opt of options; track opt) {
                            <button [class]="baseBtn + (alignment() === opt ? activeBtn : inactiveBtn)" (click)="alignment.set(opt)">{{ opt }}</button>
                        }
                    </div>
                    <p-chart-svg [height]="460">
                        <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
                        <p-chart-title text="Expansion ARR Run Rate" [alignment]="alignment()" />
                        <p-chart-caption text="January - June 2026" [alignment]="alignment()" />
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
export class TitleCaptionAlignmentDoc {
    readonly alignment = signal<Alignment>('center');
    readonly options: Alignment[] = ['start', 'center', 'end'];
    readonly baseBtn = BASE_BTN;
    readonly activeBtn = ACTIVE_BTN;
    readonly inactiveBtn = INACTIVE_BTN;

    readonly data = [
        { month: 'Jan', arr: 42 },
        { month: 'Feb', arr: 55 },
        { month: 'Mar', arr: 48 },
        { month: 'Apr', arr: 63 },
        { month: 'May', arr: 58 },
        { month: 'Jun', arr: 71 }
    ];
}
