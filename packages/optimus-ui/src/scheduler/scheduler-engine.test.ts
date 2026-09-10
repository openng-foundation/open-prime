import { afterEach, describe, expect, it } from 'vitest';
import type { SchedulerEvent } from '@openng/optimus-ui/types/scheduler';
import { addDays, addMonths, dayKey, daysBetween, formatTime, formatTimeRange, navigate, startOfWeek, timeSlots, timelineScaleOf, toDate, viewRange } from './scheduler-date';
import { groupByDay, groupByResource, layoutRows, layoutTimeGrid } from './scheduler-layout';
import { buildTimelineAxis, placeOnAxis } from './scheduler-timeline-axis';
import { applyPendingChanges, readCellTarget, snapInstant } from './scheduler-drag';
import { expandEvents, parseRRule, recurrenceStarts } from './scheduler-recurrence';
import { moveCellFocus } from './scheduler-keyboard';
import { fromDisplayTime, toDisplayTime, zoneLabel, zoneOffsetMinutes } from './scheduler-timezone';
import { parseICalendar, parseSchedule, serializeSchedule, toICalendar } from './scheduler-transfer';

// The Scheduler's engine is date arithmetic and event placement: the two things that break in
// silence and without which no view can be trusted. Tested here, without a DOM.

const d = (iso: string) => new Date(iso);
const ev = (id: string, start: string, end?: string, extra: Partial<SchedulerEvent> = {}): SchedulerEvent => ({ id, start: d(start), end: end ? d(end) : undefined, ...extra });

describe('scheduler-date', () => {
    it('dayKey uses the LOCAL day and not the UTC one', () => {
        // 00:30 in UTC+2 is the previous day in UTC: this is where off-by-ones get in.
        expect(dayKey(new Date(2026, 8, 8, 0, 30))).toBe('2026-09-08');
        expect(dayKey(new Date(2026, 8, 8, 23, 30))).toBe('2026-09-08');
    });

    it('addDays keeps the local time across a clock change', () => {
        // In Europe summer time ends on the last Sunday of October: that day is 25 hours long, so
        // adding 86,400,000 ms would give 08:00 instead of 09:00.
        const before = new Date(2026, 9, 25, 9, 0);
        const after = addDays(before, 1);
        expect(after.getDate()).toBe(26);
        expect(after.getHours()).toBe(9);
    });

    it('addMonths clamps the day instead of spilling into the next month', () => {
        expect(dayKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
        expect(dayKey(addMonths(new Date(2024, 0, 31), 1))).toBe('2024-02-29');
    });

    it('daysBetween counts calendar days, the day the clocks change included', () => {
        expect(daysBetween(new Date(2026, 9, 25), new Date(2026, 9, 26))).toBe(1);
        expect(daysBetween(new Date(2026, 8, 1), new Date(2026, 8, 30))).toBe(29);
    });

    it('startOfWeek honours firstDayOfWeek', () => {
        const wed = new Date(2026, 8, 9); // a Wednesday
        expect(dayKey(startOfWeek(wed, 0))).toBe('2026-09-06'); // domingo
        expect(dayKey(startOfWeek(wed, 1))).toBe('2026-09-07'); // lunes
    });

    it("the month's viewRange covers whole weeks and not just the month", () => {
        const { start, end } = viewRange('month', new Date(2026, 8, 15), { firstDayOfWeek: 1 });
        expect(dayKey(start)).toBe('2026-08-31'); // lunes anterior al 1 de septiembre
        expect(daysBetween(start, end)).toBe(42); // 6 semanas fijas
    });

    it("monthCount stretches the month's viewRange to the last week of the last month", () => {
        const { start, end } = viewRange('month', new Date(2026, 8, 15), { firstDayOfWeek: 1, monthCount: 3 });
        expect(dayKey(start)).toBe('2026-08-31'); // la rejilla sigue empezando en el mes ancla
        // Tres rejillas de seis semanas: la ultima empieza en la semana del 1 de noviembre.
        expect(dayKey(new Date(end.getTime() - 1))).toBe('2026-12-06');
    });

    it('monthCount below one, or not a number at all, is treated as one', () => {
        const one = viewRange('month', new Date(2026, 8, 15), { firstDayOfWeek: 1 });

        for (const monthCount of [0, -3, Number.NaN]) {
            const range = viewRange('month', new Date(2026, 8, 15), { firstDayOfWeek: 1, monthCount });
            expect(range.start.getTime()).toBe(one.start.getTime());
            expect(range.end.getTime()).toBe(one.end.getTime());
            expect(dayKey(navigate('month', new Date(2026, 8, 9), 1, { monthCount }))).toBe('2026-10-09');
        }
    });

    it("the week's viewRange is 7 days and the day's is dayCount", () => {
        expect(daysBetween(viewRange('week', new Date(2026, 8, 9)).start, viewRange('week', new Date(2026, 8, 9)).end)).toBe(7);
        const three = viewRange('day', new Date(2026, 8, 9), { dayCount: 3 });
        expect(daysBetween(three.start, three.end)).toBe(3);
    });

    it('navigate moves by whatever each view moves by', () => {
        const base = new Date(2026, 8, 9);
        expect(dayKey(navigate('day', base, 1))).toBe('2026-09-10');
        expect(dayKey(navigate('week', base, -1))).toBe('2026-09-02');
        expect(dayKey(navigate('month', base, 1))).toBe('2026-10-09');
        // Con tres meses en pantalla una pagina son tres meses, o dos tercios de la rejilla se repiten.
        expect(dayKey(navigate('month', base, 1, { monthCount: 3 }))).toBe('2026-12-09');
        expect(dayKey(navigate('month', base, -1, { monthCount: 3 }))).toBe('2026-06-09');
        expect(navigate('year', base, 1).getFullYear()).toBe(2027);
    });

    it('timeSlots marks the whole hours and honours the range', () => {
        const slots = timeSlots(8, 10, 30);
        expect(slots.map((s) => s.minutes)).toEqual([480, 510, 540, 570]);
        expect(slots.filter((s) => s.major).map((s) => s.minutes)).toEqual([480, 540]);
        expect(timeSlots(0, 24, 60)).toHaveLength(24);
    });
});

describe('layoutTimeGrid', () => {
    const range = { start: new Date(2026, 8, 8, 0, 0), end: new Date(2026, 8, 9, 0, 0) };

    it('places an event as a fraction of the range', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T06:00', '2026-09-08T12:00')], { range });
        expect(item.offset).toBeCloseTo(0.25, 5);
        expect(item.size).toBeCloseTo(0.25, 5);
        expect(item.columns).toBe(1);
    });

    it('two overlapping events split the width', () => {
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T11:00'), ev('b', '2026-09-08T10:00', '2026-09-08T12:00')], { range });
        expect(items.map((i) => i.column)).toEqual([0, 1]);
        expect(items.every((i) => i.columns === 2)).toBe(true);
    });

    it('events that do NOT overlap both go full width', () => {
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T10:00'), ev('b', '2026-09-08T11:00', '2026-09-08T12:00')], { range });
        expect(items.every((i) => i.columns === 1 && i.column === 0)).toBe(true);
    });

    it("in an a-b-c chain, c reuses a's column (peak concurrency, not cluster size)", () => {
        // a overlaps b and b overlaps c, but a and c do NOT: at no instant are there 3 at once.
        // Splitting into thirds would leave a third of the width dead for good, so c goes back to
        // column 0. It is what Google Calendar and FullCalendar do.
        const items = layoutTimeGrid([ev('a', '2026-09-08T09:00', '2026-09-08T11:00'), ev('b', '2026-09-08T10:00', '2026-09-08T13:00'), ev('c', '2026-09-08T12:00', '2026-09-08T14:00')], { range });
        expect(items.map((i) => i.column)).toEqual([0, 1, 0]);
        expect(items.every((i) => i.columns === 2)).toBe(true);
    });

    it('clips an event that runs past the range and flags it', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-07T22:00', '2026-09-09T02:00')], { range });
        expect(item.offset).toBe(0);
        expect(item.size).toBeCloseTo(1, 5);
        expect(item.continuesBefore).toBe(true);
        expect(item.continuesAfter).toBe(true);
    });

    it('a one-minute event is still visible', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T05:43', '2026-09-08T05:44')], { range, minEventMinutes: 15 });
        expect(item.size).toBeCloseTo(15 / 1440, 5);
    });

    it('an event with no end gets the default duration', () => {
        const [item] = layoutTimeGrid([ev('a', '2026-09-08T06:00')], { range, defaultEventDuration: 60 });
        expect(item.size).toBeCloseTo(1 / 24, 5);
    });

    it('drops whatever falls outside the range', () => {
        expect(layoutTimeGrid([ev('a', '2026-09-01T09:00', '2026-09-01T10:00')], { range })).toHaveLength(0);
    });
});

