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
        onClose();
      }
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (!isOpen) return <></>;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Slide-over */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {deal ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Deal Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter deal name"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Person
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

              {/* Value and Expected Close */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deal Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Close
                  </label>
                  <input
                    type="date"
                    value={formData.expected_close}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_close: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Pipeline Stage */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pipeline Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>

              {/* Win Probability */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Win Probability
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {formData.probability}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tag name"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowTagInput(false); setNewTag(''); }}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-slate-300 text-slate-500 rounded-full text-sm hover:border-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      Add Tag
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this deal..."
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
                disabled={isLoading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : deal ? 'Update Deal' : 'Save Deal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}