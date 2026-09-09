import { Component, signal } from '@angular/core';
import { TEXT_EDITOR_FILE_SIZE, TextEditorModule } from '@openng/optimus-ui/texteditor';
import type { TextEditorUploadRejectEvent } from '@openng/optimus-ui/types/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { ImageUploadDropzoneUI, ToolbarImageInsertUI, ToolbarImageUploadUI, UploadProgressUI } from '@/components/texteditor';
import { demoUploadHandler } from './demo-data';

@Component({
    selector: 'image-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarImageInsertUI, ToolbarImageUploadUI, ImageUploadDropzoneUI, UploadProgressUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>commands.insertImage(src, attrs?)</i> places an image from a URL. For uploads, mount <i>p-text-editor-image-upload</i>: it is the overlay the runtime opens when <i>commands.uploadImages()</i> runs or an image is dropped on the
                content. The <i>Dropzone</i> sub-part renders while nothing is in flight and the <i>Progress</i> one while files are uploading.
            </p>
            <p>
                The handler receives an <i>AbortSignal</i>; forward it to <i>fetch</i> so cancelling really aborts the request. <i>maxFileCount</i>, <i>maxFileSize</i> and <i>allowedTypes</i> are a UX guard only - the browser reports the type and the
                size, and both are spoofable, so the server has to check again.
            </p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Images example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <image-insert-ui />
                        <image-upload-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-image-upload [handler]="uploadHandler" [maxFileCount]="3" [maxFileSize]="oneMB" (reject)="onReject($event)">
                    <p-text-editor-image-upload-dropzone>
                        <image-upload-dropzone-ui />
                    </p-text-editor-image-upload-dropzone>
                    <p-text-editor-image-upload-progress>
                        <upload-progress-ui />
                    </p-text-editor-image-upload-progress>
                </p-text-editor-image-upload>
                <p-text-editor-content height="16rem" />
            </p-text-editor-root>
            @if (rejected()) {
                <p class="mt-2 text-sm text-muted-color">{{ rejected() }}</p>
            }
        </div>
        <app-code></app-code>
    `
})
export class ImageDoc {
    readonly value = signal<string | undefined>(undefined);

    readonly oneMB = TEXT_EDITOR_FILE_SIZE.ONE_MB;

    readonly uploadHandler = demoUploadHandler;

    readonly rejected = signal('');

    onReject({ files, reason }: TextEditorUploadRejectEvent): void {
        this.rejected.set(`${files.length} file(s) rejected: ${reason}`);
    }
}
