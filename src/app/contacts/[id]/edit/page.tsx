'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Contact } from '@/types';
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
  const [error, setError] = useState('');
  const [contactId, setContactId] = useState<string>('');

  useEffect(() => {
    const getParams = async (): Promise<void> => {
      const resolvedParams = await params;
      setContactId(resolvedParams.id);
    };
    getParams();
  }, [params]);

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
      } else {
        setError('Contact not found');
      }
    } catch (error) {
      setError('Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any): Promise<void> => {
    setIsSubmitting(true);
    setError('');
    
    try {
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
        const errorData = await response.json();
        if (response.status === 400 && errorData.details) {
          throw errorData;
        } else {
          setError(errorData.error || 'Failed to update contact');
        }
      }
    } catch (error: any) {
      if (error.details) {
        throw error;
      } else {
        setError('Failed to update contact');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    router.push(`/contacts/${contactId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !contact) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => router.push('/contacts')} className="btn-primary">
              Back to Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Contact</h1>
          <p className="text-gray-600">Update contact information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="card">
          {contact && (
            <ContactForm
              contact={contact}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}