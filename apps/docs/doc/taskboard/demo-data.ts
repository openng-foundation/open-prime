import type { TaskBoardColumnGroup, TaskBoardColumnModel, TaskBoardItem, TaskBoardSwimlane } from '@openng/optimus-ui/types/taskboard';

/**
 * The data the TaskBoard demos share.
 *
 * Every list is handed out through a function, not exported as a constant: the demos are writable
 * boards and two of them sharing one array would move each other's cards.
 */

/** The workflow columns of the delivery board. */
export function demoColumns(): TaskBoardColumnModel[] {
    return [
        { id: 'todo', label: 'To Do', statusType: 'todo', order: 0 },
        { id: 'in-progress', label: 'In Progress', statusType: 'in-progress', order: 1 },
        { id: 'review', label: 'Review', statusType: 'in-progress', order: 2 },
        { id: 'done', label: 'Done', statusType: 'done', order: 3 }
    ];
}

/** The cards of the delivery board. */
export function demoTasks(prefix = 't'): TaskBoardItem[] {
    return [
        { id: `${prefix}1`, title: 'Design system audit', description: 'Review and document all existing design tokens.', columnId: 'todo', priority: 'high', tags: ['design'], assignee: 'Alice Chen', order: 0 },
        { id: `${prefix}2`, title: 'API rate limiting', description: 'Implement rate limiting middleware for public endpoints.', columnId: 'todo', priority: 'critical', tags: ['backend', 'security'], assignee: 'Carlos Ruiz', order: 1 },
        { id: `${prefix}3`, title: 'Onboarding flow redesign', description: 'Redesign the user onboarding experience.', columnId: 'todo', priority: 'medium', tags: ['ux'], order: 2 },
        { id: `${prefix}4`, title: 'Dashboard performance', description: 'Optimize dashboard queries and add virtualized rendering.', columnId: 'in-progress', priority: 'high', tags: ['performance'], assignee: 'Diana Park', progress: 60, order: 0 },
        {
            id: `${prefix}5`,
            title: 'Auth refactor',
            description: 'Migrate from session-based auth to JWT with refresh tokens.',
            columnId: 'in-progress',
            priority: 'critical',
            tags: ['backend', 'auth'],
            assignees: ['Eve Foster', 'Frank Lee'],
            progress: 35,
            order: 1
        },
        { id: `${prefix}6`, title: 'E2E test suite', description: 'Set up Playwright tests for critical user journeys.', columnId: 'review', priority: 'medium', tags: ['testing'], assignee: 'Grace Kim', progress: 90, order: 0 },
        { id: `${prefix}7`, title: 'CI pipeline optimization', description: 'Reduce CI build time from 12min to under 5min.', columnId: 'review', priority: 'low', tags: ['devops'], assignee: 'Hank Wang', order: 1 },
        { id: `${prefix}8`, title: 'Dark mode support', description: 'Implement system-aware dark mode across all components.', columnId: 'done', priority: 'medium', tags: ['ui'], assignee: 'Alice Chen', progress: 100, order: 0 },
        { id: `${prefix}9`, title: 'Error tracking setup', description: 'Integrate Sentry for production error monitoring.', columnId: 'done', priority: 'high', tags: ['devops'], assignee: 'Carlos Ruiz', progress: 100, order: 1 }
    ];
}

/** The delivery columns with a capacity on the lane that needs one. */
export function demoColumnsWithLimit(): TaskBoardColumnModel[] {
    return demoColumns().map((column) => (column.id === 'in-progress' ? { ...column, wipLimit: 4 } : column));
}

/** The phase headers of the grouped board. */
export function demoGroups(): TaskBoardColumnGroup[] {
    return [
        { label: 'Planning', columns: ['todo'], color: '#3b82f6' },
        { label: 'Delivery', columns: ['in-progress', 'review'], color: '#f59e0b' },
        { label: 'Closed', columns: ['done'], color: '#10b981' }
    ];
}

/** The rows of the grouped board. */
export function demoSwimlanes(): TaskBoardSwimlane[] {
    return [
        { id: 'frontend', label: 'Frontend', order: 0 },
        { id: 'operations', label: 'Operations', order: 1 }
    ];
}

/** Cards for the grouped board, which carry a row as well as a column. */
export function demoSwimlaneTasks(): TaskBoardItem[] {
    return [
        { id: 'sb1', title: 'Login page redesign', description: 'Rework the sign-in screen and its error states.', columnId: 'todo', swimlaneId: 'frontend', priority: 'high', tags: ['ui'], assignee: 'Alice Chen', order: 0 },
        { id: 'sb2', title: 'Component library bump', description: 'Move to the latest major and fix the breaking changes.', columnId: 'todo', swimlaneId: 'frontend', priority: 'low', tags: ['chore'], order: 1 },
        { id: 'sb3', title: 'Queue back-pressure', description: 'Stop the ingest queue from growing without bound.', columnId: 'todo', swimlaneId: 'operations', priority: 'critical', tags: ['infra'], assignee: 'Diana Park', order: 0 },
        { id: 'sb4', title: 'Route-level code split', description: 'Split the bundle by route and measure the first load.', columnId: 'in-progress', swimlaneId: 'frontend', priority: 'medium', tags: ['performance'], progress: 45, order: 0 },
        { id: 'sb5', title: 'Blue-green deploys', description: 'Swap traffic between two identical environments.', columnId: 'in-progress', swimlaneId: 'operations', priority: 'high', tags: ['devops'], assignee: 'Hank Wang', progress: 70, order: 0 },
        { id: 'sb6', title: 'Accessibility sweep', description: 'Audit the focus order and the live regions.', columnId: 'review', swimlaneId: 'frontend', priority: 'medium', tags: ['a11y'], assignee: 'Grace Kim', order: 0 },
        { id: 'sb7', title: 'Backup restore drill', description: 'Restore last night’s snapshot into staging.', columnId: 'done', swimlaneId: 'operations', priority: 'high', tags: ['devops'], progress: 100, order: 0 }
    ];
}
