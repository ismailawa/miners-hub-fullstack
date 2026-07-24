'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  downloadRevenueAnalyticsCsv,
  getRevenueAnalytics,
  RevenueAnalytics,
  RevenueAnalyticsFilters,
} from '../../../lib/api/revenue-analytics';
import RecordPicker from '../../../components/RecordPicker';

const periods = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: '12m', label: '12 months' },
  { value: 'custom', label: 'Custom' },
];

const statuses = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'delivered',
  'paid',
  'funded',
  'awaiting_release',
  'released',
  'refunded',
  'approved',
  'submitted',
  'under_review',
];

function money(value?: number | null) {
  return `NGN ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      {helper ? <p className="mt-1 text-xs text-text-secondary">{helper}</p> : null}
    </div>
  );
}

export default function RevenueAnalyticsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<RevenueAnalyticsFilters>({ period: '90d', status: 'all' });
  const [report, setReport] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUsePage = currentUser?.role === 'admin' || currentUser?.role === 'government' || currentUser?.role === 'miner' || currentUser?.role === 'investor';

  const maxTrend = useMemo(() => {
    if (!report?.monthlyTrend.length) return 1;
    return Math.max(...report.monthlyTrend.map((row) => row.governmentRevenue), 1);
  }, [report]);

  useEffect(() => {
    if (currentUser && !canUsePage) router.replace('/dashboard');
  }, [currentUser, canUsePage, router]);

  useEffect(() => {
    if (!currentUser || !canUsePage) return;
    loadReport();
  }, [currentUser, canUsePage]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRevenueAnalytics(filters);
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof RevenueAnalyticsFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'period' && value !== 'custom' ? { dateFrom: '', dateTo: '' } : {}),
    }));
  };

  const exportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      const csv = await downloadRevenueAnalyticsCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `miners-hub-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'Failed to export revenue report');
    } finally {
      setExporting(false);
    }
  };

  if (currentUser && !canUsePage) return null;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Government revenue intelligence</p>
          <h1 className="mt-1 text-3xl font-bold text-text-primary">Revenue Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Track mineral sales, escrow settlement, platform commissions, and royalty exposure across verified production reports.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadReport} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-border/40">
            Refresh
          </button>
          <button onClick={exportCsv} disabled={exporting} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content disabled:opacity-60">
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary p-4 md:grid-cols-3 xl:grid-cols-6">
        <label className="text-sm text-text-secondary">
          <span className="mb-1 block">Period</span>
          <select value={filters.period || '90d'} onChange={(event) => updateFilter('period', event.target.value)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary">
            {periods.map((period) => <option key={period.value} value={period.value}>{period.label}</option>)}
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          <span className="mb-1 block">Mineral</span>
          <input value={filters.mineral || ''} onChange={(event) => updateFilter('mineral', event.target.value)} placeholder="Gold" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary" />
        </label>
        <label className="text-sm text-text-secondary">
          <span className="mb-1 block">LGA / Location</span>
          <input value={filters.lga || ''} onChange={(event) => updateFilter('lga', event.target.value)} placeholder="Jos North" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary" />
        </label>
        <RecordPicker
          resource="mine-sites"
          value={filters.siteId || ''}
          label="Mine site"
          placeholder="Search by site, operator, community, or state"
          onChange={(id) => updateFilter('siteId', id)}
        />
        <label className="text-sm text-text-secondary">
          <span className="mb-1 block">Status</span>
          <select value={filters.status || 'all'} onChange={(event) => updateFilter('status', event.target.value)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary">
            {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
          </select>
        </label>
        <button onClick={loadReport} className="self-end rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-primary hover:bg-border/40">
          Apply Filters
        </button>
        {filters.period === 'custom' ? (
          <>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block">From</span>
              <input type="date" value={filters.dateFrom || ''} onChange={(event) => updateFilter('dateFrom', event.target.value)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block">To</span>
              <input type="date" value={filters.dateTo || ''} onChange={(event) => updateFilter('dateTo', event.target.value)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary" />
            </label>
          </>
        ) : null}
      </section>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
      {loading ? <div className="rounded-lg border border-border bg-secondary p-6 text-text-secondary">Loading revenue analytics...</div> : null}

      {report && !loading ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Order Gross" value={money(report.totals.orderGross)} helper={`${report.totals.orderCount} order records`} />
            <MetricCard title="Escrow Gross" value={money(report.totals.escrowGross)} helper="Funds captured into escrow" />
            <MetricCard title="Commission Revenue" value={money(report.totals.commissionRevenue)} helper="Platform commission pipeline" />
            <MetricCard title="Approved Royalties" value={money(report.totals.approvedRoyaltyDue)} helper={`Total due: ${money(report.totals.royaltyDue)}`} />
            <MetricCard title="Government Revenue" value={money(report.totals.governmentRevenue)} helper="Approved royalties plus commissions" />
            <MetricCard title="Seller Net Payout" value={money(report.totals.sellerNetPayout)} helper="Released or pending seller net" />
            <MetricCard title="Refunded Amount" value={money(report.totals.refundedAmount)} helper="Refunded escrow exposure" />
            <MetricCard title="Report Window" value={`${report.filters.dateFrom} to ${report.filters.dateTo}`} />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary p-5 xl:col-span-2">
              <h2 className="text-lg font-bold text-text-primary">Monthly Revenue Trend</h2>
              <div className="mt-4 flex h-64 items-end gap-3 overflow-x-auto">
                {report.monthlyTrend.map((row) => (
                  <div key={row.month} className="flex min-w-20 flex-1 flex-col items-center gap-2">
                    <div className="flex h-48 w-full items-end rounded-md bg-primary px-2">
                      <div className="w-full rounded-t bg-accent" style={{ height: `${Math.max((row.governmentRevenue / maxTrend) * 100, 3)}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{row.month}</span>
                  </div>
                ))}
                {report.monthlyTrend.length === 0 ? <p className="text-sm text-text-secondary">No trend data for these filters.</p> : null}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary p-5">
              <h2 className="text-lg font-bold text-text-primary">Revenue by Status</h2>
              <div className="mt-4 space-y-3">
                {report.byStatus.map((row) => (
                  <div key={row.status} className="flex items-center justify-between rounded-md bg-primary px-3 py-2">
                    <span className="text-sm capitalize text-text-secondary">{label(row.status)}</span>
                    <span className="text-sm font-semibold text-text-primary">{money(row.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary p-5">
              <h2 className="text-lg font-bold text-text-primary">Mineral Breakdown</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase text-text-muted">
                    <tr>
                      <th className="py-2">Mineral</th>
                      <th>Orders</th>
                      <th>Gross</th>
                      <th>Commission</th>
                      <th>Royalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.byMineral.map((row) => (
                      <tr key={row.mineral}>
                        <td className="py-3 font-semibold text-text-primary">{row.mineral}</td>
                        <td>{row.orderCount}</td>
                        <td>{money(row.orderGross)}</td>
                        <td>{money(row.commissionRevenue)}</td>
                        <td>{money(row.royaltyDue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary p-5">
              <h2 className="text-lg font-bold text-text-primary">Royalty by LGA</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="text-xs uppercase text-text-muted">
                    <tr>
                      <th className="py-2">LGA</th>
                      <th>Reports</th>
                      <th>Due</th>
                      <th>Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.royaltyByLga.map((row) => (
                      <tr key={row.lga}>
                        <td className="py-3 font-semibold text-text-primary">{row.lga}</td>
                        <td>{row.reportCount}</td>
                        <td>{money(row.royaltyDue)}</td>
                        <td>{money(row.approvedRoyaltyDue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-secondary p-5">
            <h2 className="text-lg font-bold text-text-primary">Recent Transaction Sample</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-text-muted">
                  <tr>
                    <th className="py-2">Date</th>
                    <th>Mineral</th>
                    <th>Location</th>
                    <th>Order Status</th>
                    <th>Escrow</th>
                    <th>Total</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.recentTransactions.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 text-text-secondary">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td className="font-semibold text-text-primary">{row.mineralType}</td>
                      <td>{row.location || '-'}</td>
                      <td className="capitalize">{label(row.status)}</td>
                      <td className="capitalize">{row.escrowStatus ? label(row.escrowStatus) : row.paymentStatus}</td>
                      <td>{money(row.totalAmount)}</td>
                      <td>{money(row.commissionAmount)}</td>
                    </tr>
                  ))}
                  {report.recentTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="py-6 text-center text-text-secondary">No transactions match these filters.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
