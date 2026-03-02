'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

interface DeleteContactButtonProps {
  contactId: number;
  contactName: string;
}

export default function DeleteContactButton({ contactId, contactName }: DeleteContactButtonProps): JSX.Element {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/contacts');
      } else {
        console.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-base mr-2">delete</span>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}