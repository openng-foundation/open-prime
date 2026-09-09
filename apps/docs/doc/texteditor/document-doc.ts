import { Component, signal } from '@angular/core';
import { TEXT_EDITOR_FILE_SIZE, TextEditorModule } from '@openng/optimus-ui/texteditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { DocumentUploadDropzoneUI, ToolbarDocumentUploadUI, UploadProgressUI } from '@/components/texteditor';
import { demoUploadHandler } from './demo-data';

@Component({
    selector: 'document-doc',
    standalone: true,
    imports: [TextEditorModule, ToolbarDocumentUploadUI, DocumentUploadDropzoneUI, UploadProgressUI, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-text-editor-document-upload</i> mirrors the image overlay for non-image files, which are inserted into the content as links. The inputs, the outputs and the two sub-parts are the same; only the defaults differ -
                <i>allowedTypes</i> resolves to the office and archive extensions, and <i>maxFileSize</i> defaults to 10MB.
            </p>
            <p>Use the named sizes from <i>TEXT_EDITOR_FILE_SIZE</i> rather than a seven-digit literal.</p>
        </app-docsectiontext>
        <div class="card">
            <p-text-editor-root [(value)]="value" ariaLabel="Documents example">
                <p-text-editor-toolbar>
                    <div class="p-text-editor-ui-toolbar">
                        <document-upload-ui />
                    </div>
                </p-text-editor-toolbar>
                <p-text-editor-document-upload [handler]="uploadHandler" [maxFileCount]="3" [maxFileSize]="tenMB">
                    <p-text-editor-document-upload-dropzone>
                        <document-upload-dropzone-ui />
                    </p-text-editor-document-upload-dropzone>
                    <p-text-editor-document-upload-progress>
                        <upload-progress-ui />
                    </p-text-editor-document-upload-progress>
                </p-text-editor-document-upload>
                <p-text-editor-content height="14rem" />
            </p-text-editor-root>
        </div>
        <app-code></app-code>
    `
})
export class DocumentDoc {
    readonly value = signal<string | undefined>(undefined);

    readonly tenMB = TEXT_EDITOR_FILE_SIZE.TEN_MB;

    readonly uploadHandler = demoUploadHandler;
}
