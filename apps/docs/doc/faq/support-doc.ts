import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { DISCORD_URL } from '@/utils/constants';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'faq-support-doc',
    standalone: true,
    imports: [AppDocSectionText, RouterModule],
    template: `
        <app-docsectiontext>
            <h3>Is there commercial support?</h3>
            <p>No. There is no SLA, no support contract and no guaranteed response time. Issues and discussions are answered by volunteers when they have time. If your organisation needs contractual guarantees, this project cannot offer them.</p>

            <h3>How do I report a bug?</h3>
            <p>
                Open an issue on <a href="https://github.com/openng-org/optimus-ui/issues" target="_blank" rel="noopener noreferrer">GitHub</a> with a minimal reproduction — a StackBlitz from any demo on this site is ideal — plus your Optimus UI,
                Angular and browser versions. A reproduction is the difference between a bug that gets fixed and one that sits in the backlog.
            </p>

            <h3>How do I request a feature?</h3>
            <p>
                Open a <a href="https://github.com/openng-org/optimus-ui/discussions" target="_blank" rel="noopener noreferrer">discussion</a>. Requests are triaged and welcome, but in practice they ship when someone implements them. If it matters to
                you, the <a [routerLink]="'/contribution'" class="doc-link">contribution guide</a> is the fastest route.
            </p>

            <h3>Where do I ask questions?</h3>
            <p>
                GitHub Discussions is the primary place. There is also an Ask AI button in the header, which answers from this documentation. For real-time chat, join the
                <a [href]="discordUrl" target="_blank" rel="noopener noreferrer">Optimus UI Discord</a> server.
            </p>

            <h3>How does versioning work?</h3>
            <p>
                Semantic versioning, with majors tracking Angular majors. Breaking changes are confined to majors and documented in the
                <a href="https://github.com/openng-org/optimus-ui/releases" target="_blank" rel="noopener noreferrer">GitHub releases</a>.
            </p>
        </app-docsectiontext>
    `
})
export class FaqSupportDoc {
    readonly discordUrl = DISCORD_URL;
}
