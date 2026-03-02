'use client';

import { useState, useEffect } from 'react';
import { Company } from '@/types';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';

export default function CompaniesPage(): JSX.Element {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm, sortBy, pagination.page]);

  const fetchCompanies = async (): Promise<void> => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        sort: sortBy,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/companies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async (): Promise<void> => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        await fetchCompanies();
        setShowAddCompany(false);
        setNewCompany({
          name: '',
          industry: '',
          website: '',
          phone: '',
          address: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDomain = (website: string): string => {
    if (!website) return '';
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname;
    } catch {
      return website;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Companies" subtitle="Manage and track your business accounts." />
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
      <Header title="Companies" subtitle="Manage and track your business accounts.">
        <button
          onClick={() => setShowAddCompany(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Company
        </button>
      </Header>

      <div className="p-6">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-base">search</span>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="name">Sort by Name</option>
            <option value="industry">Sort by Industry</option>
            <option value="deal_value">Sort by Deal Value</option>
          </select>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Company</th>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Industry</th>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Contacts</th>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Total Value</th>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Open Deals</th>
                  <th className="text-left px-6 py-4 font-medium text-text-main">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {getInitials(company.name)}
                        </div>
                        <div>
                          <div className="font-medium text-text-main">{company.name}</div>
                          {company.website && (
                            <div className="text-sm text-text-muted">{getDomain(company.website)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {company.industry || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm font-medium">
                        {company.contact_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-text-main">
                      ${(company.total_deal_value || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                        {company.open_deal_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-text-muted hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-3 py-1 border rounded text-sm ${
                    page === pagination.page
                      ? 'bg-primary text-white border-primary'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddCompany(false)}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-main">Add New Company</h2>
                  <button
                    onClick={() => setShowAddCompany(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Industry</label>
                    <input
                      type="text"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. Technology, Healthcare"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Website</label>
                    <input
                      type="url"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Address</label>
                    <textarea
                      value={newCompany.address}
                      onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Company address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Notes</label>
                    <textarea
                      value={newCompany.notes}
                      onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddCompany(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCompany}
                    disabled={!newCompany.name}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}