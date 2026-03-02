'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Contact, Group, PaginatedResponse } from '@/types';
import ContactCard from '@/components/ContactCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ContactsPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [searchQuery, selectedGroup, currentPage]);

  const fetchGroups = async (): Promise<void> => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const fetchContacts = async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroup) params.append('group', selectedGroup);

      const response = await fetch(`/api/contacts?${params}`);
      if (response.ok) {
        const data: PaginatedResponse<Contact> = await response.json();
        setContacts(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleGroupFilter = (groupId: string): void => {
    setSelectedGroup(groupId);
    setCurrentPage(1);
  };

  const getGroupName = (groupId: number): string => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || '';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <Link href="/contacts/new" className="btn-primary">
            Add Contact
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by name or email..."
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedGroup}
              onChange={(e) => handleGroupFilter(e.target.value)}
              className="input"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2">
          {total} contact{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : contacts.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedGroup ? 'No contacts match your search' : 'No contacts yet'}
          </p>
          {!searchQuery && !selectedGroup && (
            <Link href="/contacts/new" className="btn-primary">
              Create Your First Contact
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                groupName={contact.group_id ? getGroupName(contact.group_id) : undefined}
              />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}