describe('layoutRows', () => {
    const week = { start: new Date(2026, 8, 6), end: new Date(2026, 8, 13) };

    it('a multi-day event takes ONE row from end to end', () => {
        const { items } = layoutRows([ev('a', '2026-09-07T00:00', '2026-09-10T00:00')], { range: week });
        expect(items[0].row).toBe(0);
        expect(items[0].size).toBeCloseTo(3 / 7, 5);
    });

    it('two events that overlap land in different rows', () => {
        const { items } = layoutRows([ev('a', '2026-09-07', '2026-09-10'), ev('b', '2026-09-08', '2026-09-09')], { range: week });
        expect(items.map((i) => i.row)).toEqual([0, 1]);
    });

    it('reuses a row once it is free', () => {
        const { items } = layoutRows([ev('a', '2026-09-07', '2026-09-08'), ev('b', '2026-09-09', '2026-09-10')], { range: week });
        expect(items.every((i) => i.row === 0)).toBe(true);
    });

    it('what does not fit in maxRows comes out as overflow rather than being lost', () => {
        const events = [ev('a', '2026-09-07', '2026-09-08'), ev('b', '2026-09-07', '2026-09-08'), ev('c', '2026-09-07', '2026-09-08')];
        const { items, overflow } = layoutRows(events, { range: week, maxRows: 2 });
        expect(items).toHaveLength(2);
        expect(overflow.get(1)?.map((e) => e.id)).toEqual(['c']);
    });
});

describe('grouping helpers', () => {
    it('groupByDay lists an event under EVERY day it touches', () => {
        const groups = groupByDay([ev('a', '2026-09-07T22:00', '2026-09-09T02:00')]);
        expect([...groups.keys()].sort()).toEqual(['2026-09-07', '2026-09-08', '2026-09-09']);
    });

    it('groupByDay does NOT put an event ending at midnight into the next day', () => {
        const groups = groupByDay([ev('a', '2026-09-07T08:00', '2026-09-08T00:00')]);
        expect([...groups.keys()]).toEqual(['2026-09-07']);
    });

    it('groupByResource keeps the orphans under null instead of dropping them', () => {
        const groups = groupByResource([ev('a', '2026-09-08', undefined, { resourceId: 'r1' }), ev('b', '2026-09-08', undefined, { resourceId: 'zzz' }), ev('c', '2026-09-08')], ['r1', 'r2']);
        expect(groups.get('r1')?.map((e) => e.id)).toEqual(['a']);
        expect(groups.get('r2')).toEqual([]);
        expect(groups.get(null)?.map((e) => e.id)).toEqual(['b', 'c']);
    });
});

