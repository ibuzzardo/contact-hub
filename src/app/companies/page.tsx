'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Company } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';

export default function CompaniesPage(): JSX.Element {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, searchTerm]);

  const fetchCompanies = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/companies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        setTotalPages(data.totalPages || 1);
        setTotalCompanies(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Companies" subtitle="Loading companies..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading companies...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Companies" 
        subtitle={`Manage your ${totalCompanies.toLocaleString()} companies`}
      />
      
      <div className="p-6">
        {/* Search */}
        <div className="mb-8">
          <SearchBar 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search companies by name, industry, or website..."
          />
        </div>

        {/* Companies List */}
        {companies.length === 0 ? (
          <EmptyState 
            icon="domain"
            title="No companies found"
            description={searchTerm ? 
              "Try adjusting your search criteria." :
              "Companies will appear here as you add contacts with company information."
            }
          />
        ) : (
          <>
            <div className="bg-surface-light rounded-xl border border-border-light overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-border-light">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Company</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Industry</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Website</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Contacts</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Deals</th>
                      <th className="text-left py-4 px-6 font-medium text-text-main">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">domain</span>
                            </div>
                            <div>
                              <p className="font-medium text-text-main">{company.name}</p>
                              {company.description && (
                                <p className="text-sm text-text-muted truncate max-w-xs">
                                  {company.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {company.industry || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {company.website ? (
                            <a 
                              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              {company.website}
                            </a>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {company.contact_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-text-main">
                            {company.deal_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/companies/${company.id}`}
                            className="text-primary hover:text-primary-dark font-medium transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCompanies}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}