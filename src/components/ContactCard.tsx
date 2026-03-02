'use client';

import Link from 'next/link';
import { Contact } from '@/types';
import Avatar from './Avatar';
import GroupBadge from './GroupBadge';
import { useState } from 'react';

interface ContactCardProps {
  contact: Contact;
  groupName?: string;
  onFavoriteToggle?: (contactId: number, isFavorite: boolean) => void;
}

export default function ContactCard({ contact, groupName, onFavoriteToggle }: ContactCardProps): JSX.Element {
  const [isFavorite, setIsFavorite] = useState(contact.favorite === 1);
  const [isToggling, setIsToggling] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    try {
      const response = await fetch(`/api/contacts/${contact.id}/favorite`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        // Revert on error
        setIsFavorite(!newFavoriteState);
      } else {
        onFavoriteToggle?.(contact.id, newFavoriteState);
      }
    } catch (error) {
      // Revert on error
      setIsFavorite(!newFavoriteState);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="group bg-surface-light rounded-xl border border-border-light p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 relative cursor-pointer">
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="absolute top-4 right-4 text-slate-300 hover:text-yellow-400 transition-colors z-10"
        >
          <span className={`material-symbols-outlined ${isFavorite ? 'fill-current text-yellow-400' : ''}`}>
            star
          </span>
        </button>
        
        <div className="flex flex-col items-center text-center">
          <Avatar name={contact.name} size="md" />
          
          <h3 className="font-bold text-text-main mt-3 mb-1">{contact.name}</h3>
          
          {contact.job_title && (
            <p className="text-text-muted text-sm mb-1">{contact.job_title}</p>
          )}
          
          {contact.company && (
            <p className="text-primary text-xs font-semibold mb-3">{contact.company}</p>
          )}
          
          <div className="w-full border-t border-border-light pt-3 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <span className="material-symbols-outlined text-base">mail</span>
              <span className="truncate">{contact.email}</span>
            </div>
            
            {contact.phone && (
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <span className="material-symbols-outlined text-base">call</span>
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
          
          {groupName && (
            <div className="mt-3">
              <GroupBadge name={groupName} />
            </div>
          )}
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </Link>
  );
}