import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { ArchitectureDoc } from '@/doc/scheduler/architecture-doc';
import { AccessibilityDoc } from '@/doc/scheduler/accessibility-doc';
import { AdaptiveDoc } from '@/doc/scheduler/adaptive-doc';
import { AgendaDoc } from '@/doc/scheduler/agenda-doc';
import { AvailabilityDoc } from '@/doc/scheduler/availability-doc';
import { BasicDoc } from '@/doc/scheduler/basic-doc';
import { BookingDoc } from '@/doc/scheduler/booking-doc';
import { BusinessHoursDoc } from '@/doc/scheduler/business-hours-doc';
import { CategoriesDoc } from '@/doc/scheduler/categories-doc';
import { CellsDoc } from '@/doc/scheduler/cells-doc';
import { ControlledDoc } from '@/doc/scheduler/controlled-doc';
import { DataAttributesDoc } from '@/doc/scheduler/data-attributes-doc';
import { DayDoc } from '@/doc/scheduler/day-doc';
import { DefinitionsDoc } from '@/doc/scheduler/definitions-doc';
import { EditingDoc } from '@/doc/scheduler/editing-doc';
import { EventDataDoc } from '@/doc/scheduler/event-data-doc';
import { EventUiDoc } from '@/doc/scheduler/event-ui-doc';
import { GroupingDoc } from '@/doc/scheduler/grouping-doc';
import { HierarchyDoc } from '@/doc/scheduler/hierarchy-doc';
import { ImportDoc } from '@/doc/scheduler/import-doc';
import { InteractionDoc } from '@/doc/scheduler/interaction-doc';
import { LocaleDoc } from '@/doc/scheduler/locale-doc';
import { MonthDoc } from '@/doc/scheduler/month-doc';
import { MultiMonthDoc } from '@/doc/scheduler/multi-month-doc';
import { OverlaysDoc } from '@/doc/scheduler/overlays-doc';
import { PerformanceDoc } from '@/doc/scheduler/performance-doc';
import { RecurrenceDoc } from '@/doc/scheduler/recurrence-doc';
import { RecurrenceEditingDoc } from '@/doc/scheduler/recurrence-editing-doc';
import { ResourceTimelineDoc } from '@/doc/scheduler/resource-timeline-doc';
import { ResourceUiDoc } from '@/doc/scheduler/resource-ui-doc';
import { ResponsiveDoc } from '@/doc/scheduler/responsive-doc';
import { ResourcesDoc } from '@/doc/scheduler/resources-doc';
import { RtlDoc } from '@/doc/scheduler/rtl-doc';
import { SelectionDoc } from '@/doc/scheduler/selection-doc';
import { SlotsDoc } from '@/doc/scheduler/slots-doc';
import { SpanningDoc } from '@/doc/scheduler/spanning-doc';
import { TimeFormatDoc } from '@/doc/scheduler/time-format-doc';
import { TimezoneDoc } from '@/doc/scheduler/timezone-doc';
import { TransferDoc } from '@/doc/scheduler/transfer-doc';
import { TimelineDoc } from '@/doc/scheduler/timeline-doc';
import { ViewsDoc } from '@/doc/scheduler/views-doc';
import { WeekDoc } from '@/doc/scheduler/week-doc';
import { YearDoc } from '@/doc/scheduler/year-doc';

