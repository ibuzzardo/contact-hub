'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';

export default function FavoritesPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchFavorites();
  }, [currentPage, searchTerm]);

  const fetchFavorites = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        favorite: '1',
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setTotalPages(data.totalPages || 1);
        setTotalContacts(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFavoriteToggle = (contactId: number, isFavorite: boolean): void => {
    if (!isFavorite) {
      // Remove from favorites list when unfavorited
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setTotalContacts(prev => prev - 1);
    }
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex-1">
        <Header title="Favorites" subtitle="Loading favorite contacts..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading favorites...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title="Favorites" 
        subtitle={`Your ${totalContacts.toLocaleString()} favorite contacts`}
      />
      
      <div className="p-6">
        {/* Search */}
        <div className="mb-8">
          <SearchBar 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search favorite contacts..."
          />
        </div>

        {/* Favorites Grid */}
        {contacts.length === 0 ? (
          <EmptyState 
            icon="star"
            title={searchTerm ? "No favorite contacts found" : "No favorites yet"}
            description={searchTerm ? 
              "Try adjusting your search criteria." :
              "Star contacts to add them to your favorites for quick access."
            }
            action={!searchTerm ? {
              label: "Browse Contacts",
              href: "/contacts"
            } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contacts.map((contact) => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact}
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