describe('timeline scales', () => {
    const axisOptions = (range: { start: Date; end: Date }) => ({
        range,
        dayBounds: { start: 8, end: 12 },
        slotMinutes: 60,
        firstDayOfWeek: 1,
        locale: 'en-US'
    });

    it('the view name decides the scale, and the older names still mean the day', () => {
        expect(timelineScaleOf('timeline')).toBe('day');
        expect(timelineScaleOf('resourceTimeline')).toBe('day');
        expect(timelineScaleOf('timelineWeek')).toBe('week');
        expect(timelineScaleOf('resourceTimelineMonth')).toBe('month');
        expect(timelineScaleOf('timelineYear')).toBe('year');
        expect(timelineScaleOf('month')).toBeUndefined();
    });

    it('each scale spans its period, and the month is NOT padded to whole weeks', () => {
        const anchor = new Date(2026, 8, 8); // martes 8 de septiembre
        const week = viewRange('timelineWeek', anchor, { firstDayOfWeek: 1 });
        expect(dayKey(week.start)).toBe('2026-09-07');
        expect(dayKey(week.end)).toBe('2026-09-14');

        const month = viewRange('timelineMonth', anchor, { firstDayOfWeek: 1 });
        expect(dayKey(month.start)).toBe('2026-09-01');
        expect(dayKey(month.end)).toBe('2026-10-01');

        const year = viewRange('timelineYear', anchor, {});
        expect(dayKey(year.start)).toBe('2026-01-01');
        expect(dayKey(year.end)).toBe('2027-01-01');
    });

    it("navigating moves the scale's range and not a day", () => {
        const anchor = new Date(2026, 8, 8);
        expect(dayKey(navigate('timelineWeek', anchor, 1, {}))).toBe('2026-09-15');
        expect(dayKey(navigate('timelineMonth', anchor, 1, {}))).toBe('2026-10-08');
        expect(dayKey(navigate('timelineYear', anchor, -1, {}))).toBe('2025-09-08');
        expect(dayKey(navigate('timelineDay', anchor, 1, {}))).toBe('2026-09-09');
    });

    it("the week's axis repeats the hour window on each day and skips the nights", () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));

        // 7 days x 4 hours (08:00-12:00)
        expect(axis.slots.length).toBe(28);
        expect(axis.multiDay).toBe(true);
        // The second day's first column is 08:00 again and not 12:00.
        expect(axis.slots[4].start.getHours()).toBe(8);
        expect(dayKey(axis.slots[4].start)).toBe('2026-09-08');
    });

    it('an hour of the night lands on the edge of the gap, not interpolated inside it', () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));

        // 03:00 on Tuesday is outside the drawn window: the axis resolves it to the start of
        // Tuesday's columns, which is where the gap ends.
        const nightPosition = axis.position(new Date(2026, 8, 8, 3, 0));
        expect(nightPosition).toBeCloseTo(4 / 28, 6);
        // 10:00 on Tuesday is halfway through that day's window.
        expect(axis.position(new Date(2026, 8, 8, 10, 0))).toBeCloseTo(6 / 28, 6);
    });

    it('the header bands group the columns and their spans add up to the axis', () => {
        const range = viewRange('timelineWeek', new Date(2026, 8, 8), { firstDayOfWeek: 1 });
        const axis = buildTimelineAxis('week', axisOptions(range));
        const [period, day] = axis.tiers;

        expect(period.key).toBe('period');
        expect(day.cells.length).toBe(7);
        for (const tier of axis.tiers) {
            expect(tier.cells.reduce((sum, cell) => sum + cell.span, 0)).toBe(axis.slots.length);
        }
    });

    it('the month is one column per day and the year one per month', () => {
        const monthAxis = buildTimelineAxis('month', axisOptions(viewRange('timelineMonth', new Date(2026, 8, 8), {})));
        expect(monthAxis.slots.length).toBe(30);
        expect(monthAxis.tiers.length).toBe(1);

        const yearAxis = buildTimelineAxis('year', axisOptions(viewRange('timelineYear', new Date(2026, 8, 8), {})));
        expect(yearAxis.slots.length).toBe(12);
        expect(yearAxis.slots[0].label).toBe('Jan');
    });

    it('an event shorter than half a column keeps half a column of width', () => {
        const range = viewRange('timelineYear', new Date(2026, 8, 8), {});
        const axis = buildTimelineAxis('year', axisOptions(range));
        const events = [ev('a', '2026-09-08T10:00', '2026-09-08T11:00')];
        const packed = layoutTimeGrid(events, { range });
        const placed = placeOnAxis(packed, axis, (event) => ({ start: new Date(event.start as Date), end: new Date(event.end as Date) }));

        expect(placed.length).toBe(1);
        expect(placed[0].size).toBeCloseTo(0.5 / 12, 6);
        // September is the ninth month: the bar starts inside its own column.
        expect(placed[0].offset).toBeGreaterThanOrEqual(8 / 12);
        expect(placed[0].offset).toBeLessThan(9 / 12);
    });

    it('the time prints without a leading zero and with a dash', () => {
        // Some ICU versions separate the AM with U+202F rather than a normal space: normalised
        // before comparing, because what is under test is the range and not the platform's space.
        const range = formatTimeRange(new Date(2026, 8, 8, 8, 30), new Date(2026, 8, 8, 9, 30), 'en-US');

        expect(range.replace(/\u202f/g, ' ')).toBe('8:30 AM - 9:30 AM');
    });
});

