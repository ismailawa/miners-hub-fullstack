'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LookupOption, LookupResource, searchLookup } from '../lib/api/lookups';

interface RecordPickerProps {
  resource: LookupResource;
  value?: string;
  label?: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  context?: {
    siteId?: string;
    minerId?: string;
    listingId?: string;
    orderId?: string;
  };
  onChange: (id: string, option?: LookupOption | null) => void;
  onSelect?: (option: LookupOption) => void;
}

export default function RecordPicker({
  resource,
  value = '',
  label,
  placeholder,
  required,
  disabled,
  helperText,
  context,
  onChange,
  onSelect,
}: RecordPickerProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const contextKey = useMemo(() => JSON.stringify(context || {}), [context]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!value) {
      setSelectedLabel('');
      return;
    }
    if (selectedLabel) return;
    setSelectedLabel(value.slice(0, 8));
  }, [selectedLabel, value]);

  useEffect(() => {
    if (!isOpen && query.length === 0) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLookup({
          resource,
          q: query,
          limit: 20,
          ...(context || {}),
        });
        if (active) setOptions(results);
      } catch {
        if (active) setOptions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [contextKey, isOpen, query, resource]);

  const selectOption = (option: LookupOption) => {
    setSelectedLabel(option.label);
    setQuery('');
    setIsOpen(false);
    onChange(option.id, option);
    onSelect?.(option);
  };

  const clearSelection = () => {
    setSelectedLabel('');
    setQuery('');
    setOptions([]);
    onChange('', null);
  };

  return (
    <div ref={rootRef} className="relative">
      {label ? <label className="mb-1.5 block text-sm font-semibold text-text-secondary">{label}</label> : null}
      <div className="flex min-h-[42px] items-center gap-2 rounded-md border border-border bg-primary px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-accent">
        <input
          value={isOpen ? query : selectedLabel}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedLabel('');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
        />
        {value ? (
          <button
            type="button"
            onClick={clearSelection}
            disabled={disabled}
            className="rounded p-1 text-text-muted hover:bg-secondary hover:text-text-primary"
            aria-label="Clear selected record"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
        <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 9 4-4 4 4m0 6-4 4-4-4" />
        </svg>
      </div>
      {helperText ? <p className="mt-1 text-xs text-text-muted">{helperText}</p> : null}
      {isOpen ? (
        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-secondary shadow-xl">
          {isLoading ? <div className="px-3 py-3 text-sm text-text-muted">Searching...</div> : null}
          {!isLoading && options.length === 0 ? (
            <div className="px-3 py-3 text-sm text-text-muted">No matching records found.</div>
          ) : null}
          {!isLoading && options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option)}
              className="block w-full border-b border-border/70 px-3 py-2 text-left last:border-b-0 hover:bg-primary"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-semibold text-text-primary">{option.label}</span>
                {option.badge ? <span className="shrink-0 rounded bg-primary px-2 py-0.5 text-[11px] uppercase text-text-muted">{option.badge}</span> : null}
              </span>
              {option.description ? <span className="mt-0.5 block truncate text-xs text-text-secondary">{option.description}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      <input type="hidden" value={value} required={required} readOnly />
    </div>
  );
}
