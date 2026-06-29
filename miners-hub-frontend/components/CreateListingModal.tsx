import React, { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { BackendListing, CreateListingPayload, createListing, updateListing } from '../lib/api/listings';
import MultiFileInput, { FilePreview } from './MultiFileInput';

const COMMON_MINERALS = ['Gold', 'Lithium', 'Copper', 'Cobalt', 'Coltan', 'Zinc', 'Tin', 'Lead', 'Iron Ore'];

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (listing: BackendListing) => void;
    listingToEdit?: BackendListing | null;
    currentUser: User | null;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose, onSave, listingToEdit, currentUser }) => {
    const initialState = {
        mineral: '',
        customMineral: '',
        isCustomMineral: false,
        quantity: 0,
        price: 0,
        gradePurity: '',
        location: '',
        type: 'buy_now' as 'buy_now' | 'auction',
    };
    const [formData, setFormData] = useState(initialState);
    const [images, setImages] = useState<FilePreview[]>([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (listingToEdit) {
            const isCustom = !COMMON_MINERALS.includes(listingToEdit.mineralType);
            setFormData({
                mineral: isCustom ? 'Other' : listingToEdit.mineralType,
                customMineral: isCustom ? listingToEdit.mineralType : '',
                isCustomMineral: isCustom,
                quantity: listingToEdit.quantity,
                price: listingToEdit.price,
                gradePurity: listingToEdit.gradePurity || '',
                location: listingToEdit.location || '',
                type: (listingToEdit.listingType as 'buy_now' | 'auction') || 'buy_now',
            });
            setImages([]);
        } else {
            setFormData(initialState);
            setImages([]);
        }
        setError('');
    }, [listingToEdit, isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value }));
    };

    const handleMineralChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            mineral: val,
            isCustomMineral: val === 'Other',
            customMineral: val === 'Other' ? prev.customMineral : '',
        }));
    };

    const handleFilesAdded = (newFiles: File[]) => {
        const filePreviews = newFiles.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...filePreviews]);
    };

    const handleFileRemoved = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].previewUrl);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError('You must be logged in to create a listing.');
            return;
        }

        const finalMineralName = formData.isCustomMineral ? formData.customMineral : formData.mineral;
        if (!finalMineralName.trim()) {
            setError('Please select or specify a mineral type.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const payload: CreateListingPayload = {
                mineralType: finalMineralName,
                quantity: formData.quantity,
                price: (formData as any).price ?? 0,
                gradePurity: formData.gradePurity || undefined,
                location: formData.location || undefined,
                listingType: formData.type,
            };

            let result: BackendListing;
            if (listingToEdit) {
                result = await updateListing(listingToEdit.id, payload);
            } else {
                result = await createListing(payload);
            }
            onSave(result);
        } catch (err: any) {
            setError(err?.message || 'Failed to save listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                            <h2 className="text-2xl font-bold text-text-primary">{listingToEdit ? 'Edit Listing' : 'Create New Listing'}</h2>
                            <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-8">
                            
                            <div className="bg-primary/50 p-6 rounded-xl border border-border">
                                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Listing Format
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className={`cursor-pointer p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 ${formData.type === 'buy_now' ? 'border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(var(--color-accent),0.2)]' : 'border-border bg-secondary hover:border-text-muted'}`}>
                                        <input type="radio" name="type" value="buy_now" checked={formData.type === 'buy_now'} onChange={handleInputChange} className="w-5 h-5 text-accent focus:ring-accent accent-accent" />
                                        <div>
                                            <div className="font-semibold text-text-primary text-base">Buy Now</div>
                                            <div className="text-xs text-text-secondary mt-0.5">Fixed price sale for immediate purchase</div>
                                        </div>
                                    </label>
                                    <label className={`cursor-pointer p-4 border rounded-xl flex items-center gap-4 transition-all duration-200 ${formData.type === 'auction' ? 'border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(var(--color-accent),0.2)]' : 'border-border bg-secondary hover:border-text-muted'}`}>
                                        <input type="radio" name="type" value="auction" checked={formData.type === 'auction'} onChange={handleInputChange} className="w-5 h-5 text-accent focus:ring-accent accent-accent" />
                                        <div>
                                            <div className="font-semibold text-text-primary text-base">Auction</div>
                                            <div className="text-xs text-text-secondary mt-0.5">Allow buyers to bid on your listing</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Mineral Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Mineral Type <span className="text-red-500">*</span></label>
                                        <select 
                                            name="mineral" 
                                            value={formData.mineral} 
                                            onChange={handleMineralChange} 
                                            required={!formData.isCustomMineral} 
                                            className="w-full bg-primary p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all appearance-none"
                                        >
                                            <option value="" disabled>Select Mineral</option>
                                            {COMMON_MINERALS.map(m => <option key={m} value={m}>{m}</option>)}
                                            <option value="Other">Other (Specify...)</option>
                                        </select>
                                        {formData.isCustomMineral && (
                                            <input 
                                                type="text" 
                                                name="customMineral" 
                                                value={formData.customMineral} 
                                                onChange={handleInputChange} 
                                                placeholder="e.g. Rare Earth Element" 
                                                required 
                                                className="w-full bg-primary p-3 border border-border rounded-lg mt-3 focus:ring-2 focus:ring-accent outline-none transition-all" 
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Grade / Purity</label>
                                        <input type="text" name="gradePurity" value={formData.gradePurity} onChange={handleInputChange} placeholder="e.g. 99.9% pure, Grade A" className="w-full bg-primary p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Origin Location <span className="text-red-500">*</span></label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Jos, Plateau State, Nigeria" required className="w-full bg-primary p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Quantity & Price</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Quantity (tonnes) <span className="text-red-500">*</span></label>
                                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" className="w-full bg-primary p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">
                                            {formData.type === 'auction' ? 'Starting Price ($ / tonne)' : 'Price per Tonne ($)'} <span className="text-red-500">*</span>
                                        </label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full bg-primary p-3 border border-border rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <MultiFileInput id="listing-images" label="Listing Images" files={images} onFilesAdded={handleFilesAdded} onFileRemoved={handleFileRemoved} />
                            </div>
                            
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <p className="text-red-400 text-sm font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-secondary border-t border-border rounded-b-2xl">
                        <p className="text-xs text-text-muted mb-4 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Your listing will be submitted for admin review before appearing on the marketplace.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} disabled={submitting} className="px-6 py-2.5 text-sm font-medium rounded-lg bg-primary hover:bg-border transition-colors disabled:opacity-50">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm font-bold rounded-lg bg-accent text-accent-content hover:bg-yellow-400 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                {submitting ? (
                                    <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...</>
                                ) : (
                                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{listingToEdit ? 'Save Changes' : 'Submit for Approval'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingModal;