import type { SchedulerCategory, SchedulerEvent, SchedulerResource } from '@openng/optimus-ui/types/scheduler';

/**
 * Demo data for the Scheduler docs, mirroring the structure the upstream reference uses so the
 * examples are comparable: the same anchor (today at midnight), the same four category colours, the
 * same four resources and the same event timings. Only the labels are ours.
 */
function createDemoDate(): Date {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
}

/** Anchor of every demo: today. A fixed date would drift out of the visible range over time. */
export const DEMO_DATE = createDemoDate();

/** An instant `dayOffset` days from the anchor, at a wall-clock time. */
function at(dayOffset: number, hour: number, minute = 0): Date {
    const date = new Date(DEMO_DATE);

    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);

    return date;
}

/** Local midnight `dayOffset` days from the anchor, for the all-day events. */
function allDay(dayOffset: number): Date {
    return at(dayOffset, 0);
}

export const DEMO_CATEGORIES: SchedulerCategory[] = [
    { id: 'planning', name: 'Planning', color: 'rgb(37 99 235)' },
    { id: 'ops', name: 'Operations', color: 'rgb(5 150 105)' },
    { id: 'blocked', name: 'Hold', color: 'rgb(220 38 38)' },
    { id: 'admin', name: 'Review', color: 'rgb(147 51 234)' }
];

export const DEMO_RESOURCES: SchedulerResource[] = [
    { id: 'north-crew', name: 'Survey Crew', color: 'rgb(37 99 235)' },
    { id: 'harbor-crew', name: 'Civil Crew', color: 'rgb(5 150 105)' },
    { id: 'service-bay-4', name: 'Permit Desk', color: 'rgb(147 51 234)' },
    { id: 'lift-dock-2', name: 'Splice Team', color: 'rgb(234 88 12)' }
];

/**
 * First day of the week the timeline demos use: today's.
 *
 * A timeline week that starts on Monday puts today's events several screens to the right, and a demo
 * you have to scroll to see is a demo of a scrollbar.
 */
export const DEMO_TIMELINE_FIRST_DAY_OF_WEEK = DEMO_DATE.getDay();

/**
 * The same resources with a parent, for the grouped lanes: `parentId` is what turns the flat rail
 * into a hierarchy.
 */
export const DEMO_RESOURCE_TREE: SchedulerResource[] = [
    { id: 'field', name: 'Field teams' },
    { id: 'north-crew', name: 'Survey Crew', parentId: 'field', color: 'rgb(37 99 235)' },
    { id: 'harbor-crew', name: 'Civil Crew', parentId: 'field', color: 'rgb(5 150 105)' },
    { id: 'office', name: 'Office' },
    { id: 'service-bay-4', name: 'Permit Desk', parentId: 'office', color: 'rgb(147 51 234)' },
    { id: 'lift-dock-2', name: 'Splice Team', parentId: 'office', color: 'rgb(234 88 12)' }
];

export const DEMO_EVENTS: SchedulerEvent[] = [
    { id: 'briefing', title: 'Load-in', start: at(0, 8, 30), end: at(0, 9, 30), resourceId: 'north-crew', categoryId: 'planning' },
    { id: 'handoff', title: 'Stage Tech', start: at(0, 10), end: at(0, 11), resourceId: 'harbor-crew', categoryId: 'ops' },
    { id: 'work-block', title: 'Workshop A', start: at(1, 13), end: at(1, 15), resourceId: 'service-bay-4', categoryId: 'planning' },
    { id: 'review', title: 'Sponsor Review', start: at(2, 11, 30), end: at(2, 12, 30), resourceId: 'north-crew', categoryId: 'ops' },
    { id: 'audit-window', title: 'Festival Week', start: allDay(-1), end: allDay(3), allDay: true, categoryId: 'blocked' },
    { id: 'training', title: 'Sponsor Night', start: at(3, 9), end: at(3, 17), resourceId: 'lift-dock-2', categoryId: 'admin' }
];

/**
 * A series and its edge cases: a daily stand-up with an exception, a weekly review on two weekdays,
 * and an occurrence overridden by a separate event.
 */
/**
 * The first `weekday` at or after a date, keeping its time.
 *
 * The recurrence demo needs an instant the RULE actually generates: hard-coding a day offset only
 * lands on an occurrence when the anchor happens to fall on the right weekday.
 */
function nextWeekday(from: Date, weekday: number): Date {
    const date = new Date(from);

    date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7));
    return date;
}

export const DEMO_RECURRING_EVENTS: SchedulerEvent[] = [
    {
        id: 'standup',
        title: 'Stand-up',
        start: at(0, 9, 30),
        end: at(0, 9, 45),
        categoryId: 'ops',
        rrule: 'FREQ=DAILY;COUNT=10',
        // Not on the following day: EXDATE skips that occurrence without touching the rule.
        exdate: [allDay(1)]
    },
    {
        id: 'review',
        title: 'Design review',
        start: at(0, 15),
        end: at(0, 16),
        categoryId: 'planning',
        rrule: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH;COUNT=6'
    },
    {
        id: 'review-moved',
        title: 'Design review (moved)',
        // An override: it points at the series and at the original instant, so it replaces that
        // copy rather than duplicating it. The instant is derived from the RULE and not by hand:
        // with a fixed offset it only landed on an occurrence when the anchor was a Tuesday.
        recurrenceId: 'review',
        recurrenceStart: nextWeekday(at(0, 15), 4),
        start: nextWeekday(at(0, 11), 4),
        end: nextWeekday(at(0, 12), 4),
        categoryId: 'planning'
    },
    { id: 'monthly-close', title: 'Monthly close', start: at(0, 17), end: at(0, 18), categoryId: 'admin', rrule: 'FREQ=MONTHLY;BYMONTHDAY=1,15;COUNT=6' }
];

/** A month `dayOffset` months from the anchor, at day 1. */
function month(monthOffset: number, day = 1): Date {
    const date = new Date(DEMO_DATE);

    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(day);
    date.setHours(9, 0, 0, 0);

    return date;
}

/**
 * Events spread over a year, for the month and year timelines: the day-scale set lives inside a
 * single week, so on a twelve-column axis it would be one bar in one column.
 */
export const DEMO_SPAN_EVENTS: SchedulerEvent[] = [
    ...DEMO_EVENTS,
    { id: 'season-a', title: 'Winter run', start: month(-3), end: month(-1, 15), resourceId: 'north-crew', categoryId: 'planning' },
    { id: 'season-b', title: 'Permit window', start: month(-1, 10), end: month(1, 20), resourceId: 'service-bay-4', categoryId: 'admin' },
    { id: 'season-c', title: 'Fibre rollout', start: month(1), end: month(4, 10), resourceId: 'lift-dock-2', categoryId: 'ops' },
    { id: 'season-d', title: 'Harbour works', start: month(0, 20), end: month(2, 5), resourceId: 'harbor-crew', categoryId: 'ops' }
];
