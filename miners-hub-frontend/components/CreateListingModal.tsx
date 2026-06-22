import React, { useState, useEffect, useCallback } from 'react';
import { Listing, User, ListingStatus, ListingType } from '../lib/types';
import MultiFileInput, { FilePreview } from './MultiFileInput';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

interface CreateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (listing: Listing) => void;
    listingToEdit?: Listing | null;
    currentUser: User | null;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose, onSave, listingToEdit, currentUser }) => {
    const initialState = {
        mineral: '',
        quantity: 0,
        unit: 'tonne' as 'tonne' | 'kg' | 'gram',
        pricePerUnit: 0,
        grade: '',
        location: '',
        description: '',
    };
    const [formData, setFormData] = useState(initialState);
    const [images, setImages] = useState<FilePreview[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (listingToEdit) {
            setFormData({
                mineral: listingToEdit.mineral,
                quantity: listingToEdit.quantity,
                unit: listingToEdit.unit,
                pricePerUnit: listingToEdit.pricePerUnit,
                grade: listingToEdit.grade,
                location: listingToEdit.location,
                description: listingToEdit.description,
            });
            // Note: Cannot pre-populate file input for security reasons. Images must be re-uploaded on edit.
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
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'pricePerUnit' ? parseFloat(value) : value }));
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
        if (images.length === 0 && !listingToEdit) {
            setError('Please upload at least one image.');
            return;
        }

        const imageUrls = await Promise.all(images.map(img => toBase64(img.file)));

        const now = new Date().toISOString();
        const listingData: Listing = {
            id: listingToEdit ? listingToEdit.id : `listing-${Date.now()}`,
            minerId: currentUser.id,
            minerName: currentUser.name,
            minerImageUrl: 'https://picsum.photos/seed/newuser/100/100', // Placeholder
            ...formData,
            images: imageUrls.length > 0 ? imageUrls : (listingToEdit?.images || []),
            datePosted: now,
            status: ListingStatus.AVAILABLE,
            type: listingToEdit?.type || 'buy-now' as ListingType,
            createdAt: listingToEdit?.createdAt || now,
            updatedAt: now,
        };
        onSave(listingData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">{listingToEdit ? 'Edit Listing' : 'Create New Listing'}</h2>
                        <div className="space-y-6">
                            
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4">Mineral Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-text-secondary">Mineral Type</label><input type="text" name="mineral" value={formData.mineral} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                                    <div><label className="block text-sm font-medium text-text-secondary">Grade</label><input type="text" name="grade" value={formData.grade} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                                    <div className="md:col-span-2"><label className="block text-sm font-medium text-text-secondary">Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4">Pricing & Quantity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-sm font-medium text-text-secondary">Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                                    <div><label className="block text-sm font-medium text-text-secondary">Unit</label><select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full bg-primary p-2 border border-border rounded-md mt-1"><option value="tonne">Tonne</option><option value="kg">Kg</option><option value="gram">Gram</option></select></div>
                                    <div><label className="block text-sm font-medium text-text-secondary">Price per Unit ($)</label><input type="number" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleInputChange} required min="0" step="0.01" className="w-full bg-primary p-2 border border-border rounded-md mt-1" /></div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4">Description</h3>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full bg-primary p-2 border border-border rounded-md" />
                            </div>

                            <MultiFileInput id="listing-images" label="Listing Images" files={images} onFilesAdded={handleFilesAdded} onFileRemoved={handleFileRemoved} />
                            
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        </div>
                    </div>
                    <div className="p-4 bg-primary border-t border-border flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-border">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-accent text-accent-content font-semibold">Save Listing</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingModal;