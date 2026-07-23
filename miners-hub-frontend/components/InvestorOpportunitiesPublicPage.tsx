"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import DashboardSearchFilters, { ActiveFilter } from "./DashboardSearchFilters";
import FormModal from "./FormModal";
import {
  createInvestorOpportunityInquiry,
  getPublicInvestorOpportunities,
  InvestorOpportunity,
  InvestorOpportunityRiskRating,
  InvestorOpportunityStage,
} from "../lib/api/investor-opportunities";

const stages: Array<"all" | InvestorOpportunityStage> = [
  "all",
  "exploration",
  "development",
  "production",
  "expansion",
];
const risks: Array<"all" | InvestorOpportunityRiskRating> = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];

const emptyInquiry = {
  message: "",
  investmentRange: "",
  contactPreference: "",
  dueDiligenceConsent: true,
  analyticsSubscriptionInterest: false,
};

function label(value: string) {
  return value.replace(/_/g, " ");
}

function money(value?: number | null) {
  if (value === undefined || value === null) return "Capital TBD";
  return `NGN ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function riskClass(risk: string) {
  const classes: Record<string, string> = {
    low: "border-green-500/30 bg-green-500/10 text-green-300",
    medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    high: "border-red-500/30 bg-red-500/10 text-red-300",
    critical: "border-red-600/50 bg-red-600/20 text-red-200",
  };
  return classes[risk] || classes.medium;
}

function esgLine(opportunity: InvestorOpportunity) {
  const summary = opportunity.esgSummary;
  if (!summary || summary.total === 0) return "ESG obligations not attached";
  const issues = summary.actionRequired + summary.overdue;
  if (issues > 0)
    return `${issues} ESG item${issues === 1 ? "" : "s"} need attention`;
  return `${summary.approved + summary.fulfilled}/${summary.total} ESG items cleared`;
}

function scoreClass(score?: number) {
  if (score === undefined) return "text-text-muted";
  if (score >= 80) return "text-green-300";
  if (score >= 60) return "text-yellow-300";
  return "text-red-300";
}

export default function InvestorOpportunitiesPublicPage() {
  const { currentUser, setPage } = useAuth();
  const [opportunities, setOpportunities] = useState<InvestorOpportunity[]>([]);
  const [selected, setSelected] = useState<InvestorOpportunity | null>(null);
  const [filters, setFilters] = useState({
    mineral: "",
    location: "",
    riskRating: "all",
    stage: "all",
    licenseStatus: "",
    status: "published",
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiry, setInquiry] = useState(emptyInquiry);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicInvestorOpportunities(filters);
      setOpportunities(
        response.data.filter((item) => item.status === "published"),
      );
    } catch (err: any) {
      setError(err?.message || "Unable to load investor opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(
    () => ({
      opportunities: opportunities.length,
      capital: opportunities.reduce(
        (sum, item) => sum + Number(item.capitalRequired || 0),
        0,
      ),
      productionStage: opportunities.filter(
        (item) => item.stage === "production" || item.stage === "expansion",
      ).length,
    }),
    [opportunities],
  );

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const active: ActiveFilter[] = [];
    if (filters.mineral.trim())
      active.push({
        key: "mineral",
        label: `Mineral: ${filters.mineral.trim()}`,
        clear: () => setFilters((current) => ({ ...current, mineral: "" })),
      });
    if (filters.location.trim())
      active.push({
        key: "location",
        label: `Location: ${filters.location.trim()}`,
        clear: () => setFilters((current) => ({ ...current, location: "" })),
      });
    if (filters.stage !== "all")
      active.push({
        key: "stage",
        label: `Stage: ${label(filters.stage)}`,
        clear: () => setFilters((current) => ({ ...current, stage: "all" })),
      });
    if (filters.riskRating !== "all")
      active.push({
        key: "risk",
        label: `Risk: ${label(filters.riskRating)}`,
        clear: () =>
          setFilters((current) => ({ ...current, riskRating: "all" })),
      });
    return active;
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      mineral: "",
      location: "",
      riskRating: "all",
      stage: "all",
      licenseStatus: "",
      status: "published",
    });
  };

  const openInquiry = (opportunity: InvestorOpportunity) => {
    if (!currentUser) {
      setPage("login");
      return;
    }
    setSelected(opportunity);
    setIsInquiryOpen(true);
  };

  const submitInquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await createInvestorOpportunityInquiry(selected.id, inquiry);
      setInquiry(emptyInquiry);
      setIsInquiryOpen(false);
      setNotice(
        "Inquiry sent. The opportunity sponsor can now review your interest.",
      );
    } catch (err: any) {
      setError(err?.message || "Unable to send inquiry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bg-primary pt-20">
      <section className="border-b border-border bg-secondary">
        <div className="container mx-auto grid min-h-[440px] gap-8 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">
              Investor Opportunities
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-text-primary md:text-6xl">
              Discover investment-ready mining projects.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              Review published mining opportunities with mineral focus, stage,
              capital requirement, risk signals, site context, and due diligence
              references.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#opportunities"
                className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-accent-content hover:bg-yellow-400"
              >
                Browse Opportunities
              </a>
              <button
                onClick={() => setPage(currentUser ? "dashboard" : "register")}
                className="rounded-md border border-border px-5 py-3 text-sm font-bold text-text-primary hover:border-accent hover:text-accent"
              >
                {currentUser ? "Open Investor Dashboard" : "Register Interest"}
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-primary p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary p-4">
                <p className="text-xs uppercase text-text-muted">Published</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {stats.opportunities}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary p-4">
                <p className="text-xs uppercase text-text-muted">Capital</p>
                <p className="mt-2 text-xl font-bold text-text-primary">
                  {money(stats.capital)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary p-4">
                <p className="text-xs uppercase text-text-muted">
                  Advanced Stage
                </p>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {stats.productionStage}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm font-semibold text-text-primary">
                Public due diligence view
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Full access, sponsor messaging, and restricted documents require
                an authenticated investor account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="opportunities"
        className="container mx-auto space-y-6 px-4 py-12"
      >
        <DashboardSearchFilters
          searchValue={filters.mineral}
          onSearchChange={(value) =>
            setFilters((current) => ({ ...current, mineral: value }))
          }
          searchPlaceholder="Search by mineral focus"
          isFilterPanelOpen={isFilterPanelOpen}
          onToggleFilters={() => setIsFilterPanelOpen((open) => !open)}
          activeFilters={activeFilters}
          onReset={resetFilters}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="text-sm text-text-secondary">
              <span className="mb-1.5 block font-semibold">Location</span>
              <input
                value={filters.location}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="State or LGA"
                className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1.5 block font-semibold">Stage</span>
              <select
                value={filters.stage}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    stage: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {label(stage)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1.5 block font-semibold">Risk</span>
              <select
                value={filters.riskRating}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    riskRating: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
              >
                {risks.map((risk) => (
                  <option key={risk} value={risk}>
                    {label(risk)}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={loadOpportunities}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 md:self-end"
            >
              Apply Filters
            </button>
          </div>
        </DashboardSearchFilters>

        {notice ? (
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-lg border border-border bg-secondary p-8 text-text-secondary">
              Loading investor opportunities...
            </div>
          ) : opportunities.length === 0 ? (
            <div className="col-span-full rounded-lg border border-border bg-secondary p-8 text-text-secondary">
              No published investor opportunities match the current filters.
            </div>
          ) : (
            opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="flex min-h-[360px] flex-col rounded-lg border border-border bg-secondary p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-accent">
                      {label(opportunity.stage)}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-text-primary">
                      {opportunity.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${riskClass(opportunity.riskRating)}`}
                  >
                    {label(opportunity.riskRating)}
                  </span>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-text-secondary">
                  {opportunity.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {opportunity.mineralFocus.map((mineral) => (
                    <span
                      key={mineral}
                      className="rounded-full border border-border bg-primary px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {mineral}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase text-text-muted">Capital</p>
                    <p className="mt-1 font-semibold text-text-primary">
                      {money(opportunity.capitalRequired)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-text-muted">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-text-primary">
                      {opportunity.site
                        ? `${opportunity.site.state}${opportunity.site.lga ? `, ${opportunity.site.lga}` : ""}`
                        : "Not disclosed"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-md border border-border bg-primary px-3 py-2">
                  <p className="text-xs uppercase text-text-muted">
                    ESG / Community
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {esgLine(opportunity)}
                  </p>
                </div>
                <div className="mt-3 rounded-md border border-border bg-primary px-3 py-2">
                  <p className="text-xs uppercase text-text-muted">
                    Diligence Score
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${scoreClass(opportunity.riskScore)}`}
                  >
                    {opportunity.riskScore ?? "TBD"} ·{" "}
                    {label(opportunity.dueDiligenceReviewStatus || "draft")}
                  </p>
                </div>
                <div className="mt-auto flex gap-2 pt-6">
                  <button
                    onClick={() => setSelected(opportunity)}
                    className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:border-accent hover:text-accent"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openInquiry(opportunity)}
                    className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400"
                  >
                    Inquire
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <FormModal
        isOpen={Boolean(selected) && !isInquiryOpen}
        title={selected?.title || "Opportunity Detail"}
        description={
          selected
            ? `${label(selected.stage)} stage · ${money(selected.capitalRequired)}`
            : undefined
        }
        onClose={() => setSelected(null)}
        maxWidthClass="max-w-4xl"
      >
        {selected ? (
          <div className="space-y-5">
            <p className="text-sm leading-6 text-text-secondary">
              {selected.summary}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-primary p-3">
                <p className="text-xs uppercase text-text-muted">Risk</p>
                <p className="mt-1 font-semibold capitalize text-text-primary">
                  {label(selected.riskRating)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-primary p-3">
                <p className="text-xs uppercase text-text-muted">License</p>
                <p className="mt-1 font-semibold text-text-primary">
                  {selected.licenseStatus || "TBD"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-primary p-3">
                <p className="text-xs uppercase text-text-muted">Inquiries</p>
                <p className="mt-1 font-semibold text-text-primary">
                  {selected.inquiryCount}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Investor Diligence
              </h3>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border bg-primary p-3">
                  <p className="text-xs uppercase text-text-muted">Score</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${scoreClass(selected.riskScore)}`}
                  >
                    {selected.riskScore ?? "TBD"}
                  </p>
                </div>
                <div className="rounded-md border border-border bg-primary p-3">
                  <p className="text-xs uppercase text-text-muted">Review</p>
                  <p className="mt-1 font-semibold capitalize text-text-primary">
                    {label(selected.dueDiligenceReviewStatus || "draft")}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                ESG & Community Readiness
              </h3>
              <div className="mt-2 rounded-md border border-border bg-primary p-3 text-sm text-text-secondary">
                <p className="font-semibold text-text-primary">
                  {esgLine(selected)}
                </p>
                {selected.esgSummary && selected.esgSummary.types.length > 0 ? (
                  <p className="mt-1 capitalize">
                    {selected.esgSummary.types.map(label).join(", ")}
                  </p>
                ) : (
                  <p className="mt-1">
                    No public ESG obligation register has been attached to this
                    site.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Risk Indicators
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.riskIndicators.length > 0 ? (
                  selected.riskIndicators.map((risk) => (
                    <span
                      key={risk}
                      className="rounded-full border border-border bg-primary px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {risk}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">
                    No public risk indicators attached.
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Due Diligence Documents
              </h3>
              <div className="mt-2 space-y-2">
                {selected.dueDiligenceDocuments.length > 0 ? (
                  selected.dueDiligenceDocuments.map((document) => (
                    <a
                      key={`${document.title}-${document.url}`}
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-border bg-primary px-3 py-2 text-sm text-accent hover:border-accent"
                    >
                      {document.title}
                      {document.type ? ` · ${document.type}` : ""}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">
                    Restricted document access may be shared after inquiry
                    review.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
              >
                Close
              </button>
              <button
                onClick={() => openInquiry(selected)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400"
              >
                Submit Inquiry
              </button>
            </div>
          </div>
        ) : null}
      </FormModal>

      <FormModal
        isOpen={isInquiryOpen}
        title="Submit Investor Inquiry"
        description={
          selected ? `Send interest for ${selected.title}.` : undefined
        }
        onClose={() => setIsInquiryOpen(false)}
      >
        <form onSubmit={submitInquiry} className="space-y-3">
          <textarea
            required
            value={inquiry.message}
            onChange={(event) =>
              setInquiry((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            rows={4}
            placeholder="Investment interest, questions, or due diligence request"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
          />
          <input
            value={inquiry.investmentRange}
            onChange={(event) =>
              setInquiry((current) => ({
                ...current,
                investmentRange: event.target.value,
              }))
            }
            placeholder="Investment range"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
          />
          <input
            value={inquiry.contactPreference}
            onChange={(event) =>
              setInquiry((current) => ({
                ...current,
                contactPreference: event.target.value,
              }))
            }
            placeholder="Contact preference"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
          />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={inquiry.dueDiligenceConsent}
              onChange={(event) =>
                setInquiry((current) => ({
                  ...current,
                  dueDiligenceConsent: event.target.checked,
                }))
              }
            />
            Request due diligence access
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={inquiry.analyticsSubscriptionInterest}
              onChange={(event) =>
                setInquiry((current) => ({
                  ...current,
                  analyticsSubscriptionInterest: event.target.checked,
                }))
              }
            />
            Interested in investor intelligence
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Send Inquiry"}
            </button>
          </div>
        </form>
      </FormModal>
    </main>
  );
}
