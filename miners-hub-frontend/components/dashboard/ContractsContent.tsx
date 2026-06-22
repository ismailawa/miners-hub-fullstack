'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Contract, ContractStatus } from '../../lib/types';
import { CONTRACTS_DATA } from '../../lib/constants/data';

const ContractRow: React.FC<{ contract: Contract; currentUserId: string; onView: (id: string) => void }> = ({ contract, currentUserId, onView }) => {
    const getStatusChip = (status: ContractStatus) => {
        switch (status) {
            case ContractStatus.PENDING_MINER_SIGNATURE:
            case ContractStatus.PENDING_INVESTOR_SIGNATURE: {
                const isMyTurn = (status === ContractStatus.PENDING_MINER_SIGNATURE && currentUserId === contract.minerId) || (status === ContractStatus.PENDING_INVESTOR_SIGNATURE && currentUserId === contract.investorId);
                return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isMyTurn ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 'bg-gray-500/20 text-gray-400'}`}>{isMyTurn ? 'Action Required' : 'Pending Other Party'}</span>;
            }
            case ContractStatus.ACTIVE:
                return <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Active</span>;
            case ContractStatus.REJECTED:
                return <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">Rejected</span>;
            default:
                return <span className="bg-gray-500/20 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
        }
    };

    const otherParty = currentUserId === contract.minerId ? contract.investorName : contract.minerName;

    return (
        <div className="bg-primary p-4 rounded-lg border border-border grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
                <p className="font-bold text-text-primary">{contract.mineral}</p>
                <p className="text-xs text-text-muted">ID: {contract.id}</p>
            </div>
            <div>
                <p className="text-sm text-text-secondary">{otherParty}</p>
                <p className="text-xs text-text-muted">Other Party</p>
            </div>
            <div className="text-center">{getStatusChip(contract.status)}</div>
            <div className="text-right">
                <button onClick={() => onView(contract.id)} className="px-3 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 transition-colors">View Details</button>
            </div>
        </div>
    );
};

const filters = ['all', 'pending', 'active', 'rejected'];

const ContractsContent: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    const [myContracts, setMyContracts] = useState<Contract[]>([]);
    const [contractFilter, setContractFilter] = useState('all');

    useEffect(() => {
        if (!currentUser) return;
        try {
            const all: Contract[] = JSON.parse(localStorage.getItem('miners_hub_contracts') || JSON.stringify(CONTRACTS_DATA));
            setMyContracts(all.filter(c => c.minerId === currentUser.id || c.investorId === currentUser.id));
        } catch (e) { /* silent */ }
    }, [currentUser]);

    if (!currentUser) return null;

    const filteredContracts = myContracts.filter(c => {
        if (contractFilter === 'all') return true;
        if (contractFilter === 'pending') return c.status === ContractStatus.PENDING_MINER_SIGNATURE || c.status === ContractStatus.PENDING_INVESTOR_SIGNATURE;
        if (contractFilter === 'active') return c.status === ContractStatus.ACTIVE;
        if (contractFilter === 'rejected') return c.status === ContractStatus.REJECTED;
        return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Contract Management</h1>
                    <p className="text-text-muted text-sm mt-1">{myContracts.length} total contract{myContracts.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex space-x-1 bg-secondary p-1 rounded-lg border border-border self-start">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setContractFilter(f)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors capitalize ${contractFilter === f ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-border'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredContracts.length > 0 ? (
                <div className="space-y-4">
                    {filteredContracts.map(contract => (
                        <ContractRow
                            key={contract.id}
                            contract={contract}
                            currentUserId={currentUser.id}
                            onView={(id) => setPage('contract-detail', { contractId: id })}
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
