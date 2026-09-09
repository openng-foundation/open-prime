import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { TextEditorRoot } from './texteditor';
import { TextEditorModule } from './texteditor.module';

// The compound tree is mounted exactly as an application writes it: a root, a toolbar filled from
// the slot template, the content region and - where the test needs them - the menu parts. What this
// protects is the contract the docs promise: the parts compose, the value round-trips, the slot
// hands over unwrapped commands and state, and the accessibility attributes are on the region.

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-text-editor-root #editor [(value)]="value" [mode]="mode()" [disabled]="disabled()" [readonly]="readonly()" [ariaLabel]="ariaLabel()" [name]="name()" [placeholder]="placeholder()" [uploadHandler]="uploadHandler">
            <p-text-editor-toolbar>
                <ng-template pTextEditorToolbarDef let-commands="commands" let-state="state">
                    <button type="button" class="bold" [attr.aria-pressed]="state.bold" (click)="commands.bold()">B</button>
                    <button type="button" class="h2" [attr.aria-pressed]="state.heading === 2" (click)="commands.heading(2)">H2</button>
                </ng-template>
            </p-text-editor-toolbar>
            <p-text-editor-content height="12rem" />
        </p-text-editor-root>
    `
})
class TestHost {
    readonly editor = viewChild.required<TextEditorRoot>('editor');

    readonly value = signal<string | string[] | undefined>('<p>Hello world</p>');

    readonly mode = signal<'classic' | 'block'>('classic');

    readonly disabled = signal(false);

    readonly readonly = signal(false);

    readonly ariaLabel = signal<string | undefined>('Comment');

    readonly name = signal<string | undefined>(undefined);

    readonly placeholder = signal<string | null>(null);

    /** Resolved by the test, so the placeholder can be observed while the upload is in flight. */
    finishUpload: (url: string) => void = () => undefined;

    readonly uploadHandler = (): Promise<string> => new Promise<string>((resolve) => (this.finishUpload = resolve));
}

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-text-editor-root [formControl]="body">
            <p-text-editor-content />
        </p-text-editor-root>
    `
})
class FormHost {
    readonly body = new FormControl('<p>From the form</p>');
}

