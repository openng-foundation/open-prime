/**
 * One collapsible group of playground controls.
 *
 * A playground has too many controls to show at once -- that is what makes it a playground rather
 * than a demo -- so they are grouped and collapsed. The open state is owned by the playground
 * rather than by each section, so it can open the group a reader has just changed something in.
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, output } from '@angular/core';

/**
 * A titled, collapsible group of controls.
 *
 * @group Components
 */
@Component({
    selector: 'app-playground-section',
    standalone: true,
    template: `
        <section class="chart-playground-section" [attr.data-open]="open()">
            <button type="button" class="chart-playground-section-header" [attr.aria-expanded]="open()" (click)="toggle.emit()">
                <span>{{ title() }}</span>
                <i class="pi" [class.pi-chevron-down]="open()" [class.pi-chevron-right]="!open()" aria-hidden="true"></i>
            </button>
            <div class="chart-playground-section-body" [hidden]="!open()">
                <ng-content />
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PlaygroundSectionComponent {
    /**
     * Group heading.
     * @group Props
     */
    readonly title = input('');
    /**
     * Whether the group is expanded.
     * @group Props
     */
    readonly open = input(false, { transform: booleanAttribute });
    /**
     * Fired when the header is pressed. The playground owns the state, so this only asks.
     * @group Emits
     */
    readonly toggle = output<void>();
}
