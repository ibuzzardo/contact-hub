'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ContactForm from '@/components/ContactForm';

export default function NewContactPage(): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/contacts');
      } else {
        const error = await response.json();
        throw error;
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    router.back();
  };

  return (
    <div className="flex-1">
      <Header title="Add New Contact" subtitle="Fill in the details below to create a new contact.">
        <Link
          href="/contacts"
          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Contacts
        </Link>
      </Header>

      <div className="p-6">
        <ContactForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}