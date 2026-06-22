import React from 'react';

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
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({ label, files, onFilesAdded, onFileRemoved, error, id }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesAdded(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary">{label}</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg bg-primary hover:bg-secondary hover:border-accent transition-colors duration-300">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-text-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-text-secondary justify-center">
                        <label htmlFor={id} className="relative cursor-pointer rounded-md font-medium text-accent hover:text-accent/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-primary focus-within:ring-accent">
                            <span>Upload files</span>
                            <input id={id} name={id} type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-text-muted mt-2">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
            {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {files.map((filePreview, index) => (
                        <div key={index} className="relative group aspect-square">
                           {filePreview.file.type.startsWith('image/') ? (
                                <img src={filePreview.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md border border-border" />
                            ) : (
                                <div className="w-full h-full bg-border rounded-md flex flex-col items-center justify-center p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="text-xs text-text-muted mt-1 text-center break-all truncate">{filePreview.file.name}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                <button type="button" onClick={() => onFileRemoved(index)} className="text-white p-2 bg-red-600/70 rounded-full hover:bg-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
    );
};

export default MultiFileInput;