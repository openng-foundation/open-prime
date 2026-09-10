import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import type { SchedulerCategory, SchedulerEvent, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { Scheduler } from './scheduler';
import { SchedulerModule } from './scheduler.module';

// The compound tree is mounted EXACTLY as a consumer writes it: root -> header -> content -> scope,
// with definitions of its own in one scope and a fallback in the content. What this protects:
//   - that the composition compiles and draws the active view,
//   - that a scope's *...Def beats the fallback and that another view falls back,
//   - that the context arrives with the title and the time already resolved,
//   - that today and the neighbouring month come out marked with their data attributes,
//   - that a dense cell collapses into "+N more",
//   - that navigation and the view selector move the range.
const DAY = new Date(2026, 8, 8); // martes 8 de septiembre de 2026

const CATEGORIES: SchedulerCategory[] = [
    { id: 'prod', name: 'Production', color: '#0ea5e9' },
    { id: 'lab', name: 'Laboratory', color: '#f59e0b' }
];

function at(day: number, hour: number, minute = 0) {
    return new Date(2026, 8, day, hour, minute);
}

const EVENTS: SchedulerEvent[] = [
    { id: 'a', title: 'Dye batch rinse', start: at(8, 9), end: at(8, 11), categoryId: 'prod' },
    { id: 'b', title: 'Pigment run', start: at(8, 10), end: at(8, 12), categoryId: 'prod' },
    { id: 'c', title: 'Fastness test', start: at(8, 15), end: at(8, 16), categoryId: 'lab' },
    { id: 'd', title: 'Maintenance shutdown', start: at(8, 0), end: at(11, 0), allDay: true },
    { id: 'e', title: 'Fourth of the day', start: at(8, 17), end: at(8, 18), categoryId: 'lab' }
];

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-scheduler-root
            [events]="events()"
            [categories]="categories"
            categoryField="categoryId"
            [view]="view()"
            (viewChange)="view.set($event)"
            [date]="date()"
            [resources]="resources"
            [maxEventsPerCell]="2"
            [monthCount]="monthCount()"
            [views]="allViews"
            [showMorePopover]="showMorePopover()"
            (moreClick)="more.push($event)"
            [density]="density()"
            [nowIndicator]="nowIndicator()"
            [showEmptyDays]="showEmptyDays()"
            [resourcesExpandable]="true"
            [showAggregatedEvents]="showAggregatedEvents()"
            [appointmentSlots]="slots()"
            [timeFormat]="timeFormat()"
            (slotBook)="booked.push($event)"
            (slotCancel)="cancelled.push($event)"
        >
            <p-scheduler-header>
                <p-scheduler-navigation />
                <p-scheduler-title />
                <p-scheduler-view-selector />
            </p-scheduler-header>
            <p-scheduler-category-legend />
            <p-scheduler-content>
                <p-scheduler-event *pSchedulerEventDef="let ctx">
                    <span class="fallback-card">{{ ctx.title }}</span>
                </p-scheduler-event>
                <p-scheduler-month>
                    <p-scheduler-month-event *pSchedulerMonthEventDef="let ctx">
                        <span class="month-card">{{ ctx.title }} · {{ ctx.timeText }}</span>
                    </p-scheduler-month-event>
                </p-scheduler-month>
                <p-scheduler-week>
                    <p-scheduler-time-grid-event *pSchedulerTimeGridEventDef="let ctx">
                        <span class="week-card" [attr.data-accent]="ctx.accentColor">{{ ctx.title }}</span>
                    </p-scheduler-time-grid-event>
                </p-scheduler-week>
                <p-scheduler-agenda />
                <p-scheduler-day />
                <p-scheduler-year />
                <p-scheduler-timeline />
                <p-scheduler-resource-timeline />
            </p-scheduler-content>
            <p-scheduler-more-popover />
            <p-scheduler-loading />
        </p-scheduler-root>
    `
})
class TestHost {
    events = signal(EVENTS);
    categories = CATEGORIES;
    view = signal<SchedulerViewType>('month');

    resources: any[] = [];

    monthCount = signal(1);
    showMorePopover = signal(true);
    density = signal<'comfortable' | 'compact'>('comfortable');
    nowIndicator = signal(true);
    showEmptyDays = signal(false);
    showAggregatedEvents = signal(false);
    timeFormat = signal<{ format?: '12h' | '24h' | 'auto' } | undefined>(undefined);
    slots = signal<any[]>([]);
    booked: any[] = [];
    cancelled: any[] = [];
    more: { date: Date; events: SchedulerEvent[]; view: SchedulerViewType }[] = [];

    allViews: SchedulerViewType[] = ['day', 'week', 'month', 'agenda', 'year', 'timeline', 'resourceTimeline'];
    date = signal(DAY);
}

describe('Scheduler', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const q = (selector: string) => fixture.debugElement.queryAll(By.css(selector));
    const text = (selector: string) => q(selector).map((el) => (el.nativeElement as HTMLElement).textContent?.trim());

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SchedulerModule],
            declarations: [TestHost],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('mounts the compound tree and draws the active view', () => {
        expect(q('[data-slot="scheduler-root"]').length).toBe(1);
        expect(q('[data-slot="scheduler-content"][data-view="month"]').length).toBeGreaterThan(0);
        expect(q('.p-scheduler-view-month').length).toBe(1);
    });

    it('the month is 6 weeks of 7 days', () => {
        expect(q('.p-scheduler-month-week').length).toBe(6);
        expect(q('[data-slot="scheduler-month-cell"]').length).toBe(42);
    });

    it('marks today, the weekend and the days of another month', () => {
        expect(q('[data-slot="scheduler-month-cell"][data-other-month]').length).toBeGreaterThan(0);
        expect(q('[data-slot="scheduler-month-cell"][data-weekend]').length).toBe(12); // 6 weeks x Sat+Sun
        expect(q('[data-slot="scheduler-month-cell"][data-date="2026-09-08"]').length).toBe(1);
    });

    it("uses the month scope's definition and not the fallback", () => {
        expect(q('.month-card').length).toBeGreaterThan(0);
        expect(q('.fallback-card').length).toBe(0);
    });

    it('the context arrives with the title and the time already resolved', () => {
        const cards = text('.month-card');
        expect(cards.some((t) => t?.includes('Dye batch rinse'))).toBe(true);
        expect(cards.some((t) => t?.includes('·'))).toBe(true);
    });

    it('a dense cell collapses into "+N more"', () => {
        // maxEventsPerCell = 2 and the 8th has 4 timed events plus the multi-day shutdown.
        const links = q('[data-slot="scheduler-month-more-link"]');
        expect(links.length).toBeGreaterThan(0);
        expect((links[0].nativeElement as HTMLElement).textContent).toMatch(/\+\d+/);
    });

    it('the legend counts the events per category', async () => {
        const items = q('[data-slot="scheduler-category-legend-ui-item"]');
        expect(items.length).toBe(2);
        expect((items[0].nativeElement as HTMLElement).getAttribute('data-event-count')).toBe('2');
    });

    it('filtering a category out removes its events', async () => {
        // The total the cells report is measured and NOT the visible cards: with maxEventsPerCell
        // the cell clips, so filtering changes WHICH are seen and not how many, and an assertion
        // about what is visible passed by luck or failed with nothing actually broken.
        const totalEvents = () => q('[data-slot="scheduler-month-cell"]').reduce((sum, el) => sum + Number((el.nativeElement as HTMLElement).getAttribute('data-event-count') ?? 0), 0);

        const before = totalEvents();
        expect(before).toBeGreaterThan(0);

        (q('[data-slot="scheduler-category-legend-ui-item"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        expect(totalEvents()).toBeLessThan(before);
        expect(q('[data-slot="scheduler-category-legend-ui-item"][data-selected]').length).toBe(1);
    });

    it("switching to week uses the week's definition and the time grid appears", async () => {
        host.view.set('week');
        await fixture.whenStable();

        expect(q('.p-scheduler-view-time-grid').length).toBe(1);
        expect(q('.week-card').length).toBeGreaterThan(0);
        expect(q('.month-card').length).toBe(0);
        // 7 day columns
        expect(q('[data-slot="scheduler-time-grid-column"]').length).toBe(7);
    });

    it("the category's colour reaches the event's context", async () => {
        host.view.set('week');
        await fixture.whenStable();
        const accents = q('.week-card').map((el) => (el.nativeElement as HTMLElement).getAttribute('data-accent'));
        expect(accents).toContain('#0ea5e9');
    });

    it('an all-day event goes to the top band and not into the grid', async () => {
        host.view.set('week');
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-all-day-event"]').length).toBe(1);
    });

    it('in the agenda each day is a group and the empty days do not appear', async () => {
        host.view.set('agenda');
        await fixture.whenStable();

        const headers = q('[data-slot="scheduler-agenda-date-header"]');
        expect(headers.length).toBeGreaterThan(0);
        // The multi-day shutdown appears on all 3 of its days; none of the groups is empty.
        expect(q('[data-slot="scheduler-agenda-event"]').length).toBeGreaterThanOrEqual(EVENTS.length);
        expect(q('.p-scheduler-agenda-empty').length).toBe(0);
    });

    it('monthCount draws one captioned grid per month and pages by all of them', async () => {
        host.monthCount.set(3);
        await fixture.whenStable();

        expect(q('.p-scheduler-month').length).toBe(3);
        expect(q('.p-scheduler-month-week').length).toBe(18); // 3 rejillas de 6 semanas
        expect(q('[data-slot="scheduler-month-title"]').length).toBe(3);
        expect(q('.p-scheduler-month[data-month="2026-11"]').length).toBe(1);
        // The header names the span and not the anchor: "September" over a grid running into
        // November would be a lie about what is on screen.
        expect((q('[data-slot="scheduler-title"]')[0].nativeElement as HTMLElement).textContent?.trim()).toBe('September - November 2026');
        // September's padding days are October's own days in October's grid: each grid greys out
        // against ITS month, so the same date is other-month in one and not in the next.
        expect(q('.p-scheduler-month[data-month="2026-10"] [data-slot="scheduler-month-cell"][data-date="2026-10-01"]:not([data-other-month])').length).toBe(1);

        (q('[data-slot="scheduler-nav-next"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        // Three on screen means a page is three months: December is the last of the next page.
        expect(q('.p-scheduler-month[data-month="2026-12"]').length).toBe(1);
        expect(q('.p-scheduler-month[data-month="2026-10"]').length).toBe(0);
    });

    it('the whole month view keeps one tab stop however many grids it draws', async () => {
        expect(q('[data-nav-cell][tabindex="0"]').length).toBe(1);

        host.monthCount.set(3);
        await fixture.whenStable();

        // The arrows walk from the last week of a month into the first of the next, so the three
        // grids are one grid to the keyboard and get ONE tab stop between them.
        expect(q('[data-nav-cell][tabindex="0"]').length).toBe(1);
    });

    it('a single month keeps its caption off and its grid unchanged', () => {
        expect(q('[data-slot="scheduler-month-title"]').length).toBe(0);
        expect(q('.p-scheduler-month').length).toBe(1);
    });

    it('navigating moves the range and the title', async () => {
        const title = () => (q('[data-slot="scheduler-title"]')[0].nativeElement as HTMLElement).textContent?.trim();
        const before = title();
        (q('[data-slot="scheduler-nav-next"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(title()).not.toBe(before);
    });

    it('the view selector changes the view and marks the active one', async () => {
        const dayButton = q('[data-slot="scheduler-view-button"][data-view="day"]')[0];
        (dayButton.nativeElement as HTMLElement).click();
        await fixture.whenStable();

        expect(q('.p-scheduler-view-time-grid').length).toBe(1);
        expect(q('[data-slot="scheduler-time-grid-column"]').length).toBe(1);
        expect(q('[data-slot="scheduler-view-button"][data-view="day"][data-selected]').length).toBe(1);
    });

    it('the "+N more" opens the overflow popover with that day events', async () => {
        expect(q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel').length).toBe(0);

        (q('[data-slot="scheduler-month-more-link"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        const panel = q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel');
        expect(panel.length).toBe(1);
        expect(q('.p-scheduler-more-popover-item').length).toBeGreaterThan(0);

        (q('.p-scheduler-more-popover-close')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel').length).toBe(0);
    });

    it('the "+N more" always reports, and with the popover off it does NOT open the panel', async () => {
        host.showMorePopover.set(false);
        await fixture.whenStable();

        (q('[data-slot="scheduler-month-more-link"]')[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();

        // Turning the popover off keeps the notice: the page opens whatever it likes with the day's events.
        expect(host.more.length).toBe(1);
        expect(host.more[0].view).toBe('month');
        expect(host.more[0].events.length).toBeGreaterThan(0);
        expect(q('[data-slot="scheduler-more-popover"] .p-scheduler-more-popover-panel').length).toBe(0);
    });

    it('the year is twelve mini-months and marks the days with events', async () => {
        host.view.set('year');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-mini-month"]').length).toBe(12);
        // The fixture's events fall in September: at least one day carries an indicator.
        expect(q('.p-scheduler-mini-month-day-has-events').length).toBeGreaterThan(0);
        // The year is a navigator: pressing a day takes you to the day view.
        const marked = q('.p-scheduler-mini-month-day-has-events')[0];
        (marked.nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(host.view()).toBe('day');
    });

    it('the timeline lays the day out horizontally, with one row per overlap', async () => {
        host.view.set('timeline');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-timeline-body"]').length).toBe(1);
        expect(q('[data-slot="scheduler-timeline-lane"]').length).toBe(1);
        expect(q('[data-slot="scheduler-timeline-event"]').length).toBeGreaterThan(0);
        // No resource rail in the plain view.
        expect(q('[data-slot="scheduler-resource-area"]').length).toBe(0);
    });

    it('the resource timeline gives one lane per resource and collects the orphans', async () => {
        host.resources = [
            { id: 'r1', name: 'Drum 1' },
            { id: 'r2', name: 'Drum 2' }
        ];
        host.view.set('resourceTimeline');
        await fixture.whenStable();

        expect(q('[data-slot="scheduler-resource-area"]').length).toBe(1);
        const labels = q('.p-scheduler-resource-label').map((el) => (el.nativeElement as HTMLElement).textContent?.trim());
        // Two resources plus the lane for those with no known resource: no event is lost.
        expect(labels).toContain('Drum 1');
        expect(labels).toContain('Drum 2');
        expect(labels).toContain('Unassigned');
    });

    it('a resource group collapses, and its lane keeps counting what is under it', async () => {
        host.resources = [
            { id: 'field', name: 'Field teams' },
            { id: 'north-crew', name: 'Survey Crew', parentId: 'field' },
            { id: 'harbor-crew', name: 'Civil Crew', parentId: 'field' }
        ];
        host.showAggregatedEvents.set(true);
        host.view.set('resourceTimeline');
        await fixture.whenStable();

        // Tres carriles: el grupo y sus dos hijos, mas el de los eventos sin recurso.
        const lanes = () => q('[data-slot="scheduler-resource"]').map((el) => (el.nativeElement as HTMLElement).getAttribute('data-resource-id'));
        expect(lanes()).toContain('north-crew');

        const toggle = q('[data-slot="scheduler-resource-toggle"]')[0];
        expect(toggle).toBeTruthy();
        expect((toggle.nativeElement as HTMLElement).getAttribute('aria-expanded')).toBe('true');

        (toggle.nativeElement as HTMLElement).click();
        await fixture.whenStable();

        // Colapsado: los hijos desaparecen del carril y el grupo sigue ahi.
        expect(lanes()).not.toContain('north-crew');
        expect(lanes()).toContain('field');
        expect((q('[data-slot="scheduler-resource-toggle"]')[0].nativeElement as HTMLElement).getAttribute('aria-expanded')).toBe('false');
    });

    it('activating an appointment window reports a booking, and a taken one a cancellation', async () => {
        const at = (hour: number) => new Date(2026, 8, 8, hour);

        host.slots.set([
            { id: 'free', start: at(9), end: at(10), capacity: 2, booked: 0 },
            { id: 'mine', start: at(11), end: at(12), capacity: 2, booked: 1, status: 'booked' }
        ]);
        host.view.set('day');
        await fixture.whenStable();

        const windows = q('[data-slot="scheduler-appointment-slot"]');
        expect(windows.length).toBe(2);

        (windows[0].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(host.booked.length).toBe(1);
        expect(host.booked[0].slot.id).toBe('free');

        (windows[1].nativeElement as HTMLElement).click();
        await fixture.whenStable();
        // El estado del hueco es lo unico que distingue reservar de cancelar: la capacidad no lo sabe.
        expect(host.cancelled.length).toBe(1);
        expect(host.cancelled[0].slot.id).toBe('mine');
    });

    it('the now indicator can be turned off, and the density reaches the DOM', async () => {
        // El ancla se mueve a HOY: la linea de ahora solo existe en la columna del dia actual, que es
        // justamente lo que la hace util.
        host.date.set(new Date());
        host.view.set('day');
        await fixture.whenStable();
        expect(q('.p-scheduler-now-indicator').length).toBe(1);

        host.nowIndicator.set(false);
        await fixture.whenStable();
        expect(q('.p-scheduler-now-indicator').length).toBe(0);

        host.density.set('compact');
        await fixture.whenStable();
        expect((q('.p-scheduler')[0].nativeElement as HTMLElement).getAttribute('data-density')).toBe('compact');
    });

    it('the agenda lists empty days only when asked to', async () => {
        host.view.set('agenda');
        await fixture.whenStable();

        const groups = () => q('.p-scheduler-agenda-group').length;
        const withEvents = groups();

        host.showEmptyDays.set(true);
        await fixture.whenStable();
        expect(groups()).toBeGreaterThan(withEvents);
    });

    it('timeFormat decides the clock the gutter and the events print', async () => {
        host.view.set('day');
        host.timeFormat.set({ format: '24h' });
        await fixture.whenStable();

        const gutter = text('.p-scheduler-time-gutter-slot').filter(Boolean).join(' ');
        // 24h no lleva meridiem en ninguna parte de la reticula.
        expect(gutter).not.toMatch(/[AP]M/i);
    });

    it('print() isolates the schedule and puts the page back afterwards', async () => {
        const scheduler = fixture.debugElement.query(By.directive(Scheduler)).componentInstance as Scheduler;
        // window.print abre un dialogo del navegador: se sustituye para que el test no se cuelgue.
        const original = window.print;
        let printed = 0;

        window.print = () => {
            printed++;

            // Mientras el dialogo esta abierto: el documento marcado —lo que deja al CSS apagar a los
            // hermanos— y una COPIA colgada de body, que es lo unico que se imprime.
            expect(document.documentElement.hasAttribute('data-p-scheduler-printing')).toBe(true);

            const container = document.getElementById('p-scheduler-print-root');

            expect(container?.parentElement).toBe(document.body);

            const copy = container?.querySelector('.p-scheduler[data-printing]') as HTMLElement | null;

            expect(copy).toBeTruthy();
            expect(copy?.getAttribute('data-print-color')).toBe('false');
            expect(copy?.getAttribute('data-print-scale')).toBe('fit');
            // Y el componente vivo se queda como estaba: lo que se imprime no es el que se ve.
            expect(document.querySelectorAll('.p-scheduler[data-printing]').length).toBe(1);
        };

        try {
            scheduler.print({ color: false, layout: { orientation: 'landscape', scale: 'fit' } });
        } finally {
            window.print = original;
        }

        expect(printed).toBe(1);

        window.dispatchEvent(new Event('afterprint'));
        await fixture.whenStable();

        // Y al cerrarlo no queda nada puesto: una pagina en estado de impresion es una pagina rota.
        expect(document.documentElement.hasAttribute('data-p-scheduler-printing')).toBe(false);
        expect(document.getElementById('p-scheduler-print-root')).toBeNull();
        expect(document.getElementById('p-scheduler-print-page')).toBeNull();
    });

    it('a click on an event selects it', async () => {
        const card = q('[data-slot="scheduler-month-event"]')[0];
        (card.nativeElement as HTMLElement).click();
        await fixture.whenStable();
        expect(q('[data-slot="scheduler-month-event"][data-selected]').length).toBe(1);
    });
});
