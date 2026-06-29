'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAdminOrders, refundEscrow, releaseEscrow } from '../../../../lib/api/admin';
import type { BackendOrder } from '../../../../lib/api/orders';

const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrdersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchOrders = async (status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrders(status === 'all' ? undefined : status);
      setOrders(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (currentUser?.role === 'admin') {
      void fetchOrders();
    }
  }, [currentUser, router]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    void fetchOrders(status);
  };

  const handleEscrowAction = async (orderId: string, action: 'release' | 'refund') => {
    setActioning(`${action}-${orderId}`);
    setError(null);
    try {
      if (action === 'release') {
        await releaseEscrow(orderId);
      } else {
        await refundEscrow(orderId);
      }
      await fetchOrders();
    } catch (err: any) {
      setError(err?.message || `Failed to ${action} escrow`);
    } finally {
      setActioning(null);
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  const totalVolume = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
          <p className="text-text-secondary">Monitor purchases, payment status, and fulfillment progress.</p>
        </div>
        <div className="bg-secondary border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-text-muted">Visible Order Volume</p>
          <p className="text-lg font-bold text-accent">₦{totalVolume.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
          <button onClick={() => fetchOrders()} className="underline ml-2">Retry</button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${
              statusFilter === status ? 'bg-accent text-accent-content' : 'bg-secondary text-text-secondary hover:bg-border'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-secondary rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/50 text-text-secondary text-sm">
              <th className="p-4 font-semibold border-b border-border">Order</th>
              <th className="p-4 font-semibold border-b border-border">Buyer</th>
              <th className="p-4 font-semibold border-b border-border">Seller</th>
              <th className="p-4 font-semibold border-b border-border">Value</th>
              <th className="p-4 font-semibold border-b border-border">Status</th>
              <th className="p-4 font-semibold border-b border-border">Payment</th>
              <th className="p-4 font-semibold border-b border-border">Escrow</th>
              <th className="p-4 font-semibold border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const escrow = order.escrowTransaction;
              const payoutReady = escrow?.sellerPayoutAccount?.status === 'active';
              const canRelease = escrow?.status === 'awaiting_release' && payoutReady;
              const canRefund = escrow && !['released', 'release_processing', 'refunded'].includes(escrow.status);
              return (
                <tr key={order.id} className="border-b border-border hover:bg-primary/30 transition-colors align-top">
                  <td className="p-4">
                    <p className="font-medium text-text-primary">{order.listing?.mineralType || 'Mineral'}</p>
                    <p className="text-xs text-text-muted font-mono">#{order.id.slice(0, 8)}</p>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">{order.buyer?.name || order.buyer?.email || 'Buyer'}</td>
                  <td className="p-4 text-sm text-text-secondary">{order.seller?.name || order.seller?.email || 'Seller'}</td>
                  <td className="p-4 text-sm font-semibold text-text-primary">₦{Number(order.totalAmount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-text-secondary capitalize">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-text-secondary capitalize">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 min-w-56">
                    {escrow ? (
                      <div className="space-y-1 text-xs text-text-secondary">
                        <p className="font-semibold text-text-primary capitalize">{escrow.status.replace(/_/g, ' ')}</p>
                        <p>Gross: ₦{Number(escrow.grossAmount).toLocaleString()}</p>
                        <p>Commission: ₦{Number(escrow.commissionAmount).toLocaleString()}</p>
                        <p>Seller net: ₦{Number(escrow.sellerNetAmount).toLocaleString()}</p>
                        <p className={payoutReady ? 'text-green-400' : 'text-yellow-400'}>
                          Payout: {escrow.sellerPayoutAccount?.status || 'missing'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">No escrow yet</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2 min-w-28">
                      <button
                        onClick={() => handleEscrowAction(order.id, 'release')}
                        disabled={!canRelease || actioning === `release-${order.id}`}
                        className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-500 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                      >
                        {actioning === `release-${order.id}` ? 'Releasing...' : 'Release'}
                      </button>
                      <button
                        onClick={() => handleEscrowAction(order.id, 'refund')}
                        disabled={!canRefund || actioning === `refund-${order.id}`}
                        className="px-3 py-1.5 text-xs rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                      >
                        {actioning === `refund-${order.id}` ? 'Refunding...' : 'Refund'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-text-muted">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
