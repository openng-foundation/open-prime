import type { Node as ProseMirrorNode } from 'prosemirror-model';
import type { EditorView, NodeView } from 'prosemirror-view';

/**
 * Renders a checklist item as a real checkbox next to its content.
 *
 * The checkbox lives in the node view rather than in `toDOM`, so it never reaches the serialized
 * value: `getHTML` emits `<li data-p-checked="false">` and the checkbox is rebuilt from that
 * attribute when the value is parsed back in. It is also `contenteditable="false"`, so Backspace at
 * the start of the item deletes the item rather than the checkbox.
 *
 * @group Interface
 */
export class CheckListItemView implements NodeView {
    dom: HTMLLIElement;

    contentDOM: HTMLElement;

    private readonly checkbox: HTMLInputElement;

    constructor(
        private node: ProseMirrorNode,
        private readonly view: EditorView,
        private readonly getPos: () => number | undefined
    ) {
        const document = view.dom.ownerDocument;

        this.dom = document.createElement('li');
        this.dom.setAttribute('data-p-checked', node.attrs['checked'] ? 'true' : 'false');

        const label = document.createElement('label');

        label.contentEditable = 'false';

        this.checkbox = document.createElement('input');
        this.checkbox.type = 'checkbox';
        this.checkbox.checked = !!node.attrs['checked'];
        this.checkbox.addEventListener('mousedown', (event) => event.preventDefault());
        this.checkbox.addEventListener('change', () => this.toggle());

        label.appendChild(this.checkbox);

        this.contentDOM = document.createElement('div');

        this.dom.append(label, this.contentDOM);
    }

    update(node: ProseMirrorNode): boolean {
        if (node.type !== this.node.type) return false;

        this.node = node;
        this.checkbox.checked = !!node.attrs['checked'];
        this.dom.setAttribute('data-p-checked', node.attrs['checked'] ? 'true' : 'false');

        return true;
    }

    stopEvent(event: Event): boolean {
        return event.target === this.checkbox;
    }

    private toggle(): void {
        const pos = this.getPos();

        if (pos == null || !this.view.editable) {
            this.checkbox.checked = !!this.node.attrs['checked'];

            return;
        }

        this.view.dispatch(this.view.state.tr.setNodeMarkup(pos, undefined, { ...this.node.attrs, checked: !this.node.attrs['checked'] }));
    }
}
