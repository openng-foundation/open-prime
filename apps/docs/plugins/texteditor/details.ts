import { defineTextEditorPlugin } from '@openng/optimus-ui/texteditor';
import type { NodeSpec } from 'prosemirror-model';

/**
 * A collapsible details/summary block, and the example of a plugin that extends the schema.
 *
 * The three nodes round-trip as plain HTML, so a document with a details block is still a document
 * an application without the plugin can render - it just renders as an open block.
 */
const detailsNode: NodeSpec = {
    content: 'detailsSummary detailsContent',
    group: 'block',
    defining: true,
    attrs: { open: { default: true } },
    parseDOM: [{ tag: 'details', getAttrs: (dom: HTMLElement) => ({ open: dom.hasAttribute('open') }) }],
    toDOM: (node) => ['details', node.attrs['open'] ? { open: '' } : {}, 0]
};

const detailsSummaryNode: NodeSpec = {
    content: 'inline*',
    parseDOM: [{ tag: 'summary' }],
    toDOM: () => ['summary', 0]
};

const detailsContentNode: NodeSpec = {
    content: 'block+',
    parseDOM: [{ tag: 'div[data-details-content]' }],
    toDOM: () => ['div', { 'data-details-content': '' }, 0]
};

export const detailsPlugin = defineTextEditorPlugin(
    'details',
    (ctx) => ({
        commands: {
            insert: (summary = 'Details') => {
                const view = ctx.getView();

                if (!view) return;

                const { schema } = view.state;
                const node = schema.nodes['details']?.createAndFill(null, [schema.nodes['detailsSummary'].create(null, schema.text(summary)), schema.nodes['detailsContent'].createAndFill()!]);

                if (node) view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
            }
        }
    }),
    {
        schema: {
            nodes: {
                details: detailsNode,
                detailsSummary: detailsSummaryNode,
                detailsContent: detailsContentNode
            }
        }
    }
);
