'use client';

import React from 'react';

export type ActiveFilter = {
  key: string;
  label: string;
  clear: () => void;
};

type DashboardSearchFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  isFilterPanelOpen: boolean;
  onToggleFilters: () => void;
  activeFilters: ActiveFilter[];
  onReset: () => void;
  children?: React.ReactNode;
};

export default function DashboardSearchFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  isFilterPanelOpen,
  onToggleFilters,
  activeFilters,
  onReset,
  children,
}: DashboardSearchFiltersProps) {
  return (
    <section className="rounded-lg border border-border bg-secondary p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border bg-primary py-3 pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={isFilterPanelOpen}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
              isFilterPanelOpen || activeFilters.length > 0
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
            </svg>
            Filters
            {activeFilters.length > 0 ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-content">{activeFilters.length}</span>
            ) : null}
          </button>
          {activeFilters.length > 0 ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border px-4 py-3 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.clear}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:border-accent"
              title={`Remove ${filter.label}`}
            >
              <span className="truncate">{filter.label}</span>
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      ) : null}

      {isFilterPanelOpen && children ? (
        <div className="mt-5 border-t border-border pt-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
