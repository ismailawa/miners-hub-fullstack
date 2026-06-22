'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../lib/types';
import OrderTrackingModal from '../OrderTrackingModal';

const getStatusChip = (status: string) => {
    switch (status) {
        case 'processing': return <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">Processing</span>;
        case 'shipped': return <span className="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">Shipped</span>;
        case 'in-transit': return <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full">In Transit</span>;
        case 'delivered': return <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Delivered</span>;
        default: return <span className="bg-gray-500/20 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
    }
};

const OrderCard: React.FC<{
    order: Order;
    onView: (order: Order) => void;
    isSeller: boolean;
    onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}> = ({ order, onView, isSeller, onUpdateStatus }) => (
    <div className="bg-primary p-4 rounded-lg border border-border grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
        <div>
            <p className="font-bold text-text-primary">{order.mineral}</p>
            <p className="text-xs text-text-muted">ID: {order.id}</p>
        </div>
        <div className="text-right md:text-left">
            <p className="font-semibold text-text-primary">${order.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-text-muted">{isSeller ? `To: ${order.buyerName}` : `From: ${order.sellerName}`}</p>
        </div>
        <div className="text-left">
            <p className="text-sm text-text-secondary">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div className="text-right md:text-center">{getStatusChip(order.status)}</div>
        <div className="col-span-2 md:col-span-1 flex justify-end items-center space-x-2">
            {isSeller && order.status !== 'delivered' && (
                <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-border rounded p-1 text-xs text-text-primary focus:ring-accent"
                >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                </select>
            )}
            <button onClick={() => onView(order)} className="px-3 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 transition-colors">
                Track
            </button>
        </div>
    </div>
);

const OrdersContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        try {
            const all: Order[] = JSON.parse(localStorage.getItem('miners_hub_orders') || '[]');
            setMyOrders(all.filter(o => o.buyerId === currentUser.id || o.sellerId === currentUser.id));
        } catch (e) { /* silent */ }
    }, [currentUser]);

    const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        if (!currentUser) return;
        try {
            const allOrders: Order[] = JSON.parse(localStorage.getItem('miners_hub_orders') || '[]');
            const idx = allOrders.findIndex(o => o.id === orderId);
            if (idx > -1) {
                const updated = { ...allOrders[idx], status: newStatus };
                const newHistory = { status: newStatus, date: new Date().toISOString(), location: "Seller's Location", notes: `Status updated to ${newStatus}.` };
                if (newStatus === 'shipped' && !updated.trackingNumber) {
                    updated.trackingNumber = `MH${Math.floor(100000000 + Math.random() * 900000000)}`;
                    const del = new Date(); del.setDate(del.getDate() + 7);
                    updated.estimatedDelivery = del.toISOString();
                    newHistory.notes = `Package shipped. Tracking: ${updated.trackingNumber}`;
                    newHistory.location = 'Lagos Logistics Hub';
                }
                updated.statusHistory.push(newHistory);
                allOrders[idx] = updated;
                localStorage.setItem('miners_hub_orders', JSON.stringify(allOrders));
                setMyOrders(allOrders.filter(o => o.buyerId === currentUser.id || o.sellerId === currentUser.id));
            }
        } catch (e) { console.error('Failed to update order', e); }
    };

    if (!currentUser) return null;

    const sorted = [...myOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">My Orders</h1>
                <p className="text-text-muted text-sm mt-1">{myOrders.length} total order{myOrders.length !== 1 ? 's' : ''}</p>
            </div>

            {sorted.length > 0 ? (
                <div className="space-y-4">
                    {sorted.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onView={(o) => { setSelectedOrder(o); setIsTrackingModalOpen(true); }}
                            isSeller={currentUser.id === order.sellerId}
                            onUpdateStatus={handleUpdateOrderStatus}
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
                isOpen={isTrackingModalOpen}
                onClose={() => setIsTrackingModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default OrdersContent;
