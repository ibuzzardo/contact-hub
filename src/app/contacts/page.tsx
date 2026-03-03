'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Contact, Group } from '@/types';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';

export default function ContactsPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, [currentPage, searchTerm, selectedGroup]);

  const fetchContacts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGroup && { group: selectedGroup })
      });
      
      const response = await fetch(`/api/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setTotalPages(data.totalPages || 1);
        setTotalContacts(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (): Promise<void> => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleGroupFilter = (groupId: string): void => {
    setSelectedGroup(groupId);
    setCurrentPage(1);
  };

  const handleFavoriteToggle = (contactId: number, isFavorite: boolean): void => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, favorite: isFavorite ? 1 : 0 }
        : contact
    ));
  };

  const getGroupName = (groupId: number): string => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || '';
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Contacts" subtitle="Loading contacts..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading contacts...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Contacts" 
        subtitle={`Manage your ${totalContacts.toLocaleString()} contacts`}
        action={
          <Link 
            href="/contacts/new"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary/30"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Contact
          </Link>
        }
      />
      
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search contacts by name, email, or company..."
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border-light rounded-lg bg-surface-light text-text-main focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id.toString()}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contacts Grid */}
        {contacts.length === 0 ? (
          <EmptyState 
            icon="group"
            title="No contacts found"
            description={searchTerm || selectedGroup ? 
              "Try adjusting your search or filter criteria." :
              "Get started by adding your first contact."
            }
            action={!searchTerm && !selectedGroup ? {
              label: "Add Contact",
              href: "/contacts/new"
            } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contacts.map((contact) => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact}
                  groupName={contact.group_id ? getGroupName(contact.group_id) : undefined}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
            
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