import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, numberAttribute } from '@angular/core';
import { Avatar } from '@openng/optimus-ui/avatar';
import { BarsIcon, ChevronDownIcon } from '@openng/optimus-ui/icons';
import { Tag } from '@openng/optimus-ui/tag';
import type { TaskBoardColumnModel, TaskBoardItem, TaskBoardPriority, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';
import {
    TASKBOARD_CARD_CONTEXT,
    TASKBOARD_COLUMN_CONTEXT,
    TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT,
    TASKBOARD_SWIMLANE_HEADER_CONTEXT,
    type TaskBoardCardContext,
    type TaskBoardColumnContext,
    type TaskBoardSwimlaneColumnHeaderContext,
    type TaskBoardSwimlaneHeaderContext
} from './taskboard-context';
import { TASKBOARD_STATE, formatLabel } from './taskboard-state';

/**
 * The supplied visual parts: a working card, column header and swimlane header, out of the box.
 *
 * These are the only components in the package that decide how anything LOOKS. Everything else is
 * structural, which is the boundary the docs draw: a product that outgrows these drops its own
 * component into the same runtime wrapper and loses nothing.
 *
 * Each one reads its data from the nearest context, so `<p-taskboard-card-ui />` with no bindings is
 * a complete card. The explicit inputs are there for a preview or a component test rendered outside
 * a board, and for the cases where the template already has the value to hand.
 *
 * @module taskboard-ui
 */

/** Initials of a name: two words give two letters, one word gives one. */
function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';

    return parts.length === 1 ? parts[0].charAt(0).toUpperCase() : `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

/** How a priority is abbreviated on the advanced card. */
const PRIORITY_RANK: Record<TaskBoardPriority, string> = { critical: 'P1', high: 'P2', medium: 'P3', low: 'P4' };

/** The palette the advanced card's priority badge uses, keyed by priority. */
const PRIORITY_TONE: Record<TaskBoardPriority, { background: string; color: string }> = {
    critical: { background: 'light-dark(var(--p-red-200), color-mix(in srgb, var(--p-red-500) 24%, transparent))', color: 'light-dark(var(--p-red-800), var(--p-red-200))' },
    high: { background: 'light-dark(var(--p-orange-200), color-mix(in srgb, var(--p-orange-500) 24%, transparent))', color: 'light-dark(var(--p-orange-800), var(--p-orange-200))' },
    medium: { background: 'light-dark(var(--p-amber-200), color-mix(in srgb, var(--p-amber-500) 24%, transparent))', color: 'light-dark(var(--p-amber-800), var(--p-amber-200))' },
    low: { background: 'light-dark(var(--p-slate-200), color-mix(in srgb, var(--p-slate-500) 24%, transparent))', color: 'light-dark(var(--p-slate-700), var(--p-slate-200))' }
};

/**
 * The padlock, inline.
 *
 * The package's icon set has no padlock and its barrel is generated, so a single 12px glyph is not
 * worth a new entry in it — the path is small enough to carry here.
 */
const LOCK_PATH = 'M4.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5H11a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5h1.5Zm1 0h3V4a1.5 1.5 0 0 0-3 0v1.5Z';

/**
 * Reads a due date, treating a date-only string as a LOCAL day.
 *
 * `new Date('2026-09-09')` is defined to parse as UTC midnight, which west of Greenwich lands on the
 * previous local day: a card due today printed yesterday's date and picked up the overdue style.
 * Anything carrying a time is left to the platform, which is where a real instant belongs.
 */
function readDueDate(value: Date | string | number | undefined): Date | undefined {
    if (value == null) return undefined;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;

    if (typeof value === 'string') {
        const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

        if (dateOnly) {
            const local = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
            return Number.isNaN(local.getTime()) ? undefined : local;
        }
    }

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/** Whether the first day is strictly before the second, comparing calendar days only. */
function isBeforeDay(left: Date, right: Date): boolean {
    if (left.getFullYear() !== right.getFullYear()) return left.getFullYear() < right.getFullYear();
    if (left.getMonth() !== right.getMonth()) return left.getMonth() < right.getMonth();

    return left.getDate() < right.getDate();
}

/** The neutral tone the advanced card's labels use. */
const LABEL_TONE = { background: 'light-dark(var(--p-slate-100), color-mix(in srgb, var(--p-slate-400) 18%, transparent))', color: 'light-dark(var(--p-slate-600), var(--p-slate-200))' };

/**
 * The general-purpose card: title, description, labels, progress, owners and a sub-item count.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-ui',
    standalone: true,
    imports: [Avatar, Tag],
    template: `
        <span class="taskboard-card-title">{{ title() }}</span>
        @if (description()) {
            <p class="taskboard-card-description">{{ description() }}</p>
        }
        @if (tags().length > 0) {
            <div class="taskboard-card-tags">
                @for (tag of tags(); track tag) {
                    <p-tag severity="secondary" [value]="tag" />
                }
            </div>
        }
        @if (progress() !== undefined) {
            <div class="taskboard-card-progress">
                <div class="taskboard-card-progress-track"><div class="taskboard-card-progress-fill" [style.width.%]="progress()"></div></div>
                <span class="taskboard-card-progress-label">{{ progress() }}%</span>
            </div>
        }
        @if (owners().length > 0 || subtaskLabel()) {
            <div class="taskboard-card-footer">
                <div class="taskboard-card-assignees">
                    @for (owner of owners(); track owner) {
                        <p-avatar shape="circle" [label]="initials(owner)" [ariaLabel]="owner" />
                    }
                </div>
                @if (subtaskLabel()) {
                    <span class="taskboard-card-subtask-count">{{ subtaskLabel() }}</span>
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-ui', class: 'taskboard-card' }
})
export class TaskBoardCardUI<T extends TaskBoardItem = TaskBoardItem> {
    private readonly card = inject<TaskBoardCardContext<T> | null>(TASKBOARD_CARD_CONTEXT, { optional: true });

    /**
     * The record to render. Taken from the card context when left unset, which is the normal case.
     * @group Props
     */
    readonly task = input<T | undefined>(undefined);

    /** The record this card is rendering: the input, else the one the wrapper provides. */
    protected readonly item = computed<T | undefined>(() => this.task() ?? this.card?.item());

    protected readonly title = computed(() => this.item()?.title ?? '');

    protected readonly description = computed(() => this.item()?.description ?? '');

    protected readonly tags = computed(() => this.item()?.tags ?? []);

    /** Completion, clamped: a stored 140 would otherwise render a bar wider than its track. */
    protected readonly progress = computed(() => {
        const value = this.item()?.progress;
        return value == null ? undefined : Math.max(0, Math.min(100, value));
    });

    /** The owners, from either spelling of the field. */
    protected readonly owners = computed(() => {
        const item = this.item();
        if (!item) return [];

        if (item.assignees && item.assignees.length > 0) return item.assignees;

        return item.assignee ? [item.assignee] : [];
    });

    /** `done/total`, or nothing when the card has no sub-items. */
    protected readonly subtaskLabel = computed(() => {
        const subtasks = this.item()?.subtasks;
        if (!subtasks || subtasks.length === 0) return '';

        return `${subtasks.filter((entry) => entry.completed).length}/${subtasks.length}`;
    });

    protected initials(name: string): string {
        return initialsOf(name);
    }
}

/**
 * The denser card: labels, title, priority, sub-items, due date and one owner in the corner.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-card-advanced-ui',
    standalone: true,
    imports: [Avatar, BarsIcon],
    template: `
        @if (tags().length > 0) {
            <div class="taskboard-card-advanced-tags">
                @for (tag of tags(); track tag) {
                    <span class="taskboard-card-advanced-tag" [style.background]="labelTone.background" [style.color]="labelTone.color">{{ tag }}</span>
                }
            </div>
        }
        <span class="taskboard-card-advanced-title">{{ title() }}</span>
        <div class="taskboard-card-advanced-badges">
            @if (priorityRank()) {
                <span class="taskboard-card-advanced-priority" [style.background]="priorityTone()?.background" [style.color]="priorityTone()?.color">{{ priorityRank() }}</span>
            }
            @if (description()) {
                <span class="taskboard-card-advanced-desc-icon" title="Has description"><svg data-p-icon="bars" aria-hidden="true" width="12" height="12"></svg></span>
            }
            @if (subtaskLabel()) {
                <span class="taskboard-card-advanced-subtasks">{{ subtaskLabel() }}</span>
            }
            @if (dueLabel()) {
                <span [class]="overdue() ? 'taskboard-card-advanced-due taskboard-card-advanced-due-overdue' : 'taskboard-card-advanced-due'">{{ dueLabel() }}</span>
            }
        </div>
        @if (owner()) {
            <p-avatar shape="circle" class="taskboard-card-advanced-avatar" [label]="initials(owner())" [ariaLabel]="owner()" />
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'card-advanced-ui', class: 'taskboard-card-advanced' }
})
export class TaskBoardCardAdvancedUI<T extends TaskBoardItem = TaskBoardItem> {
    private readonly card = inject<TaskBoardCardContext<T> | null>(TASKBOARD_CARD_CONTEXT, { optional: true });

    /**
     * The record to render. Taken from the card context when left unset.
     * @group Props
     */
    readonly task = input<T | undefined>(undefined);

    /** @internal The neutral tone the labels use. */
    readonly labelTone = LABEL_TONE;

    protected readonly item = computed<T | undefined>(() => this.task() ?? this.card?.item());

    protected readonly title = computed(() => this.item()?.title ?? '');

    protected readonly description = computed(() => this.item()?.description ?? '');

    protected readonly tags = computed(() => this.item()?.tags ?? []);

    protected readonly priorityRank = computed(() => {
        const priority = this.item()?.priority;
        return priority ? PRIORITY_RANK[priority] : '';
    });

    protected readonly priorityTone = computed(() => {
        const priority = this.item()?.priority;
        return priority ? PRIORITY_TONE[priority] : undefined;
    });

    protected readonly subtaskLabel = computed(() => {
        const subtasks = this.item()?.subtasks;
        if (!subtasks || subtasks.length === 0) return '';

        return `${subtasks.filter((entry) => entry.completed).length}/${subtasks.length}`;
    });

    protected readonly owner = computed(() => this.item()?.assignee ?? this.item()?.assignees?.[0] ?? '');

    private readonly dueDate = computed(() => readDueDate(this.item()?.dueDate));

    /**
     * The due date as a short month and day.
     *
     * Formatted with the browser's own locale rather than a fixed pattern, because the card is the
     * one place in this package that prints a date and a hard-coded order is wrong somewhere.
     */
    protected readonly dueLabel = computed(() => {
        const date = this.dueDate();
        return date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    });

    /** Whether the due date has passed. Compared by calendar day, so today is never overdue. */
    protected readonly overdue = computed(() => {
        const date = this.dueDate();
        return date ? isBeforeDay(date, new Date()) : false;
    });

    protected initials(name: string): string {
        return initialsOf(name);
    }
}

