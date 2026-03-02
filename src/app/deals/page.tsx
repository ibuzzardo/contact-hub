'use client';

import { useState, useEffect } from 'react';
import { Deal, Company, Contact } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';

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

  const filteredDeals = deals.filter(deal => 
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredDeals.filter(deal => deal.stage === stage.key);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalPipelineValue = filteredDeals
    .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0);

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Deals Pipeline" />
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
      <Header title="Deals Pipeline" subtitle={`Total Pipeline Value: $${totalPipelineValue.toLocaleString()}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-base">search</span>
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button className="px-3 py-1 bg-white rounded-md text-sm font-medium text-primary shadow-sm">
              Kanban
            </button>
            <button className="px-3 py-1 text-sm font-medium text-text-muted" disabled>
              List
            </button>
          </div>
          <button
            onClick={() => setShowAddDeal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Deal
          </button>
        </div>
      </Header>

      <div className="p-6">
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage.key] || [];
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return (
              <div key={stage.key} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-xl border border-slate-200 h-full">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <h3 className="font-bold text-sm uppercase text-text-main">{stage.name}</h3>
                      </div>
                      <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-medium">
                        {stageDeals.length}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      ${stageValue.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className={`relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 ${
                          deal.stage === 'closed_won' ? 'opacity-80 hover:opacity-100' : 
                          deal.stage === 'closed_lost' ? 'opacity-60 hover:opacity-90' : ''
                        }`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${stage.color}`}></div>
                        
                        <div className="ml-2">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-bold text-sm text-text-main ${
                              deal.stage === 'closed_lost' ? 'line-through' : ''
                            }`}>
                              {deal.name}
                            </h4>
                            {deal.stage === 'closed_won' && (
                              <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                            )}
                            {deal.stage === 'closed_lost' && (
                              <span className="material-symbols-outlined text-red-500 text-base">cancel</span>
                            )}
                          </div>
                          
                          {deal.company_name && (
                            <p className="text-xs text-slate-500 mb-2">{deal.company_name}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-sm text-text-main">
                              ${deal.value.toLocaleString()}
                            </span>
                            {deal.expected_close && (
                              <span className="text-[10px] text-slate-400">
                                {new Date(deal.expected_close).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {deal.contact_name && (
                            <div className="flex items-center gap-2">
                              <Avatar name={deal.contact_name} size="sm" />
                              <span className="text-xs text-slate-600">{deal.contact_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Deal Slide-over */}
      {showAddDeal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddDeal(false)}></div>
          <div className="absolute right-0 top-0 h-full w-[400px] bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text-main">Add New Deal</h2>
                  <button
                    onClick={() => setShowAddDeal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Deal Name *</label>
                  <input
                    type="text"
                    value={newDeal.name}
                    onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter deal name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Company</label>
                  <select
                    value={newDeal.company_id}
                    onChange={(e) => setNewDeal({ ...newDeal, company_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Contact Person</label>
                  <select
                    value={newDeal.contact_id}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Deal Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={newDeal.value}
                      onChange={(e) => setNewDeal({ ...newDeal, value: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Expected Close</label>
                  <input
                    type="date"
                    value={newDeal.expected_close}
                    onChange={(e) => setNewDeal({ ...newDeal, expected_close: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Pipeline Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">
                    Win Probability: {newDeal.probability}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newDeal.probability}
                    onChange={(e) => setNewDeal({ ...newDeal, probability: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Notes</label>
                  <textarea
                    value={newDeal.notes}
                    onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Add notes..."
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setShowAddDeal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDeal}
                  disabled={!newDeal.name}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}