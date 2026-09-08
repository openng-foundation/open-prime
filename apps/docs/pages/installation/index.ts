import { AppDoc } from '@/components/doc/app.doc';
import { DownloadDoc } from '@/doc/installation/download-doc';
import { ExamplesDoc } from '@/doc/installation/examples-doc';
import { InstallationIconsDoc } from '@/doc/installation/icons-doc';
import { NextStepsDoc } from '@/doc/installation/nextsteps-doc';
import { NgAddDoc } from '@/doc/installation/ngadd-doc';
import { PrerequisitesDoc } from '@/doc/installation/prerequisites-doc';
import { ProviderDoc } from '@/doc/installation/provider-doc';
import { InstallationVersionCompatibilityDoc } from '@/doc/installation/versioncompatibility-doc';
import { VerifyDoc } from '@/doc/installation/verify-doc';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    imports: [CommonModule, AppDoc],
    template: `<app-doc docTitle="Getting Started - Optimus UI" header="Installation" description="Setting up Optimus UI in an Angular CLI project." [docs]="docs" docType="page"></app-doc>`
})
export class InstallationDemo {
    docs = [
        {
            id: 'prerequisites',
            label: 'Prerequisites',
            component: PrerequisitesDoc
        },
        {
            id: 'compatibility',
            label: 'Angular Version Compatibility',
            component: InstallationVersionCompatibilityDoc
        },
        {
            id: 'ngadd',
            label: 'Install',
            component: NgAddDoc
        },
        {
            id: 'manual',
            label: 'Manual Setup',
            children: [
                {
                    id: 'download',
                    label: 'Download',
                    component: DownloadDoc
                },
                {
                    id: 'provider',
                    label: 'Provider',
                    component: ProviderDoc
                }
            ]
        },
        {
            id: 'icons',
            label: 'Icons',
            component: InstallationIconsDoc
        },
        {
            id: 'verify',
            label: 'Verify',
            component: VerifyDoc
        },
        {
            id: 'examples',
            label: 'Examples',
            component: ExamplesDoc
        },
        {
            id: 'nextsteps',
            label: 'Next Steps',
            component: NextStepsDoc
        }
    ];
}
