'use client';

import { useState, useEffect } from 'react';
import { Deal, Company, Contact } from '@/types';

interface DealSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Deal;
  onSaved: () => void;
}

export default function DealSlideOver({ isOpen, onClose, deal, onSaved }: DealSlideOverProps): JSX.Element {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    contact_id: '',
    value: 0,
    stage: 'lead' as const,
    probability: 10,
    expected_close: '',
    notes: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      fetchContacts();
      
      if (deal) {
        setFormData({
          name: deal.name,
          company_id: deal.company_id?.toString() || '',
          contact_id: deal.contact_id?.toString() || '',
          value: deal.value,
          stage: deal.stage,
          probability: deal.probability,
          expected_close: deal.expected_close ? deal.expected_close.split('T')[0] : '',
          notes: deal.notes || '',
          tags: deal.tags ? deal.tags.split(',').filter(Boolean) : []
        });
      } else {
        setFormData({
          name: '',
          company_id: '',
          contact_id: '',
          value: 0,
          stage: 'lead',
          probability: 10,
          expected_close: '',
          notes: '',
          tags: []
        });
      }
    }
  }, [isOpen, deal]);

  const fetchCompanies = async (): Promise<void> => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsLoading(true);
      
      const dealData = {
        ...formData,
        company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : undefined,
        tags: formData.tags.join(',')
      };

      const url = deal ? `/api/deals/${deal.id}` : '/api/deals';
      const method = deal ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });

      if (response.ok) {
        onSaved();
      }
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addTag = (): void => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const stages = [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  if (!isOpen) return <div></div>;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface-light shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-light">
            <h2 className="text-lg font-semibold text-text-main">
              {deal ? 'Edit Deal' : 'New Deal'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Deal Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-main mb-2">
                  Deal Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter deal name"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company_id" className="block text-sm font-medium text-text-main mb-2">
                  Company
                </label>
                <select
                  id="company_id"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                >
                  <option value="">Select company (optional)</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id.toString()}>
                      {company.name}
                    </option>
                  ))}
                </select>
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

              {/* Value */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-text-main mb-2">
                  Deal Value ($)
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="0.00"
                />
              </div>

              {/* Stage */}
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-text-main mb-2">
                  Stage
                </label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                >
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Probability */}
              <div>
                <label htmlFor="probability" className="block text-sm font-medium text-text-main mb-2">
                  Probability ({formData.probability}%)
                </label>
                <input
                  type="range"
                  id="probability"
                  name="probability"
                  value={formData.probability}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Expected Close */}
              <div>
                <label htmlFor="expected_close" className="block text-sm font-medium text-text-main mb-2">
                  Expected Close Date
                </label>
                <input
                  type="date"
                  id="expected_close"
                  name="expected_close"
                  value={formData.expected_close}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                {showTagInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-1 text-sm border border-border-light rounded bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter tag name"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTagInput(false);
                        setNewTag('');
                      }}
                      className="px-3 py-1 text-sm text-text-muted hover:text-text-main transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    + Add tag
                  </button>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text-main mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  placeholder="Add notes about this deal..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-border-light">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}