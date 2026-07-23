'use client';

import React, { useEffect, useState } from 'react';
import {
  EnvironmentalRecord,
  getCommunityEnvironmentalRecords,
} from '../../../lib/api/environmental-records';

export default function EnvironmentalUpdatesPage() {
  const [records, setRecords] = useState<EnvironmentalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getCommunityEnvironmentalRecords();
        setRecords(response.data);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-primary px-4 py-24 text-text-secondary">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent">Community Updates</p>
          <h1 className="mt-2 text-3xl font-extrabold text-text-primary">Environmental Monitoring</h1>
          <p className="mt-2 max-w-2xl text-sm">Public-safe environmental inspections, incidents, and remediation updates shared by Miners Hub administrators and regulators.</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-secondary p-8 text-center">Loading community updates...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {records.map((record) => (
              <article key={record.id} className="rounded-lg border border-border bg-secondary p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text-muted">{record.recordType.replace(/_/g, ' ')}</p>
                    <h2 className="mt-1 font-semibold text-text-primary">{record.site?.name || 'Mining site'}</h2>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold capitalize text-text-secondary">{record.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="mt-4 text-sm leading-6">{record.description}</p>
                <div className="mt-4 text-xs text-text-muted">
                  <p>{record.site?.community || record.site?.lga || record.site?.state || 'Location restricted'}</p>
                  <p>{new Date(record.createdAt).toLocaleDateString()}</p>
                </div>
              </article>
            ))}
            {records.length === 0 && (
              <div className="rounded-lg border border-border bg-secondary p-8 text-center text-text-muted md:col-span-2 xl:col-span-3">
                No community-safe environmental updates have been published yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