/**
 * The column header: title, lock, count, WIP state and the collapse affordance.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-column-header-ui',
    standalone: true,
    imports: [ChevronDownIcon, Tag],
    template: `
        <div class="taskboard-column-header-left">
            <span class="taskboard-column-header-title">{{ label() }}</span>
            @if (locked()) {
                <span class="taskboard-column-header-lock" title="Locked">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14" fill="none"><path [attr.d]="lockPath" fill="currentColor" /></svg>
                </span>
            }
            <p-tag severity="secondary" [rounded]="true" [value]="count().toString()" />
            @if (wipLabel()) {
                <div class="taskboard-column-header-meta-group" aria-label="Column metadata">
                    <span [class]="'taskboard-column-header-meta taskboard-column-header-meta--' + wipTone()" [attr.title]="wipTitle()">{{ wipLabel() }}</span>
                </div>
            }
        </div>
        @if (showToggle()) {
            <button type="button" class="taskboard-column-header-collapse-toggle" [attr.aria-label]="toggleLabel()" (pointerdown)="$event.stopPropagation()" (click)="onToggle()">
                <svg data-p-icon="chevron-down" aria-hidden="true" [class]="chevronClass()" [attr.width]="12" [attr.height]="12"></svg>
            </button>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-scope': 'taskboard',
        'data-part': 'column-header-ui',
        '[class]': 'hostClass()'
    }
})
export class TaskBoardColumnHeaderUI {
    /** @internal The padlock path. */
    readonly lockPath = LOCK_PATH;

    private readonly state = inject(TASKBOARD_STATE);
    private readonly columnContext = inject<TaskBoardColumnContext | null>(TASKBOARD_COLUMN_CONTEXT, { optional: true });

    /**
     * The column to describe. Taken from the column context when left unset.
     * @group Props
     */
    readonly column = input<TaskBoardColumnModel | undefined>(undefined);
    /**
     * How many cards to show in the count. Taken from the column context when left unset.
     * @group Props
     */
    readonly taskCount = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Whether the column is collapsed. Taken from the column context when left unset.
     * @group Props
     */
    readonly isCollapsed = input<boolean | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value)) });
    /**
     * What the collapse control should call. Falls back to the column context's own toggle.
     * @group Props
     */
    readonly toggleCollapse = input<(() => void) | undefined>(undefined);
    /**
     * Whether to draw the collapse control at all. Follows the board when left unset.
     * @group Props
     */
    readonly collapsible = input<boolean | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value)) });

    private readonly resolvedColumn = computed(() => this.column() ?? this.columnContext?.columnData());

    protected readonly label = computed(() => this.resolvedColumn()?.label ?? this.columnContext?.label() ?? '');

    protected readonly count = computed(() => this.taskCount() ?? this.columnContext?.itemCount() ?? 0);

    protected readonly collapsed = computed(() => this.isCollapsed() ?? this.columnContext?.isCollapsed() ?? false);

    protected readonly locked = computed(() => this.resolvedColumn()?.locked === true);

    /**
     * Whether to draw the collapse control.
     *
     * The input is an override, not the answer: left unbound it is `undefined`, and reading it
     * directly would mean the control only ever appeared on a header that asked for it by hand.
     * Unset, it follows the board's own `columnCollapsible` and feature flag.
     */
    protected readonly showToggle = computed(() => this.collapsible() ?? this.state.collapsible());

    protected readonly hostClass = computed(() => (this.collapsed() ? 'taskboard-column-header-content taskboard-column-header-content--collapsed' : 'taskboard-column-header-content'));

    protected readonly chevronClass = computed(() => (this.collapsed() ? 'taskboard-column-header-chevron taskboard-column-header-chevron-collapsed' : 'taskboard-column-header-chevron'));

    /** `WIP 3/5`, or nothing when the column has no limit. */
    protected readonly wipLabel = computed(() => {
        const limit = this.resolvedColumn()?.wipLimit;
        return limit == null || limit <= 0 ? '' : `WIP ${this.count()}/${limit}`;
    });

    protected readonly wipTitle = computed(() => {
        const limit = this.resolvedColumn()?.wipLimit;
        return limit == null ? null : `Work in progress limit: ${this.count()} of ${limit}`;
    });

    /**
     * How loudly the WIP badge is drawn.
     *
     * Taken from the board's own capacity state rather than recomputed here, so the badge and the
     * `p-taskboard-column-wip-*` class on the column can never disagree.
     */
    protected readonly wipTone = computed(() => {
        const id = this.resolvedColumn()?.id ?? this.columnContext?.value();
        if (id == null) return 'neutral';

        const wip = this.state.wipStateOf(id);

        return wip === 'exceeded' ? 'danger' : wip === 'warning' ? 'warning' : 'neutral';
    });

    protected readonly toggleLabel = computed(() => {
        const labels = this.state.labels();
        return formatLabel(this.collapsed() ? labels.expandColumn : labels.collapseColumn, this.label());
    });

    protected onToggle(): void {
        const explicit = this.toggleCollapse();

        if (explicit) explicit();
        else this.columnContext?.toggleCollapse();
    }
}