@Component({
    template: `<app-doc
        docTitle="Angular Scheduler Component - Optimus UI"
        header="Scheduler"
        description="Scheduler is a compound scheduling surface with day, week, month, agenda, year and timeline views."
        [docs]="docs"
        [apiDocs]="['Scheduler']"
        themeDocs="scheduler"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class SchedulerDemo {
    docs = [
        {
            id: 'import',
            label: 'Import',
            component: ImportDoc
        },
        {
            id: 'basic',
            label: 'Basic',
            component: BasicDoc
        },
        {
            id: 'architecture',
            label: 'Architecture',
            component: ArchitectureDoc
        },
        {
            id: 'views',
            label: 'Views',
            component: ViewsDoc
        },
        {
            id: 'day',
            label: 'Day',
            component: DayDoc
        },
        {
            id: 'week',
            label: 'Week',
            component: WeekDoc
        },
        {
            id: 'month',
            label: 'Month',
            component: MonthDoc
        },
        {
            id: 'multi-month',
            label: 'Multi Month',
            component: MultiMonthDoc
        },
        {
            id: 'agenda',
            label: 'Agenda',
            component: AgendaDoc
        },
        {
            id: 'year',
            label: 'Year',
            component: YearDoc
        },
        {
            id: 'timeline',
            label: 'Timeline',
            component: TimelineDoc
        },
        {
            id: 'resourcetimeline',
            label: 'Resource Timeline',
            component: ResourceTimelineDoc
        },
        {
            id: 'eventdata',
            label: 'Event Data',
            component: EventDataDoc
        },
        {
            id: 'spanning',
            label: 'All-Day and Spanning',
            component: SpanningDoc
        },
        {
            id: 'resources',
            label: 'Resources',
            component: ResourcesDoc
        },
        {
            id: 'grouping',
            label: 'Grouping',
            component: GroupingDoc
        },
        {
            id: 'hierarchy',
            label: 'Resource Hierarchy',
            component: HierarchyDoc
        },
        {
            id: 'adaptive',
            label: 'Adaptive Grouping',
            component: AdaptiveDoc
        },
        {
            id: 'businesshours',
            label: 'Business Hours',
            component: BusinessHoursDoc
        },
        {
            id: 'availability',
            label: 'Availability',
            component: AvailabilityDoc
        },
        {
            id: 'slots',
            label: 'Appointment Slots',
            component: SlotsDoc
        },
        {
            id: 'booking',
            label: 'Booking',
            component: BookingDoc
        },
        {
            id: 'interaction',
            label: 'Drag and Resize',
            component: InteractionDoc
        },
        {
            id: 'editing',
            label: 'Add, Edit and Delete',
            component: EditingDoc
        },
        {
            id: 'recurrence',
            label: 'Recurring Events',
            component: RecurrenceDoc
        },
        {
            id: 'recurrenceediting',
            label: 'Recurrence Scope',
            component: RecurrenceEditingDoc
        },
        {
            id: 'categories',
            label: 'Categories',
            component: CategoriesDoc
        },
        {
            id: 'selection',
            label: 'Selection',
            component: SelectionDoc
        },
        {
            id: 'overlays',
            label: 'Overlays',
            component: OverlaysDoc
        },
        {
            id: 'definitions',
            label: 'Definitions',
            component: DefinitionsDoc
        },
        {
            id: 'eventui',
            label: 'Event UI',
            component: EventUiDoc
        },
        {
            id: 'cells',
            label: 'Cells and Headers',
            component: CellsDoc
        },
        {
            id: 'resourceui',
            label: 'Resource UI',
            component: ResourceUiDoc
        },
        {
            id: 'controlled',
            label: 'Controlled State',
            component: ControlledDoc
        },
        {
            id: 'locale',
            label: 'Locale',
            component: LocaleDoc
        },
        {
            id: 'timeformat',
            label: 'Time Format',
            component: TimeFormatDoc
        },
        {
            id: 'timezone',
            label: 'Timezones',
            component: TimezoneDoc
        },
        {
            id: 'rtl',
            label: 'RTL',
            component: RtlDoc
        },
        {
            id: 'transfer',
            label: 'Import, Export and Print',
            component: TransferDoc
        },
        {
            id: 'responsive',
            label: 'Responsive Behaviour',
            component: ResponsiveDoc
        },
        {
            id: 'performance',
            label: 'Performance',
            component: PerformanceDoc
        },
        {
            id: 'dataattributes',
            label: 'Data Attributes',
            component: DataAttributesDoc
        },
        {
            id: 'accessibility',
            label: 'Accessibility',
            component: AccessibilityDoc
        }
    ];
}
