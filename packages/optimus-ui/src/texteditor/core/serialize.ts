import { DOMParser as ProseMirrorDOMParser, DOMSerializer, Node as ProseMirrorNode, Schema, Slice } from 'prosemirror-model';
import { isSafeCssValue, isSafeImageSrc, isSafeLinkHref, parseInertHtml, safeLinkTarget } from './sanitize';

/**
 * Parses untrusted HTML into a document. The fragment is built inside an inert `<template>`, and
 * the schema then drops every node and attribute it does not know.
 *
 * @group Function
 */
export function parseHtml(schema: Schema, html: string, document: Document): ProseMirrorNode {
    const fragment = parseInertHtml(html ?? '', document);

    return ProseMirrorDOMParser.fromSchema(schema).parse(fragment, { preserveWhitespace: false });
}

/**
 * Parses untrusted HTML into a slice, which is what an insertion at the cursor needs: parsing to a
 * document and replacing with it would split the paragraph the caret sits in.
 *
 * @group Function
 */
export function parseHtmlSlice(schema: Schema, html: string, document: Document): Slice {
    const fragment = parseInertHtml(html ?? '', document);

    return ProseMirrorDOMParser.fromSchema(schema).parseSlice(fragment, { preserveWhitespace: false });
}

/**
 * Parses the block-mode value - one HTML string per block - into a single document.
 *
 * @group Function
 */
export function parseBlocks(schema: Schema, blocks: string[], document: Document): ProseMirrorNode {
    return parseHtml(schema, (blocks ?? []).join(''), document);
}

/**
 * Re-checks every attribute the schema carries on the way out. A value that entered before a
 * sanitizer rule existed, or through `getJSON` round-tripped by the host, does not leave the editor
 * as live markup.
 */
function sanitizeElement(element: Element): void {
    for (const child of Array.from(element.children)) sanitizeElement(child);

    for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value;

        if (name.startsWith('on')) {
            element.removeAttribute(attribute.name);
            continue;
        }

        if (name === 'href' && !isSafeLinkHref(value)) element.removeAttribute(attribute.name);

        if (name === 'src' && !isSafeImageSrc(value)) element.removeAttribute(attribute.name);

        if (name === 'target' && !safeLinkTarget(value)) element.removeAttribute(attribute.name);

        /* Declaration by declaration, not the attribute as a whole: the browser normalizes a style
           attribute with a trailing `;`, and a check meant for values would then reject every style
           the editor itself wrote. */
        if (name === 'style') {
            const safe = value
                .split(';')
                .map((declaration) => declaration.trim())
                .filter(Boolean)
                .filter((declaration) => isSafeCssValue(declaration.slice(declaration.indexOf(':') + 1)));

            if (safe.length) element.setAttribute('style', safe.join('; '));
            else element.removeAttribute(attribute.name);
        }
    }
}

function serializeToElement(schema: Schema, node: ProseMirrorNode, document: Document): HTMLElement {
    const container = document.createElement('div');

    container.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(node.content, { document }));
    sanitizeElement(container);

    return container;
}

/**
 * Serializes the document to HTML.
 *
 * @group Function
 */
export function serializeHtml(schema: Schema, doc: ProseMirrorNode, document: Document): string {
    return serializeToElement(schema, doc, document).innerHTML;
}

/**
 * Serializes the document as the array-of-block-HTML representation block mode binds to: one entry
 * per top-level node, in document order.
 *
 * @group Function
 */
export function serializeBlocks(schema: Schema, doc: ProseMirrorNode, document: Document): string[] {
    const blocks: string[] = [];

    doc.forEach((child) => {
        const container = document.createElement('div');

        container.appendChild(DOMSerializer.fromSchema(schema).serializeNode(child, { document }));
        sanitizeElement(container);
        blocks.push(container.innerHTML);
    });

    return blocks;
}

/**
 * Plain-text projection of the document: block boundaries become newlines, inline formatting is
 * dropped.
 *
 * @group Function
 */
export function serializeText(doc: ProseMirrorNode): string {
    return doc.textBetween(0, doc.content.size, '\n\n', (node) => (node.type.name === 'mention' ? node.attrs['label'] : node.type.name === 'hardBreak' ? '\n' : ''));
}

const MARK_WRAPPERS: Record<string, [string, string]> = {
    bold: ['**', '**'],
    italic: ['*', '*'],
    strikethrough: ['~~', '~~'],
    code: ['`', '`'],
    underline: ['<u>', '</u>'],
    subscript: ['<sub>', '</sub>'],
    superscript: ['<sup>', '</sup>']
};