/**
 * The swimlane row header: the collapse chevron, the row name and its count.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-swimlane-header-ui',
    standalone: true,
    imports: [ChevronDownIcon, Tag],
    template: `
        <button type="button" class="taskboard-swimlane-header-collapse-toggle" [attr.aria-label]="toggleLabel()" (click)="onToggle()">
            <svg data-p-icon="chevron-down" aria-hidden="true" [class]="chevronClass()" [attr.width]="12" [attr.height]="12"></svg>
        </button>
        <span class="taskboard-swimlane-header-title">{{ label() }}</span>
        <p-tag severity="secondary" [rounded]="true" [value]="count().toString()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'swimlane-header-ui', class: 'taskboard-swimlane-header-content' }
})
export class TaskBoardSwimlaneHeaderUI {
    private readonly state = inject(TASKBOARD_STATE);
    private readonly headerContext = inject<TaskBoardSwimlaneHeaderContext | null>(TASKBOARD_SWIMLANE_HEADER_CONTEXT, { optional: true });

    /**
     * The row to describe. Taken from the swimlane header context when left unset.
     * @group Props
     */
    readonly swimlane = input<TaskBoardSwimlane | undefined>(undefined);
    /**
     * How many cards to show in the count. Taken from the context when left unset.
     * @group Props
     */
    readonly taskCount = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
    /**
     * Whether the row is collapsed. Taken from the context when left unset.
     * @group Props
     */
    readonly isCollapsed = input<boolean | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : booleanAttribute(value)) });
    /**
     * What the collapse control should call. Falls back to the context's own toggle.
     * @group Props
     */
    readonly toggleCollapse = input<(() => void) | undefined>(undefined);

    private readonly resolved = computed(() => this.swimlane() ?? this.headerContext?.swimlane());

    protected readonly label = computed(() => this.resolved()?.label ?? '');

    protected readonly count = computed(() => this.taskCount() ?? this.headerContext?.itemCount() ?? 0);

    protected readonly collapsed = computed(() => this.isCollapsed() ?? this.headerContext?.isCollapsed() ?? false);

    protected readonly chevronClass = computed(() => (this.collapsed() ? 'taskboard-swimlane-header-chevron taskboard-swimlane-header-chevron-collapsed' : 'taskboard-swimlane-header-chevron'));

    protected readonly toggleLabel = computed(() => {
        const labels = this.state.labels();
        return formatLabel(this.collapsed() ? labels.expandSwimlane : labels.collapseSwimlane, this.label());
    });

    protected onToggle(): void {
        const explicit = this.toggleCollapse();

        if (explicit) explicit();
        else this.headerContext?.toggleCollapse();
    }
}

