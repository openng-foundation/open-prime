import type { MarkSpec, NodeSpec } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';
import { isSafeCssValue, isSafeImageSrc, isSafeLinkHref, safeLinkTarget } from './sanitize';

const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

/**
 * Reads the alignment declared on an element, ignoring anything outside the four supported values.
 * A rogue `text-align: -webkit-center` from a pasted document is dropped rather than carried into
 * the document and back out through the serializer.
 */
function parseAlign(dom: HTMLElement): string | null {
    const value = dom.style.textAlign || dom.getAttribute('align') || '';

    return ALIGNMENTS.includes(value) ? value : null;
}

function alignAttrs(node: { attrs: Record<string, any> }): Record<string, string> {
    return node.attrs['textAlign'] ? { style: `text-align: ${node.attrs['textAlign']}` } : {};
}

/**
 * The block nodes every editor instance starts from. A plugin derives its own spec from one of
 * these with `extendNodeSpec` instead of redeclaring the whole node.
 *
 * @group Interface
 */
export const baseNodes: Record<string, NodeSpec> = {
    doc: { content: 'block+' },

    paragraph: {
        content: 'inline*',
        group: 'block',
        attrs: { textAlign: { default: null } },
        parseDOM: [{ tag: 'p', getAttrs: (dom: HTMLElement) => ({ textAlign: parseAlign(dom) }) }],
        toDOM: (node) => ['p', alignAttrs(node), 0]
    },

    heading: {
        content: 'inline*',
        group: 'block',
        defining: true,
        attrs: { level: { default: 1 }, textAlign: { default: null } },
        parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
            tag: `h${level}`,
            getAttrs: (dom: HTMLElement) => ({ level, textAlign: parseAlign(dom) })
        })),
        toDOM: (node) => [`h${node.attrs['level']}`, alignAttrs(node), 0]
    },

    blockquote: {
        content: 'block+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'blockquote' }],
        toDOM: () => ['blockquote', 0]
    },

    codeBlock: {
        content: 'text*',
        group: 'block',
        code: true,
        defining: true,
        marks: '',
        attrs: { language: { default: null } },
        parseDOM: [
            {
                tag: 'pre',
                preserveWhitespace: 'full',
                getAttrs: (dom: HTMLElement) => ({ language: dom.querySelector('code')?.getAttribute('data-language') || null })
            }
        ],
        toDOM: (node) => ['pre', ['code', node.attrs['language'] ? { 'data-language': node.attrs['language'] } : {}, 0]]
    },

    horizontalRule: {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: () => ['hr']
    },

    bulletList: {
        content: 'listItem+',
        group: 'block',
        parseDOM: [{ tag: 'ul', getAttrs: (dom: HTMLElement) => (dom.hasAttribute('data-p-checked-list') ? false : null) }],
        toDOM: () => ['ul', 0]
    },

    orderedList: {
        content: 'listItem+',
        group: 'block',
        attrs: { start: { default: 1 } },
        parseDOM: [
            {
                tag: 'ol',
                getAttrs: (dom: HTMLElement) => ({ start: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) || 1 : 1 })
            }
        ],
        toDOM: (node) => (node.attrs['start'] === 1 ? ['ol', 0] : ['ol', { start: node.attrs['start'] }, 0])
    },

    listItem: {
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li', getAttrs: (dom: HTMLElement) => (dom.hasAttribute('data-p-checked') ? false : null) }],
        toDOM: () => ['li', 0]
    },

    checkList: {
        content: 'checkListItem+',
        group: 'block',
        parseDOM: [{ tag: 'ul[data-p-checked-list]', priority: 60 }],
        toDOM: () => ['ul', { 'data-p-checked-list': '' }, 0]
    },

    checkListItem: {
        content: 'paragraph block*',
        defining: true,
        attrs: { checked: { default: false } },
        parseDOM: [
            {
                tag: 'li[data-p-checked]',
                priority: 60,
                getAttrs: (dom: HTMLElement) => ({ checked: dom.getAttribute('data-p-checked') === 'true' })
            }
        ],
        toDOM: (node) => ['li', { 'data-p-checked': node.attrs['checked'] ? 'true' : 'false' }, 0]
    },

    image: {
        group: 'block',
        atom: true,
        draggable: true,
        attrs: { src: {}, alt: { default: null }, title: { default: null }, width: { default: null } },
        parseDOM: [
            {
                tag: 'img[src]',
                getAttrs: (dom: HTMLElement) => {
                    const src = dom.getAttribute('src') || '';

                    /* An unsafe src drops the whole node: an <img> that cannot render is not worth
                       keeping, and keeping it would round-trip the payload back out of getHTML. */
                    if (!isSafeImageSrc(src)) return false;

                    return {
                        src,
                        alt: dom.getAttribute('alt'),
                        title: dom.getAttribute('title'),
                        width: dom.getAttribute('width')
                    };
                }
            }
        ],
        toDOM: (node) => {
            const { src, alt, title, width } = node.attrs;

            return ['img', { src, alt, title, width }];
        }
    },

    mention: {
        group: 'inline',
        inline: true,
        atom: true,
        selectable: true,
        attrs: { label: { default: '' }, data: { default: null } },
        parseDOM: [
            {
                tag: 'span[data-p-mention]',
                getAttrs: (dom: HTMLElement) => {
                    const raw = dom.getAttribute('data-p-mention-data');
                    let data: unknown = null;

                    try {
                        data = raw ? JSON.parse(raw) : null;
                    } catch {
                        data = null;
                    }

                    return { label: dom.textContent || '', data };
                }
            }
        ],
        toDOM: (node) => {
            const attrs: Record<string, string> = { 'data-p-mention': '', class: 'p-text-editor-mention' };

            if (node.attrs['data'] != null) attrs['data-p-mention-data'] = JSON.stringify(node.attrs['data']);

            return ['span', attrs, node.attrs['label']];
        }
    },

    imageUploadPlaceholder: {
        group: 'block',
        atom: true,
        selectable: false,
        parseDOM: [{ tag: 'div[data-p-image-upload-placeholder]' }],
        toDOM: () => ['div', { 'data-p-image-upload-placeholder': '', class: 'p-text-editor-image-upload-placeholder' }]
    },

    documentUploadPlaceholder: {
        group: 'block',
        atom: true,
        selectable: false,
        parseDOM: [{ tag: 'div[data-p-document-upload-placeholder]' }],
        toDOM: () => ['div', { 'data-p-document-upload-placeholder': '', class: 'p-text-editor-document-upload-placeholder' }]
    },

    hardBreak: {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: () => ['br']
    },

    text: { group: 'inline' }
};

