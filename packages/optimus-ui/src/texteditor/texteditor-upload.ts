import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ElementRef, ViewEncapsulation, computed, contentChild, inject, input, numberAttribute, output, viewChild } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import type { TextEditorPartPassThrough, TextEditorUploadErrorEvent, TextEditorUploadHandler, TextEditorUploadKind, TextEditorUploadRejectEvent } from '@openng/optimus-ui/types/texteditor';
import { TextEditorRoot } from './texteditor';
import { UPLOAD_CONTEXT } from './texteditor-contexts';
import { TextEditorDocumentUploadDef, TextEditorDocumentUploadDropzoneDef, TextEditorDocumentUploadProgressDef, TextEditorImageUploadDef, TextEditorImageUploadDropzoneDef, TextEditorImageUploadProgressDef } from './texteditor-defs';

/**
 * What the image and document overlays share: the inputs, the outputs, the file picker and the two
 * states the sub-parts render in. Only the kind differs, and with it the defaults the root falls
 * back to.
 *
 * @group Components
 */
@Directive()
export abstract class TextEditorUploadBase extends BaseComponent<TextEditorPartPassThrough> {
    protected readonly root = inject(TextEditorRoot);

    private unregister?: () => void;

    /**
     * Which overlay this is.
     */
    abstract readonly kind: TextEditorUploadKind;

    /**
     * The upload transport. Takes precedence over the handlers set on the root.
     * @group Props
     */
    readonly handler = input<TextEditorUploadHandler | undefined>(undefined);
    /**
     * Accepted file types.
     * @group Props
     */
    readonly allowedTypes = input<string | undefined>(undefined);
    /**
     * Accepted file types of the native picker. Falls back to `allowedTypes`.
     * @group Props
     */
    readonly accept = input<string | undefined>(undefined);
    /**
     * Maximum number of files allowed per selection.
     * @group Props
     */
    readonly maxFileCount = input<number | null>(null, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });
    /**
     * Maximum file size in bytes per file.
     * @group Props
     */
    readonly maxFileSize = input<number | null>(null, { transform: (value: unknown) => (value == null ? null : numberAttribute(value)) });

    /**
     * Emitted when files are turned away by client-side validation.
     * @group Emits
     */
    readonly reject = output<TextEditorUploadRejectEvent>();
    /**
     * Emitted when the handler rejects. Named `uploadError` rather than `error` so it cannot collide
     * with the native DOM error event.
     * @group Emits
     */
    readonly uploadError = output<TextEditorUploadErrorEvent>();
    /**
     * Emitted when the uploads in flight finish.
     * @group Emits
     */
    readonly complete = output<void>();

    protected readonly picker = viewChild<ElementRef<HTMLInputElement>>('picker');

    /**
     * The files currently in flight.
     */
    readonly uploads = computed(() => this.root.uploadEntries(this.kind)());

    /**
     * Whether an upload is in flight, which is what decides between the dropzone and the progress
     * sub-part.
     */
    readonly uploading = computed(() => this.uploads().length > 0);

    /**
     * Whether the overlay is on screen: opened by `commands.uploadImages()` / `uploadDocuments()`,
     * by a drop on the content, or by an upload already running.
     */
    readonly open = computed(() => this.root.isUploadOpen(this.kind) || this.uploading());

    /**
     * File types the native picker accepts.
     */
    readonly acceptTypes = computed(() => this.accept() ?? this.allowedTypes() ?? (this.kind === 'image' ? this.root.allowedImageTypes() : this.root.allowedDocumentTypes()));

    onInit(): void {
        this.unregister = this.root.registerPart(this.kind === 'image' ? 'image-upload' : 'document-upload');
        this.root.registerUploadOptions(this.kind, {
            handler: () => this.handler(),
            allowedTypes: () => this.allowedTypes() ?? this.accept(),
            maxFileCount: () => this.maxFileCount(),
            maxFileSize: () => this.maxFileSize(),
            onReject: (event) => this.reject.emit(event),
            onError: (event) => this.uploadError.emit(event),
            onComplete: () => this.complete.emit()
        });
    }

    onDestroy(): void {
        this.root.registerUploadOptions(this.kind, null);
        this.unregister?.();
    }

    /**
     * Opens the file picker.
     */
    selectFiles(): void {
        this.picker()?.nativeElement.click();
    }

    /**
     * Starts uploading the files dropped on the dropzone.
     */
    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.start(Array.from(event.dataTransfer?.files ?? []));
    }

    /**
     * Cancels the uploads in flight and closes the overlay.
     */
    dismiss(): void {
        if (this.kind === 'image') this.root.dismissImageUpload();
        else this.root.dismissDocumentUpload();
    }

    /**
     * Handles a selection from the native picker.
     */
    onPicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);

        input.value = '';
        this.start(files);
    }

    /**
     * The slot surface both the overlay and its sub-parts are built from.
     */
    readonly slotContext = computed(() => {
        const props = {
            selectFiles: () => this.selectFiles(),
            uploads: this.uploads(),
            onDrop: (event: DragEvent) => this.onDrop(event),
            dismiss: () => this.dismiss()
        };

        return { ...props, $implicit: props };
    });

    private start(files: File[]): void {
        if (!files.length) return;

        if (this.kind === 'image') this.root.startImageUploads(files);
        else this.root.startDocumentUploads(files);
    }
}

