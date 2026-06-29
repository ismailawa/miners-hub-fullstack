import React, { useEffect } from 'react';
import { Order, OrderStatusHistoryItem } from '../lib/types';

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

const StatusStep: React.FC<{ title: string; isActive: boolean; isCompleted: boolean; isLast?: boolean }> = ({ title, isActive, isCompleted, isLast }) => (
    <div className="relative flex-1 text-center">
        <div className="flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isActive || isCompleted ? 'bg-accent' : 'bg-border'}`}>
                {isCompleted ? <svg className="w-5 h-5 text-accent-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-accent-content' : 'bg-secondary'}`}></div>}
            </div>
        </div>
        {!isLast && <div className={`absolute top-4 left-1/2 w-full h-1 ${isCompleted ? 'bg-accent' : 'bg-border'}`}></div>}
        <p className={`mt-2 text-xs md:text-sm font-medium ${isActive || isCompleted ? 'text-text-primary' : 'text-text-muted'}`}>{title}</p>
    </div>
);

const HistoryItem: React.FC<{ item: OrderStatusHistoryItem; isFirst: boolean }> = ({ item, isFirst }) => (
    <div className="flex space-x-4">
        <div className="flex flex-col items-center -z-0">
            <div className={`w-4 h-4 rounded-full ${isFirst ? 'bg-accent' : 'bg-border'}`}></div>
            <div className="flex-1 w-0.5 bg-border"></div>
        </div>
        <div className="pb-8 flex-1">
            <p className={`font-semibold ${isFirst ? 'text-accent' : 'text-text-primary'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</p>
            <p className="text-sm text-text-secondary">{new Date(item.date).toLocaleString()}</p>
            <p className="text-sm text-text-muted">{item.location}</p>
            {item.notes && <p className="text-xs text-text-muted mt-1 italic">"{item.notes}"</p>}
        </div>
    </div>
);


const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, order }) => {
     useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if(isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    
    if (!isOpen || !order) return null;
    
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);
    const history = order.statusHistory?.length
        ? order.statusHistory
        : [{ status: order.status, date: order.updatedAt || order.createdAt, location: '', notes: 'Current order status.' }];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">Order Details</h2>
                            <p className="text-text-muted">Order ID: {order.id}</p>
                        </div>
                        <button onClick={onClose} aria-label="Close modal" className="text-text-muted hover:text-text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="my-8">
                        <div className="flex">
                            {statuses.map((status, index) => (
                                <StatusStep 
                                    key={status} 
                                    title={status.charAt(0).toUpperCase() + status.slice(1)} 
                                    isActive={index === currentStatusIndex}
                                    isCompleted={index < currentStatusIndex}
                                    isLast={index === statuses.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6 text-sm mb-8 bg-primary p-4 rounded-md border border-border">
                        <div><p className="font-semibold text-text-primary">Shipping To:</p><p className="text-text-secondary">{order.shippingAddress}</p></div>
                        <div><p className="font-semibold text-text-primary">Tracking Number:</p><p className="text-text-secondary">{order.trackingNumber || 'N/A'}</p></div>
                        <div><p className="font-semibold text-text-primary">Estimated Delivery:</p><p className="text-text-secondary">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Pending'}</p></div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-text-primary mb-4">Tracking History</h3>
                        <div className="relative">
                            {history.slice().reverse().map((item, index) => (
                                <HistoryItem key={index} item={item} isFirst={index === 0} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OrderTrackingModal;
