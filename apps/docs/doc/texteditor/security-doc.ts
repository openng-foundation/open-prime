import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'security-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <p>
            Everything entering the document - <i>value</i>, <i>setValue</i>, paste, drag-drop and a plugin's <i>replaceSelection</i> - is treated as untrusted. Sanitization happens at the trust boundary and again on serialization, so a malicious
            value cannot execute script in the editor and cannot round-trip a dangerous attribute back out through <i>getHTML()</i>.
        </p>
        <p>
            Untrusted HTML is parsed inside an inert <i>&lt;template&gt;</i>, where the browser fetches nothing and fires no load or error events, so <i>&lt;img src=x onerror=...&gt;</i> cannot run in the window between parsing and the schema
            stripping the handler. The schema itself drops unknown nodes, which is what keeps <i>&lt;script&gt;</i>, <i>&lt;iframe&gt;</i> and <i>&lt;svg&gt;</i> out of the document.
        </p>
        <p>
            <i>href</i> and <i>src</i> are validated against a scheme allowlist - http, https, mailto, tel, ftp, relative URLs and fragments, plus <i>data:image/*</i> for images, minus <i>data:image/svg+xml</i>. Obfuscated variants using tabs,
            newlines, control characters or zero-width characters are normalized before the scheme is read. An unsafe href drops the link and keeps the text; an unsafe image src drops the node. Link targets are narrowed to the four navigable values
            and <i>rel="noopener noreferrer"</i> is always emitted.
        </p>
        <p>
            Inline style values are checked on both parse and serialize: <i>url(...)</i>, <i>expression(...)</i>, <i>behavior</i>, <i>-moz-binding</i>, <i>&#64;import</i>, declaration separators, comments and markup-breakout characters are rejected.
        </p>
        <p>
            Three things stay the host application's responsibility. <i>getJSON()</i> returns raw attribute values, so sanitize before rendering it yourself or render through <i>getHTML()</i>. A mention's <i>data</i> is an opaque payload the host
            supplies and reads back. And the client-side upload checks trust the browser-reported type: the server must re-validate the file and serve it with a safe content type.
        </p>
    </app-docsectiontext>`
})
export class SecurityDoc {}
