"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import BrandLoader from "../../../../components/BrandLoader";
import {
  getAdminDocuments,
  reviewDocument,
  type AdminDocument,
} from "../../../../lib/api/admin";

const statuses = ["all", "pending", "approved", "rejected"];
const documentTypes = [
  "all",
  "kyc",
  "mining_licence",
  "listing_attachment",
  "contract",
  "other",
];

function formatBytes(value?: number) {
  const size = Number(value || 0);
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  return `${(size / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function AdminDocumentsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      documents.filter((document) => document.reviewStatus === "pending")
        .length,
    [documents],
  );

  const fetchDocuments = async (status = statusFilter, type = typeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDocuments(status, type);
      setDocuments(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (currentUser?.role === "admin") {
      void fetchDocuments();
    }
  }, [currentUser, router]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    void fetchDocuments(status, typeFilter);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value;
    setTypeFilter(nextType);
    void fetchDocuments(statusFilter, nextType);
  };

  const handleReview = async (
    document: AdminDocument,
    status: AdminDocument["reviewStatus"],
  ) => {
    const notes = window.prompt(
      status === "approved"
        ? "Approval notes (optional)"
        : "Reason for rejection (optional)",
      document.reviewNotes || "",
    );
    if (notes === null) return;

    setReviewingId(document.id);
    setError(null);
    try {
      const updated = await reviewDocument(
        document.id,
        status,
        notes.trim() || undefined,
      );
      setDocuments((current) =>
        current.map((item) => (item.id === document.id ? updated : item)),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to review document");
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) return <BrandLoader label="Loading documents" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            KYC Documents
          </h1>
          <p className="text-text-secondary">
            Review uploaded verification files and mining credentials.
          </p>
        </div>
        <div className="bg-secondary border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-text-muted">Pending In View</p>
          <p className="text-lg font-bold text-accent">{pendingCount}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
          <button onClick={() => fetchDocuments()} className="underline ml-2">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${
                statusFilter === status
                  ? "bg-accent text-accent-content"
                  : "bg-secondary text-text-secondary hover:bg-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Type
          <select
            value={typeFilter}
            onChange={handleTypeChange}
            className="bg-secondary border border-border rounded-md px-3 py-2 capitalize outline-none focus:ring-2 focus:ring-accent"
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bg-secondary rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/50 text-text-secondary text-sm">
              <th className="p-4 font-semibold border-b border-border">
                Document
              </th>
              <th className="p-4 font-semibold border-b border-border">
                Uploader
              </th>
              <th className="p-4 font-semibold border-b border-border">
                Listing
              </th>
              <th className="p-4 font-semibold border-b border-border">
                Uploaded
              </th>
              <th className="p-4 font-semibold border-b border-border">
                Status
              </th>
              <th className="p-4 font-semibold border-b border-border text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr
                key={document.id}
                className="border-b border-border hover:bg-primary/30 transition-colors"
              >
                <td className="p-4">
                  <p className="font-medium text-text-primary">
                    {document.fileName}
                  </p>
                  <p className="text-xs text-text-muted capitalize">
                    {formatLabel(document.type)} -{" "}
                    {formatBytes(document.fileSize)} - {document.mimeType}
                  </p>
                  {document.reviewNotes && (
                    <p className="text-xs text-text-secondary mt-1">
                      Note: {document.reviewNotes}
                    </p>
                  )}
                </td>
                <td className="p-4 text-sm">
                  <p className="text-text-primary">
                    {document.user?.name || "Unnamed user"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {document.user?.email || document.userId}
                  </p>
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  {document.listing?.mineralType ||
                    (document.listingId
                      ? document.listingId.slice(0, 8)
                      : "Not linked")}
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  {new Date(document.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-text-secondary capitalize">
                    {document.reviewStatus}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-text-secondary hover:bg-border transition-colors"
                    >
                      Open
                    </a>
                    <button
                      onClick={() => handleReview(document, "approved")}
                      disabled={reviewingId === document.id}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(document, "rejected")}
                      disabled={reviewingId === document.id}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500/15 text-red-300 hover:bg-red-500/25 disabled:opacity-60 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
