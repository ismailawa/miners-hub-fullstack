'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, updateOrderStatus, initiateEscrowPayment, cancelOrder, mapBackendOrderToOrder, BackendOrder } from '../../lib/api/orders';
import OrderTrackingModal from '../OrderTrackingModal';
import { Order } from '../../lib/types';
import { formatCurrency } from '../../lib/currency';

// ── Status chip ────────────────────────────────────────────────────────────────
const getStatusChip = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-orange-500/20 text-orange-400',
    confirmed: 'bg-sky-500/20 text-sky-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-yellow-500/20 text-yellow-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    refunded: 'bg-purple-500/20 text-purple-400',
  };
  const cls = map[status] ?? 'bg-gray-500/20 text-gray-400';
  return <span className={`${cls} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>{status.replace(/_/g, ' ')}</span>;
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-primary p-4 rounded-lg border border-border animate-pulse grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 bg-border rounded" />)}
  </div>
);

// ── Order Card ─────────────────────────────────────────────────────────────────
const OrderCard: React.FC<{
  order: BackendOrder;
  isSeller: boolean;
  onView: (order: BackendOrder) => void;
  onUpdateStatus: (id: string, status: BackendOrder['status']) => void;
  onPayNow: (id: string) => void;
  onCancel: (id: string) => void;
  isUpdating: string | null;
}> = ({ order, isSeller, onView, onUpdateStatus, onPayNow, onCancel, isUpdating }) => {
  const mineral = order.listing?.mineralType ?? 'Mineral';
  const counterParty = isSeller
    ? (order.buyer?.name ?? 'Buyer')
    : (order.seller?.name ?? 'Seller');

  return (
    <div className="bg-primary p-4 rounded-lg border border-border grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
      <div>
        <p className="font-bold text-text-primary">{mineral}</p>
        <p className="text-xs text-text-muted font-mono">#{order.id.slice(0, 8)}</p>
      </div>
      <div className="text-right md:text-left">
        <p className="font-semibold text-text-primary">{formatCurrency(order.totalAmount)}</p>
        <p className="text-xs text-text-muted">{isSeller ? `To: ${counterParty}` : `From: ${counterParty}`}</p>
      </div>
      <div className="text-left">
        <p className="text-sm text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</p>
        {order.escrowTransaction && (
          <p className="text-xs text-text-muted mt-1">
            Escrow: <span className="capitalize">{order.escrowTransaction.status.replace(/_/g, ' ')}</span>
          </p>
        )}
      </div>
      <div className="text-right md:text-center">{getStatusChip(order.status)}</div>
      <div className="col-span-2 md:col-span-1 flex justify-end items-center gap-2 flex-wrap">
        {/* Buyer: pay now */}
        {!isSeller && order.status === 'pending' && (
          <button
            onClick={() => onPayNow(order.id)}
            disabled={isUpdating === order.id}
            className="px-3 py-1.5 text-sm rounded-md bg-accent text-accent-content hover:bg-yellow-400 disabled:opacity-60 transition-colors"
          >
            {isUpdating === order.id ? '...' : 'Pay Now'}
          </button>
        )}
        {/* Seller: advance status */}
        {isSeller && order.status === 'confirmed' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'processing')}
            disabled={isUpdating === order.id}
            className="px-3 py-1.5 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-60 transition-colors"
          >
            {isUpdating === order.id ? '...' : 'Process'}
          </button>
        )}
        {isSeller && order.status === 'processing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'shipped')}
            disabled={isUpdating === order.id}
            className="px-3 py-1.5 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-500 disabled:opacity-60 transition-colors"
          >
            {isUpdating === order.id ? '...' : 'Mark Shipped'}
          </button>
        )}
        {/* Buyer: confirm delivery */}
        {!isSeller && order.status === 'shipped' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'delivered')}
            disabled={isUpdating === order.id}
            className="px-3 py-1.5 text-sm rounded-md bg-green-700 text-white hover:bg-green-600 disabled:opacity-60 transition-colors"
          >
            {isUpdating === order.id ? '...' : 'Confirm Delivery'}
          </button>
        )}
        {['pending', 'confirmed', 'processing'].includes(order.status) && (
          <button
            onClick={() => onCancel(order.id)}
            disabled={isUpdating === order.id}
            className="px-3 py-1.5 text-sm rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => onView(order)}
          className="px-3 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 transition-colors"
        >
          Track
        </button>
      </div>
    </div>
  );
};

// ── Orders Content ─────────────────────────────────────────────────────────────
const OrdersContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await getOrders({ limit: 50 });
      const sellerResponse = await getOrders({ role: 'seller', limit: 50 });
      const data = [...(response.data || []), ...(sellerResponse.data || [])];
      setOrders(Array.from(new Map(data.map((order) => [order.id, order])).values()));
    } catch {
      setApiError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (currentUser) fetchOrders(); }, [currentUser, fetchOrders]);

  const handlePayNow = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      const response = await initiateEscrowPayment(orderId);
      if (!response.paymentLink) throw new Error('Payment link could not be created.');
      window.location.assign(response.paymentLink);
    } catch (error: any) {
      alert(error?.message || 'Payment failed. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: BackendOrder['status']) => {
    setIsUpdating(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      alert('Failed to update order. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
          <p className="text-text-muted text-sm mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchOrders} className="text-xs text-accent underline">Refresh</button>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
          {apiError} <button onClick={fetchOrders} className="underline ml-2">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isSeller={currentUser.id === order.sellerId}
              onView={(o) => { setSelectedOrder(o); setIsTrackingOpen(true); }}
              onUpdateStatus={handleUpdateStatus}
              onPayNow={handlePayNow}
              onCancel={handleCancel}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-lg">
          <p className="text-2xl mb-2">📦</p>
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm">Your purchase and sale orders will appear here.</p>
        </div>
      )}

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={selectedOrder ? mapBackendOrderToOrder(selectedOrder) as unknown as Order : null}
      />
    </div>
  );
};

export default OrdersContent;
