import { Component } from '@angular/core';
import { AppDoc } from '@/components/doc/app.doc';
import { AccessibilityDoc } from '@/doc/taskboard/accessibility-doc';
import { AppearanceDoc } from '@/doc/taskboard/appearance-doc';
import { BasicDoc } from '@/doc/taskboard/basic-doc';
import { CardsDoc } from '@/doc/taskboard/cards-doc';
import { ColumnSlotsDoc } from '@/doc/taskboard/columnslots-doc';
import { ColumnsDoc } from '@/doc/taskboard/columns-doc';
import { ContextMenuDoc } from '@/doc/taskboard/contextmenu-doc';
import { ContextsDoc } from '@/doc/taskboard/contexts-doc';
import { CrudDoc } from '@/doc/taskboard/crud-doc';
import { CustomStylesDoc } from '@/doc/taskboard/customstyles-doc';
import { DataAttributesDoc } from '@/doc/taskboard/data-attributes-doc';
import { DataDoc } from '@/doc/taskboard/data-doc';
import { DragDoc } from '@/doc/taskboard/drag-doc';
import { EventsDoc } from '@/doc/taskboard/events-doc';
import { ExportDoc } from '@/doc/taskboard/export-doc';
import { ExternalDoc } from '@/doc/taskboard/external-doc';
import { FilteringDoc } from '@/doc/taskboard/filtering-doc';
import { GroupsDoc } from '@/doc/taskboard/groups-doc';
import { HeaderDoc } from '@/doc/taskboard/header-doc';
import { HistoryDoc } from '@/doc/taskboard/history-doc';
import { ImportDoc } from '@/doc/taskboard/import-doc';
import { IndicatorsDoc } from '@/doc/taskboard/indicators-doc';
import { KeyboardDoc } from '@/doc/taskboard/keyboard-doc';
import { PerformanceDoc } from '@/doc/taskboard/performance-doc';
import { PermissionsDoc } from '@/doc/taskboard/permissions-doc';
import { PredicatesDoc } from '@/doc/taskboard/predicates-doc';
import { SelectionDoc } from '@/doc/taskboard/selection-doc';
import { SwimlanesDoc } from '@/doc/taskboard/swimlanes-doc';
import { TreeShakingDoc } from '@/doc/taskboard/treeshaking-doc';
import { UiPartsDoc } from '@/doc/taskboard/uiparts-doc';
import { VirtualScrollDoc } from '@/doc/taskboard/virtualscroll-doc';
import { WorkflowDoc } from '@/doc/taskboard/workflow-doc';

@Component({
    template: `<app-doc
        docTitle="Angular TaskBoard Component - Optimus UI"
        header="TaskBoard"
        description="TaskBoard is a compound kanban surface with columns, swimlanes, phase groups, workflow rules and a fully template-driven UI."
        [docs]="docs"
        [apiDocs]="['TaskBoard']"
        themeDocs="taskboard"
    ></app-doc>`,
    standalone: true,
    imports: [AppDoc]
})
export class TaskBoardDemo {
    docs = [
        { id: 'import', label: 'Import', component: ImportDoc },
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'data', label: 'Data Binding', component: DataDoc },
        { id: 'external', label: 'External Mode', component: ExternalDoc },
        { id: 'columns', label: 'Columns', component: ColumnsDoc },
        { id: 'groups', label: 'Column Groups', component: GroupsDoc },
        { id: 'swimlanes', label: 'Swimlanes', component: SwimlanesDoc },
        { id: 'cards', label: 'Card Content', component: CardsDoc },
        { id: 'columnslots', label: 'Column Content', component: ColumnSlotsDoc },
        { id: 'uiparts', label: 'UI Parts', component: UiPartsDoc },
        { id: 'header', label: 'Board Header', component: HeaderDoc },
        { id: 'selection', label: 'Selection', component: SelectionDoc },
        { id: 'drag', label: 'Drag and Drop', component: DragDoc },
        { id: 'indicators', label: 'Drop Indicators', component: IndicatorsDoc },
        { id: 'contextmenu', label: 'Context Menu', component: ContextMenuDoc },
        { id: 'workflow', label: 'Workflow Rules', component: WorkflowDoc },
        { id: 'permissions', label: 'Permissions', component: PermissionsDoc },
        { id: 'crud', label: 'CRUD', component: CrudDoc },
        { id: 'history', label: 'Undo and Redo', component: HistoryDoc },
        { id: 'keyboard', label: 'Keyboard', component: KeyboardDoc },
        { id: 'filtering', label: 'Search and Sort', component: FilteringDoc },
        { id: 'predicates', label: 'Custom Predicates', component: PredicatesDoc },
        { id: 'virtualscroll', label: 'Virtual Scroll', component: VirtualScrollDoc },
        { id: 'export', label: 'Export and Print', component: ExportDoc },
        { id: 'appearance', label: 'Density and RTL', component: AppearanceDoc },
        { id: 'customstyles', label: 'Custom Styles', component: CustomStylesDoc },
        { id: 'contexts', label: 'Projected Content', component: ContextsDoc },
        { id: 'events', label: 'Events', component: EventsDoc },
        { id: 'data-attributes', label: 'Data Attributes', component: DataAttributesDoc },
        { id: 'treeshaking', label: 'Tree Shaking', component: TreeShakingDoc },
        { id: 'accessibility', label: 'Accessibility', component: AccessibilityDoc },
        { id: 'performance', label: 'Performance', component: PerformanceDoc }
    ];
}
