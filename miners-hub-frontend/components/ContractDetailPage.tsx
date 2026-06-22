import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Contract, ContractStatus } from '../lib/types';
import SignaturePad, { SignaturePadHandles } from './SignaturePad';

const ContractDetailPage: React.FC = () => {
    const { currentUser, pagePayload, setPage } = useAuth();
    const { addNotification } = useNotification();
    const contractId = pagePayload && 'contractId' in pagePayload ? pagePayload.contractId : undefined;
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const signaturePadRef = useRef<SignaturePadHandles>(null);

    const getStatusChip = (status: ContractStatus) => {
        switch (status) {
            case ContractStatus.PENDING_MINER_SIGNATURE:
            case ContractStatus.PENDING_INVESTOR_SIGNATURE:
                return <span className="bg-yellow-500/20 text-yellow-400 text-sm font-semibold px-3 py-1 rounded-full">Pending Signature</span>;
            case ContractStatus.ACTIVE:
                return <span className="bg-green-500/20 text-green-400 text-sm font-semibold px-3 py-1 rounded-full">Active</span>;
            case ContractStatus.REJECTED:
                return <span className="bg-red-500/20 text-red-400 text-sm font-semibold px-3 py-1 rounded-full">Rejected</span>;
            default:
                return <span className="bg-gray-500/20 text-gray-400 text-sm font-semibold px-3 py-1 rounded-full">{status.replace('_', ' ')}</span>;
        }
    };
    
    useEffect(() => {
        if (!currentUser || !contractId) {
            setPage('home');
            return;
        }
        try {
            const allContracts: Contract[] = JSON.parse(localStorage.getItem('miners_hub_contracts') || '[]');
            const foundContract = allContracts.find(c => c.id === contractId);
            if (foundContract && (foundContract.minerId === currentUser.id || foundContract.investorId === currentUser.id)) {
                setContract(foundContract);
            } else {
                setPage('profile', { initialTab: 'contracts' }); // Not authorized
            }
        } catch (error) {
            console.error("Failed to load contract", error);
        }
        setIsLoading(false);
    }, [currentUser, contractId, setPage]);

    const updateContract = (updatedContract: Contract) => {
        try {
            const allContracts: Contract[] = JSON.parse(localStorage.getItem('miners_hub_contracts') || '[]');
            const contractIndex = allContracts.findIndex(c => c.id === updatedContract.id);
            if(contractIndex > -1) {
                allContracts[contractIndex] = updatedContract;
                localStorage.setItem('miners_hub_contracts', JSON.stringify(allContracts));
                setContract(updatedContract);
            }
        } catch (error) {
            console.error("Failed to update contract", error);
        }
    };
    
    const handleSign = () => {
        if (!contract || !currentUser) return;
        const signatureDataUrl = signaturePadRef.current?.toDataURL();
        if(!signatureDataUrl || signatureDataUrl.length < 100) { // basic check for empty canvas
             alert("Please provide your signature.");
            return;
        }
        
        let updatedContract = { ...contract };
        let nextStatus: Contract['status'] = contract.status;

        const signature = {
            userId: currentUser.id,
            userName: currentUser.name,
            signatureDataUrl,
            signedAt: new Date().toISOString()
        };

        if (contract.status === ContractStatus.PENDING_MINER_SIGNATURE && currentUser.id === contract.minerId) {
            updatedContract.minerSignature = signature;
            nextStatus = ContractStatus.PENDING_INVESTOR_SIGNATURE;
        } else if (contract.status === ContractStatus.PENDING_INVESTOR_SIGNATURE && currentUser.id === contract.investorId) {
            updatedContract.investorSignature = signature;
            nextStatus = ContractStatus.ACTIVE;
        }

        updatedContract.status = nextStatus;
        updatedContract.updatedAt = new Date().toISOString();
        updateContract(updatedContract);
        addNotification({
            userId: currentUser.id,
            type: 'success',
            title: 'Contract Signed',
            message: `You have successfully signed the contract for ${contract.mineral}.`,
            createdAt: new Date().toISOString(),
        });
    };

    const handleReject = () => {
         if (!contract || !currentUser) return;
         if (window.confirm("Are you sure you want to reject this contract? This action cannot be undone.")) {
            const updatedContract = { ...contract, status: ContractStatus.REJECTED, updatedAt: new Date().toISOString() };
            updateContract(updatedContract);
            addNotification({
                userId: currentUser.id,
                type: 'warning',
                title: 'Contract Rejected',
                message: `You have rejected the contract for ${contract.mineral}.`,
                createdAt: new Date().toISOString(),
            });
         }
    };

    if (isLoading || !contract) {
        return <div className="pt-20 text-center">Loading contract...</div>;
    }

    const canSign = (contract.status === ContractStatus.PENDING_MINER_SIGNATURE && currentUser?.id === contract.minerId) ||
                    (contract.status === ContractStatus.PENDING_INVESTOR_SIGNATURE && currentUser?.id === contract.investorId);

    const SignatureDisplay = ({ signature }: { signature?: Contract['minerSignature']}) => (
        signature ? (
            <div className="mt-4">
                <img src={signature.signatureDataUrl} alt="signature" className="h-16 bg-white p-2 rounded" />
                <p className="text-sm text-text-primary mt-2">{signature.userName}</p>
                <p className="text-xs text-text-muted">Signed on {new Date(signature.signedAt).toLocaleDateString()}</p>
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
                                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Contract Agreement</h1>
                                <p className="text-sm text-text-muted">ID: {contract.id}</p>
                            </div>
                            {getStatusChip(contract.status)}
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-primary p-4 rounded-md">
                            <div><span className="font-semibold text-text-muted block">Miner</span>{contract.minerName}</div>
                            <div><span className="font-semibold text-text-muted block">Investor</span>{contract.investorName}</div>
                            <div><span className="font-semibold text-text-muted block">Mineral</span>{contract.mineral}</div>
                            <div><span className="font-semibold text-text-muted block">Total</span>${(contract.pricePerUnit * contract.quantity).toLocaleString()}</div>
                        </div>

                        <h2 className="text-lg font-semibold text-text-primary mb-4">Terms and Conditions</h2>
                        <div className="prose prose-sm prose-invert max-w-none text-text-secondary whitespace-pre-wrap bg-primary p-4 rounded-md border border-border">
                            {contract.terms}
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border pt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">Miner Signature</h3>
                                <SignatureDisplay signature={contract.minerSignature} />
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-text-primary">Investor Signature</h3>
                                <SignatureDisplay signature={contract.investorSignature} />
                            </div>
                        </div>

                        {canSign && (
                            <div className="mt-8 border-t border-border pt-8">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Your Signature</h3>
                                <p className="text-sm text-text-secondary mb-4">By signing below, you agree to all terms and conditions outlined in this contract.</p>
                                <div className="h-48">
                                    <SignaturePad ref={signaturePadRef} />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                     <button onClick={() => signaturePadRef.current?.clear()} className="text-sm text-text-muted hover:text-text-primary">Clear Signature</button>
                                     <div className="flex space-x-2">
                                        <button onClick={handleReject} className="bg-red-500/20 text-red-400 font-semibold py-2 px-5 rounded-md hover:bg-red-500/30">Reject</button>
                                        <button onClick={handleSign} className="bg-green-500 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-600">Accept & Sign</button>
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