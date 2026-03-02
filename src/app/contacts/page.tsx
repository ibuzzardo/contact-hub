'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Contact, Group } from '@/types';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ContactCard from '@/components/ContactCard';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContactsResponse {
  contacts: Contact[];
  groups: Group[];
  total: number;
}

export default function ContactsPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const itemsPerPage = 12;

  const fetchContacts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortBy,
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroup) params.append('group', selectedGroup);
      
      const response = await fetch(`/api/contacts?${params}`);
      if (response.ok) {
        const data: ContactsResponse = await response.json();
        setContacts(data.contacts);
        setGroups(data.groups);
        setTotalContacts(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedGroup, sortBy]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGroup, sortBy]);

  const handleFavoriteToggle = (contactId: number, isFavorite: boolean): void => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, favorite: isFavorite ? 1 : 0 }
        : contact
    ));
  };

  const getGroupName = (groupId?: number): string | undefined => {
    if (!groupId) return undefined;
    const group = groups.find(g => g.id === groupId);
    return group?.name;
  };

  const totalPages = Math.ceil(totalContacts / itemsPerPage);

  return (
    <div className="flex-1">
      <Header 
        title="All Contacts"
        subtitle={`${totalContacts} contact${totalContacts !== 1 ? 's' : ''} in your network`}
      >
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Contact
        </Link>
      </Header>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search by name, email, or company..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-border-light rounded-lg text-sm font-medium text-text-main hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filters
            </button>
            
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 bg-surface-light border border-border-light rounded-lg text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-surface-light border border-border-light rounded-lg text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="name-asc">A-Z</option>
              <option value="name-desc">Z-A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="company">Company</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">list</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon="group"
            message={searchQuery || selectedGroup ? "No contacts found matching your criteria." : "No contacts yet. Create your first contact to get started."}
            actionText={!searchQuery && !selectedGroup ? "Add Contact" : undefined}
            onAction={!searchQuery && !selectedGroup ? () => window.location.href = '/contacts/new' : undefined}
          />
        ) : (
          <>
            {/* Contact Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  groupName={getGroupName(contact.group_id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalContacts}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}