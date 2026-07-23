'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  createInvestorOpportunity,
  createInvestorOpportunityInquiry,
  getInvestorOpportunity,
  getInvestorOpportunities,
  InvestorOpportunity,
  InvestorOpportunityRiskRating,
  InvestorOpportunityStage,
  InvestorOpportunityStatus,
  updateInvestorOpportunity,
  updateInvestorOpportunityInquiry,
} from '../../../lib/api/investor-opportunities';

const statuses: Array<'all' | InvestorOpportunityStatus> = ['all', 'draft', 'published', 'closed', 'archived'];
const stages: Array<'all' | InvestorOpportunityStage> = ['all', 'exploration', 'development', 'production', 'expansion'];
const risks: Array<'all' | InvestorOpportunityRiskRating> = ['all', 'low', 'medium', 'high', 'critical'];

const emptyForm = {
  siteId: '',
  title: '',
  mineralFocus: '',
  capitalRequired: '',
  investmentType: 'equity',
  stage: 'development' as InvestorOpportunityStage,
  riskRating: 'medium' as InvestorOpportunityRiskRating,
  licenseStatus: '',
  summary: '',
  dueDiligenceDocuments: '',
  riskIndicators: '',
  analyticsSubscriptionEnabled: false,
  status: 'draft' as InvestorOpportunityStatus,
};

const emptyInquiry = {
  message: '',
  investmentRange: '',
  contactPreference: '',
  dueDiligenceConsent: true,
  analyticsSubscriptionInterest: false,
};

function list(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function documents(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, url, type] = line.split('|').map((part) => part.trim());
      return { title, url, type: type || undefined, restricted: true };
    })
    .filter((document) => document.title && document.url);
}

