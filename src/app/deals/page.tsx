'use client';

import { useState, useEffect } from 'react';
import { Deal, Company, Contact } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import DealSlideOver from '@/components/DealSlideOver';

const STAGES = [
  { key: 'lead', name: 'Lead', color: 'bg-slate-400' },
  { key: 'qualified', name: 'Qualified', color: 'bg-blue-500' },
  { key: 'proposal', name: 'Proposal', color: 'bg-yellow-400' },
  { key: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
  { key: 'closed_won', name: 'Closed Won', color: 'bg-green-500' },
  { key: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500' },
];

export default function DealsPage(): JSX.Element {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newDeal, setNewDeal] = useState({
    name: '',
    company_id: '',
    contact_id: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    expected_close: '',
    notes: '',
    tags: [] as string[]
  });

  useEffect(() => {
    fetchDeals();
    fetchCompanies();
    fetchContacts();
  }, []);

  const fetchDeals = async (): Promise<void> => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddDeal = async (): Promise<void> => {
    try {
      const dealData = {
        ...newDeal,
        company_id: newDeal.company_id ? parseInt(newDeal.company_id) : undefined,
        contact_id: newDeal.contact_id ? parseInt(newDeal.contact_id) : undefined,
      };

      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      });

      if (response.ok) {
        await fetchDeals();
        setShowAddDeal(false);
        setNewDeal({
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
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageDeals = (stageKey: string): Deal[] => {
    return deals.filter(deal => deal.stage === stageKey);
  };

  const getStageValue = (stageKey: string): number => {
    return getStageDeals(stageKey).reduce((sum, deal) => sum + deal.value, 0);
  };

  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deal.company_name && deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Deals Pipeline" subtitle="Manage your sales opportunities" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading deals...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header title="Deals Pipeline" subtitle="Manage your sales opportunities">
        <button
          onClick={() => setShowAddDeal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Deal
        </button>
      </Header>

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageDeals = getStageDeals(stage.key).filter(deal => 
              deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (deal.company_name && deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return (
              <div key={stage.key} className="flex-shrink-0 w-80">
                {/* Stage Header */}
                <div className="bg-surface-light rounded-lg p-4 mb-4 border border-border-light">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-text-main">{stage.name}</h3>
                    </div>
                    <span className="bg-surface text-text-muted px-2 py-1 rounded-full text-sm font-medium">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-sm text-text-muted">
                    {formatCurrency(stageValue)}
                  </div>
                </div>

                {/* Deal Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="bg-surface border border-border-light rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-text-main line-clamp-2">{deal.name}</h4>
                        <span className="text-lg font-bold text-primary ml-2 flex-shrink-0">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                      
                      {deal.company_name && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-text-muted text-sm">business</span>
                          <span className="text-sm text-text-muted">{deal.company_name}</span>
                        </div>
                      )}
                      
                      {deal.contact_name && (
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar name={deal.contact_name} size="xs" />
                          <span className="text-sm text-text-muted">{deal.contact_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted font-medium">{deal.probability}%</span>
                        </div>
                        
                        {deal.expected_close && (
                          <span className="text-xs text-text-muted">
                            {new Date(deal.expected_close).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Deal Modal */}
        {showAddDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-main">Add New Deal</h2>
                <button
                  onClick={() => setShowAddDeal(false)}
                  className="p-2 hover:bg-surface-light rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-text-muted">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Deal Name *</label>
                  <input
                    type="text"
                    value={newDeal.name}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter deal name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Company</label>
                  <select
                    value={newDeal.company_id}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, company_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Contact</label>
                  <select
                    value={newDeal.contact_id}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, contact_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="">Select contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Value</label>
                    <input
                      type="number"
                      value={newDeal.value}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Probability (%)</label>
                    <input
                      type="number"
                      value={newDeal.probability}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, stage: e.target.value }))}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    {STAGES.map(stage => (
                      <option key={stage.key} value={stage.key}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Expected Close Date</label>
                  <input
                    type="date"
                    value={newDeal.expected_close}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, expected_close: e.target.value }))}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Notes</label>
                  <textarea
                    value={newDeal.notes}
                    onChange={(e) => setNewDeal(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Add notes about this deal..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddDeal(false)}
                  className="px-4 py-2 text-text-muted border border-border-light rounded-lg hover:bg-surface-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDeal}
                  disabled={!newDeal.name.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Deal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deal Slide Over */}
      <DealSlideOver
        isOpen={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        onSaved={() => {
          fetchDeals();
          setShowAddDeal(false);
        }}
      />
    </div>
  );
}