describe('recurrence', () => {
    const window = (fromDay: number, toDay: number) => ({ start: new Date(2026, 8, fromDay), end: new Date(2026, 8, toDay) });

    it('reads the RRULE subset calendars actually use, and discards what it does not understand', () => {
        expect(parseRRule('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=MO,WE')).toMatchObject({ freq: 'WEEKLY', interval: 2, count: 4, byDay: [1, 3] });
        // A bare-date UNTIL is INCLUSIVE: it is stored as the end of its day, or the timed
        // appointments on that last day would fall out of the series.
        expect(parseRRule('FREQ=DAILY;UNTIL=20260915')?.until).toEqual(new Date(2026, 8, 15, 23, 59, 59, 999));
        // With an explicit time it is taken as it stands.
        expect(parseRRule('FREQ=DAILY;UNTIL=20260915T120000Z')?.until).toEqual(new Date(Date.UTC(2026, 8, 15, 12)));
        // An INTERVAL of 0 would leave the expander never advancing.
        expect(parseRRule('FREQ=DAILY;INTERVAL=0')?.interval).toBe(1);
        expect(parseRRule('every other tuesday')).toBeUndefined();
        expect(parseRRule(undefined)).toBeUndefined();
    });

    it('COUNT counts from the start of the series and not from the edge of the window', () => {
        const rule = parseRRule('FREQ=DAILY;COUNT=5')!;
        // The series starts on the 1st and the window opens on the 4th: 2 occurrences left, not 5.
        const starts = recurrenceStarts(new Date(2026, 8, 1, 9), rule, window(4, 30));
        expect(starts.map(dayKey)).toEqual(['2026-09-04', '2026-09-05']);
    });

    it('BYDAY spreads across the week and honours the start of the series', () => {
        const rule = parseRRule('FREQ=WEEKLY;BYDAY=TU,TH;COUNT=4')!;
        // It starts on Tuesday the 8th: Thursday the 3rd of that same week does not exist backwards.
        const starts = recurrenceStarts(new Date(2026, 8, 8, 15), rule, window(1, 30));
        expect(starts.map(dayKey)).toEqual(['2026-09-08', '2026-09-10', '2026-09-15', '2026-09-17']);
    });

    it('BYMONTHDAY skips the days a month does not have instead of clamping them', () => {
        const rule = parseRRule('FREQ=MONTHLY;BYMONTHDAY=30,31;COUNT=4')!;
        const starts = recurrenceStarts(new Date(2026, 0, 30, 9), rule, { start: new Date(2026, 0, 1), end: new Date(2026, 4, 1) });
        // February has neither a 30th nor a 31st: the series jumps to March without doubling the 28th.
        expect(starts.map(dayKey)).toEqual(['2026-01-30', '2026-01-31', '2026-03-30', '2026-03-31']);
    });

    it('expanding gives one occurrence per date, with its own id and a link to the series', () => {
        const series: SchedulerEvent = { id: 's', title: 'Stand-up', start: new Date(2026, 8, 8, 9), end: new Date(2026, 8, 8, 9, 15), rrule: 'FREQ=DAILY;COUNT=3' };
        const occurrences = expandEvents([series], window(1, 30), 30);

        expect(occurrences.length).toBe(3);
        expect(new Set(occurrences.map((event) => event.id)).size).toBe(3);
        expect(occurrences.every((event) => event['recurrenceId'] === 's')).toBe(true);
        // The series' duration is kept in every copy.
        expect(occurrences.map((event) => toDate(event.end!).getTime() - toDate(event.start).getTime())).toEqual([900_000, 900_000, 900_000]);
    });

    it('exdate skips an occurrence and rdate adds one outside the rule', () => {
        const series: SchedulerEvent = {
            id: 's',
            start: new Date(2026, 8, 8, 9),
            end: new Date(2026, 8, 8, 10),
            rrule: 'FREQ=DAILY;COUNT=3',
            exdate: [new Date(2026, 8, 9)],
            rdate: [new Date(2026, 8, 20, 9)]
        };
        expect(expandEvents([series], window(1, 30), 30).map((event) => dayKey(toDate(event.start)))).toEqual(['2026-09-08', '2026-09-10', '2026-09-20']);
    });

    it('an override stored separately replaces its occurrence instead of duplicating it', () => {
        const series: SchedulerEvent = { id: 's', start: new Date(2026, 8, 8, 9), end: new Date(2026, 8, 8, 10), rrule: 'FREQ=DAILY;COUNT=3' };
        const exception: SchedulerEvent = { id: 's-moved', recurrenceId: 's', recurrenceStart: new Date(2026, 8, 9, 9), start: new Date(2026, 8, 9, 14), end: new Date(2026, 8, 9, 15) };

        const expanded = expandEvents([series, exception], window(1, 30), 30);
        const nine = expanded.filter((event) => dayKey(toDate(event.start)) === '2026-09-09');
        expect(nine.length).toBe(1);
        expect(nine[0].id).toBe('s-moved');
    });

    it('with no rule at all the array comes back AS IS, by reference', () => {
        const events = [ev('a', '2026-09-08T09:00')];
        expect(expandEvents(events, window(1, 30), 30)).toBe(events);
    });
});