/**
 * The marks every editor instance starts from.
 *
 * @group Interface
 */
export const baseMarks: Record<string, MarkSpec> = {
    bold: {
        parseDOM: [{ tag: 'strong' }, { tag: 'b', getAttrs: (dom: HTMLElement) => dom.style.fontWeight !== 'normal' && null }, { style: 'font-weight=bold' }, { style: 'font-weight=700' }],
        toDOM: () => ['strong', 0]
    },
    italic: {
        parseDOM: [{ tag: 'em' }, { tag: 'i', getAttrs: (dom: HTMLElement) => dom.style.fontStyle !== 'normal' && null }, { style: 'font-style=italic' }],
        toDOM: () => ['em', 0]
    },
    underline: {
        parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
        toDOM: () => ['u', 0]
    },
    strikethrough: {
        parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }, { style: 'text-decoration=line-through' }],
        toDOM: () => ['s', 0]
    },
    code: {
        code: true,
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: () => ['code', 0]
    },
    subscript: {
        excludes: 'superscript',
        parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
        toDOM: () => ['sub', 0]
    },
    superscript: {
        excludes: 'subscript',
        parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
        toDOM: () => ['sup', 0]
    },
    link: {
        inclusive: false,
        attrs: { href: {}, target: { default: null }, title: { default: null } },
        parseDOM: [
            {
                tag: 'a[href]',
                getAttrs: (dom: HTMLElement) => {
                    const href = dom.getAttribute('href') || '';

                    /* Dropping the mark and keeping the text: an unsafe href must not survive, but
                       silently deleting the words the user linked would lose content. */
                    if (!isSafeLinkHref(href)) return false;

                    return { href, target: safeLinkTarget(dom.getAttribute('target')), title: dom.getAttribute('title') };
                }
            }
        ],
        toDOM: (mark) => ['a', { href: mark.attrs['href'], target: mark.attrs['target'], title: mark.attrs['title'], rel: 'noopener noreferrer' }, 0]
    },
    textStyle: {
        attrs: { color: { default: null }, backgroundColor: { default: null }, fontFamily: { default: null }, fontSize: { default: null } },
        parseDOM: [
            {
                tag: 'span',
                getAttrs: (dom: HTMLElement) => {
                    const color = isSafeCssValue(dom.style.color) ? dom.style.color : null;
                    const backgroundColor = isSafeCssValue(dom.style.backgroundColor) ? dom.style.backgroundColor : null;
                    const fontFamily = isSafeCssValue(dom.style.fontFamily) ? dom.style.fontFamily : null;
                    const fontSize = isSafeCssValue(dom.style.fontSize) ? dom.style.fontSize : null;

                    if (!color && !backgroundColor && !fontFamily && !fontSize) return false;

                    return { color, backgroundColor, fontFamily, fontSize };
                }
            },
            { tag: 'mark', getAttrs: () => ({ backgroundColor: 'inherit' }) }
        ],
        toDOM: (mark) => {
            const { color, backgroundColor, fontFamily, fontSize } = mark.attrs;
            const style = [color ? `color: ${color}` : '', backgroundColor ? `background-color: ${backgroundColor}` : '', fontFamily ? `font-family: ${fontFamily}` : '', fontSize ? `font-size: ${fontSize}` : ''].filter(Boolean).join('; ');

            return ['span', { style }, 0];
        }
    }
};

