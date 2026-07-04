'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from '../../../../lib/api/admin';
import { uploadImage } from '../../../../lib/api/media';
import type { Event } from '../../../../lib/types';
import type { EventPayload } from '../../../../lib/api/events';

const emptyForm: EventPayload = {
  title: '',
  description: '',
  date: '',
  location: '',
  imageUrl: '',
  registrationUrl: '',
  featured: false,
  status: 'published',
};

export default function AdminEventsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState<EventPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string>('');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (currentUser?.role === 'admin') {
      void fetchEvents();
    }
  }, [currentUser, router]);

  useEffect(() => {
    return () => {
      if (eventImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(eventImagePreview);
      }
    };
  }, [eventImagePreview]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setEventImageFile(null);
    setEventImagePreview('');
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a JPG or PNG image.');
      return;
    }

    if (eventImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(eventImagePreview);
    }
    setEventImageFile(file);
    setEventImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let imageUrl = formData.imageUrl;
      if (eventImageFile) {
        const uploaded = await uploadImage(eventImageFile, 'event');
        imageUrl = uploaded.secureUrl;
      }

      const payload: EventPayload = {
        ...formData,
        imageUrl,
        description: formData.description || undefined,
        registrationUrl: formData.registrationUrl || undefined,
      };

      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        setEvents((current) => current.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await createEvent(payload);
        setEvents((current) => [created, ...current]);
      }
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      location: event.location,
      imageUrl: event.imageUrl,
      registrationUrl: event.registrationUrl || '',
      featured: Boolean(event.featured),
      status: event.status || 'published',
    });
    setEventImageFile(null);
    setEventImagePreview(event.imageUrl);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;

    try {
      await deleteEvent(id);
      setEvents((current) => current.filter((event) => event.id !== id));
      if (editingId === id) resetForm();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete event');
    }
  };

  if (loading) return <div className="p-8">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Events</h1>
        <p className="text-text-secondary">Create and manage homepage featured and upcoming events.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-secondary rounded-xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Title</span>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Date</span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Location</span>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-secondary">Status</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-text-secondary">Event Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
              required={!formData.imageUrl}
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
            {(eventImagePreview || formData.imageUrl) && (
              <img
                src={eventImagePreview || formData.imageUrl}
                alt="Event preview"
                className="mt-3 h-36 w-full rounded-lg border border-border object-cover"
              />
            )}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-text-secondary">Registration URL</span>
            <input
              name="registrationUrl"
              value={formData.registrationUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-text-secondary">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full bg-primary border border-border rounded-lg p-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="featured"
              checked={Boolean(formData.featured)}
              onChange={handleChange}
              className="h-4 w-4 accent-accent"
            />
            Feature this event first
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md bg-border hover:bg-border/80 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-md bg-accent text-accent-content font-semibold hover:bg-yellow-400 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : editingId ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-secondary rounded-xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/50 text-text-secondary text-sm">
              <th className="p-4 font-semibold border-b border-border">Event</th>
              <th className="p-4 font-semibold border-b border-border">Date</th>
              <th className="p-4 font-semibold border-b border-border">Location</th>
              <th className="p-4 font-semibold border-b border-border">Status</th>
              <th className="p-4 font-semibold border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-border hover:bg-primary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={event.imageUrl} alt={event.title} className="w-16 h-12 rounded-md object-cover bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{event.title}</p>
                      {event.featured && <p className="text-xs text-accent">Featured</p>}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-text-secondary">{new Date(event.date).toLocaleDateString()}</td>
                <td className="p-4 text-sm text-text-secondary">{event.location}</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-text-secondary capitalize">
                    {event.status || 'published'}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 bg-border hover:bg-border/80 rounded text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