describe('TextEditor', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const content = () => fixture.nativeElement.querySelector('[data-part="content"]') as HTMLElement;
    const root = () => fixture.nativeElement.querySelector('[data-part="root"]') as HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TextEditorModule, ReactiveFormsModule],
            declarations: [TestHost, FormHost],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('mounts the editable region and renders the bound value', () => {
        expect(root()).toBeTruthy();
        expect(content()).toBeTruthy();
        expect(content().innerHTML).toContain('Hello world');
    });

    it('exposes the data attributes the styling and testing contract promises', () => {
        expect(root().getAttribute('data-scope')).toBe('texteditor');
        expect(root().getAttribute('data-id')).toMatch(/^p-text-editor-/);
        expect(root().getAttribute('data-mode')).toBe('classic');
        expect(content().getAttribute('data-scope')).toBe('texteditor');
        expect(fixture.nativeElement.querySelector('[data-part="toolbar"]')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('[data-part="body"]')).toBeTruthy();
    });

    it('names the editing region and exposes it as a textbox', () => {
        expect(content().getAttribute('role')).toBe('textbox');
        expect(content().getAttribute('aria-multiline')).toBe('true');
        expect(content().getAttribute('aria-label')).toBe('Comment');
    });

    it('hands the toolbar slot unwrapped commands and state', async () => {
        const bold = fixture.debugElement.query(By.css('button.bold')).nativeElement as HTMLButtonElement;

        expect(bold.getAttribute('aria-pressed')).toBe('false');

        host.editor().getCommands().heading(2);
        fixture.detectChanges();
        await fixture.whenStable();

        const heading = fixture.debugElement.query(By.css('button.h2')).nativeElement as HTMLButtonElement;

        expect(heading.getAttribute('aria-pressed')).toBe('true');
    });

    it('writes the edited document back through the two-way binding', async () => {
        host.editor().getCommands().heading(3);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(host.value()).toContain('<h3>Hello world</h3>');
    });

    it('applies a value set from the outside without losing the editor', async () => {
        host.value.set('<p>Replaced</p>');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(content().innerHTML).toContain('Replaced');
        expect(host.editor().getText()).toContain('Replaced');
    });

    it('serializes on demand in every format', () => {
        const editor = host.editor();

        expect(editor.getHTML()).toContain('<p>Hello world</p>');
        expect(editor.getText()).toBe('Hello world');
        expect(editor.getMarkdown()).toBe('Hello world');
        expect(editor.getBlocks()).toEqual(['<p>Hello world</p>']);
        expect((editor.getJSON() as { type: string }).type).toBe('doc');
    });

    it('blocks editing when disabled or read-only, and says so on the root', async () => {
        host.readonly.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(root().hasAttribute('data-readonly')).toBe(true);
        expect(host.editor().getView()?.editable).toBe(false);

        host.readonly.set(false);
        host.disabled.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(root().hasAttribute('data-disabled')).toBe(true);
        expect(host.editor().getView()?.editable).toBe(false);
    });

    it('renders a hidden input for a native form submit when a name is set', async () => {
        host.name.set('body');
        fixture.detectChanges();
        await fixture.whenStable();

        const hidden = fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement;

        expect(hidden).toBeTruthy();
        expect(hidden.getAttribute('name')).toBe('body');
        expect(hidden.value).toContain('Hello world');
    });

    it('switches the value to an array of blocks in block mode', async () => {
        host.value.set(['<h2>One</h2>', '<p>Two</p>']);
        host.mode.set('block');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(root().getAttribute('data-mode')).toBe('block');
        expect(host.editor().getBlocks()).toEqual(['<h2>One</h2>', '<p>Two</p>']);
        expect(host.editor().getBlockType(0)).toBe('heading:2');
        expect(host.editor().getBlockType(1)).toBe('text');
    });

    it('reorders and adds blocks in block mode', async () => {
        host.value.set(['<p>One</p>', '<p>Two</p>']);
        host.mode.set('block');
        fixture.detectChanges();
        await fixture.whenStable();

        host.editor().moveBlock(0, 2);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(host.editor().getBlocks()).toEqual(['<p>Two</p>', '<p>One</p>']);

        host.editor().addBlockAfter(1);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(host.editor().getBlocks()).toHaveLength(3);
    });

    it('reorders a block through the drag events the hover bar raises', async () => {
        host.value.set(['<p>One</p>', '<p>Two</p>', '<p>Three</p>']);
        host.mode.set('block');
        fixture.detectChanges();
        await fixture.whenStable();

        const editor = host.editor();
        const dataTransfer = new DataTransfer();
        const target = content().querySelector('[data-block-index="0"]') as HTMLElement;
        const rect = target.getBoundingClientRect();

        editor.onBlockDragStart(1, new DragEvent('dragstart', { dataTransfer }));
        target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer, clientX: rect.left + 4, clientY: rect.top + 2 }));
        target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer, clientX: rect.left + 4, clientY: rect.top + 2 }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(editor.getBlocks()).toEqual(['<p>Two</p>', '<p>One</p>', '<p>Three</p>']);
    });

    it('leaves the blocks alone when the drag is cancelled instead of dropped', async () => {
        host.value.set(['<p>One</p>', '<p>Two</p>', '<p>Three</p>']);
        host.mode.set('block');
        fixture.detectChanges();
        await fixture.whenStable();

        const editor = host.editor();
        const dataTransfer = new DataTransfer();
        const target = content().querySelector('[data-block-index="0"]') as HTMLElement;
        const rect = target.getBoundingClientRect();

        editor.onBlockDragStart(1, new DragEvent('dragstart', { dataTransfer }));
        target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer, clientX: rect.left + 4, clientY: rect.top + 2 }));
        // Escape, or a release outside the window: `dragend` arrives without a `drop`.
        editor.onBlockDragEnd();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(editor.getBlocks()).toEqual(['<p>One</p>', '<p>Two</p>', '<p>Three</p>']);
    });

    it('turns an upload placeholder into the uploaded content', async () => {
        const editor = host.editor();

        editor.startDocumentUploads([new File(['%PDF'], 'report.pdf', { type: 'application/pdf' })]);
        fixture.detectChanges();
        await fixture.whenStable();

        // The placeholder holds the spot while the transport runs.
        expect(editor.getHTML()).toContain('data-p-document-upload-placeholder');

        host.finishUpload('https://example.com/report.pdf');
        await new Promise((resolve) => setTimeout(resolve, 50));
        fixture.detectChanges();
        await fixture.whenStable();

        const html = editor.getHTML();

        expect(html).not.toContain('placeholder');
        expect(html).toContain('<a href="https://example.com/report.pdf"');
        expect(html).toContain('report.pdf</a>');
    });

    it('drives the document from a form control, and disables with it', async () => {
        const formFixture = TestBed.createComponent(FormHost);

        formFixture.detectChanges();
        await formFixture.whenStable();

        const editor = formFixture.debugElement.query(By.directive(TextEditorRoot)).componentInstance as TextEditorRoot;

        expect(editor.getText()).toBe('From the form');

        formFixture.componentInstance.body.setValue('<p>Reset</p>');
        formFixture.detectChanges();
        await formFixture.whenStable();

        expect(editor.getText()).toBe('Reset');

        formFixture.componentInstance.body.disable();
        formFixture.detectChanges();
        await formFixture.whenStable();

        expect(editor.getView()?.editable).toBe(false);
    });
});
