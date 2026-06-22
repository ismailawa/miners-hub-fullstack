import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SHIPMENT_DATA } from '../lib/constants/data';
import { Shipment, ShipmentStatus } from '../lib/types';
import LogisticsQuoteForm from './LogisticsQuoteForm';

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-secondary p-6 rounded-lg border border-border transform hover:-translate-y-2 transition-transform duration-300">
        <div className="text-accent mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary">{description}</p>
    </div>
);

const ProcessStep: React.FC<{ number: string; title: string; description: string; }> = ({ number, title, description }) => (
    <div className="relative">
        <div className="absolute -left-4 top-2 h-full border-l-2 border-dashed border-border"></div>
        <div className="relative pl-8">
            <div className="absolute -left-8 top-0 w-8 h-8 rounded-full bg-accent text-accent-content font-bold flex items-center justify-center ring-4 ring-primary">{number}</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary">{description}</p>
        </div>
    </div>
);

const TrackingResult: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
    const statuses = ['pending', 'in-transit', 'at-port', 'customs', 'delivered'];
    const currentStatusIndex = statuses.indexOf(shipment.currentStatus);

    return (
        <div className="bg-primary mt-6 p-6 rounded-lg border border-border animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text-primary">Tracking ID: {shipment.trackingId}</h3>
                    <p className="text-text-secondary">{shipment.origin} &rarr; {shipment.destination}</p>
                </div>
                <div className="text-left md:text-right mt-4 md:mt-0">
                    <p className="text-text-secondary">Estimated Delivery</p>
                    <p className="font-bold text-accent">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex mb-8">
                {statuses.map((status, index) => (
                    <div key={status} className="flex-1 text-center">
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${index <= currentStatusIndex ? 'bg-accent' : 'bg-border'}`}>
                             {index < currentStatusIndex && <svg className="w-4 h-4 text-accent-content" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`text-xs mt-2 ${index <= currentStatusIndex ? 'text-text-primary' : 'text-text-muted'}`}>{status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                ))}
            </div>

            {/* History */}
            <div>
                <h4 className="font-bold text-text-primary mb-4">Shipment History</h4>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {shipment.history.map((item, index) => (
                        <div key={index} className="relative pl-6">
                             {index !== shipment.history.length - 1 && <div className="absolute left-2.5 top-5 h-full w-px bg-border"></div>}
                             <div className="absolute left-0 top-2 w-5 h-5 bg-secondary border-2 border-border rounded-full flex items-center justify-center">
                                <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-accent' : 'bg-border'}`}></div>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <p className={`font-semibold capitalize ${index === 0 ? 'text-accent' : 'text-text-primary'}`}>{item.status.replace('-', ' ')}</p>
                                <p className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">{item.location}</p>
                            {item.notes && <p className="text-xs text-text-muted mt-1 italic">"{item.notes}"</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const LogisticsPage: React.FC = () => {
    const { setPage } = useAuth();
    const [trackingId, setTrackingId] = useState('');
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [error, setError] = useState('');

    const handleTrackShipment = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShipment(null);
        const result = SHIPMENT_DATA[trackingId.toUpperCase()];
        if (result) {
            setShipment(result);
        } else {
            setError('Invalid tracking ID. Please check the number and try again.');
        }
    };

    const services = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg>,
            title: 'Ground & Rail Transport',
            description: 'Reliable and secure transportation of minerals from mine sites to ports and processing facilities using our extensive network of trucks and rail partners.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
            title: 'Warehousing & Storage',
            description: 'Secure, climate-controlled warehousing solutions at key strategic locations, ensuring the safety and integrity of your assets before shipment.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
            title: 'Customs Clearance',
            description: 'Expert handling of all customs documentation and brokerage services to ensure your shipments comply with all regulations and avoid costly delays.'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            title: 'Real-Time Tracking',
            description: 'Gain full visibility into your supply chain with our advanced tracking system, providing live updates from pickup to final delivery.'
        }
    ];

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center py-16 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Integrated Logistics</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">Seamless, secure, and transparent supply chain solutions from mine to market.</p>
                </div>
                
                 {/* Services Section */}
                <section className="mb-20">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map(service => (
                            <ServiceCard key={service.title} {...service} />
                        ))}
                    </div>
                </section>
                
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* How It Works */}
                    <section>
                        <h2 className="text-3xl font-bold text-text-primary mb-8">Our Process</h2>
                        <div className="space-y-12 pl-8">
                            <ProcessStep number="1" title="Request a Quote" description="Submit your shipment details through our platform, and our logistics team will provide a competitive, all-inclusive quote." />
                            <ProcessStep number="2" title="Schedule Pickup" description="Once you accept the quote, schedule a convenient pickup time. Our team will handle all pre-shipment preparations." />
                            <ProcessStep number="3" title="Real-Time Tracking" description="Monitor your shipment's journey with our live tracking system, giving you full visibility and peace of mind." />
                            <ProcessStep number="4" title="Secure Delivery" description="We ensure your cargo is delivered safely and on time, with all customs and final documentation handled by our experts." />
                        </div>
                    </section>
                    
                    {/* Tracking Section */}
                    <section>
                        <div className="bg-secondary rounded-lg p-8 border border-border sticky top-24">
                            <h2 className="text-3xl font-bold text-text-primary mb-4">Track Your Shipment</h2>
                            <p className="text-text-secondary mb-6">Enter your Miners Hub tracking ID below to see the latest status of your shipment.</p>
                            <form onSubmit={handleTrackShipment}>
                                <div className="flex flex-col sm:flex-row">
                                    <input
                                        type="text"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder="e.g., MH78654321"
                                        className="w-full bg-primary text-text-primary placeholder-text-muted border border-border rounded-md sm:rounded-r-none py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-accent text-accent-content hover:bg-yellow-400 font-semibold px-6 py-3 rounded-md sm:rounded-l-none mt-2 sm:mt-0 transition-colors"
                                    >
                                        Track
                                    </button>
                                </div>
                                 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                            </form>
                            
                            {shipment && <TrackingResult shipment={shipment} />}
                        </div>
                    </section>
                </div>
                
                 {/* Quote Form Section */}
                <section id="logistics-quote" className="mt-20 bg-secondary rounded-lg shadow-lg p-8 md:p-12 border border-border">
                     <h2 className="text-3xl font-extrabold text-text-primary text-center">Request a Logistics Quote</h2>
                    <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto text-center mb-8">
                       Fill out the form below and our team of experts will provide you with a competitive quote for your shipment.
                    </p>
                    <div className="max-w-3xl mx-auto">
                        <LogisticsQuoteForm />
                    </div>
                </section>

            </div>
        </main>
    );
};

export default LogisticsPage;