'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getPublicMineralPassport,
  PublicMineralPassport,
} from '../../../../../lib/api/mineral-passports';

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-secondary p-4">
    <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
    <div className="mt-1 text-sm font-semibold text-text-primary">{value || '-'}</div>
  </div>
);

export default function PublicPassportVerificationPage() {
  const params = useParams<{ token: string }>();
  const [passport, setPassport] = useState<PublicMineralPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPassport = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const data = await getPublicMineralPassport(params.token);
        setPassport(data);
      } catch {
        setError('This mineral passport could not be verified or is no longer active.');
      } finally {
        setIsLoading(false);
      }
    };
    if (params.token) void loadPassport();
  }, [params.token]);

  return (
    <main className="min-h-screen bg-primary px-4 py-24 text-text-secondary">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-accent">Public Verification</p>
          <h1 className="mt-2 text-3xl font-extrabold text-text-primary">Mineral Passport Certificate</h1>
        </div>

        {isLoading && <div className="rounded-lg border border-border bg-secondary p-8 text-center">Verifying certificate...</div>}
        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-red-300">{error}</div>}

        {passport && (
          <div className="space-y-6">
            <section className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-green-300">Verified active passport</p>
                  <h2 className="mt-1 text-2xl font-bold text-text-primary">{passport.passportNumber}</h2>
                  <p className="mt-1 text-sm text-text-muted">Issued {passport.issuedAt ? new Date(passport.issuedAt).toLocaleString() : '-'}</p>
                </div>
                <span className="rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-sm font-semibold capitalize text-green-300">{passport.status}</span>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Miner" value={passport.miner?.companyName || passport.snapshot?.miner?.companyName} />
              <Field label="Mine Site" value={passport.site?.name || passport.snapshot?.site?.name} />
              <Field label="License" value={passport.license?.licenseNumber || passport.snapshot?.license?.licenseNumber} />
              <Field label="Mineral" value={passport.labResult?.mineralType || passport.listing?.mineralType || passport.snapshot?.listing?.mineralType} />
              <Field label="Grade" value={passport.labResult?.grade || passport.snapshot?.labResult?.grade} />
              <Field label="Shipment" value={passport.shipment?.trackingId || passport.snapshot?.shipment?.trackingId} />
            </section>

            <section className="rounded-lg border border-border bg-secondary p-6">
              <h2 className="text-lg font-semibold text-text-primary">Traceability Timeline</h2>
              <div className="mt-5 space-y-4">
                {[
                  ['Source registered', passport.site?.name || passport.snapshot?.site?.name],
                  ['License checked', passport.license?.licenseNumber || passport.snapshot?.license?.licenseNumber],
                  ['Production reported', passport.snapshot?.productionReport?.mineralType],
                  ['Laboratory certified', passport.labResult?.sampleReference || passport.snapshot?.labResult?.sampleReference],
                  ['Marketplace linked', passport.listing?.mineralType || passport.snapshot?.listing?.mineralType],
                  ['Logistics tracked', passport.shipment?.trackingId || passport.snapshot?.shipment?.trackingId],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${value ? 'bg-accent' : 'bg-border'}`} />
                    <div>
                      <p className="font-semibold text-text-primary">{label}</p>
                      <p className="text-sm text-text-muted">{value || 'Not linked'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