/**
 * A column label in the swimlane grid's header row.
 *
 * @group Components
 */
@Component({
    selector: 'p-taskboard-swimlane-column-header-ui',
    standalone: true,
    imports: [Tag],
    template: `
        <span class="taskboard-swimlane-column-header-title">{{ label() }}</span>
        @if (locked()) {
            <span class="taskboard-swimlane-column-header-lock" title="Locked">
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14" fill="none"><path [attr.d]="lockPath" fill="currentColor" /></svg>
            </span>
        }
        <p-tag severity="secondary" [rounded]="true" [value]="count().toString()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { 'data-scope': 'taskboard', 'data-part': 'swimlane-column-header-ui', class: 'taskboard-swimlane-column-header' }
})
export class TaskBoardSwimlaneColumnHeaderUI {
    /** @internal The padlock path. */
    readonly lockPath = LOCK_PATH;

    private readonly headerContext = inject<TaskBoardSwimlaneColumnHeaderContext | null>(TASKBOARD_SWIMLANE_COLUMN_HEADER_CONTEXT, { optional: true });

    /**
     * The column to describe. Taken from the swimlane column header context when left unset.
     * @group Props
     */
    readonly column = input<TaskBoardColumnModel | undefined>(undefined);
    /**
     * How many cards to show in the count. Taken from the context when left unset.
     * @group Props
     */
    readonly taskCount = input<number | undefined>(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });

    private readonly resolved = computed(() => this.column() ?? this.headerContext?.column());

    protected readonly label = computed(() => this.resolved()?.label ?? '');

    protected readonly count = computed(() => this.taskCount() ?? this.headerContext?.itemCount() ?? 0);

    protected readonly locked = computed(() => this.resolved()?.locked === true);
}

/** Every supplied visual part, for the module to import and export in one go. @internal */
export const TASKBOARD_UI_PARTS = [TaskBoardCardUI, TaskBoardCardAdvancedUI, TaskBoardColumnHeaderUI, TaskBoardSwimlaneHeaderUI, TaskBoardSwimlaneColumnHeaderUI] as const;
