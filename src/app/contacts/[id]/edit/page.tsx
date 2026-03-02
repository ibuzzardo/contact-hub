'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contact } from '@/types';
import Header from '@/components/Header';
import ContactForm from '@/components/ContactForm';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export default function EditContactPage({ params }: EditContactPageProps): JSX.Element {
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactId, setContactId] = useState<string>('');

  useEffect(() => {
    const getParams = async (): Promise<void> => {
      const { id } = await params;
      setContactId(id);
      fetchContact(id);
    };
    getParams();
  }, [params]);

  const fetchContact = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
      } else {
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      router.push('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any): Promise<void> => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(`/contacts/${contactId}`);
      } else {
        const error = await response.json();
        throw error;
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push(`/contacts/${contactId}`);
  };

  if (loading) {
    return (
      <div className="flex-1">
        <Header title="Edit Contact" />
        <LoadingSpinner />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex-1">
        <Header title="Contact Not Found" />
        <div className="p-6">
          <p className="text-text-muted">The contact you're looking for doesn't exist.</p>
          <Link href="/contacts" className="text-primary hover:text-primary-dark font-medium">
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Header title="Edit Contact" subtitle={`Update ${contact.name}'s information`}>
        <Link
          href={`/contacts/${contactId}`}
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Contact
        </Link>
      </Header>

      <div className="p-6">
        <ContactForm
          contact={contact}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}