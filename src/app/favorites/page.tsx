'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Contact, Group } from '@/types';
import Header from '@/components/Header';
import ContactCard from '@/components/ContactCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

interface FavoritesResponse {
  contacts: Contact[];
  groups: Group[];
  total: number;
}

export default function FavoritesPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts?favorite=true');
      if (response.ok) {
        const data: FavoritesResponse = await response.json();
        setContacts(data.contacts);
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = (contactId: number, isFavorite: boolean): void => {
    if (!isFavorite) {
      // Remove from favorites list
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } else {
      // Update the contact in the list
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, favorite: 1 }
          : contact
      ));
    }
  };

  const getGroupName = (groupId?: number): string | undefined => {
    if (!groupId) return undefined;
    const group = groups.find(g => g.id === groupId);
    return group?.name;
  };

  return (
    <div className="flex-1">
      <Header 
        title="Favorites"
        subtitle={`${contacts.length} favorite contact${contacts.length !== 1 ? 's' : ''}`}
      >
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-xl">star</span>
        </div>
      </Header>

      <div className="p-6">
        {loading ? (
          <LoadingSpinner />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon="star"
            message="No favorites yet. Star contacts to see them here."
            actionText="Browse Contacts"
            onAction={() => window.location.href = '/contacts'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                groupName={getGroupName(contact.group_id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}