import type { TextEditorUploadHandler, TextEditorUploadKind, TextEditorUploadRejectReason, UploadSlotEntry } from '@openng/optimus-ui/types/texteditor';

/**
 * Default accept list for document uploads, matching the file types the document overlay advertises.
 *
 * @group Constant
 */
export const DEFAULT_DOCUMENT_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip';

/**
 * Default accept list for image uploads.
 *
 * @group Constant
 */
export const DEFAULT_IMAGE_TYPES = 'image/*';

/**
 * Named file sizes for the `maxFileSize` inputs, so a template reads `TEXT_EDITOR_FILE_SIZE.ONE_MB`
 * instead of a seven-digit literal.
 *
 * @group Constant
 */
export const TEXT_EDITOR_FILE_SIZE = {
    /**
     * One megabyte, in bytes.
     */
    ONE_MB: 1024 * 1024,
    /**
     * Five megabytes, in bytes.
     */
    FIVE_MB: 5 * 1024 * 1024,
    /**
     * Ten megabytes, in bytes.
     */
    TEN_MB: 10 * 1024 * 1024,
    /**
     * Twenty-five megabytes, in bytes.
     */
    TWENTY_FIVE_MB: 25 * 1024 * 1024,
    /**
     * Fifty megabytes, in bytes.
     */
    FIFTY_MB: 50 * 1024 * 1024
} as const;

/**
 * Formats a byte count the way the progress UI shows it.
 *
 * @group Function
 */
export function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);

    return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/**
 * Whether a file matches one entry of an `accept` list - a MIME type, a wildcard type, or an
 * extension.
 */
function matchesType(file: File, accept: string): boolean {
    const pattern = accept.trim().toLowerCase();

    if (!pattern) return true;

    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern);

    if (pattern.endsWith('/*')) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));

    return file.type.toLowerCase() === pattern;
}

/**
 * Splits a selection into the files that pass client-side validation and the reason the rest were
 * turned away. This is a UX guard only: the browser reports the type and the size, and both are
 * spoofable, so the server has to check again.
 *
 * @group Function
 */
export function validateFiles(files: File[], options: { allowedTypes?: string | null; maxFileCount?: number | null; maxFileSize?: number | null }): { accepted: File[]; rejected: File[]; reason: TextEditorUploadRejectReason | null } {
    const allowed = options.allowedTypes?.split(',').filter(Boolean) ?? [];
    const wrongType = allowed.length ? files.filter((file) => !allowed.some((accept) => matchesType(file, accept))) : [];

    if (wrongType.length) return { accepted: [], rejected: wrongType, reason: 'file-type' };

    if (options.maxFileCount != null && files.length > options.maxFileCount) return { accepted: [], rejected: files, reason: 'max-file-count' };

    const tooLarge = options.maxFileSize != null ? files.filter((file) => file.size > options.maxFileSize!) : [];

    if (tooLarge.length) return { accepted: [], rejected: tooLarge, reason: 'max-file-size' };

    return { accepted: files, rejected: [], reason: null };
}

/**
 * What the owner of an upload queue has to provide: the transport, and the three moments the
 * component turns into outputs.
 */
export interface UploadQueueOptions {
    /**
     * Which overlay the queue belongs to.
     */
    kind: TextEditorUploadKind;
    /**
     * The upload transport.
     */
    handler: () => TextEditorUploadHandler | undefined;
    /**
     * Called whenever an entry's progress or status changes.
     */
    onChange: (entries: UploadSlotEntry[]) => void;
    /**
     * Called once per file, with the URL the file is reachable at.
     */
    onUploaded: (file: File, url: string) => void;
    /**
     * Called when the transport rejects.
     */
    onError: (file: File, error: unknown) => void;
    /**
     * Called when the queue drains and the entries are cleared.
     */
    onComplete: () => void;
}

/**
 * Tracks one overlay's in-flight uploads: progress per file, cancellation through an `AbortSignal`,
 * and the single "everything finished" moment the overlay closes on.
 *
 * @group Interface
 */
export class UploadQueue {
    private entries: UploadSlotEntry[] = [];

    private sequence = 0;

    private completed = false;

    constructor(private readonly options: UploadQueueOptions) {}

    /**
     * The live entries, as the progress slot renders them.
     */
    get value(): UploadSlotEntry[] {
        return this.entries;
    }

    /**
     * Starts one upload per file and reports progress as it comes in.
     */
    start(files: File[]): void {
        const handler = this.options.handler();

        if (!handler || !files.length) return;

        for (const file of files) {
            const controller = new AbortController();
            const id = `upload-${++this.sequence}`;
            const entry: UploadSlotEntry = {
                id,
                fileName: file.name,
                fileSize: file.size,
                fileSizeFormatted: formatFileSize(file.size),
                progress: 0,
                status: 'uploading',
                cancel: () => {
                    controller.abort();
                    this.patch(id, { status: 'cancelled' });
                    this.settle();
                }
            };

            this.entries = [...this.entries, entry];
            this.completed = false;
            this.emit();

            handler(file, { onProgress: (percent) => this.patch(id, { progress: Math.max(0, Math.min(100, percent)) }), signal: controller.signal })
                .then((url) => {
                    if (controller.signal.aborted) return;

                    this.completed = true;
                    this.patch(id, { progress: 100, status: 'complete' });
                    this.options.onUploaded(file, url);
                })
                .catch((error) => {
                    if (controller.signal.aborted) return;

                    this.patch(id, { status: 'error' });
                    this.options.onError(file, error);
                })
                .finally(() => this.settle());
        }
    }

    /**
     * Cancels everything in flight and clears the queue, the overlay's dismiss action.
     */
    dismiss(): void {
        for (const entry of this.entries) {
            if (entry.status === 'uploading') entry.cancel();
        }

        this.entries = [];
        this.completed = false;
        this.emit();
    }

    private patch(id: string, changes: Partial<UploadSlotEntry>): void {
        this.entries = this.entries.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry));
        this.emit();
    }

    /**
     * Clears the queue once nothing is uploading any more. Errors keep their entry on screen until
     * the host dismisses the overlay, so a failed upload is not silently swallowed.
     */
    private settle(): void {
        if (this.entries.some((entry) => entry.status === 'uploading')) return;

        if (this.entries.some((entry) => entry.status === 'error')) return;

        const completed = this.completed;

        this.entries = [];
        this.completed = false;
        this.emit();

        /* A queue that was cancelled never completed: telling the host every upload finished would
           have it act on files that never arrived. */
        if (completed) this.options.onComplete();
    }

    private emit(): void {
        this.options.onChange(this.entries);
    }
}
