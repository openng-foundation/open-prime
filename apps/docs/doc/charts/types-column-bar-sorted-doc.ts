import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ChartsModule } from '@openng/optimus-ui/charts';

@Component({
    selector: 'types-column-bar-sorted-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, ChartsModule],
    template: `
        <app-docsectiontext>
            <p>
                Set <i>sort</i> to reorder bars before rendering. <i>value-desc</i> places the highest value first; <i>value-asc</i> reverses it. <i>label-asc</i> and <i>label-desc</i> sort alphabetically by category name. For multi-series charts,
                <i>sortAggregate</i> controls how series values combine to determine rank. The default is <i>sum</i>.
            </p>
        </app-docsectiontext>
        @defer (on viewport) {
            <div class="card">
                <div style="height: 460px">
                    <p-chart-svg>
                        <p-chart-bar [data]="data" categoryXField="queue" valueYField="tickets" sort="value-desc" [borderRadius]="4" color="#5daeea" />
                        <p-chart-x-axis />
                        <p-chart-y-axis label="Open tickets" />
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
export class ColumnBarSortedDoc {
    readonly data = [
        { queue: 'Returns', tickets: 60 },
        { queue: 'Billing', tickets: 100 },
        { queue: 'Checkout', tickets: 120 },
        { queue: 'Shipping', tickets: 90 },
        { queue: 'Accounts', tickets: 80 }
    ];
}
