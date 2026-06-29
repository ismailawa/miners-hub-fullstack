'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { getContract, signContract, updateContractStatus, BackendContract } from '../lib/api/contracts';
import SignaturePad, { SignaturePadHandles } from './SignaturePad';

const ContractDetailPage: React.FC = () => {
    const { currentUser, pagePayload, setPage } = useAuth();
    const { addNotification } = useNotification();
    const contractId = pagePayload && 'contractId' in pagePayload ? pagePayload.contractId as string : undefined;
    const [contract, setContract] = useState<BackendContract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const signaturePadRef = useRef<SignaturePadHandles>(null);

    const getStatusChip = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-orange-500/20 text-orange-400',
            negotiating: 'bg-blue-500/20 text-blue-400',
            pending_signatures: 'bg-yellow-500/20 text-yellow-400',
            signed: 'bg-sky-500/20 text-sky-400',
            active: 'bg-green-500/20 text-green-400',
            completed: 'bg-green-700/20 text-green-300',
            cancelled: 'bg-red-500/20 text-red-400',
            rejected: 'bg-red-700/20 text-red-300',
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
                const data = await getContract(contractId);
                // Ensure user is authorized
                if (data.party1Id !== currentUser.id && data.party2Id !== currentUser.id) {
                    setPage('profile', { initialTab: 'contracts' });
                    return;
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
        const signatureDataUrl = signaturePadRef.current?.toDataURL();
        if(!signatureDataUrl || signatureDataUrl.length < 100) { 
             alert("Please provide your signature.");
            return;
        }
        
        setIsUpdating(true);
        try {
            const updated = await signContract(contract.id, { signatureData: signatureDataUrl });
            setContract(updated);
            
            addNotification({
                userId: currentUser.id,
                type: 'success',
                title: 'Contract Signed',
                message: `You have successfully signed the contract: ${contract.title}.`,
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to sign contract", error);
            alert("Failed to sign contract. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReject = async () => {
         if (!contract || !currentUser) return;
         if (window.confirm("Are you sure you want to reject this contract? This action cannot be undone.")) {
            setIsUpdating(true);
            try {
                const updated = await updateContractStatus(contract.id, 'rejected');
                setContract(updated);
                addNotification({
                    userId: currentUser.id,
                    type: 'warning',
                    title: 'Contract Rejected',
                    message: `You have rejected the contract: ${contract.title}.`,
                    createdAt: new Date().toISOString(),
                });
            } catch (error) {
                console.error("Failed to reject contract", error);
                alert("Failed to reject contract. Please try again.");
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
    
    const canSign = contract.status === 'pending_signatures' &&
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
                                <SignatureDisplay signature={contract.party1SignatureData} signedAt={contract.party1SignedAt} partyName={contract.party1?.name ?? 'Party 1'} />
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-text-primary">Counterparty Signature</h3>
                                <SignatureDisplay signature={contract.party2SignatureData} signedAt={contract.party2SignedAt} partyName={contract.party2?.name ?? 'Party 2'} />
                            </div>
                        </div>

                        {canSign && (
                            <div className="mt-8 border-t border-border pt-8">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Your Signature</h3>
                                <p className="text-sm text-text-secondary mb-4">By signing below, you agree to all terms and conditions outlined in this contract.</p>
                                <div className="h-48 border border-border rounded-lg overflow-hidden bg-white">
                                    <SignaturePad ref={signaturePadRef} />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                     <button onClick={() => signaturePadRef.current?.clear()} className="text-sm text-text-muted hover:text-text-primary">Clear Signature</button>
                                     <div className="flex space-x-2">
                                        <button onClick={handleReject} disabled={isUpdating} className="bg-red-500/20 text-red-400 font-semibold py-2 px-5 rounded-md hover:bg-red-500/30 disabled:opacity-50">Reject</button>
                                        <button onClick={handleSign} disabled={isUpdating} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 disabled:opacity-50">
                                            {isUpdating ? 'Saving...' : 'Accept & Sign'}
                                        </button>
                                     </div>
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