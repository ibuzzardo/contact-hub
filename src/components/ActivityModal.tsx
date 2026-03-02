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
        onClose();
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activityTypes = [
    { key: 'call', label: 'Call', icon: 'phone' },
    { key: 'email', label: 'Email', icon: 'email' },
    { key: 'meeting', label: 'Meeting', icon: 'groups' },
    { key: 'note', label: 'Note', icon: 'description' }
  ];

  const showDurationAndOutcome = formData.type === 'call' || formData.type === 'meeting';

  if (!isOpen) return <></>;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Log Activity</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-80px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Activity Type
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {activityTypes.map(type => (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.key as any }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-center ${
                        formData.type === type.key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl block mb-2">
                        {type.icon}
                      </span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter activity subject"
                  required
                />
              </div>

              {/* Contact and Deal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact
                  </label>
                  <select
                    value={formData.contact_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deal
                  </label>
                  <select
                    value={formData.deal_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, deal_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select deal</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>
                        {deal.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.activity_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Duration and Outcome (conditional) */}
              {showDurationAndOutcome && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="30"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Outcome
                    </label>
                    <select
                      value={formData.outcome}
                      onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select outcome</option>
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes/Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this activity..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.subject.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Activity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}