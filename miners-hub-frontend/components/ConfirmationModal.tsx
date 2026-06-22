import React, { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    confirmButtonClass = 'bg-red-600 hover:bg-red-500 text-white' 
}) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-xl font-bold text-text-primary mb-4">{title}</h2>
                    <p className="text-text-secondary">{message}</p>
                </div>
                <div className="p-4 bg-primary border-t border-border flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-border">Cancel</button>
                    <button type="button" onClick={onConfirm} className={`px-4 py-2 text-sm rounded-md font-semibold ${confirmButtonClass}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;