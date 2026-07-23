"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers, verifyUser, AdminUser } from "../../../../lib/api/admin";
import { useAuth } from "../../../../contexts/AuthContext";
import BrandLoader from "../../../../components/BrandLoader";
import { formatCurrency } from "../../../../lib/currency";

const statusClasses: Record<string, string> = {
  verified: "border-green-500/30 bg-green-500/15 text-green-300",
  rejected: "border-red-500/30 bg-red-500/15 text-red-300",
  pending: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
};

const formatLabel = (value?: string | null) =>
  value
    ? value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "-";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || "border-border bg-primary text-text-secondary"}`}
  >
    {formatLabel(status)}
  </span>
);

const UserActions: React.FC<{
  user: AdminUser;
  disabled?: boolean;
  onStatus: (
    user: AdminUser,
    status: "verified" | "pending" | "rejected",
  ) => void;
}> = ({ user, disabled, onStatus }) => (
  <div className="flex flex-wrap gap-2">
    {user.verificationStatus !== "verified" && (
      <button
        disabled={disabled}
        onClick={() => onStatus(user, "verified")}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50"
      >
        Approve
      </button>
    )}
    {user.verificationStatus === "verified" && (
      <button
        disabled={disabled}
        onClick={() => onStatus(user, "pending")}
        className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-500 disabled:opacity-50"
      >
        Unapprove
      </button>
    )}
    {user.verificationStatus !== "rejected" && (
      <button
        disabled={disabled}
        onClick={() => onStatus(user, "rejected")}
        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        Reject
      </button>
    )}
  </div>
);

const UserDetailModal: React.FC<{
  user: AdminUser | null;
  updating: boolean;
  onClose: () => void;
  onStatus: (
    user: AdminUser,
    status: "verified" | "pending" | "rejected",
  ) => void;
}> = ({ user, updating, onClose, onStatus }) => {
  if (!user) return null;

  const profile = user.role === "miner" ? user.miner : user.investor;
  const documents = user.documents || [];
  const listings = user.miner?.listings || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border bg-secondary shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-secondary px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {user.name || user.email}
            </h2>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-primary">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name || user.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-accent">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={user.verificationStatus} />
                  <span className="rounded-full border border-border bg-primary px-2.5 py-1 text-xs font-semibold capitalize text-text-secondary">
                    {user.role}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.onboardingComplete ? "border-green-500/30 bg-green-500/15 text-green-300" : "border-yellow-500/30 bg-yellow-500/15 text-yellow-300"}`}
                  >
                    {user.onboardingComplete
                      ? "Onboarding complete"
                      : "Onboarding incomplete"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-muted">
                  Created {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <UserActions user={user} disabled={updating} onStatus={onStatus} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-md border border-border bg-primary p-4">
              <span className="text-sm text-text-muted">Phone</span>
              <div className="mt-1 font-semibold text-text-primary">
                {user.phoneNumber || "-"}
              </div>
            </div>
            <div className="rounded-md border border-border bg-primary p-4">
              <span className="text-sm text-text-muted">KYC submitted</span>
              <div className="mt-1 font-semibold text-text-primary">
                {user.kycSubmittedAt
                  ? new Date(user.kycSubmittedAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div className="rounded-md border border-border bg-primary p-4">
              <span className="text-sm text-text-muted">KYC verified</span>
              <div className="mt-1 font-semibold text-text-primary">
                {user.kycVerifiedAt
                  ? new Date(user.kycVerifiedAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-primary p-4">
            <h3 className="font-semibold text-text-primary">Profile Details</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              {user.role === "miner" ? (
                <>
                  <div>
                    <span className="text-text-muted">Company</span>
                    <div className="font-semibold text-text-primary">
                      {user.miner?.companyName || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Location</span>
                    <div className="font-semibold text-text-primary">
                      {user.miner?.location || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Industry</span>
                    <div className="font-semibold text-text-primary">
                      {user.miner?.industry || "-"}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-text-muted">Business address</span>
                    <div className="font-semibold text-text-primary">
                      {user.miner?.businessAddress || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Years in operation</span>
                    <div className="font-semibold text-text-primary">
                      {user.miner?.yearsInOperation || "-"}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-text-muted">Risk appetite</span>
                    <div className="font-semibold text-text-primary">
                      {user.investor?.riskAppetite || "-"}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-text-muted">Preferences</span>
                    <div className="font-semibold text-text-primary">
                      {user.investor?.investmentPreferences?.join(", ") || "-"}
                    </div>
                  </div>
                </>
              )}
              {!profile && (
                <div className="text-text-muted">
                  No role profile record found.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-primary p-4">
              <h3 className="font-semibold text-text-primary">Documents</h3>
              <div className="mt-3 divide-y divide-border">
                {documents.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No documents uploaded.
                  </p>
                ) : (
                  documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-text-primary">
                          {formatLabel(document.type)}
                        </div>
                        <div className="text-xs text-text-muted">
                          {document.fileName}
                        </div>
                      </div>
                      <StatusBadge status={document.reviewStatus} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-md border border-border bg-primary p-4">
              <h3 className="font-semibold text-text-primary">Listings</h3>
              <div className="mt-3 divide-y divide-border">
                {listings.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No miner listings found.
                  </p>
                ) : (
                  listings.map((listing) => (
                    <div key={listing.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-text-primary">
                          {listing.mineralType}
                        </div>
                        <StatusBadge status={listing.status} />
                      </div>
                      <div className="mt-1 text-xs text-text-muted">
                        {Number(listing.quantity).toLocaleString()} tonnes at{" "}
                        {formatCurrency(Number(listing.price))}/tonne
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers(statusFilter);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    if (currentUser?.role === "admin") void fetchUsers();
  }, [currentUser, router, statusFilter]);

  const counts = useMemo(
    () => ({
      pending: users.filter((user) => user.verificationStatus === "pending")
        .length,
      verified: users.filter((user) => user.verificationStatus === "verified")
        .length,
      rejected: users.filter((user) => user.verificationStatus === "rejected")
        .length,
    }),
    [users],
  );

  const handleVerify = async (
    user: AdminUser,
    status: "verified" | "pending" | "rejected",
  ) => {
    setUpdatingId(user.id);
    try {
      const updated = await verifyUser(user.id, status);
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, ...updated, verificationStatus: status }
            : item,
        ),
      );
      setSelectedUser((current) =>
        current?.id === user.id
          ? { ...current, ...updated, verificationStatus: status }
          : current,
      );
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <BrandLoader label="Loading users" />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            User Management
          </h1>
          <p className="text-text-secondary">
            View user details and approve, unapprove, or reject miners and
            investors.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-md border border-border bg-secondary px-4 py-2">
            <div className="font-bold text-text-primary">{counts.pending}</div>
            <div className="text-xs text-text-muted">Pending</div>
          </div>
          <div className="rounded-md border border-border bg-secondary px-4 py-2">
            <div className="font-bold text-text-primary">{counts.verified}</div>
            <div className="text-xs text-text-muted">Approved</div>
          </div>
          <div className="rounded-md border border-border bg-secondary px-4 py-2">
            <div className="font-bold text-text-primary">{counts.rejected}</div>
            <div className="text-xs text-text-muted">Rejected</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary p-4">
        <label className="block max-w-xs text-sm text-text-secondary">
          <span className="mb-1 block font-semibold">Status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All users</option>
            <option value="pending">Pending</option>
            <option value="verified">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-secondary">
        <table className="w-full text-left">
          <thead className="bg-primary/50 text-sm text-text-secondary">
            <tr>
              <th className="border-b border-border p-4 font-semibold">User</th>
              <th className="border-b border-border p-4 font-semibold">Role</th>
              <th className="border-b border-border p-4 font-semibold">
                Onboarding
              </th>
              <th className="border-b border-border p-4 font-semibold">
                Status
              </th>
              <th className="border-b border-border p-4 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-primary/30 ${updatingId === user.id ? "opacity-60" : ""}`}
              >
                <td className="p-4">
                  <div className="font-semibold text-text-primary">
                    {user.name || "-"}
                  </div>
                  <div className="text-sm text-text-muted">{user.email}</div>
                </td>
                <td className="p-4 text-sm capitalize text-text-secondary">
                  {user.role}
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  {user.onboardingComplete ? "Complete" : "Incomplete"}
                </td>
                <td className="p-4">
                  <StatusBadge status={user.verificationStatus} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent"
                    >
                      View Details
                    </button>
                    <UserActions
                      user={user}
                      disabled={updatingId === user.id}
                      onStatus={(item, status) =>
                        void handleVerify(item, status)
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserDetailModal
        user={selectedUser}
        updating={Boolean(updatingId)}
        onClose={() => setSelectedUser(null)}
        onStatus={(user, status) => void handleVerify(user, status)}
      />
    </div>
  );
}