/**
 * The image upload overlay. Opens when `commands.uploadImages()` runs or an image is dropped on the
 * content.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-image-upload',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (open()) {
            @if (imageUploadDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            }
            <ng-content />
        }
        <input #picker type="file" multiple class="p-text-editor-file-input" [attr.accept]="acceptTypes()" (change)="onPicked($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: UPLOAD_CONTEXT,
            useFactory: () => {
                const upload = inject(TextEditorImageUpload);

                return {
                    kind: 'image' as const,
                    uploads: upload.uploads,
                    selectFiles: () => upload.selectFiles(),
                    onDrop: (event: DragEvent) => upload.onDrop(event),
                    dismiss: () => upload.dismiss()
                };
            }
        }
    ],
    host: { class: 'p-text-editor-upload', 'data-scope': 'texteditor' }
})
export class TextEditorImageUpload extends TextEditorUploadBase {
    componentName = 'TextEditorImageUpload';

    readonly kind: TextEditorUploadKind = 'image';

    readonly imageUploadDef = contentChild(TextEditorImageUploadDef);
}

/**
 * The document upload overlay. Mirrors the image overlay for non-image files, which are inserted as
 * links.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-document-upload',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (open()) {
            @if (documentUploadDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            }
            <ng-content />
        }
        <input #picker type="file" multiple class="p-text-editor-file-input" [attr.accept]="acceptTypes()" (change)="onPicked($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: UPLOAD_CONTEXT,
            useFactory: () => {
                const upload = inject(TextEditorDocumentUpload);

                return {
                    kind: 'document' as const,
                    uploads: upload.uploads,
                    selectFiles: () => upload.selectFiles(),
                    onDrop: (event: DragEvent) => upload.onDrop(event),
                    dismiss: () => upload.dismiss()
                };
            }
        }
    ],
    host: { class: 'p-text-editor-upload', 'data-scope': 'texteditor' }
})
export class TextEditorDocumentUpload extends TextEditorUploadBase {
    componentName = 'TextEditorDocumentUpload';

    readonly kind: TextEditorUploadKind = 'document';

    readonly documentUploadDef = contentChild(TextEditorDocumentUploadDef);
}

/**
 * The dropzone half of the image overlay: rendered while nothing is uploading.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-image-upload-dropzone',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (!upload.uploading()) {
            @if (dropzoneDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            } @else {
                <ng-content />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-text-editor-upload-dropzone', 'data-scope': 'texteditor' }
})
export class TextEditorImageUploadDropzone extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorImageUploadDropzone';

    /**
     * The overlay this dropzone belongs to.
     */
    readonly upload = inject(TextEditorImageUpload);

    readonly dropzoneDef = contentChild(TextEditorImageUploadDropzoneDef);

    /**
     * The slot surface handed to `pTextEditorImageUploadDropzoneDef`.
     */
    readonly slotContext = computed(() => {
        const props = { selectFiles: () => this.upload.selectFiles(), onDrop: (event: DragEvent) => this.upload.onDrop(event) };

        return { ...props, $implicit: props };
    });
}

/**
 * The progress half of the image overlay: rendered while files are in flight.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-image-upload-progress',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (upload.uploading()) {
            @if (progressDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            } @else {
                <ng-content />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-text-editor-upload-progress', 'data-scope': 'texteditor', role: 'status', 'aria-live': 'polite' }
})
export class TextEditorImageUploadProgress extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorImageUploadProgress';

    /**
     * The overlay this progress surface belongs to.
     */
    readonly upload = inject(TextEditorImageUpload);

    readonly progressDef = contentChild(TextEditorImageUploadProgressDef);

    /**
     * The slot surface handed to `pTextEditorImageUploadProgressDef`.
     */
    readonly slotContext = computed(() => {
        const props = { uploads: this.upload.uploads(), dismiss: () => this.upload.dismiss() };

        return { ...props, $implicit: props };
    });
}

/**
 * The dropzone half of the document overlay.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-document-upload-dropzone',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (!upload.uploading()) {
            @if (dropzoneDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            } @else {
                <ng-content />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-text-editor-upload-dropzone', 'data-scope': 'texteditor' }
})
export class TextEditorDocumentUploadDropzone extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorDocumentUploadDropzone';

    /**
     * The overlay this dropzone belongs to.
     */
    readonly upload = inject(TextEditorDocumentUpload);

    readonly dropzoneDef = contentChild(TextEditorDocumentUploadDropzoneDef);

    /**
     * The slot surface handed to `pTextEditorDocumentUploadDropzoneDef`.
     */
    readonly slotContext = computed(() => {
        const props = { selectFiles: () => this.upload.selectFiles(), onDrop: (event: DragEvent) => this.upload.onDrop(event) };

        return { ...props, $implicit: props };
    });
}

/**
 * The progress half of the document overlay.
 *
 * @group Components
 */
@Component({
    selector: 'p-text-editor-document-upload-progress',
    standalone: true,
    imports: [NgTemplateOutlet],
    template: `
        @if (upload.uploading()) {
            @if (progressDef(); as def) {
                <ng-container *ngTemplateOutlet="def.template; context: slotContext()" />
            } @else {
                <ng-content />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'p-text-editor-upload-progress', 'data-scope': 'texteditor', role: 'status', 'aria-live': 'polite' }
})
export class TextEditorDocumentUploadProgress extends BaseComponent<TextEditorPartPassThrough> {
    componentName = 'TextEditorDocumentUploadProgress';

    /**
     * The overlay this progress surface belongs to.
     */
    readonly upload = inject(TextEditorDocumentUpload);

    readonly progressDef = contentChild(TextEditorDocumentUploadProgressDef);

    /**
     * The slot surface handed to `pTextEditorDocumentUploadProgressDef`.
     */
    readonly slotContext = computed(() => {
        const props = { uploads: this.upload.uploads(), dismiss: () => this.upload.dismiss() };

        return { ...props, $implicit: props };
    });
}
