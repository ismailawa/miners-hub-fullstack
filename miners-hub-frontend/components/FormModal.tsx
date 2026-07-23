'use client';

import React, { useEffect } from 'react';

interface FormModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClass?: string;
}

export default function FormModal({
  isOpen,
  title,
  description,
  children,
  onClose,
  maxWidthClass = 'max-w-3xl',
}: FormModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onMouseDown={onClose}>
      <div
        className={`flex max-h-[90vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-lg border border-border bg-secondary shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="form-modal-title" className="text-lg font-bold text-text-primary">{title}</h2>
            {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-text-muted hover:bg-primary hover:text-text-primary"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