describe('drag and resize', () => {
    it('snapping counts from the start of the day and not from the epoch', () => {
        expect(snapInstant(new Date(2026, 8, 8, 9, 7), 15)).toEqual(new Date(2026, 8, 8, 9, 0));
        expect(snapInstant(new Date(2026, 8, 8, 9, 8), 15)).toEqual(new Date(2026, 8, 8, 9, 15));
        // A step of 0 or less cannot divide: the instant comes back untouched.
        expect(snapInstant(new Date(2026, 8, 8, 9, 7), 0)).toEqual(new Date(2026, 8, 8, 9, 7));
    });

    it('a pending change only applies while the data is still as it was', () => {
        const event = ev('a', '2026-09-08T09:00', '2026-09-08T10:00');
        const change = {
            from: { start: new Date(2026, 8, 8, 9).getTime(), end: new Date(2026, 8, 8, 10).getTime(), resourceId: undefined, allDay: false },
            to: { start: new Date(2026, 8, 8, 11), end: new Date(2026, 8, 8, 12) }
        };
        const pending = new Map([['a', change]]);

        expect(toDate(applyPendingChanges([event], pending)[0].start).getHours()).toBe(11);

        // The application saved the change: the override stops applying instead of adding to it.
        const persisted = ev('a', '2026-09-08T11:00', '2026-09-08T12:00');
        expect(toDate(applyPendingChanges([persisted], pending)[0].start).getHours()).toBe(11);

        // And if the data changed for any other reason, the data wins.
        const elsewhere = ev('a', '2026-09-09T08:00', '2026-09-09T09:00');
        expect(applyPendingChanges([elsewhere], pending)[0]).toBe(elsewhere);
    });

    it('with no pending change the array comes back by reference', () => {
        const events = [ev('a', '2026-09-08T09:00')];
        expect(applyPendingChanges(events, new Map())).toBe(events);
    });

    it("a drag's target is read off the cell's data attributes", () => {
        const lane = document.createElement('div');
        lane.dataset['resourceId'] = 'r1';
        const cell = document.createElement('div');
        cell.dataset['slot'] = 'scheduler-time-grid-cell';
        cell.dataset['startDate'] = String(new Date(2026, 8, 8, 9).getTime());
        cell.dataset['endDate'] = String(new Date(2026, 8, 8, 9, 30).getTime());
        lane.appendChild(cell);

        const target = readCellTarget(cell)!;
        expect(target.start).toEqual(new Date(2026, 8, 8, 9));
        expect(target.resourceId).toBe('r1');
        // A time cell IS interpolated inside; a month cell is a whole day.
        expect(target.whole).toBe(false);

        const monthCell = document.createElement('div');
        monthCell.dataset['slot'] = 'scheduler-month-cell';
        monthCell.dataset['startDate'] = String(new Date(2026, 8, 8).getTime());
        monthCell.dataset['endDate'] = String(new Date(2026, 8, 9).getTime());
        expect(readCellTarget(monthCell)!.whole).toBe(true);

        // Anything that is not a labelled cell is not a target.
        expect(readCellTarget(document.createElement('div'))).toBeNull();
        expect(readCellTarget(null)).toBeNull();
    });
});

