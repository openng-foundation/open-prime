import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import type { TaskBoardColumnModel } from '@openng/optimus-ui/types/taskboard';
import { TASKBOARD_STATE } from './taskboard-state';

/**
 * The columns viewport: the scroll container, the phase-header band and the swimlane grid switch.
 *
 * @module taskboard-content
 */

/** One segment of the phase-header band. */
interface GroupSegment {
    /** Text of the header, empty for the spacer that stands in for an ungrouped column. */
    label: string;
    /** Accent colour of the underline. */
    color?: string;
    /** How many consecutive columns the segment covers. */
    span: number;
}

/**
 * The board's content region.
 *
 * Owns the scroll container and the phase headers; the columns themselves are projected. On a
 * grouped board it switches to the swimlane grid container and leaves the header row and the rows to
 * the application, because only the application's template knows which cell goes where.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-content',
    standalone: true,
    template: `
        <div [attr.data-scope]="'taskboard'" data-part="columns" [class]="containerClass()">
            @if (segments().length > 0) {
                <div class="p-taskboard-column-group-headers">
                    <div class="p-taskboard-column-group-headers-inner">
                        @for (segment of segments(); track $index) {
                            <div class="p-taskboard-column-group-header" [style]="spanStyle(segment.span, segment.color)">{{ segment.label }}</div>
                        }
                    </div>
                </div>
                <div class="p-taskboard-column-group-mobile-headers">
                    <div class="p-taskboard-column-group-mobile-headers-inner">
                        @for (entry of mobileSegments(); track $index) {
                            <div [class]="entry.label ? 'p-taskboard-column-group-mobile-header' : 'p-taskboard-column-group-mobile-header p-taskboard-column-group-mobile-header-empty'" [style]="spanStyle(1, entry.color)">{{ entry.label }}</div>
                        }
                    </div>
                </div>
            }
            <div [class]="trackClass()"><ng-content /></div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'content',
        class: 'p-taskboard-body'
    }
})
export class TaskBoardContent {
    private readonly state = inject(TASKBOARD_STATE);

    /** Which container the columns sit in: the flex row, the grouped stack, or the swimlane grid. */
    protected readonly containerClass = computed(() => {
        if (this.state.grouped()) return 'p-taskboard-swimlane-grid';

        return this.segments().length > 0 ? 'p-taskboard-columns p-taskboard-columns-with-groups' : 'p-taskboard-columns';
    });

    /**
     * The wrapper the projected columns sit in.
     *
     * Grouped boards need a real row under the header band, because the outer container has turned
     * into a column stack. Ungrouped boards must NOT gain a box between the container and the
     * columns, or the columns stop being flex items of the scroller — so the wrapper is still
     * emitted, and `display: contents` makes it disappear from the layout. One wrapper either way
     * means one `<ng-content>`, and Angular only ever fills the first of those.
     */
    protected readonly trackClass = computed(() => (this.segments().length > 0 ? 'p-taskboard-columns-track' : 'p-taskboard-columns-plain'));

    /**
     * The phase-header band, as runs of consecutive columns.
     *
     * Walks the VISIBLE column order and opens a new segment whenever the group changes, which is
     * what makes a group whose columns are no longer adjacent — because of `order` or because a
     * column was hidden — render as two labelled runs instead of one label stretched over a lane
     * that does not belong to it.
     */
    protected readonly segments = computed<GroupSegment[]>(() => {
        const groups = this.state.columnGroups();
        if (groups.length === 0) return [];

        const columns = this.state.columns();
        if (columns.length === 0) return [];

        const out: GroupSegment[] = [];
        let current: GroupSegment | null = null;
        let currentLabel: string | null = null;

        for (const column of columns) {
            const group = groups.find((entry) => entry.columns.some((id) => String(id) === String(column.id)));
            const label = group?.label ?? null;

            if (current && currentLabel === label) {
                current.span += 1;
                continue;
            }

            current = { label: label ?? '', color: group?.color, span: 1 };
            currentLabel = label;
            out.push(current);
        }

        return out;
    });

    /**
     * The narrow-screen band: the group label repeated once per column.
     *
     * A single column fills the viewport below the container breakpoint, so a segment spanning three
     * of them would leave two of the three scrolled past with no label at all.
     */
    protected readonly mobileSegments = computed(() => {
        const groups = this.state.columnGroups();
        if (groups.length === 0) return [];

        return this.state.columns().map((column: TaskBoardColumnModel) => {
            const group = groups.find((entry) => entry.columns.some((id) => String(id) === String(column.id)));
            return { label: group?.label ?? '', color: group?.color };
        });
    });

    /**
     * Hands a header segment its span and its accent, and lets the stylesheet do the arithmetic.
     *
     * Only the two things the stylesheet cannot know are set here. The width itself is a `calc()` in
     * the stylesheet over the column-width token, so the header keeps following every responsive
     * change of it — the container query, the narrow-screen fallback, a scoped token override —
     * which a pixel width measured in TypeScript would not.
     */
    protected spanStyle(span: number, color?: string): Record<string, string> {
        const style: Record<string, string> = { '--p-taskboard-group-span': String(span) };

        if (color) style['--p-taskboard-column-group-color'] = color;

        return style;
    }
}
