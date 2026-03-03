'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Deal, Contact, Company } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import DealSlideOver from '@/components/DealSlideOver';
import EmptyState from '@/components/EmptyState';
import { getRelativeTime } from '@/lib/utils';

export default function DealsPage(): JSX.Element {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>(undefined);
  const itemsPerPage = 20;

  const stages = [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' }
  ];

  useEffect(() => {
    fetchDeals();
    fetchContacts();
    fetchCompanies();
  }, [currentPage, searchTerm, selectedStage]);

  const fetchDeals = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStage && { stage: selectedStage })
      });
      
      const response = await fetch(`/api/deals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data || []);
        // Note: API doesn't return pagination info yet
        setTotalDeals(data?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
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

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStageFilter = (stage: string): void => {
    setSelectedStage(stage);
    setCurrentPage(1);
  };

  const handleEditDeal = (deal: Deal): void => {
    setSelectedDeal(deal);
    setShowSlideOver(true);
  };

  const handleNewDeal = (): void => {
    setSelectedDeal(undefined);
    setShowSlideOver(true);
  };

  const getContactName = (contactId: number): string => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || '';
  };

  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || '';
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Deals" subtitle="Loading deals..." />
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
      <Header 
        title="Deals" 
        subtitle={`Manage your ${totalDeals.toLocaleString()} deals`}
        action={
          <button
            onClick={handleNewDeal}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Deal
          </button>
        }
      />
      
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search deals by name, company, or contact..."
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedStage}
              onChange={(e) => handleStageFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Stages</option>
              {stages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <EmptyState 
            icon="handshake"
            title="No deals found"
            description={searchTerm || selectedStage ? 
              "Try adjusting your search or filter criteria." :
              "Get started by creating your first deal."
            }
            action={!searchTerm && !selectedStage ? {
              label: "New Deal",
              onClick: handleNewDeal
            } : undefined}
          />
        ) : (
          <>
            <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-border-light">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Deal</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Company</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Contact</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Value</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Stage</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Probability</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Expected Close</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">handshake</span>
                            </div>
                            <div>
                              <p className="font-medium text-text-main">{deal.name}</p>
                              {deal.notes && (
                                <p className="text-sm text-text-muted truncate max-w-xs">
                                  {deal.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {deal.company_id ? getCompanyName(deal.company_id) : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {deal.contact_id ? getContactName(deal.contact_id) : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-text-main">
                            {formatCurrency(deal.value)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStageColor(deal.stage)}`}>
                            {deal.stage.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">{deal.probability}%</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {deal.expected_close ? getRelativeTime(deal.expected_close) : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/deals/${deal.id}`}
                              className="text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleEditDeal(deal)}
                              className="text-text-muted hover:text-text-main transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalDeals}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <DealSlideOver 
        isOpen={showSlideOver}
        onClose={() => setShowSlideOver(false)}
        deal={selectedDeal}
        onSaved={() => {
          setShowSlideOver(false);
          fetchDeals();
        }}
      />
    </div>
  );
}