'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Contact } from '@/types';
import Header from '@/components/Header';
import ContactForm from '@/components/ContactForm';

export default function EditContactPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const contactId = parseInt(params.id as string);
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const fetchContact = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      } else if (response.status === 404) {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: any): Promise<void> => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        router.push(`/contacts/${contactId}`);
      } else {
        const error = await response.json();
        throw error;
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (): void => {
    router.push(`/contacts/${contactId}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Loading..." subtitle="" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-text-muted">Loading contact...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex-1">
        <Header title="Contact Not Found" subtitle="" />
        <div className="p-6">
          <div className="text-center">
            <p className="text-text-muted mb-4">The contact you're trying to edit doesn't exist.</p>
            <button 
              onClick={() => router.push('/contacts')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              Back to Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header 
        title={`Edit ${contact.name}`}
        subtitle="Update contact information"
      />
      
      <div className="p-6">
        <ContactForm 
          contact={contact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}