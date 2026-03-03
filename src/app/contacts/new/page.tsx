'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const contact = await response.json();
        router.push(`/contacts/${contact.id}`);
      } else {
        const error = await response.json();
        throw error;
      }
    } catch (error) {
      console.error('Error creating contact:', error);
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
      <Header 
        title="Add New Contact" 
        subtitle="Create a new contact in your CRM"
      />
      
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