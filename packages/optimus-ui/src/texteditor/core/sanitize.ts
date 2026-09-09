/**
 * Everything entering the document - the bound value, `setValue`, a paste, a drop, a plugin's
 * `replaceSelection` - is untrusted. ProseMirror's schema already drops unknown nodes, but it does
 * not look at attribute values, so URLs and CSS are checked here, on the way in and on the way back
 * out through the serializer.
 */

const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'];

const ALLOWED_TARGETS = ['_blank', '_self', '_parent', '_top'];

const UNSAFE_CSS = /url\s*\(|expression\s*\(|behaviou?r\s*:|-moz-binding|@import|[;}<>`\\]|\/\*/i;

/**
 * Whether a character is one the browser ignores while resolving a URL. Tabs, newlines, control
 * characters and the zero-width family all count: a tab inside `java<TAB>script:` still navigates
 * to `javascript:`, so they are stripped before the scheme is read.
 */
function isIgnoredUrlChar(code: number): boolean {
    return code <= 0x20 || (code >= 0x7f && code <= 0xa0) || (code >= 0x200b && code <= 0x200f) || code === 0x2028 || code === 0x2029 || code === 0x202f || code === 0x3000 || code === 0xfeff;
}

function normalizeUrl(url: string): string {
    let normalized = '';

    for (const character of url ?? '') {
        if (!isIgnoredUrlChar(character.codePointAt(0) ?? 0)) normalized += character;
    }

    return normalized;
}

/**
 * Reads the scheme of a URL, or an empty string when the URL is relative or a fragment - neither of
 * which can carry a scheme, and both of which are allowed.
 */
function schemeOf(url: string): string {
    const match = /^([a-z][a-z0-9+.-]*):/i.exec(url);

    return match ? match[1].toLowerCase() + ':' : '';
}

/**
 * Whether a link href is safe to keep. Relative URLs and fragments pass; every scheme outside the
 * allowlist is rejected, `javascript:` and `data:text/html` included.
 *
 * @group Function
 */
export function isSafeLinkHref(url: string): boolean {
    const value = normalizeUrl(url);

    if (!value) return false;

    const scheme = schemeOf(value);

    return scheme === '' || ALLOWED_SCHEMES.includes(scheme);
}

/**
 * Whether an image src is safe to keep. Adds inline `data:image/*` to the link allowlist, minus
 * `data:image/svg+xml`, which can carry script.
 *
 * @group Function
 */
export function isSafeImageSrc(url: string): boolean {
    const value = normalizeUrl(url);

    if (!value) return false;

    const scheme = schemeOf(value);

    if (scheme === 'data:') return /^data:image\/(?!svg\+xml)[a-z0-9.+-]+[;,]/i.test(value);

    return scheme === '' || ALLOWED_SCHEMES.includes(scheme);
}

/**
 * Narrows a link target to the four navigable values; anything else is dropped.
 *
 * @group Function
 */
export function safeLinkTarget(target: string | null): string | null {
    return target && ALLOWED_TARGETS.includes(target) ? target : null;
}

/**
 * Whether an inline CSS value is safe to keep. Rejects anything that fetches, executes or breaks
 * out of the declaration it sits in.
 *
 * @group Function
 */
export function isSafeCssValue(value: string | null | undefined): boolean {
    if (!value) return true;

    return !UNSAFE_CSS.test(value);
}

/**
 * Parses untrusted HTML inside an inert `<template>`. The browser fetches nothing and fires no
 * load/error events there, so `<img src=x onerror=...>` cannot run in the window between parsing
 * and the schema stripping the handler.
 *
 * @group Function
 */
export function parseInertHtml(html: string, document: Document): DocumentFragment {
    const template = document.createElement('template');

    template.innerHTML = html ?? '';

    return template.content;
}