function money(value?: number | null) {
  if (value === undefined || value === null) return 'Capital TBD';
  return `NGN ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

function riskClass(risk: string) {
  const classes: Record<string, string> = {
    low: 'border-green-500/30 bg-green-500/10 text-green-300',
    medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    high: 'border-red-500/30 bg-red-500/10 text-red-300',
    critical: 'border-red-600/50 bg-red-600/20 text-red-200',
  };
  return classes[risk] || classes.medium;
}

export default function InvestorOpportunitiesPage() {
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState<InvestorOpportunity[]>([]);
  const [selected, setSelected] = useState<InvestorOpportunity | null>(null);
  const [filters, setFilters] = useState({ mineral: '', location: '', riskRating: 'all', stage: 'all', licenseStatus: '', status: 'all' });
  const [form, setForm] = useState(emptyForm);
  const [inquiry, setInquiry] = useState(emptyInquiry);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'government' || currentUser?.role === 'miner';
  const canInquire = currentUser?.role === 'investor' || currentUser?.role === 'admin' || currentUser?.role === 'government';

  const stats = useMemo(() => ({
    published: opportunities.filter((item) => item.status === 'published').length,
    totalCapital: opportunities.reduce((sum, item) => sum + Number(item.capitalRequired || 0), 0),
    inquiries: opportunities.reduce((sum, item) => sum + Number(item.inquiryCount || 0), 0),
  }), [opportunities]);

  useEffect(() => {
    if (!currentUser) return;
    loadOpportunities();
  }, [currentUser]);

  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInvestorOpportunities(filters);
      setOpportunities(response.data);
      if (!selected && response.data[0]) {
        const detail = await getInvestorOpportunity(response.data[0].id);
        setSelected(detail);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load investor opportunities');
    } finally {
      setLoading(false);
    }
  };

  const selectOpportunity = async (opportunity: InvestorOpportunity) => {
    setError(null);
    try {
      setSelected(await getInvestorOpportunity(opportunity.id));
    } catch (err: any) {
      setError(err?.message || 'Failed to load opportunity detail');
    }
  };

  const saveOpportunity = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        siteId: form.siteId || null,
        title: form.title,
        mineralFocus: list(form.mineralFocus),
        capitalRequired: form.capitalRequired ? Number(form.capitalRequired) : null,
        investmentType: form.investmentType,
        stage: form.stage,
        riskRating: form.riskRating,
        licenseStatus: form.licenseStatus || null,
        summary: form.summary,
        dueDiligenceDocuments: documents(form.dueDiligenceDocuments),
        riskIndicators: list(form.riskIndicators),
        analyticsSubscriptionEnabled: form.analyticsSubscriptionEnabled,
        status: form.status,
      };
      const saved = await createInvestorOpportunity(payload);
      setForm(emptyForm);
      setSelected(saved);
      await loadOpportunities();
    } catch (err: any) {
      setError(err?.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const submitInquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await createInvestorOpportunityInquiry(selected.id, inquiry);
      setInquiry(emptyInquiry);
      setSelected(await getInvestorOpportunity(selected.id));
      await loadOpportunities();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit inquiry');
    } finally {
      setSaving(false);
    }
  };

  const publishSelected = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateInvestorOpportunity(selected.id, { status: 'published' });
      setSelected(updated);
      await loadOpportunities();
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Investment pipeline</p>
          <h1 className="mt-1 text-3xl font-bold text-text-primary">Investor Opportunities</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">Publish investment-ready mining opportunities, review due diligence packs, and track investor inquiries.</p>
        </div>
        <button onClick={loadOpportunities} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-border/40">Refresh</button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase text-text-muted">Published</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats.published}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase text-text-muted">Capital Required</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{money(stats.totalCapital)}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase text-text-muted">Tracked Inquiries</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{stats.inquiries}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary p-4 md:grid-cols-3 xl:grid-cols-6">
        <input value={filters.mineral} onChange={(event) => setFilters((current) => ({ ...current, mineral: event.target.value }))} placeholder="Mineral" className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
        <input value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
        <select value={filters.stage} onChange={(event) => setFilters((current) => ({ ...current, stage: event.target.value }))} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
          {stages.map((stage) => <option key={stage} value={stage}>{label(stage)}</option>)}
        </select>
        <select value={filters.riskRating} onChange={(event) => setFilters((current) => ({ ...current, riskRating: event.target.value }))} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
          {risks.map((risk) => <option key={risk} value={risk}>{label(risk)}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
          {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
        </select>
        <button onClick={loadOpportunities} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-text-primary hover:bg-border/40">Apply</button>
      </section>

      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {loading ? <div className="rounded-lg border border-border bg-secondary p-6 text-text-secondary">Loading opportunities...</div> : null}
          {opportunities.map((opportunity) => (
            <button key={opportunity.id} onClick={() => selectOpportunity(opportunity)} className={`block w-full rounded-lg border p-5 text-left transition ${selected?.id === opportunity.id ? 'border-accent bg-accent/5' : 'border-border bg-secondary hover:border-accent/40'}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{opportunity.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{opportunity.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opportunity.mineralFocus.map((mineral) => <span key={mineral} className="rounded-full bg-primary px-2.5 py-1 text-xs text-text-secondary">{mineral}</span>)}
                  </div>
                </div>
                <div className="shrink-0 text-left md:text-right">
                  <p className="font-semibold text-text-primary">{money(opportunity.capitalRequired)}</p>
                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${riskClass(opportunity.riskRating)}`}>{label(opportunity.riskRating)} risk</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text-muted md:grid-cols-4">
                <span>{label(opportunity.stage)}</span>
                <span>{opportunity.licenseStatus || 'License status TBD'}</span>
                <span>{opportunity.site ? `${opportunity.site.state}${opportunity.site.lga ? `, ${opportunity.site.lga}` : ''}` : 'No site linked'}</span>
                <span>{opportunity.inquiryCount} inquiries</span>
              </div>
            </button>
          ))}
          {!loading && opportunities.length === 0 ? <div className="rounded-lg border border-border bg-secondary p-6 text-text-secondary">No investor opportunities match these filters.</div> : null}
        </div>

        <aside className="space-y-6">
          {selected ? (
            <div className="rounded-lg border border-border bg-secondary p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{selected.title}</h2>
                  <p className="mt-1 text-sm capitalize text-text-muted">{label(selected.status)} · {label(selected.stage)}</p>
                </div>
                {canPublish && selected.status !== 'published' ? <button onClick={publishSelected} disabled={saving} className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-content">Publish</button> : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{selected.summary}</p>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-text-primary">Due Diligence</h3>
                {selected.dueDiligenceDocuments.map((document) => (
                  <a key={`${document.title}-${document.url}`} href={document.url} target="_blank" rel="noreferrer" className="block rounded-md border border-border bg-primary px-3 py-2 text-sm text-accent hover:border-accent/40">
                    {document.title}{document.type ? ` · ${document.type}` : ''}
                  </a>
                ))}
                {selected.dueDiligenceDocuments.length === 0 ? <p className="text-sm text-text-muted">No documents attached yet.</p> : null}
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-text-primary">Risk Indicators</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.riskIndicators.map((risk) => <span key={risk} className="rounded-full border border-border bg-primary px-2.5 py-1 text-xs text-text-secondary">{risk}</span>)}
                </div>
              </div>
              {selected.analyticsSubscriptionEnabled ? <p className="mt-4 rounded-md bg-primary p-3 text-xs text-text-secondary">Investor intelligence subscription hooks enabled for this opportunity.</p> : null}
            </div>
          ) : null}

          {selected && canInquire ? (
            <form onSubmit={submitInquiry} className="rounded-lg border border-border bg-secondary p-5 space-y-3">
              <h2 className="text-lg font-bold text-text-primary">Submit Inquiry</h2>
              <textarea required value={inquiry.message} onChange={(event) => setInquiry((current) => ({ ...current, message: event.target.value }))} rows={4} placeholder="Investment interest, questions, or diligence request" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input value={inquiry.investmentRange} onChange={(event) => setInquiry((current) => ({ ...current, investmentRange: event.target.value }))} placeholder="Investment range" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input value={inquiry.contactPreference} onChange={(event) => setInquiry((current) => ({ ...current, contactPreference: event.target.value }))} placeholder="Contact preference" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={inquiry.dueDiligenceConsent} onChange={(event) => setInquiry((current) => ({ ...current, dueDiligenceConsent: event.target.checked }))} />
                Request due diligence access
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={inquiry.analyticsSubscriptionInterest} onChange={(event) => setInquiry((current) => ({ ...current, analyticsSubscriptionInterest: event.target.checked }))} />
                Interested in investor intelligence
              </label>
              <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content disabled:opacity-60">{saving ? 'Submitting...' : 'Send Inquiry'}</button>
            </form>
          ) : null}

          {selected?.inquiries?.length ? (
            <div className="rounded-lg border border-border bg-secondary p-5">
              <h2 className="text-lg font-bold text-text-primary">Inquiry Tracker</h2>
              <div className="mt-4 space-y-3">
                {selected.inquiries.map((item) => (
                  <div key={item.id} className="rounded-md bg-primary p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">{item.investor?.name || item.investor?.email || 'Investor'}</p>
                      <select value={item.status} onChange={async (event) => {
                        await updateInvestorOpportunityInquiry(item.id, { status: event.target.value as any });
                        setSelected(await getInvestorOpportunity(selected.id));
                      }} className="rounded-md border border-border bg-secondary px-2 py-1 text-xs text-text-primary">
                        {['new', 'contacted', 'due_diligence', 'closed'].map((status) => <option key={status} value={status}>{label(status)}</option>)}
                      </select>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{item.message}</p>
                    <p className="mt-2 text-xs text-text-muted">{item.investmentRange || 'Range not supplied'} · {item.contactPreference || 'No contact preference'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {canPublish ? (
            <form onSubmit={saveOpportunity} className="rounded-lg border border-border bg-secondary p-5 space-y-3">
              <h2 className="text-lg font-bold text-text-primary">Publish Opportunity</h2>
              <input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Opportunity title" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input value={form.siteId} onChange={(event) => setForm((current) => ({ ...current, siteId: event.target.value }))} placeholder="Mine site ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input required value={form.mineralFocus} onChange={(event) => setForm((current) => ({ ...current, mineralFocus: event.target.value }))} placeholder="Mineral focus, comma separated" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input value={form.capitalRequired} onChange={(event) => setForm((current) => ({ ...current, capitalRequired: event.target.value }))} placeholder="Capital required" type="number" min="0" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.stage} onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as InvestorOpportunityStage }))} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
                  {stages.filter((stage) => stage !== 'all').map((stage) => <option key={stage} value={stage}>{label(stage)}</option>)}
                </select>
                <select value={form.riskRating} onChange={(event) => setForm((current) => ({ ...current, riskRating: event.target.value as InvestorOpportunityRiskRating }))} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
                  {risks.filter((risk) => risk !== 'all').map((risk) => <option key={risk} value={risk}>{label(risk)}</option>)}
                </select>
              </div>
              <input value={form.investmentType} onChange={(event) => setForm((current) => ({ ...current, investmentType: event.target.value }))} placeholder="Investment type" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <input value={form.licenseStatus} onChange={(event) => setForm((current) => ({ ...current, licenseStatus: event.target.value }))} placeholder="License status" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <textarea required value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} rows={4} placeholder="Opportunity summary" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <textarea value={form.dueDiligenceDocuments} onChange={(event) => setForm((current) => ({ ...current, dueDiligenceDocuments: event.target.value }))} rows={3} placeholder="Document lines: Title | URL | Type" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <textarea value={form.riskIndicators} onChange={(event) => setForm((current) => ({ ...current, riskIndicators: event.target.value }))} rows={2} placeholder="Risk indicators, comma separated" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" />
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InvestorOpportunityStatus }))} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary">
                {statuses.filter((status) => status !== 'all').map((status) => <option key={status} value={status}>{label(status)}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" checked={form.analyticsSubscriptionEnabled} onChange={(event) => setForm((current) => ({ ...current, analyticsSubscriptionEnabled: event.target.checked }))} />
                Enable investor intelligence hook
              </label>
              <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content disabled:opacity-60">{saving ? 'Saving...' : 'Save Opportunity'}</button>
            </form>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