/**
 * Markdown for one inline fragment. Marks wrap in a fixed order so `***bold italic***` comes out
 * the same way twice, which is what makes the projection round-trip.
 */
function inlineMarkdown(node: ProseMirrorNode): string {
    let markdown = '';

    node.forEach((child) => {
        if (child.type.name === 'hardBreak') {
            markdown += '\n';

            return;
        }

        if (child.type.name === 'image') {
            markdown += `![${child.attrs['alt'] ?? ''}](${child.attrs['src']})`;

            return;
        }

        if (child.type.name === 'mention') {
            markdown += child.attrs['label'];

            return;
        }

        let text = child.text ?? '';
        const link = child.marks.find((mark) => mark.type.name === 'link');

        for (const name of ['code', 'strikethrough', 'italic', 'bold', 'underline', 'subscript', 'superscript']) {
            if (!child.marks.some((mark) => mark.type.name === name)) continue;

            const [open, close] = MARK_WRAPPERS[name];

            text = `${open}${text}${close}`;
        }

        markdown += link ? `[${text}](${link.attrs['href']})` : text;
    });

    return markdown;
}

function listMarkdown(node: ProseMirrorNode, depth: number, ordered: boolean, checkList: boolean): string {
    const indent = '  '.repeat(depth);
    let markdown = '';
    let index = ordered ? (node.attrs['start'] ?? 1) : 1;

    node.forEach((item) => {
        const bullet = checkList ? `- [${item.attrs['checked'] ? 'x' : ' '}] ` : ordered ? `${index++}. ` : '- ';
        const [first, ...rest] = blocksMarkdown(item, depth + 1).split('\n');

        markdown += `${indent}${bullet}${first}\n`;

        for (const line of rest) markdown += line ? `${indent}  ${line}\n` : '\n';
    });

    return markdown;
}

function tableMarkdown(node: ProseMirrorNode): string {
    const rows: string[][] = [];

    node.forEach((row) => {
        const cells: string[] = [];

        // A pipe inside a cell would end the column early, so it is escaped rather than emitted raw.
        row.forEach((cell) => cells.push(serializeText(cell).replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim()));
        rows.push(cells);
    });

    if (!rows.length) return '';

    const header = rows[0];
    const separator = header.map(() => '---');
    const body = rows.slice(1);

    return [header, separator, ...body].map((cells) => `| ${cells.join(' | ')} |`).join('\n') + '\n';
}

/**
 * Markdown for a container's children, used both for the document itself and for the blocks nested
 * inside a list item or a blockquote.
 */
function blocksMarkdown(parent: ProseMirrorNode, depth = 0): string {
    let markdown = '';

    parent.forEach((node) => {
        switch (node.type.name) {
            case 'paragraph':
                markdown += `${inlineMarkdown(node)}\n\n`;
                break;
            case 'heading':
                markdown += `${'#'.repeat(node.attrs['level'])} ${inlineMarkdown(node)}\n\n`;
                break;
            case 'blockquote':
                markdown +=
                    blocksMarkdown(node, depth)
                        .trimEnd()
                        .split('\n')
                        .map((line) => (line ? `> ${line}` : '>'))
                        .join('\n') + '\n\n';
                break;
            case 'codeBlock':
                markdown += `\`\`\`${node.attrs['language'] ?? ''}\n${node.textContent}\n\`\`\`\n\n`;
                break;
            case 'bulletList':
                markdown += listMarkdown(node, depth, false, false) + (depth ? '' : '\n');
                break;
            case 'orderedList':
                markdown += listMarkdown(node, depth, true, false) + (depth ? '' : '\n');
                break;
            case 'checkList':
                markdown += listMarkdown(node, depth, false, true) + (depth ? '' : '\n');
                break;
            case 'horizontalRule':
                markdown += '---\n\n';
                break;
            case 'table':
                markdown += tableMarkdown(node) + '\n';
                break;
            case 'image':
                markdown += `![${node.attrs['alt'] ?? ''}](${node.attrs['src']})\n\n`;
                break;
            default:
                markdown += node.isTextblock ? `${inlineMarkdown(node)}\n\n` : blocksMarkdown(node, depth);
        }
    });

    return markdown;
}

/**
 * Markdown projection of the document. The same serializer backs markdown copy, so a document
 * copied out and pasted back in keeps its headings, emphasis, lists, links, code and tables.
 *
 * @group Function
 */
export function serializeMarkdown(doc: ProseMirrorNode): string {
    return blocksMarkdown(doc)
        .replace(/\n{3,}/g, '\n\n')
        .trimEnd();
}
