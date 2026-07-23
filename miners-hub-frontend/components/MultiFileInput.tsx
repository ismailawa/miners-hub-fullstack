import React, { useRef, useState } from 'react';

export interface FilePreview {
    file: File;
    previewUrl: string;
}

interface MultiFileInputProps {
    label: string;
    files: FilePreview[];
    onFilesAdded: (files: File[]) => void;
    onFileRemoved: (index: number) => void;
    error?: string | null;
    id: string;
    accept?: string;
    helperText?: string;
    multiple?: boolean;
    maxFiles?: number;
    disabled?: boolean;
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({
    label,
    files,
    onFilesAdded,
    onFileRemoved,
    error,
    id,
    accept = 'image/png,image/jpeg,application/pdf',
    helperText = 'PNG, JPG, or PDF up to 10MB',
    multiple = true,
    maxFiles,
    disabled = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const addFiles = (fileList: FileList | File[]) => {
        if (disabled) return;
        const selectedFiles = Array.from(fileList);
        if (selectedFiles.length > 0) {
            const remainingSlots = maxFiles ? Math.max(maxFiles - files.length, 0) : undefined;
            const nextFiles = multiple
                ? selectedFiles.slice(0, remainingSlots)
                : selectedFiles.slice(0, 1);
            if (nextFiles.length > 0) {
                onFilesAdded(nextFiles);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const openFilePicker = () => inputRef.current?.click();
    const getFileTypeLabel = (file: File) => {
        if (file.type === 'application/pdf') return 'PDF';
        if (file.type.startsWith('image/')) return file.type.replace('image/', '').toUpperCase();
        return 'FILE';
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-text-secondary">{label}</label>
            <div
                role="button"
                tabIndex={0}
                aria-label={`Upload ${label}`}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFilePicker();
                    }
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-2 flex min-h-[180px] items-center justify-center rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all duration-200 ${
                    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                    isDragging
                        ? 'border-accent bg-accent/10 shadow-[0_0_0_4px_rgba(217,119,6,0.12)]'
                        : 'border-border bg-primary hover:border-accent/70 hover:bg-secondary'
                }`}
            >
                <input
                    ref={inputRef}
                    id={id}
                    name={id}
                    type="file"
                    className="sr-only"
                    multiple={multiple}
                    onChange={handleFileChange}
                    accept={accept}
                    disabled={disabled}
                />
                <div className="max-w-sm">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${
                        isDragging ? 'border-accent bg-accent/20 text-accent' : 'border-border bg-secondary text-text-muted'
                    }`}>
                        <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 16V4m0 0L7 9m5-5 5 5M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                        {isDragging ? 'Drop files here' : 'Drop files here or click to browse'}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">{helperText}</p>
                    <p className="mt-3 text-xs text-text-secondary">
                        {files.length > 0 ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'No files selected'}
                    </p>
                </div>
            </div>
            {files.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {files.map((filePreview, index) => (
                        <div key={`${filePreview.file.name}-${index}`} className="group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-primary p-3">
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                                {filePreview.file.type.startsWith('image/') ? (
                                    <img src={filePreview.previewUrl} alt={filePreview.file.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center text-text-muted">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 18 9.414V19a2 2 0 0 1-2 2Z" />
                                        </svg>
                                        <span className="mt-0.5 text-[10px] font-bold leading-none">{getFileTypeLabel(filePreview.file)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-text-primary" title={filePreview.file.name}>{filePreview.file.name}</p>
                                <p className="mt-1 text-xs text-text-muted">{getFileTypeLabel(filePreview.file)} · {formatFileSize(filePreview.file.size)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileRemoved(index);
                                }}
                                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                                aria-label={`Remove ${filePreview.file.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 18 12-12M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
    );
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default MultiFileInput;
