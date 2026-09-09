import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'performance-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Where the work goes</h3>
        <p>
            The board groups the accepted array by column and swimlane cell once per data change, and every column, header count and drag hit test reads that index. Without it each of those would scan the whole array, which on a board of a few
            thousand cards is the difference between one pass and one pass per visible cell.
        </p>
        <p>
            The pointer sensor works the same way: it snapshots the cell and card geometry when a drag starts and re-measures only when something invalidates it — a scroll of the board or of a column. Hit-testing against live
            <i>getBoundingClientRect()</i> calls on every pointer move forces a layout per move and the drag visibly stutters.
        </p>
        <h3>What to do on a large board</h3>
        <p>
            Keep the ids stable, keep the card markup lean, and derive expensive formatting in a <i>computed()</i> rather than calling a method from the template. Turn on <i>virtualScroll</i> with an honest <i>virtualScrollItemHeight</i>: a buffer of
            three to five keeps scrolling smooth without mounting the board. Cards whose height varies wildly make the estimate worth less, so keep them close to one another in size.
        </p>
        <p>
            Narrow the data before it reaches the board. Search, filter and sort belong to the application, so a board looking at ten thousand records should be handed the page the user is actually looking at — and with
            <i>items</i> rather than <i>tasks</i>, so a store can batch or debounce the writes instead of replacing the array on every accepted move.
        </p>
        <h3>What does not help</h3>
        <p>
            Importing the parts individually instead of <i>TaskBoardModule</i> narrows the declarations a feature sees, but every board runs the same root: there is no per-view engine to leave behind, so it does not make the runtime smaller.
            Lazy-loading the route that owns the board does. Measure the production bundle before and after; a shorter import statement is not evidence.
        </p>
    </app-docsectiontext>`
})
export class PerformanceDoc {}
