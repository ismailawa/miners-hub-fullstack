'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getContract, getSignNowLink, updateContractStatus, syncContractSignatures, BackendContract } from '../lib/api/contracts';

const ContractDetailPage: React.FC = () => {
    const { currentUser, pagePayload, setPage } = useAuth();
    const { addNotification } = useNotification();
    const contractId = pagePayload && 'contractId' in pagePayload ? pagePayload.contractId as string : undefined;
    const [contract, setContract] = useState<BackendContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const getStatusChip = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-orange-500/20 text-orange-400',
            negotiating: 'bg-blue-500/20 text-blue-400',
            pending_signatures: 'bg-yellow-500/20 text-yellow-400',
            signed: 'bg-sky-500/20 text-sky-400',
            active: 'bg-green-500/20 text-green-400',
            completed: 'bg-green-700/20 text-green-300',
            cancelled: 'bg-red-500/20 text-red-400',
            terminated: 'bg-red-700/20 text-red-300',
        };
        const cls = map[status] ?? 'bg-gray-500/20 text-gray-400';
        return <span className={`${cls} text-sm font-semibold px-3 py-1 rounded-full capitalize`}>{status.replace(/_/g, ' ')}</span>;
    };
    
    useEffect(() => {
        if (!currentUser || !contractId) {
            setPage('home');
            return;
        }

        const fetchContractDetail = async () => {
            setIsLoading(true);
            try {
                let data = await getContract(contractId);
                // Ensure user is authorized
                if (data.party1Id !== currentUser.id && data.party2Id !== currentUser.id) {
                    setPage('profile', { initialTab: 'contracts' });
                    return;
                }
                
                // If it's under review (or proposed), we sync from SignNow in case they just returned from signing
                if (data.status === 'under_review' || data.status === 'proposed') {
                    try {
                        data = await syncContractSignatures(contractId);
                    } catch (e) {
                        console.error("Failed to sync signatures from SignNow", e);
                    }
                }
                
                setContract(data);
            } catch (error) {
                console.error("Failed to load contract", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContractDetail();
    }, [currentUser, contractId, setPage]);
    
    const handleSign = async () => {
        if (!contract || !currentUser) return;
        
        setIsUpdating(true);
        try {
            const { link } = await getSignNowLink(contract.id, window.location.href);
            if (link) {
                // Redirect user to SignNow
                window.location.href = link;
            } else {
                alert("Could not generate signing link. Please try again.");
            }
        } catch (error) {
            console.error("Failed to generate signing link", error);
            alert("Failed to generate signing link. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTerminate = async () => {
         if (!contract || !currentUser) return;
         if (window.confirm("Are you sure you want to terminate this contract? This action cannot be undone.")) {
            setIsUpdating(true);
            try {
                const updated = await updateContractStatus(contract.id, 'terminated');
                setContract(updated);
                addNotification({
                    userId: currentUser.id,
                    type: 'warning',
                    title: 'Contract Terminated',
                    message: `You have terminated the contract: ${contract.title}.`,
                    createdAt: new Date().toISOString(),
                });
            } catch (error) {
                console.error("Failed to terminate contract", error);
                alert("Failed to terminate contract. Please try again.");
            } finally {
                setIsUpdating(false);
            }
         }
    };

    if (isLoading || !contract) {
        return <div className="pt-20 text-center">Loading contract...</div>;
    }

    const isParty1 = contract.party1Id === currentUser?.id;
    const isParty2 = contract.party2Id === currentUser?.id;
    
    const canSign = (contract.status === 'under_review' || contract.status === 'proposed') &&
        ((isParty1 && !contract.party1SignedAt) || (isParty2 && !contract.party2SignedAt));

    const SignatureDisplay = ({ signature, signedAt, partyName }: { signature?: string, signedAt?: string, partyName: string }) => (
        signature && signedAt ? (
            <div className="mt-4">
                <img src={signature} alt={`${partyName} signature`} className="h-16 bg-white p-2 rounded border border-border" />
                <p className="text-sm text-text-primary mt-2 font-medium">{partyName}</p>
                <p className="text-xs text-text-muted">Signed on {new Date(signedAt).toLocaleDateString()}</p>
            </div>
        ) : <p className="text-sm text-text-muted mt-4">Awaiting Signature</p>
    );

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-secondary rounded-lg border border-border">
                    <div className="p-8 border-b border-border">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">{contract.title}</h1>
                                <p className="text-sm text-text-muted font-mono">ID: {contract.id}</p>
                            </div>
                            {getStatusChip(contract.status)}
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-primary p-4 rounded-md">
                            <div><span className="font-semibold text-text-muted block">Party 1 (Proposer)</span>{contract.party1?.name}</div>
                            <div><span className="font-semibold text-text-muted block">Party 2</span>{contract.party2?.name}</div>
                            {contract.listing && (
                                <>
                                    <div><span className="font-semibold text-text-muted block">Mineral</span>{contract.listing.mineralType}</div>
                                    <div><span className="font-semibold text-text-muted block">Value</span>₦{contract.value ? contract.value.toLocaleString() : 'N/A'}</div>
                                </>
                            )}
                        </div>

                        <h2 className="text-lg font-semibold text-text-primary mb-4">Terms and Conditions</h2>
                        <div className="prose prose-sm prose-invert max-w-none text-text-secondary whitespace-pre-wrap bg-primary p-4 rounded-md border border-border">
                            {contract.terms}
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Proposer Signature</h3>
                                <SignatureDisplay signature={contract.party1SignatureData || contract.party1Signature} signedAt={contract.party1SignedAt} partyName={contract.party1?.name ?? 'Party 1'} />
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-text-primary">Counterparty Signature</h3>
                                <SignatureDisplay signature={contract.party2SignatureData || contract.party2Signature} signedAt={contract.party2SignedAt} partyName={contract.party2?.name ?? 'Party 2'} />
                            </div>
                        </div>

                        {canSign && (
                            <div className="mt-8 border-t border-border pt-8">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Sign Contract</h3>
                                <p className="text-sm text-text-secondary mb-4">Click below to be securely redirected to SignNow to review and sign the contract.</p>
                                <div className="flex items-center space-x-4">
                                    <button onClick={handleTerminate} disabled={isUpdating} className="bg-red-500/20 text-red-400 font-semibold py-2 px-5 rounded-md hover:bg-red-500/30 disabled:opacity-50">Terminate</button>
                                    <button onClick={handleSign} disabled={isUpdating} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 disabled:opacity-50">
                                        {isUpdating ? 'Generating Link...' : 'Sign with SignNow'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ContractDetailPage;
