import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LogisticsQuoteForm: React.FC = () => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        commodity: '',
        weight: '',
        containerType: '20ST',
        contactName: currentUser?.name || '',
        contactEmail: currentUser?.email || '',
    });
    const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionState('submitting');

        // Simulate API call to a backend proxy which would then call Maersk API
        // IMPORTANT: API keys should never be exposed on the frontend.
        // This is a simulation of a secure backend request.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In production, this would be handled by the backend API
        // console.log('Quote request submitted:', formData);
        setSubmissionState('success');
    };

    if (submissionState === 'success') {
        return (
            <div className="text-center p-8 bg-primary rounded-lg border border-green-500/50">
                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-text-primary mt-4">Quote Request Submitted</h3>
                <p className="text-text-secondary mt-2">Thank you! Our logistics team has received your request and will get back to you at <span className="font-semibold text-accent">{formData.contactEmail}</span> with a detailed quote within 24 hours.</p>
                <button onClick={() => setSubmissionState('idle')} className="mt-6 bg-border text-text-primary font-semibold py-2 px-5 rounded-md hover:bg-border/80">
                    Request Another Quote
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="origin" className="block text-sm font-medium text-text-secondary">Origin (Port or City)</label>
                    <input type="text" name="origin" id="origin" value={formData.origin} onChange={handleInputChange} required placeholder="e.g., Apapa Port, Lagos" className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
                </div>
                 <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-text-secondary">Destination (Port or City)</label>
                    <input type="text" name="destination" id="destination" value={formData.destination} onChange={handleInputChange} required placeholder="e.g., Port of Shanghai" className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
                </div>
            </div>
            <div>
                <label htmlFor="commodity" className="block text-sm font-medium text-text-secondary">Commodity Type</label>
                <input type="text" name="commodity" id="commodity" value={formData.commodity} onChange={handleInputChange} required placeholder="e.g., Iron Ore, Gemstones" className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-text-secondary">Total Gross Weight (kg)</label>
                    <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleInputChange} required placeholder="e.g., 20000" className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
                </div>
                <div>
                    <label htmlFor="containerType" className="block text-sm font-medium text-text-secondary">Container Type</label>
                    <select name="containerType" id="containerType" value={formData.containerType} onChange={handleInputChange} className="mt-1 w-full bg-primary p-2 border border-border rounded-md">
                        <option value="20ST">20' Standard</option>
                        <option value="40ST">40' Standard</option>
                        <option value="40HC">40' High Cube</option>
                        <option value="20RF">20' Reefer</option>
                        <option value="40RF">40' Reefer</option>
                    </select>
                </div>
            </div>
             <div>
                <h4 className="text-lg font-semibold text-text-primary border-t border-border pt-6 mt-6">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                     <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-text-secondary">Full Name</label>
                        <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleInputChange} required className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-text-secondary">Email Address</label>
                        <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleInputChange} required className="mt-1 w-full bg-primary p-2 border border-border rounded-md" />
                    </div>
                </div>
            </div>
             <div className="pt-6">
                <button 
                    type="submit" 
                    disabled={submissionState === 'submitting'}
                    className="w-full bg-accent text-accent-content font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/40 disabled:bg-border disabled:cursor-not-allowed"
                >
                    {submissionState === 'submitting' ? 'Submitting...' : 'Get Quote'}
                </button>
            </div>
        </form>
    );
};

export default LogisticsQuoteForm;