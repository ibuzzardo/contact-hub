'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Company, Contact, Deal } from '@/types';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import { getRelativeTime } from '@/lib/utils';

export default function CompanyDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const companyId = parseInt(params.id as string);
  
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchContacts();
      fetchDeals();
    }
  }, [companyId]);

  const fetchCompany = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else if (response.status === 404) {
        router.push('/companies');
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts?company=${encodeURIComponent(company?.name || '')}`);
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
      const response = await fetch(`/api/deals?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'lead': return 'bg-stage-lead';
      case 'qualified': return 'bg-stage-qualified';
      case 'proposal': return 'bg-stage-proposal';
      case 'negotiation': return 'bg-stage-negotiation';
      case 'won': return 'bg-stage-won';
      case 'lost': return 'bg-stage-lost';
      default: return 'bg-slate-500';
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

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Loading..." subtitle="" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading company...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex-1">
        <Header title="Company Not Found" subtitle="" />
        <div className="p-6">
          <div className="text-center">
            <p className="text-text-muted mb-4">The company you're looking for doesn't exist.</p>
            <Link 
              href="/companies"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Back to Companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title={company.name}
        subtitle={company.industry || 'Company Details'}
      />
      
      <div className="p-6 space-y-8">
        {/* Company Info */}
        <div className="bg-surface-light rounded-xl border border-border-light p-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">domain</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.industry && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Industry</label>
                    <p className="text-text-main mt-1">{company.industry}</p>
                  </div>
                )}
                
                {company.website && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Website</label>
                    <div className="mt-1">
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                      >
                        {company.website}
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    </div>
                  </div>
                )}
                
                {company.phone && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Phone</label>
                    <div className="mt-1">
                      <a 
                        href={`tel:${company.phone}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {company.address && (
                  <div>
                    <label className="text-sm font-medium text-text-muted">Address</label>
                    <p className="text-text-main mt-1">{company.address}</p>
                  </div>
                )}
              </div>
              
              {company.description && (
                <div>
                  <label className="text-sm font-medium text-text-muted">Description</label>
                  <p className="text-text-main mt-1 whitespace-pre-wrap">{company.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Contacts */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-main">Contacts</h3>
              <Link 
                href={`/contacts/new?company=${encodeURIComponent(company.name)}`}
                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
              >
                Add Contact
              </Link>
            </div>
            
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <p className="text-text-muted text-center py-8">No contacts yet</p>
              ) : (
                contacts.slice(0, 6).map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 border border-border-light rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/contacts/${contact.id}`}
                        className="font-medium text-text-main hover:text-primary transition-colors"
                      >
                        {contact.name}
                      </Link>
                      {contact.job_title && (
                        <p className="text-sm text-text-muted">{contact.job_title}</p>
                      )}
                      <p className="text-sm text-text-muted">{contact.email}</p>
                    </div>
                  </div>
                ))
              )}
              
              {contacts.length > 6 && (
                <div className="text-center pt-4">
                  <Link 
                    href={`/contacts?company=${encodeURIComponent(company.name)}`}
                    className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
                  >
                    View all {contacts.length} contacts
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Company Deals */}
          <div className="bg-surface-light rounded-xl border border-border-light p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-main">Deals</h3>
              <Link 
                href="/deals"
                className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {deals.length === 0 ? (
                <p className="text-text-muted text-center py-8">No deals yet</p>
              ) : (
                deals.slice(0, 5).map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="p-4 border border-border-light rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-main">{deal.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-text-muted">
                        <span>{formatCurrency(deal.value)}</span>
                        <span>{deal.probability}% probability</span>
                      </div>
                      {deal.expected_close && (
                        <p className="text-xs text-text-muted mt-1">
                          Expected close: {getRelativeTime(deal.expected_close)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}