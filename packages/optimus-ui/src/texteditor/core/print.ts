/**
 * Prints the editor content in a clean, print-optimized frame.
 *
 * The HTML handed over here has already been through the sanitizing serializer, and the frame is
 * sandboxed without `allow-scripts`, so nothing in the document can run even if a future serializer
 * change let something through.
 *
 * @group Function
 */
export function printHtml(html: string, document: Document, title?: string): void {
    const frame = document.createElement('iframe');

    frame.setAttribute('sandbox', 'allow-modals allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);

    const frameDocument = frame.contentDocument;

    if (!frameDocument) {
        frame.remove();

        return;
    }

    /* The editor's own stylesheets are copied in so the printed page keeps its typography, lists
       and table borders instead of falling back to the browser's defaults. */
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('');

    /* The title is host-supplied text, not markup: escaped so a stray `<` cannot close the head. */
    const safeTitle = (title ?? document.title).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] as string);

    frameDocument.open();
    frameDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title>${styles}</head><body><div class="p-text-editor-content">${html}</div></body></html>`);
    frameDocument.close();

    const print = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        /* The frame outlives the print dialog on purpose: removing it while the dialog is open
           cancels the job in Safari. */
        setTimeout(() => frame.remove(), 1000);
    };

    if (frameDocument.readyState === 'complete') print();
    else frame.addEventListener('load', print, { once: true });
}