/**
 * The table nodes, built by prosemirror-tables so the cell attributes the editor styles
 * (background and alignment) survive a round trip through HTML.
 */
const tableSpec = tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {
        background: {
            default: null,
            getFromDOM: (dom) => {
                const value = (dom as HTMLElement).style.backgroundColor;

                return isSafeCssValue(value) ? value || null : null;
            },
            setDOMAttr: (value, attrs) => {
                if (value) attrs['style'] = `${attrs['style'] || ''}background-color: ${value};`;
            }
        },
        color: {
            default: null,
            getFromDOM: (dom) => {
                const value = (dom as HTMLElement).style.color;

                return isSafeCssValue(value) ? value || null : null;
            },
            setDOMAttr: (value, attrs) => {
                if (value) attrs['style'] = `${attrs['style'] || ''}color: ${value};`;
            }
        },
        align: {
            default: null,
            getFromDOM: (dom) => parseAlign(dom as HTMLElement),
            setDOMAttr: (value, attrs) => {
                if (value) attrs['style'] = `${attrs['style'] || ''}text-align: ${value};`;
            }
        }
    }
});

/**
 * Derives a node spec from an existing one, so a plugin enriches a base node - adding an `id`
 * attribute to `heading`, say - instead of redefining it and losing the parse rules.
 *
 * @group Function
 */
export function extendNodeSpec(spec: NodeSpec, extension: NodeSpec): NodeSpec {
    return {
        ...spec,
        ...extension,
        attrs: { ...(spec.attrs ?? {}), ...(extension.attrs ?? {}) }
    };
}

/**
 * Builds the schema for one editor instance. Plugin nodes and marks are merged on top of the base
 * set; a name collision keeps the base spec and warns, because silently shadowing `paragraph`
 * breaks every command that looks it up.
 *
 * @group Function
 */
export function createTextEditorSchema(pluginNodes: Record<string, NodeSpec> = {}, pluginMarks: Record<string, MarkSpec> = {}): Schema {
    /* prosemirror-tables names its nodes in snake_case; the rest of the schema - and every command
       that looks a node up by name - is camelCase, so the four table nodes are renamed here. The
       library itself finds them through `tableRole`, not through the name, so this is safe. */
    const nodes: Record<string, NodeSpec> = {
        ...baseNodes,
        table: { ...tableSpec['table'], content: 'tableRow+' },
        tableRow: { ...tableSpec['table_row'], content: '(tableCell | tableHeader)*' },
        tableCell: tableSpec['table_cell'],
        tableHeader: tableSpec['table_header']
    };
    const marks: Record<string, MarkSpec> = { ...baseMarks };

    for (const [name, spec] of Object.entries(pluginNodes)) {
        if (nodes[name]) {
            console.warn(`[optimus-ui] TextEditor plugin node "${name}" collides with a built-in node and was ignored.`);
            continue;
        }

        nodes[name] = spec;
    }

    for (const [name, spec] of Object.entries(pluginMarks)) {
        if (marks[name]) {
            console.warn(`[optimus-ui] TextEditor plugin mark "${name}" collides with a built-in mark and was ignored.`);
            continue;
        }

        marks[name] = spec;
    }

    /* A header cell without a scope is a header a screen reader cannot associate with its column,
       and prosemirror-tables does not write one. */
    const header = nodes['tableHeader'];
    const headerToDOM = header?.toDOM;

    if (header && headerToDOM) {
        nodes['tableHeader'] = {
            ...header,
            toDOM: (node) => {
                const rendered = headerToDOM(node) as [string, Record<string, string>, ...unknown[]];
                const attrs = typeof rendered[1] === 'object' && rendered[1] !== null && !Array.isArray(rendered[1]) ? { ...rendered[1] } : {};

                attrs['scope'] = attrs['scope'] ?? 'col';

                return [rendered[0], attrs, ...rendered.slice(2)] as never;
            }
        };
    }

    return new Schema({ nodes, marks });
}
