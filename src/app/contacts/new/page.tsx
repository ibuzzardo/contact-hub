'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContactForm from '@/components/ContactForm';

export default function NewContactPage(): JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: any): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
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
        const errorData = await response.json();
        if (response.status === 400 && errorData.details) {
          throw errorData;
        } else {
          setError(errorData.error || 'Failed to create contact');
        }
      }
    } catch (error: any) {
      if (error.details) {
        throw error;
      } else {
        setError('Failed to create contact');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    router.push('/contacts');
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Contact</h1>
          <p className="text-gray-600">Add a new contact to your directory</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="card">
          <ContactForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}