'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormModal from '../../../../components/FormModal';
import MultiFileInput, { FilePreview } from '../../../../components/MultiFileInput';
import { useAuth } from '../../../../contexts/AuthContext';
import { uploadImage } from '../../../../lib/api/media';
import {
  createTrustedPartner,
  deleteTrustedPartner,
  getAdminTrustedPartners,
  type TrustedPartner,
  type TrustedPartnerPayload,
  updateTrustedPartner,
} from '../../../../lib/api/trusted-partners';

const emptyForm: TrustedPartnerPayload = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  category: '',
  displayOrder: 0,
  status: 'published',
};

export default function AdminTrustedPartnersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<TrustedPartner[]>([]);
  const [form, setForm] = useState<TrustedPartnerPayload>(emptyForm);
  const [editingPartner, setEditingPartner] = useState<TrustedPartner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      setPartners(await getAdminTrustedPartners());
    } catch (err: any) {
      setError(err?.message || 'Failed to load trusted partners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (currentUser?.role === 'admin') void loadPartners();
  }, [currentUser, router]);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPartner(null);
    if (logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (partner: TrustedPartner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      logoUrl: partner.logoUrl,
      websiteUrl: partner.websiteUrl || '',
      category: partner.category || '',
      displayOrder: partner.displayOrder,
      status: partner.status,
    });
    setLogoFile(null);
    setLogoPreview('');
    setIsFormOpen(true);
  };

  const handleLogoFilesAdded = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image logo.');
      return;
    }
    if (logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoRemoved = () => {
    if (logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        const uploaded = await uploadImage(logoFile, 'general');
        logoUrl = uploaded.secureUrl;
      }

      const payload: TrustedPartnerPayload = {
        ...form,
        logoUrl,
        websiteUrl: form.websiteUrl || null,
        category: form.category || null,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (editingPartner) {
        await updateTrustedPartner(editingPartner.id, payload);
      } else {
        await createTrustedPartner(payload);
      }

      resetForm();
      setIsFormOpen(false);
      await loadPartners();
    } catch (err: any) {
      setError(err?.message || 'Failed to save trusted partner.');
    } finally {
      setSaving(false);
    }
  };

  const removePartner = async (partner: TrustedPartner) => {
    setSaving(true);
    setError(null);
    try {
      await deleteTrustedPartner(partner.id);
      await loadPartners();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete trusted partner.');
    } finally {
      setSaving(false);
    }
  };

  if (currentUser && currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Trusted Partners</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage the partner logos shown on the public home page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
        >
          Add Partner
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-secondary">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-primary/60 text-sm text-text-secondary">
            <tr>
              <th className="border-b border-border p-4 font-semibold">Partner</th>
              <th className="border-b border-border p-4 font-semibold">Category</th>
              <th className="border-b border-border p-4 font-semibold">Order</th>
              <th className="border-b border-border p-4 font-semibold">Status</th>
              <th className="border-b border-border p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted">Loading partners...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-text-muted">No trusted partners added yet. The homepage section is hidden.</td></tr>
            ) : partners.map((partner) => (
              <tr key={partner.id} className="border-b border-border align-top hover:bg-primary/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={partner.logoUrl} alt={partner.name} className="h-10 w-24 rounded bg-white object-contain p-1" />
                    <div>
                      <p className="font-semibold text-text-primary">{partner.name}</p>
                      <p className="text-xs text-text-muted">{partner.websiteUrl || 'No website'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-text-secondary">{partner.category || '-'}</td>
                <td className="p-4 text-sm text-text-secondary">{partner.displayOrder}</td>
                <td className="p-4 text-sm capitalize text-text-secondary">{partner.status}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(partner)} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Edit</button>
                    <button onClick={() => removePartner(partner)} disabled={saving} className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-70">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isFormOpen}
        title={editingPartner ? 'Edit Trusted Partner' : 'Add Trusted Partner'}
        description="Upload or paste a logo URL and choose whether it appears on the public homepage."
        onClose={() => { setIsFormOpen(false); resetForm(); }}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Partner name" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent" />
          <input value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} placeholder="Logo URL" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent" />
          <MultiFileInput
            id="trusted-partner-logo"
            label="Partner logo"
            files={logoFile && logoPreview ? [{ file: logoFile, previewUrl: logoPreview } as FilePreview] : []}
            onFilesAdded={handleLogoFilesAdded}
            onFileRemoved={handleLogoRemoved}
            accept="image/png,image/jpeg"
            helperText="Drop a JPG or PNG logo here. It uploads to Cloudinary when you save."
            multiple={false}
            maxFiles={1}
          />
          <input value={form.websiteUrl || ''} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} placeholder="Website URL" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent" />
          <input value={form.category || ''} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category e.g. Regulator, Logistics, Laboratory" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min={0} value={form.displayOrder || 0} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} placeholder="Display order" className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as TrustedPartnerPayload['status'] })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent">
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            <button disabled={saving || (!form.logoUrl && !logoFile)} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70">{saving ? 'Saving...' : 'Save Partner'}</button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
