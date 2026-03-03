'use client';

import { useState, useEffect } from 'react';
import { Contact, Deal } from '@/types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultDealId?: number;
  defaultContactId?: number;
}

export default function ActivityModal({ isOpen, onClose, onSaved, defaultDealId, defaultContactId }: ActivityModalProps): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    subject: '',
    contact_id: '',
    deal_id: '',
    activity_date: '',
    duration_minutes: '',
    outcome: '' as '' | 'positive' | 'neutral' | 'negative',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      fetchDeals();
      
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        type: 'call',
        subject: '',
        contact_id: defaultContactId?.toString() || '',
        deal_id: defaultDealId?.toString() || '',
        activity_date: localDateTime,
        duration_minutes: '',
        outcome: '',
        description: ''
      });
    }
  }, [isOpen, defaultContactId, defaultDealId]);

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchDeals = async (): Promise<void> => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    try {
      setIsLoading(true);
      
      const activityData = {
        type: formData.type,
        subject: formData.subject,
        description: formData.description || undefined,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : undefined,
        deal_id: formData.deal_id ? parseInt(formData.deal_id) : undefined,
        activity_date: formData.activity_date || new Date().toISOString(),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        outcome: formData.outcome || undefined
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });

      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return <div></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-surface-light rounded-xl border border-border-light p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-main">Log Activity</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-text-main mb-2">
              Activity Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-main mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              placeholder="Enter activity subject"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact_id" className="block text-sm font-medium text-text-main mb-2">
              Contact
            </label>
            <select
              id="contact_id"
              name="contact_id"
              value={formData.contact_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Select contact (optional)</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id.toString()}>
                  {contact.name} - {contact.email}
                </option>
              ))}
            </select>
          </div>

          {/* Deal */}
          <div>
            <label htmlFor="deal_id" className="block text-sm font-medium text-text-main mb-2">
              Deal
            </label>
            <select
              id="deal_id"
              name="deal_id"
              value={formData.deal_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Select deal (optional)</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id.toString()}>
                  {deal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Date */}
          <div>
            <label htmlFor="activity_date" className="block text-sm font-medium text-text-main mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="activity_date"
              name="activity_date"
              value={formData.activity_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Duration */}
          {(formData.type === 'call' || formData.type === 'meeting') && (
            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-text-main mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                placeholder="30"
              />
            </div>
          )}

          {/* Outcome */}
          <div>
            <label htmlFor="outcome" className="block text-sm font-medium text-text-main mb-2">
              Outcome
            </label>
            <select
              id="outcome"
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Select outcome (optional)</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-main mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
              placeholder="Add details about this activity..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.subject.trim()}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}