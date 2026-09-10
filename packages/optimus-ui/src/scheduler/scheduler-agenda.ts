import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { dayKey, eachDay, isToday, toDate } from './scheduler-date';
import { groupByDay } from './scheduler-layout';
import { SchedulerViewBase } from './scheduler-view-base';

/**
 * The agenda: a flat, scrollable list grouped by day.
 *
 * No geometry here — an agenda row is as tall as its content, which is exactly why this view is the
 * one that works on a phone. Empty days are dropped rather than rendered blank, so scrolling a
 * month of agenda does not mean scrolling past twenty empty headers.
 *
 * @module scheduler-agenda
 */
@Component({
    selector: 'p-scheduler-agenda-view',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        <div class="p-scheduler-agenda" data-slot="scheduler-agenda" [attr.data-view]="view">
            @for (group of groups(); track group.key) {
                <div class="p-scheduler-agenda-group">
                    <div class="p-scheduler-agenda-date-header" data-slot="scheduler-agenda-date-header" [attr.data-date]="group.key" [attr.data-today]="group.today ? '' : null" [attr.data-event-count]="group.count">
                        @if (dateHeaderDef(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl; context: group.context; injector: cellInjector(group.cellKey)" />
                        } @else {
                            <span class="p-scheduler-agenda-heading">
                                <span class="p-scheduler-agenda-day">{{ group.context.dayName }}</span>
                                <span class="p-scheduler-agenda-date">{{ group.context.formattedDate }}</span>
                            </span>
                            <span class="p-scheduler-agenda-count">{{ group.count }}</span>
                        }
                    </div>

                    @for (item of group.events; track item.key) {
                        <!-- The row wraps gutter + card. The data-slot and the click stay on the
                             CARD, which is the surface the consumer replaces and the one the tests
                             and the style selectors look for. -->
                        <div class="p-scheduler-agenda-row">
                            <div class="p-scheduler-agenda-row-gutter" aria-hidden="true"></div>
                            <div
                                class="p-scheduler-agenda-event"
                                data-slot="scheduler-agenda-event"
                                [attr.data-event-id]="item.context.event.id"
                                [attr.data-selected]="item.context.selected ? '' : null"
                                [style.--p-scheduler-event-border-accent]="item.context.accentColor"
                                (click)="onEventClick($event, item.context.event)"
                                (keydown)="onEventKeydown($event, item.context.event)"
                                tabindex="0"
                                role="button"
                                (mouseenter)="onEventPeek($event, item.context.event)"
                                (mouseleave)="onEventPeekEnd()"
                                (focusin)="onEventPeek($event, item.context.event)"
                                (focusout)="onEventPeekEnd()"
                                (contextmenu)="onEventContextMenu($event, item.context.event)"
                            >
                                @if (agendaEventDef(); as tpl) {
                                    <ng-container *ngTemplateOutlet="tpl; context: item.context; injector: eventInjector(item.key)" />
                                } @else {
                                    <span class="p-scheduler-event-dot" [style.background]="item.context.accentColor" aria-hidden="true"></span>
                                    <span class="p-scheduler-event-title">{{ item.context.title }}</span>
                                    <span class="p-scheduler-agenda-event-time">{{ item.context.timeText }}</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            } @empty {
                <div class="p-scheduler-agenda-empty">{{ state.labels().empty }}</div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-scheduler-view p-scheduler-view-agenda' }
})
export class SchedulerAgendaView extends SchedulerViewBase {
    /** @internal */
    override readonly view: SchedulerViewType = 'agenda';

    /** @internal */
    readonly dateHeaderDef = computed(() => this.def('agendaDateHeader'));
    /** @internal */
    readonly agendaEventDef = computed(() => this.def('agendaEvent'));

    /** The day groups, in date order, with the empty days left out. */
    readonly groups = computed(() => {
        const { start, end } = this.state.range();
        const byDay = groupByDay(this.state.visibleEvents(), this.state.defaultEventDuration());

        // Con showEmptyDays cada dia del rango entra, tenga algo o no: un hueco explicito dice "aqui
        // no hay nada" donde una lista que salta el dia deja al lector contando fechas.
        const entries = this.state.showEmptyDays() ? withEmptyDays(byDay, start, end) : [...byDay.entries()];

        const result = entries
            .filter(([key]) => {
                // groupByDay lists an event under every day it touches, the ones outside the range
                // included: an event that starts before the range must not smuggle in its own
                // earlier day.
                const date = new Date(`${key}T00:00:00`);
                return date >= start && date < end;
            })
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, events]) => {
                const date = new Date(`${key}T00:00:00`);
                const sorted = [...events].sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime());
                const context = {
                    date,
                    formattedDate: date.toLocaleDateString(this.locale(), { month: 'long', day: 'numeric', year: 'numeric' }),
                    dayName: date.toLocaleDateString(this.locale(), { weekday: 'long' }).toUpperCase(),
                    count: sorted.length,
                    today: isToday(date, this.state.now())
                };
                const binding = this.bindCellRaw(`agenda|${key}`, {
                    date,
                    label: context.formattedDate,
                    dateKey: key,
                    events: sorted,
                    count: sorted.length,
                    today: context.today,
                    weekend: date.getDay() === 0 || date.getDay() === 6,
                    otherMonth: false,
                    businessHours: true,
                    blocked: false,
                    selected: this.state.isDateSelected(date),
                    disabled: false
                });
                // $implicit and context have to be THE SAME object, as on every other surface:
                // with `let ctx` the consumer got half the fields and with `let ctx="context"` the
                // other half.
                const merged = { ...binding.context, ...context };

                return {
                    key,
                    cellKey: binding.key,
                    cellContext: binding.context,
                    today: context.today,
                    count: sorted.length,
                    context: { ...merged, $implicit: merged, context: merged },
                    events: sorted.map((event) => this.bindEvent(event, {}, `agenda|${key}`))
                };
            });

        return result;
    });

    ngAfterViewChecked(): void {
        const groups = this.groups();
        this.publishContexts(
            groups.flatMap((group) => group.events),
            groups.map((group) => ({ key: group.cellKey, context: group.context }))
        );
    }

    /** Context of the group header: it is not a grid cell, so it carries a key of its own. */
    private bindCellRaw(key: string, context: any) {
        return { key, context: { ...context, $implicit: context, context } };
    }
}

/**
 * The days of a range, each with whatever the grouping found for it.
 *
 * Built from the range and not from the events, which is the whole point: a day nothing happens on
 * has no entry to iterate, and it is exactly the day `showEmptyDays` wants to draw.
 */
function withEmptyDays(byDay: Map<string, SchedulerEvent[]>, start: Date, end: Date): [string, SchedulerEvent[]][] {
    const entries: [string, SchedulerEvent[]][] = [];

    for (const day of eachDay(start, end)) {
        const key = dayKey(day);
        entries.push([key, byDay.get(key) ?? []]);
    }

    return entries;
}
