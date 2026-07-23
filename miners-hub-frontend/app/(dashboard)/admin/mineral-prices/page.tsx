'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import FormModal from '../../../../components/FormModal';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../lib/currency';
import {
  createMineralPriceOverride,
  deleteMineralPriceOverride,
  getAdminMineralPriceOverrides,
  MineralPriceOverride,
  MineralPriceOverridePayload,
  updateMineralPriceOverride,
} from '../../../../lib/api/mineral-prices';

type MineralPriceForm = {
  name: string;
  symbol: string;
  price: string;
  change: string;
  source: string;
  displayOrder: string;
  status: 'draft' | 'published';
};

const emptyForm = {
  name: '',
  symbol: '',
  price: '',
  change: '0',
  source: 'Admin reference',
  displayOrder: '100',
  status: 'published',
} satisfies MineralPriceForm;

export default function AdminMineralPricesPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [prices, setPrices] = useState<MineralPriceOverride[]>([]);
  const [form, setForm] = useState<MineralPriceForm>(emptyForm);
  const [editing, setEditing] = useState<MineralPriceOverride | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPrices = async () => {
    setLoading(true);
    setError('');
    try {
      setPrices(await getAdminMineralPriceOverrides());
    } catch (err: any) {
      setError(err?.message || 'Failed to load mineral prices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (currentUser?.role === 'admin') void loadPrices();
  }, [currentUser, router]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setIsFormOpen(true);
  };

  const openEdit = (price: MineralPriceOverride) => {
    setEditing(price);
    setForm({
      name: price.name,
      symbol: price.symbol,
      price: formatCurrencyInput(price.price),
      change: String(price.change),
      source: price.source,
      displayOrder: String(price.displayOrder),
      status: price.status,
    });
    setError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const toPayload = (): MineralPriceOverridePayload => ({
    name: form.name.trim(),
    symbol: form.symbol.trim(),
    price: parseCurrencyInput(form.price),
    change: Number(form.change || 0),
    source: form.source.trim() || 'Admin reference',
    displayOrder: Number(form.displayOrder || 100),
    status: form.status,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload();
      if (editing) {
        await updateMineralPriceOverride(editing.id, payload);
      } else {
        await createMineralPriceOverride(payload);
      }
      closeForm();
      await loadPrices();
    } catch (err: any) {
      setError(err?.message || 'Failed to save mineral price.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (price: MineralPriceOverride) => {
    if (!confirm(`Delete ${price.name} from admin mineral prices?`)) return;
    setError('');
    try {
      await deleteMineralPriceOverride(price.id);
      setPrices((current) => current.filter((item) => item.id !== price.id));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete mineral price.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mineral Price Materials</h1>
          <p className="text-text-secondary">
            Add local materials or override external reference prices shown on the public homepage.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400"
        >
          Add Material
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-secondary">
        <table className="w-full text-left">
          <thead className="bg-primary/50 text-xs uppercase text-text-muted">
            <tr>
              <th className="p-4">Material</th>
              <th className="p-4 text-right">USD Price</th>
              <th className="p-4 text-right">Change</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">Loading materials...</td></tr>
            ) : prices.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-text-muted">No admin materials added yet.</td></tr>
            ) : prices.map((price) => (
              <tr key={price.id} className="text-sm">
                <td className="p-4">
                  <div className="font-semibold text-text-primary">{price.name}</div>
                  <div className="text-xs text-text-muted">{price.symbol}</div>
                </td>
                <td className="p-4 text-right font-semibold text-text-primary">
                  ${Number(price.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`p-4 text-right font-semibold ${Number(price.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(price.change) >= 0 ? '+' : ''}{Number(price.change).toFixed(2)}%
                </td>
                <td className="p-4 text-text-secondary">{price.source}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    price.status === 'published' ? 'bg-green-500/15 text-green-300' : 'bg-yellow-500/15 text-yellow-300'
                  }`}>
                    {price.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(price)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent">Edit</button>
                    <button onClick={() => void handleDelete(price)} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isFormOpen}
        title={editing ? 'Edit Material Price' : 'Add Material Price'}
        description="Use the same symbol as an external item to override it, or a new symbol to add another material."
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">Material name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">Symbol</span>
              <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} required placeholder="Au, Li, Sn" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">USD price</span>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: formatCurrencyInput(e.target.value) })} required inputMode="numeric" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">Change %</span>
              <input type="number" step="0.01" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">Source</span>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary">
              <span className="mb-1 block font-semibold">Display order</span>
              <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
            </label>
            <label className="text-sm text-text-secondary md:col-span-2">
              <span className="mb-1 block font-semibold">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeForm} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Material'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
