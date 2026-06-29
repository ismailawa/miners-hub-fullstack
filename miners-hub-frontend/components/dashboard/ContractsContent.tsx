'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getContracts, updateContractStatus, BackendContract } from '../../lib/api/contracts';

// ── Status Chip ────────────────────────────────────────────────────────────────
const getStatusChip = (status: string, isMyTurn: boolean) => {
  if (status === 'pending_signatures' && isMyTurn) {
    return (
      <span className="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">
        Action Required
      </span>
    );
  }
  const map: Record<string, string> = {
    pending: 'bg-orange-500/20 text-orange-400',
    negotiating: 'bg-blue-500/20 text-blue-400',
    pending_signatures: 'bg-gray-500/20 text-gray-400',
    signed: 'bg-sky-500/20 text-sky-400',
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-green-700/20 text-green-300',
    cancelled: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-700/20 text-red-300',
  };
  const cls = map[status] ?? 'bg-gray-500/20 text-gray-400';
  return <span className={`${cls} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>{status.replace(/_/g, ' ')}</span>;
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-primary p-4 rounded-lg border border-border animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-5 bg-border rounded" />)}
  </div>
);

// ── Contract Row ───────────────────────────────────────────────────────────────
const ContractRow: React.FC<{
  contract: BackendContract;
  currentUserId: string;
  onView: (id: string) => void;
  onRespond: (id: string, status: BackendContract['status']) => void;
  isUpdating: string | null;
}> = ({ contract, currentUserId, onView, onRespond, isUpdating }) => {
  const isParty1 = contract.party1Id === currentUserId;
  const otherParty = isParty1 ? (contract.party2?.name ?? 'Counterparty') : (contract.party1?.name ?? 'Counterparty');

  // Determine if this user needs to take action
  const needsMySignature =
    contract.status === 'pending_signatures' &&
    ((isParty1 && !contract.party1SignedAt) || (!isParty1 && !contract.party2SignedAt));

  // Pending party is the proposer's counterparty who has not yet responded
  const awaitingResponse = contract.status === 'pending' && !isParty1;

  return (
    <div className="bg-primary p-4 rounded-lg border border-border grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
      <div>
        <p className="font-bold text-text-primary truncate max-w-[180px]" title={contract.title}>{contract.title}</p>
        <p className="text-xs text-text-muted font-mono">#{contract.id.slice(0, 8)}</p>
      </div>
      <div>
        <p className="text-sm text-text-secondary">{otherParty}</p>
        <p className="text-xs text-text-muted">Other Party</p>
      </div>
      <div className="flex items-center gap-2">
        {getStatusChip(contract.status, needsMySignature)}
      </div>
      <div className="text-right flex items-center justify-end gap-2 flex-wrap">
        {/* Counterparty: respond to proposal */}
        {awaitingResponse && (
          <>
            <button
              onClick={() => onRespond(contract.id, 'rejected')}
              disabled={isUpdating === contract.id}
              className="px-2.5 py-1 text-xs rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/40 disabled:opacity-60 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onRespond(contract.id, 'negotiating')}
              disabled={isUpdating === contract.id}
              className="px-2.5 py-1 text-xs rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 disabled:opacity-60 transition-colors"
            >
              Accept
            </button>
          </>
        )}
        <button
          onClick={() => onView(contract.id)}
          className="px-3 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 transition-colors"
        >
          {needsMySignature ? 'Sign ✍️' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

const STATUS_FILTERS = ['all', 'pending', 'active', 'completed', 'rejected', 'cancelled'];

// ── Contracts Content ──────────────────────────────────────────────────────────
const ContractsContent: React.FC = () => {
  const { currentUser, setPage } = useAuth();
  const [contracts, setContracts] = useState<BackendContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [contractFilter, setContractFilter] = useState('all');

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await getContracts({ limit: 50 });
      const data = Array.isArray(response) ? response : (response as any).data ?? [];
      setContracts(data);
    } catch {
      setApiError('Failed to load contracts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (currentUser) fetchContracts(); }, [currentUser, fetchContracts]);

  const handleRespond = async (contractId: string, status: BackendContract['status']) => {
    setIsUpdating(contractId);
    try {
      const updated = await updateContractStatus(contractId, status);
      setContracts((prev) => prev.map((c) => (c.id === contractId ? updated : c)));
    } catch {
      alert('Failed to update contract. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  if (!currentUser) return null;

  const filtered = contracts.filter((c) => {
    if (contractFilter === 'all') return true;
    if (contractFilter === 'pending') return c.status === 'pending' || c.status === 'pending_signatures';
    if (contractFilter === 'active') return c.status === 'active' || c.status === 'signed';
    return c.status === contractFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contract Management</h1>
          <p className="text-text-muted text-sm mt-1">{contracts.length} total contract{contracts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex space-x-1 bg-secondary p-1 rounded-lg border border-border self-start flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setContractFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${contractFilter === f ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-border'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
          {apiError} <button onClick={fetchContracts} className="underline ml-2">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((contract) => (
            <ContractRow
              key={contract.id}
              contract={contract}
              currentUserId={currentUser.id}
              onView={(id) => setPage('contract-detail', { contractId: id })}
              onRespond={handleRespond}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-lg">
          <p className="text-2xl mb-2">📝</p>
          <p className="text-lg font-semibold">No contracts found</p>
          <p className="mt-1 text-sm">Contracts you create or receive will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ContractsContent;
