import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'configuration-title-caption-responsive-scaling-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>When <i>fontSize</i> is omitted, title and caption font sizes adapt to the container width across four tiers. Resize the chart to see the text scale down on smaller containers.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-surface-500">Width: {{ containerWidth() }}px</span>
                        <input type="range" min="200" max="800" class="flex-1" [value]="containerWidth()" (input)="containerWidth.set(+asInput($event).value)" />
                    </div>
                    <div [style.width]="'min(' + containerWidth() + 'px, 100%)'" style="margin: 0 auto">
                        <p-chart-svg [height]="460">
                            <p-chart-bar [data]="data" categoryXField="month" valueYField="arr" color="#5daeea" />
                            <p-chart-x-axis />
                            <p-chart-y-axis />
                            <p-chart-title text="Expansion ARR Run Rate" />
                            <p-chart-caption text="Resize to see adaptive font scaling" />
                            <p-chart-tooltip />
                        </p-chart-svg>
                    </div>
                </div>
            </div>
            <app-code></app-code>
        } @placeholder {
            <div class="card" style="min-height: 26rem"></div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleCaptionResponsiveScalingDoc {
    readonly containerWidth = signal(600);

    readonly data = [
        { month: 'Jan', arr: 42 },
        { month: 'Feb', arr: 55 },
        { month: 'Mar', arr: 48 },
        { month: 'Apr', arr: 63 },
        { month: 'May', arr: 58 },
        { month: 'Jun', arr: 71 }
    ];

    asInput(e: Event): HTMLInputElement {
        return e.target as HTMLInputElement;
    }
}