describe('timezones', () => {
    // A known instant: 2026-07-01T12:00:00Z, the middle of the northern summer.
    const summer = new Date(Date.UTC(2026, 6, 1, 12));
    // And another in winter, to show the offset is asked for per instant and not once.
    const winter = new Date(Date.UTC(2026, 0, 1, 12));

    it('the offset is asked for per instant, so daylight saving comes for free', () => {
        expect(zoneOffsetMinutes(summer, 'Europe/Madrid')).toBe(120);
        expect(zoneOffsetMinutes(winter, 'Europe/Madrid')).toBe(60);
        expect(zoneOffsetMinutes(summer, 'Asia/Tokyo')).toBe(540);
        // Tokyo has no summer time: the same offset all year round.
        expect(zoneOffsetMinutes(winter, 'Asia/Tokyo')).toBe(540);
    });

    it('a zone the platform does not know breaks nothing', () => {
        expect(Number.isNaN(zoneOffsetMinutes(summer, 'Mars/Olympus'))).toBe(true);
        // And shifting with it returns the instant untouched instead of an invalid date.
        expect(toDisplayTime(summer, 'Mars/Olympus').getTime()).toBe(summer.getTime());
    });

    it("the display date reads the target zone's wall clock", () => {
        // The shifted date's LOCAL time has to be the one Intl reports in the target zone: that is
        // what makes the engine's local arithmetic place the event where it belongs.
        for (const zone of ['Asia/Tokyo', 'America/New_York', 'Pacific/Auckland']) {
            const expected = Number(new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', hour12: false }).format(summer)) % 24;
            expect(toDisplayTime(summer, zone).getHours()).toBe(expected);
        }
    });

    const zones = ['Europe/Madrid', 'Asia/Tokyo', 'America/New_York', 'Pacific/Auckland'];

    it('shifting and back is the identity, the spring-forward jump included', () => {
        // The forward jump and an instant either side of the American and European changes: there
        // the instant and its display date fall on opposite sides of a boundary, which is where an
        // implementation built on adding offsets loses an hour.
        const instants = [summer, winter, new Date(Date.UTC(2026, 2, 29, 1, 30)), new Date(Date.UTC(2026, 2, 8, 6, 30)), new Date(Date.UTC(2026, 5, 15, 3, 15))];

        for (const zone of zones) {
            for (const instant of instants) {
                expect(fromDisplayTime(toDisplayTime(instant, zone), zone).getTime()).toBe(instant.getTime());
            }
        }
    });

    it('the REPEATED hour of the autumn change ALWAYS resolves to the first of the two', () => {
        // 02:30 on 25 October happens twice in Madrid, and 01:30 on 1 November twice in New York.
        // The rule is fixed: the same wall clock means the first of the two.
        for (const [zone, first] of [
            ['Europe/Madrid', new Date(Date.UTC(2026, 9, 25, 0, 30))],
            ['America/New_York', new Date(Date.UTC(2026, 10, 1, 5, 30))]
        ] as const) {
            const second = new Date(first.getTime() + 3_600_000);

            // Both are drawn the same...
            expect(toDisplayTime(second, zone).getTime()).toBe(toDisplayTime(first, zone).getTime());
            // ...and both come back to the first, deterministically.
            expect(fromDisplayTime(toDisplayTime(first, zone), zone).getTime()).toBe(first.getTime());
            expect(fromDisplayTime(toDisplayTime(second, zone), zone).getTime()).toBe(first.getTime());
        }
    });

    it('the hour the spring-forward jump SWALLOWS resolves just past the gap', () => {
        // 02:30 on the day of the jump does not exist in the target zone. The case is tried in
        // several zones whose jumps fall on DIFFERENT dates, discarding the ones the machine running
        // the test cannot even express: `new Date(y, m, d, 2, 30)` normalises to 03:30 when the host
        // jumps that same day, so with one zone pinned the test proved nothing outside Madrid.
        const gaps = [
            { zone: 'Europe/Madrid', date: [2026, 2, 29] as const },
            { zone: 'America/New_York', date: [2026, 2, 8] as const },
            { zone: 'Australia/Sydney', date: [2026, 9, 4] as const }
        ];
        const wallClock = (date: Date, zone: string) => new Intl.DateTimeFormat('en-US', { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit' }).format(date);
        let tested = 0;

        for (const { zone, date } of gaps) {
            const missing = new Date(date[0], date[1], date[2], 2, 30);
            if (missing.getHours() !== 2) continue;

            const resolved = fromDisplayTime(missing, zone);

            // The instant exists — the zone's offset confirms it — and its wall clock in the zone
            // is the first one past the gap, not an hour invented inside it.
            expect(Number.isNaN(zoneOffsetMinutes(resolved, zone))).toBe(false);
            expect(wallClock(resolved, zone)).toBe('03:30');
            tested++;
        }

        // A host can only collide with one of the three jumps: something is always exercised.
        expect(tested).toBeGreaterThan(0);
    });

    it('with no target zone both conversions are the identity, by reference', () => {
        expect(toDisplayTime(summer, undefined)).toBe(summer);
        expect(fromDisplayTime(summer, undefined)).toBe(summer);
    });

    it("the gutter's label states the offset of the zone being drawn", () => {
        expect(zoneLabel(summer, 'Asia/Tokyo')).toBe('GMT+9');
        expect(zoneLabel(summer, 'Europe/Madrid')).toBe('GMT+2');
        expect(zoneLabel(summer, 'Asia/Kolkata')).toBe('GMT+5:30');
        expect(zoneLabel(winter, 'America/New_York')).toBe('GMT-5');
    });
});

describe('import and export', () => {
    const events: SchedulerEvent[] = [
        { id: 'a', title: 'Stand-up; daily', start: new Date(2026, 8, 8, 9, 30), end: new Date(2026, 8, 8, 9, 45), description: 'Line one\nline two', rrule: 'FREQ=DAILY;COUNT=5', categoryId: 'ops', resourceId: 'crew' },
        { id: 'b', title: 'Festival', start: new Date(2026, 8, 10), end: new Date(2026, 8, 13), allDay: true }
    ];

    it('a series exports as ONE VEVENT with its rule and not as its copies', () => {
        const ics = toICalendar(events, { name: 'Demo' });
        expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(2);
        expect(ics).toContain('RRULE:FREQ=DAILY;COUNT=5');
        expect(ics).toContain('X-WR-CALNAME:Demo');
        // Semicolons and newlines are structural in ICS: they go escaped.
        expect(ics).toContain('SUMMARY:Stand-up\\; daily');
        expect(ics).toContain('DESCRIPTION:Line one\\nline two');
        // An all-day event goes as VALUE=DATE, which is what the format means by a whole day.
        expect(ics).toContain('DTSTART;VALUE=DATE:20260910');
    });

    it('the lines fold at 75 octets, which is what plenty of parsers demand', () => {
        const long = toICalendar([{ id: 'l', title: 'x'.repeat(200), start: new Date(2026, 8, 8, 9) }]);
        for (const line of long.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
    });

    it('the round trip keeps what the Scheduler knows how to draw', () => {
        const { events: parsed, name } = parseICalendar(toICalendar(events, { name: 'Demo' }));

        expect(name).toBe('Demo');
        expect(parsed.length).toBe(2);
        expect(parsed[0].id).toBe('a');
        expect(parsed[0].title).toBe('Stand-up; daily');
        expect(parsed[0].description).toBe('Line one\nline two');
        expect(parsed[0]['rrule']).toBe('FREQ=DAILY;COUNT=5');
        expect(parsed[0]['categoryId']).toBe('ops');
        expect(parsed[0].resourceId).toBe('crew');
        expect(toDate(parsed[0].start).getTime()).toBe(new Date(2026, 8, 8, 9, 30).getTime());
        expect(parsed[1].allDay).toBe(true);
    });

    it('an all-day event carries an EXCLUSIVE DTEND, with no end of its own too', () => {
        // A whole day from the 10th to the 12th ends, in the format, on the 13th; and one with no end takes its day, not zero.
        expect(toICalendar(events)).toContain('DTEND;VALUE=DATE:20260913');

        const single = toICalendar([{ id: 's', title: 'Feriado', start: new Date(2026, 8, 8), allDay: true }]);
        expect(single).toContain('DTSTART;VALUE=DATE:20260908');
        expect(single).toContain('DTEND;VALUE=DATE:20260909');
    });

    it('an end at midnight does not drag the next day in', () => {
        // [start, end) is the engine's convention: ending on the 11th at 00:00 occupies the 10th and nothing else.
        const ics = toICalendar([{ id: 'm', title: 'One day', start: new Date(2026, 8, 10), end: new Date(2026, 8, 11), allDay: true }]);
        expect(ics).toContain('DTEND;VALUE=DATE:20260911');
    });

    it('unescaping runs in ONE pass, so a Windows path survives', () => {
        const ics = toICalendar([{ id: 'w', title: 'Copia', start: new Date(2026, 8, 8, 9), location: 'C:\\network\\share' }]);
        const { events: parsed } = parseICalendar(ics);

        // Unescaping in steps would turn the escaped backslash plus the following n into a newline.
        expect(parsed[0].location).toBe('C:\\network\\share');
    });

    it('a broken calendar yields what can be read rather than an exception', () => {
        const { events: parsed } = parseICalendar('BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:No start\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART:20260908T090000Z\r\nSUMMARY:Fine\r\nEND:VEVENT\r\nEND:VCALENDAR');
        // The VEVENT with no DTSTART cannot be placed anywhere and is discarded; the other one gets in.
        expect(parsed.length).toBe(1);
        expect(parsed[0].title).toBe('Fine');
    });

    it('the JSON carries the instants as ISO and gives them back as Dates', () => {
        const payload = serializeSchedule(events, { categories: [{ id: 'ops', name: 'Operations' }] });
        expect(typeof payload.events[0].start).toBe('string');
        expect(payload.categories?.length).toBe(1);

        const back = parseSchedule(JSON.stringify(payload));
        expect(back.events[0].start instanceof Date).toBe(true);
        expect(toDate(back.events[0].start).getTime()).toBe(new Date(2026, 8, 8, 9, 30).getTime());
    });
});

describe('time format', () => {
    const morning = new Date(2026, 8, 8, 9, 0);
    const halfPast = new Date(2026, 8, 8, 9, 30);
    const afternoon = new Date(2026, 8, 8, 14, 15);
    // Algunas versiones de ICU separan el meridiem con U+202F: se normaliza antes de comparar.
    const plain = (value: string) => value.replace(/\u202f/g, ' ');

    it('24h prints the hour of the day and 12h the meridiem', () => {
        expect(plain(formatTime(afternoon, 'en-US', { format: '24h' }))).toBe('14:15');
        expect(plain(formatTime(afternoon, 'en-US', { format: '12h' }))).toBe('2:15 PM');
    });

    it('non-zero drops the minutes of a whole hour and keeps the rest', () => {
        expect(plain(formatTime(morning, 'en-US', { format: '12h', showMinutes: 'non-zero' }))).toBe('9 AM');
        expect(plain(formatTime(halfPast, 'en-US', { format: '12h', showMinutes: 'non-zero' }))).toBe('9:30 AM');
    });

    it('dropping the meridiem does NOT turn a 12-hour clock into a 24-hour one', () => {
        // Lo que se quita es el sufijo: las 2 de la tarde siguen siendo "2", no "14".
        expect(plain(formatTime(afternoon, 'en-US', { format: '12h', showAMPM: false }))).toBe('2:15');
    });

    it('a compact range drops the repeated meridiem, and keeps it when they differ', () => {
        const sameHalf = plain(formatTimeRange(morning, new Date(2026, 8, 8, 10), 'en-US', { format: '12h', rangeDisplay: 'compact' }));
        const crossing = plain(formatTimeRange(new Date(2026, 8, 8, 11), new Date(2026, 8, 8, 13), 'en-US', { format: '12h', rangeDisplay: 'compact' }));

        expect(sameHalf).toBe('9:00 - 10:00 AM');
        // 11 AM - 1 PM necesita los dos: recortarlo diria que la cita acaba a la una de la mañana.
        expect(crossing).toBe('11:00 AM - 1:00 PM');
    });

    it('without options the locale decides, which is the behaviour that was there before', () => {
        expect(plain(formatTimeRange(morning, halfPast, 'en-US'))).toBe('9:00 AM - 9:30 AM');
        expect(formatTimeRange(morning, halfPast, 'es-ES')).toBe('9:00 - 9:30');
    });
});

describe('cell navigation', () => {
    /** Builds the structure a renderer draws, with the marker the navigator reads. */
    function grid(html: string): HTMLElement {
        const root = document.createElement('div');

        root.className = 'p-scheduler-view';
        root.innerHTML = html;
        document.body.appendChild(root);
        return root;
    }

    const cell = (label: string) => `<div data-nav-cell="" tabindex="-1" aria-label="${label}"></div>`;

    afterEach(() => document.querySelectorAll('.p-scheduler-view').forEach((node) => node.remove()));

    it('in a time column the vertical keys walk the column and the horizontal ones change column', () => {
        const root = grid(`
            <div class="p-scheduler-time-grid-column">${cell('a1')}${cell('a2')}${cell('a3')}</div>
            <div class="p-scheduler-time-grid-column">${cell('b1')}${cell('b2')}${cell('b3')}</div>
        `);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];
        const at = (label: string) => cells.find((node) => node.getAttribute('aria-label') === label)!;

        expect(moveCellFocus(at('a1'), 'ArrowDown')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('a2');
        // Changing column keeps the row, which is what makes moving horizontally useful.
        expect(moveCellFocus(at('a2'), 'ArrowRight')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('b2');
    });

    it("a mini-month's disabled padding is skipped without losing the weekday column", () => {
        const disabled = (label: string) => `<button data-nav-cell="" tabindex="-1" disabled aria-label="${label}"></button>`;
        const cells7 = (week: number) => Array.from({ length: 7 }, (_, day) => (week === 1 && day < 3 ? disabled(`w${week}d${day}`) : cell(`w${week}d${day}`))).join('');
        const root = grid(`<div class="p-scheduler-mini-month-grid">${cells7(1)}${cells7(2)}</div>`);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];
        const at = (label: string) => cells.find((node) => node.getAttribute('aria-label') === label)!;

        // Down still moves seven at a time: the same weekday, not the next free cell.
        expect(moveCellFocus(at('w1d3'), 'ArrowDown')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('w2d3');
        // Home cannot leave the single entry point on a disabled button.
        expect(moveCellFocus(at('w1d3'), 'Home')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('w1d3');
        expect(at('w1d0').getAttribute('tabindex')).toBe('-1');
    });

    it('in a month week it is the other way round, and down jumps to the next week', () => {
        const root = grid(`
            <div class="p-scheduler-month-week">${cell('w1d1')}${cell('w1d2')}</div>
            <div class="p-scheduler-month-week">${cell('w2d1')}${cell('w2d2')}</div>
        `);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];
        const at = (label: string) => cells.find((node) => node.getAttribute('aria-label') === label)!;

        expect(moveCellFocus(at('w1d1'), 'ArrowRight')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('w1d2');
        expect(moveCellFocus(at('w1d2'), 'ArrowDown')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('w2d2');
    });

    it('a mini-month is a seven-wide grid: down advances a week', () => {
        const root = grid(`<div class="p-scheduler-mini-month-grid">${Array.from({ length: 14 }, (_, i) => cell(`d${i + 1}`)).join('')}</div>`);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];

        expect(moveCellFocus(cells[2], 'ArrowDown')).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('d10');
        // And a mini-month's edge is the edge: below it another month starts, not the next week.
        expect(moveCellFocus(cells[10], 'ArrowDown')).toBe(false);
    });

    it('a move that would leave the grid is NOT consumed, so focus is not trapped at the edge', () => {
        const root = grid(`<div class="p-scheduler-time-grid-column">${cell('only')}</div>`);
        const only = root.querySelector<HTMLElement>('[data-nav-cell]')!;

        expect(moveCellFocus(only, 'ArrowUp')).toBe(false);
        expect(moveCellFocus(only, 'ArrowLeft')).toBe(false);
        // Nor does a key that is not a movement.
        expect(moveCellFocus(only, 'a')).toBe(false);
    });

    it('in RTL the horizontal arrows are reversed', () => {
        const root = grid(`
            <div class="p-scheduler-month-week">${cell('d1')}${cell('d2')}</div>
        `);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];

        expect(moveCellFocus(cells[0], 'ArrowLeft', true)).toBe(true);
        expect(document.activeElement?.getAttribute('aria-label')).toBe('d2');
    });

    it('the focus leaves a single tab stop behind it', () => {
        const root = grid(`<div class="p-scheduler-month-week">${cell('d1')}${cell('d2')}</div>`);
        const cells = [...root.querySelectorAll<HTMLElement>('[data-nav-cell]')];

        cells[0].setAttribute('tabindex', '0');
        moveCellFocus(cells[0], 'ArrowRight');

        expect(cells[0].getAttribute('tabindex')).toBe('-1');
        expect(cells[1].getAttribute('tabindex')).toBe('0');
    });
});

describe('placement fixes', () => {
    it("an event's minimum does not run outside its container", () => {
        // A one-minute appointment at 23:59 asked for 15 minutes of height and drew outside the grid.
        const range = { start: new Date(2026, 8, 8), end: new Date(2026, 8, 9) };
        const [item] = layoutTimeGrid([ev('late', '2026-09-08T23:59', '2026-09-09T00:00')], { range, minEventMinutes: 15 });

        expect(item.offset + item.size).toBeLessThanOrEqual(1);
    });

    it('the overflow hangs off the CALENDAR day, the day the clocks change included', () => {
        // The day the clocks change is 23 or 25 hours long, so dividing by 86,400,000 shifted the
        // index of the later days and the "+N more" hung off the wrong one.
        //
        // The short day is SEARCHED for in the host's zone rather than pinned to a Madrid date: with
        // a fixed date, a host without that change — UTC in CI — measured days of exactly 24 hours
        // and the regression was invisible. Where there is no clock change at all, the plain week is
        // exercised, which is all that zone can tell apart.
        const shortDay = (() => {
            for (let month = 0; month < 24; month++) {
                const year = 2026 + Math.floor(month / 12);
                for (let day = 1; day <= 31; day++) {
                    const start = new Date(year, month % 12, day);
                    if (start.getDate() !== day) break;
                    const next = new Date(year, month % 12, day + 1);
                    if (next.getTime() - start.getTime() < 24 * 3_600_000) return start;
                }
            }
            return null;
        })();

        const first = shortDay ?? new Date(2026, 2, 29);
        const second = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 1);
        const range = { start: first, end: new Date(first.getFullYear(), first.getMonth(), first.getDate() + 7) };
        // Just past midnight on the following day: that is where the previous day's 23 hours left
        // the quotient below 1 and the overflow landed on index 0. And they overlap on purpose,
        // because without an overlap both fit in the same row and there is no overflow.
        const at = (hour: number, minute: number) => new Date(second.getFullYear(), second.getMonth(), second.getDate(), hour, minute);
        const { overflow } = layoutRows(
            [
                { id: 'a', start: at(0, 15), end: at(1, 15) },
                { id: 'b', start: at(0, 45), end: at(1, 45) }
            ],
            { range, maxRows: 1 }
        );

        expect([...overflow.keys()]).toEqual([1]);
    });

    it("a bare-date UNTIL does not swallow that same day's appointments", () => {
        const rule = parseRRule('FREQ=DAILY;UNTIL=20260910')!;
        const starts = recurrenceStarts(new Date(2026, 8, 8, 9), rule, { start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) });

        // The 10th is in: "until the 10th" includes the 10th, even for a 9 a.m. appointment.
        expect(starts.map(dayKey)).toEqual(['2026-09-08', '2026-09-09', '2026-09-10']);
    });

    it('a numeric resource id comes back from the DOM as a number', () => {
        const lane = document.createElement('div');

        lane.dataset['resourceId'] = '3';
        const cell = document.createElement('div');

        cell.dataset['slot'] = 'scheduler-timeline-cell';
        cell.dataset['startDate'] = String(new Date(2026, 8, 8, 9).getTime());
        cell.dataset['endDate'] = String(new Date(2026, 8, 8, 10).getTime());
        lane.appendChild(cell);

        // A data attribute is always text: without converting it back, "3" does not match resource 3.
        expect(readCellTarget(cell)!.resourceId).toBe(3);

        lane.dataset['resourceId'] = 'crew-3';
        expect(readCellTarget(cell)!.resourceId).toBe('crew-3');
    });
});
