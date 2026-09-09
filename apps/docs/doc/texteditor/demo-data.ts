/**
 * Shared fixtures for the TextEditor demos: a document, a block-mode value, a mention list and a
 * fake upload transport that reports progress without a server.
 */

export const DEMO_HTML =
    '<h2>Welcome to TextEditor</h2>' +
    '<p>A rich text editor with advanced customization through a template-driven UI. Select this sentence to see the context toolbar.</p>' +
    '<p>Apply <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s> and <code>inline code</code> to your text.</p>' +
    '<blockquote><p>Blockquotes are great for emphasizing key information or quoting external sources.</p></blockquote>' +
    '<ul><li><p>Bullet lists for unordered items</p></li><li><p>Supports nesting with Tab and Shift+Tab</p></li></ul>';

export const DEMO_BLOCKS = ['<h2>Welcome to the Block Editor</h2>', '<p>This is an editor where each section is its own editable block.</p>'];

export const DEMO_OUTLINE =
    '<h1>Introduction</h1><p>This is the opening section of the document.</p>' +
    '<h2>Getting Started</h2><p>Learn how to set up and configure the editor.</p>' +
    '<h3>Installation</h3><p>Install the package using your preferred package manager.</p>' +
    '<h3>Configuration</h3><p>Configure the editor with props and templates.</p>' +
    '<h2>Features</h2><p>Explore the available editing features.</p>' +
    '<h3>Formatting</h3><p>Apply bold, italic, underline, and more.</p>' +
    '<h3>Lists</h3><p>Create bullet lists, ordered lists, and checklists.</p>' +
    '<h2>Advanced</h2><p>Learn about advanced editor capabilities.</p>' +
    '<h3>Plugins</h3><p>Extend the editor with custom plugins.</p>' +
    '<h3>Theming</h3><p>Customize the editor appearance with CSS variables.</p>';

export const MENTION_USERS = [
    { id: 1, name: 'Amy Elsner', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: 2, name: 'Anna Fali', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
    { id: 3, name: 'Asiya Javayant', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: 4, name: 'Bernardo Dominic', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
    { id: 5, name: 'Elwin Sharvill', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' },
    { id: 6, name: 'Ioni Bowcher', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png' },
    { id: 7, name: 'Ivan Magalhaes', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ivanmagalhaes.png' },
    { id: 8, name: 'Onyama Limba', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png' },
    { id: 9, name: 'Stephen Shaw', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/stephenshaw.png' },
    { id: 10, name: 'Xuxue Feng', image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png' }
];

export const DEMO_IMAGE_URL = 'https://primefaces.org/cdn/primeng/images/demo/product/blue-band.jpg';

/**
 * A handler that walks progress to 100% and resolves with a placeholder URL. A real one forwards
 * `signal` to fetch so cancelling the upload aborts the request.
 */
export const demoUploadHandler = async (file: File, { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal }): Promise<string> => {
    void file;

    for (let percent = 0; percent <= 100; percent += 20) {
        await new Promise((resolve) => setTimeout(resolve, 150));

        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

        onProgress(percent);
    }

    return DEMO_IMAGE_URL;
};
