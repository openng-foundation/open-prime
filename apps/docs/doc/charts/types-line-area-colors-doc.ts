import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-line-area-colors-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>Set <i>color</i> to apply a single color to the line and its area fill. Accepts any CSS color string.</p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-line [data]="data" categoryXField="month" valueYField="priority" color="#e5484d" name="Priority" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="standard" color="#ffad5a" name="Standard" />
                        <p-chart-line [data]="data" categoryXField="month" valueYField="deflected" color="#ffd166" name="Deflected" />
                        <p-chart-x-axis />
                        <p-chart-y-axis />
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
export class LineAreaColorsDoc {
    readonly data = [
        { month: 'Jan', priority: 64, standard: 42, deflected: 28 },
        { month: 'Feb', priority: 68, standard: 45, deflected: 31 },
        { month: 'Mar', priority: 63, standard: 49, deflected: 36 },
        { month: 'Apr', priority: 72, standard: 47, deflected: 39 },
        { month: 'May', priority: 76, standard: 51, deflected: 44 },
        { month: 'Jun', priority: 81, standard: 56, deflected: 48 }
    ];
}
