'use client';

import { useState, useEffect } from 'react';
import { Contact, Group } from '@/types';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ContactForm({ contact, onSubmit, onCancel, isLoading = false }: ContactFormProps): JSX.Element {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    group_id: contact?.group_id || '',
    notes: contact?.notes || '',
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (): Promise<void> => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrors({});
    
    try {
      const submitData = {
        ...formData,
        group_id: formData.group_id ? parseInt(formData.group_id as string) : undefined,
      };
      await onSubmit(submitData);
    } catch (error: any) {
      if (error.details) {
        const fieldErrors: Record<string, string> = {};
        error.details.forEach((detail: any) => {
          if (detail.path) {
            fieldErrors[detail.path[0]] = detail.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input ${errors.name ? 'border-destructive' : ''}`}
          required
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`input ${errors.email ? 'border-destructive' : ''}`}
          required
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`input ${errors.phone ? 'border-destructive' : ''}`}
        />
        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`input ${errors.company ? 'border-destructive' : ''}`}
        />
        {errors.company && <p className="mt-1 text-sm text-destructive">{errors.company}</p>}
      </div>

      <div>
        <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
          Group
        </label>
        <select
          id="group_id"
          name="group_id"
          value={formData.group_id}
          onChange={handleChange}
          className={`input ${errors.group_id ? 'border-destructive' : ''}`}
        >
          <option value="">No Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {errors.group_id && <p className="mt-1 text-sm text-destructive">{errors.group_id}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className={`input ${errors.notes ? 'border-destructive' : ''}`}
        />
        {errors.notes && <p className="mt-1 text-sm text-destructive">{errors.notes}</p>}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}