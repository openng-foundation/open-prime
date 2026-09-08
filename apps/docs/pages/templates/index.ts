import { AppDoc } from '@/components/doc/app.doc';
import { SparkedDoc } from '@/doc/templates/sparked-doc';
import { Component } from '@angular/core';

@Component({
    selector: 'templates-demo',
    standalone: true,
    imports: [AppDoc],
    template: ` <app-doc docTitle="Templates - Optimus UI" header="Templates" description="Free, MIT licensed application templates built with Optimus UI." [docs]="docs" docType="page"></app-doc> `
})
export class TemplatesDemo {
    docs = [
        {
            id: 'sparked',
            label: 'Sparked',
            component: SparkedDoc
        }
    ];
}
