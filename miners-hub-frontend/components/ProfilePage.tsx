'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../lib/types';
import { getPayoutAccount, savePayoutAccount, type PayoutAccountPayload } from '../lib/api/users';
import type { BackendPayoutAccount } from '../lib/api/orders';
import { uploadImage } from '../lib/api/media';

type Tab = 'info' | 'payout' | 'security' | 'notifications';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>(currentUser || {});
    const [saveMsg, setSaveMsg] = useState('');
    const [payoutAccount, setPayoutAccount] = useState<BackendPayoutAccount | null>(null);
    const [payoutForm, setPayoutForm] = useState<PayoutAccountPayload>({
        bankName: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
        currency: 'NGN',
    });
    const [payoutMsg, setPayoutMsg] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) setFormData(currentUser);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'miner') return;
        void getPayoutAccount().then((account) => {
            setPayoutAccount(account);
            if (account) {
                setPayoutForm({
                    bankName: account.bankName,
                    bankCode: account.bankCode,
                    accountNumber: '',
                    accountName: account.accountName,
                    currency: account.currency,
                });
            }
        }).catch(() => undefined);
    }, [currentUser]);

    if (!currentUser) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggleChange = (key: keyof NonNullable<User['notificationSettings']>) => {
        setFormData(prev => {
            const curr = prev.notificationSettings || { marketUpdates: false, platformAnnouncements: false };
            return { ...prev, notificationSettings: { ...curr, [key]: !curr[key] } };
        });
    };

    const handleSave = () => {
        updateUser({ ...currentUser, ...formData });
        setIsEditing(false);
        setSaveMsg('Changes saved!');
        setTimeout(() => setSaveMsg(''), 2500);
    };

    const handlePayoutSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayoutLoading(true);
        setPayoutMsg('');
        try {
            const saved = await savePayoutAccount(payoutForm);
            setPayoutAccount(saved);
            setPayoutForm((prev) => ({ ...prev, accountNumber: '' }));
            setPayoutMsg(saved.status === 'active' ? 'Payout account linked.' : 'Payout account submitted.');
        } catch (error: any) {
            setPayoutMsg(error?.message || 'Unable to link payout account.');
        } finally {
            setPayoutLoading(false);
            setTimeout(() => setPayoutMsg(''), 3500);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && currentUser) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { alert('File too large. Max 2MB.'); return; }
            if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
            const uploaded = await uploadImage(file, 'profile');
            updateUser({ ...currentUser, profileImageUrl: uploaded.secureUrl });
        }
    };

    const TABS: { id: Tab; label: string }[] = [
        { id: 'info', label: 'Personal & Business Info' },
        ...(currentUser.role === 'miner' ? [{ id: 'payout' as const, label: 'Payout Bank Account' }] : []),
        { id: 'security', label: 'Security' },
        { id: 'notifications', label: 'Notifications' },
    ];

    const InfoField: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p className="mt-1 text-text-primary">{value || '-'}</p>
        </div>
    );

    const EditableField: React.FC<{ label: string; name: keyof User; value?: string | null }> = ({ label, name, value }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-text-muted">{label}</label>
            <input
                type="text"
                id={name}
                name={name}
                value={value || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-primary p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
        </div>
    );

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'verified': return <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">Verified</span>;
            case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full">Pending Review</span>;
            case 'rejected': return <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">Rejected</span>;
            default: return <span className="bg-gray-500/20 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">New</span>;
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-8 gap-4">
                {/* Avatar */}
                <div className="relative group self-start">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-accent text-3xl font-bold border-2 border-border overflow-hidden cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        {currentUser.profileImageUrl
                            ? <img src={currentUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                            : currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                    </button>
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-text-primary">{currentUser.name}</h1>
                    <p className="text-text-muted text-sm">{currentUser.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm capitalize text-text-secondary font-medium border border-border rounded-full px-3 py-0.5">{currentUser.role}</span>
                        {getStatusChip(currentUser.status)}
                    </div>
                </div>

                {saveMsg && (
                    <div className="bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-2 rounded-lg border border-green-500/30">
                        ✓ {saveMsg}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-secondary p-1 rounded-lg border border-border mb-8 self-start w-full sm:w-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                        className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-border'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-secondary rounded-xl border border-border p-6 md:p-8">
                {activeTab === 'info' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Personal & Business Information</h2>
                            {isEditing ? (
                                <div className="space-x-2">
                                    <button onClick={() => { setIsEditing(false); setFormData(currentUser); }} className="px-4 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 transition-colors">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-1.5 text-sm rounded-md bg-accent text-accent-content hover:bg-yellow-400 transition-colors">Save Changes</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 text-sm rounded-md border border-border hover:bg-border transition-colors">Edit</button>
                            )}
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-semibold text-text-primary mb-4 text-base border-b border-border pb-2">Personal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {isEditing ? <EditableField label="Full Name" name="name" value={formData.name} /> : <InfoField label="Full Name" value={currentUser.name} />}
                                    {isEditing ? <EditableField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} /> : <InfoField label="Phone Number" value={currentUser.phoneNumber} />}
                                    <InfoField label="Email Address" value={currentUser.email} />
                                    <InfoField label="Role" value={currentUser.role} />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary mb-4 text-base border-b border-border pb-2">Business</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {isEditing ? <EditableField label="Business Name" name="businessName" value={formData.businessName} /> : <InfoField label="Business Name" value={currentUser.businessName} />}
                                    {isEditing ? <EditableField label="Website" name="businessWebsite" value={formData.businessWebsite} /> : <InfoField label="Website" value={currentUser.businessWebsite} />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-6">Security Settings</h2>
                        <div className="space-y-6">
                            <div className="p-5 bg-primary rounded-lg border border-border">
                                <h3 className="font-semibold text-text-primary mb-4">Change Password</h3>
                                <form className="space-y-4 max-w-md">
                                    <div><label className="block text-sm text-text-muted mb-1">Current Password</label><input type="password" disabled className="w-full bg-secondary p-2.5 border border-border rounded-lg" placeholder="••••••••" /></div>
                                    <div><label className="block text-sm text-text-muted mb-1">New Password</label><input type="password" disabled className="w-full bg-secondary p-2.5 border border-border rounded-lg" /></div>
                                    <div><button disabled className="px-4 py-2 text-sm rounded-lg bg-accent text-accent-content disabled:bg-border disabled:cursor-not-allowed">Update Password</button></div>
                                </form>
                            </div>
                            <div className="p-5 bg-primary rounded-lg border border-border">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-text-primary">Two-Factor Authentication (2FA)</h3>
                                        <p className="text-sm text-text-muted mt-1">Add an extra layer of security to your account.</p>
                                    </div>
                                    <label htmlFor="2fa-toggle" className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" id="2fa-toggle" className="sr-only" checked={formData.twoFactorEnabled} onChange={() => setFormData(p => ({ ...p, twoFactorEnabled: !p.twoFactorEnabled }))} />
                                            <div className="block bg-border w-14 h-8 rounded-full"></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${formData.twoFactorEnabled ? 'transform translate-x-6 !bg-accent' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payout' && currentUser.role === 'miner' && (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Payout Bank Account</h2>
                                <p className="text-sm text-text-muted mt-1">Escrow releases are sent to your linked Flutterwave payout account.</p>
                            </div>
                            {payoutAccount && (
                                <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                                    payoutAccount.status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : payoutAccount.status === 'failed'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {payoutAccount.status}
                                </span>
                            )}
                        </div>

                        {payoutAccount && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-primary rounded-lg border border-border">
                                <InfoField label="Bank" value={payoutAccount.bankName} />
                                <InfoField label="Account Name" value={payoutAccount.accountName} />
                                <InfoField label="Account Number" value={payoutAccount.accountNumberMasked} />
                            </div>
                        )}

                        {payoutMsg && (
                            <div className="mb-4 bg-primary border border-border rounded-lg p-3 text-sm text-text-secondary">
                                {payoutMsg}
                            </div>
                        )}

                        <form onSubmit={handlePayoutSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted">Bank Name</label>
                                <input
                                    value={payoutForm.bankName}
                                    onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankName: e.target.value }))}
                                    required
                                    className="mt-1 block w-full bg-primary p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted">Bank Code</label>
                                <input
                                    value={payoutForm.bankCode}
                                    onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankCode: e.target.value }))}
                                    required
                                    className="mt-1 block w-full bg-primary p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted">Account Number</label>
                                <input
                                    value={payoutForm.accountNumber}
                                    onChange={(e) => setPayoutForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }))}
                                    required
                                    inputMode="numeric"
                                    placeholder={payoutAccount ? 'Enter again to update' : ''}
                                    className="mt-1 block w-full bg-primary p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted">Account Name</label>
                                <input
                                    value={payoutForm.accountName}
                                    onChange={(e) => setPayoutForm((prev) => ({ ...prev, accountName: e.target.value }))}
                                    required
                                    className="mt-1 block w-full bg-primary p-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div className="md:col-span-2 text-right">
                                <button
                                    type="submit"
                                    disabled={payoutLoading}
                                    className="px-6 py-2 text-sm rounded-lg bg-accent text-accent-content hover:bg-yellow-400 disabled:bg-border disabled:cursor-not-allowed transition-colors"
                                >
                                    {payoutLoading ? 'Saving...' : 'Save Payout Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-6">Notification Settings</h2>
                        <div className="space-y-4 p-5 bg-primary rounded-lg border border-border">
                            {[
                                { key: 'marketUpdates' as const, title: 'Market Updates', desc: 'Receive emails about significant mineral price changes.' },
                                { key: 'platformAnnouncements' as const, title: 'Platform Announcements', desc: 'Get notified about new features and platform news.' },
                            ].map(({ key, title, desc }, i) => (
                                <React.Fragment key={key}>
                                    {i > 0 && <hr className="border-border" />}
                                    <div className="flex justify-between items-center py-2">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">{title}</h3>
                                            <p className="text-sm text-text-muted mt-1">{desc}</p>
                                        </div>
                                        <label htmlFor={`toggle-${key}`} className="flex items-center cursor-pointer ml-4">
                                            <div className="relative">
                                                <input type="checkbox" id={`toggle-${key}`} className="sr-only" checked={formData.notificationSettings?.[key]} onChange={() => handleToggleChange(key)} />
                                                <div className="block bg-border w-14 h-8 rounded-full"></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${formData.notificationSettings?.[key] ? 'transform translate-x-6 !bg-accent' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="text-right mt-6">
                            <button onClick={handleSave} className="px-6 py-2 text-sm rounded-lg bg-accent text-accent-content hover:bg-yellow-400 transition-colors">Save Preferences</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
