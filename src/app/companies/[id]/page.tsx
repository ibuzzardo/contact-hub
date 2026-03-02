'use client';

import { useState, useEffect } from 'react';
import { Company, Contact, Deal } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps): JSX.Element {
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState('contacts');
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const getParams = async (): Promise<void> => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setCompanyId(id);
      if (!isNaN(id)) {
        fetchCompany(id);
        fetchContacts(id);
        fetchDeals(id);
      }
    };
    getParams();
  }, [params]);

  const fetchCompany = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts?company_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchDeals = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/deals?company_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Loading..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading company details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex-1">
        <Header title="Company Not Found" />
        <div className="p-6">
          <div className="text-center">
            <div className="text-text-muted">The requested company could not be found.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header title={company.name}>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-base">more_vert</span>
            More Actions
          </button>
        </div>
      </Header>

      <div className="p-6">
        {/* Company Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
              {getInitials(company.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text-main">{company.name}</h1>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Active Client
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <span className="material-symbols-outlined text-base">link</span>
                    Website
                  </a>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <span className="material-symbols-outlined text-base">call</span>
                    {company.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-500">group</span>
                <span className="text-sm font-medium text-text-muted">Total Contacts</span>
              </div>
              <div className="text-2xl font-bold text-text-main">{company.contact_count || 0}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-500">folder_open</span>
                <span className="text-sm font-medium text-text-muted">Open Deals</span>
              </div>
              <div className="text-2xl font-bold text-text-main">{company.open_deal_count || 0}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-green-500">attach_money</span>
                <span className="text-sm font-medium text-text-muted">Lifetime Value</span>
              </div>
              <div className="text-2xl font-bold text-text-main">{formatCurrency(company.total_deal_value || 0)}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-purple-500">schedule</span>
                <span className="text-sm font-medium text-text-muted">Last Activity</span>
              </div>
              <div className="text-2xl font-bold text-text-main">2d ago</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'contacts', label: 'Contacts', icon: 'group' },
                { key: 'deals', label: 'Deals', icon: 'handshake' },
                { key: 'activities', label: 'Activities', icon: 'timeline' },
                { key: 'notes', label: 'Notes', icon: 'note' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'contacts' && (
              <div>
                {contacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar name={contact.name} size="sm" />
                          <div>
                            <div className="font-medium text-text-main">{contact.name}</div>
                            {contact.job_title && (
                              <div className="text-sm text-text-muted">{contact.job_title}</div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-text-muted">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">mail</span>
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">call</span>
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">group</span>
                    <div className="text-text-muted">No contacts found for this company.</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deals' && (
              <div>
                {deals.length > 0 ? (
                  <div className="space-y-4">
                    {deals.map((deal) => (
                      <div key={deal.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-text-main">{deal.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deal.stage === 'closed_won' ? 'bg-green-100 text-green-700' :
                            deal.stage === 'closed_lost' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {deal.stage.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-text-muted">
                          <span>{formatCurrency(deal.value)}</span>
                          {deal.expected_close && (
                            <span>Expected: {new Date(deal.expected_close).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">handshake</span>
                    <div className="text-text-muted">No deals found for this company.</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">timeline</span>
                <div className="text-text-muted">Activity tracking coming soon.</div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                {company.notes ? (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-text-main whitespace-pre-wrap">{company.notes}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">note</span>
                    <div className="text-text-muted">No notes added for this company.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}