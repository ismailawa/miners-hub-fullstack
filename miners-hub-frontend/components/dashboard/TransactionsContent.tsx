'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Transaction } from '../../lib/types';

const getStatusChip = (status: string) => {
    switch (status) {
        case 'completed': return <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>;
        case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">Pending</span>;
        case 'failed': return <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">Failed</span>;
        default: return <span className="bg-gray-500/20 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
    }
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
    <div className="bg-primary p-4 rounded-lg border border-border grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
            <p className="font-bold text-text-primary">{transaction.mineral}</p>
            <p className="text-xs text-text-muted">ID: {transaction.id}</p>
        </div>
        <div className="text-right md:text-left">
            <p className="font-semibold text-text-primary">${transaction.amount.toFixed(2)}</p>
            <p className="text-xs text-text-muted">{transaction.quantity} {transaction.unit}(s)</p>
        </div>
        <div className="text-left">
            <p className="text-sm text-text-secondary">{new Date(transaction.date).toLocaleDateString()}</p>
            <p className="text-xs text-text-muted capitalize">{transaction.type}</p>
        </div>
        <div className="text-right">{getStatusChip(transaction.status)}</div>
    </div>
);

const TransactionsContent: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    const transactions = currentUser.transactions ? [...currentUser.transactions].reverse() : [];
    const totalAmount = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Transaction History</h1>
                    <p className="text-text-muted text-sm mt-1">{transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}</p>
                </div>
                {transactions.length > 0 && (
                    <div className="bg-secondary border border-border rounded-lg px-4 py-3 text-right">
                        <p className="text-xs text-text-muted">Total Completed Volume</p>
                        <p className="text-lg font-bold text-green-400">${totalAmount.toFixed(2)}</p>
                    </div>
                )}
            </div>

            {transactions.length > 0 ? (
                <div className="space-y-4">
                    {transactions.map(transaction => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-lg">
                    <p className="text-2xl mb-2">💳</p>
                    <p className="text-lg font-semibold">No transactions yet</p>
                    <p className="mt-1 text-sm">Your completed transactions will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionsContent;
