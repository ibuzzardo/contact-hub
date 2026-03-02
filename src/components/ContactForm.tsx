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
    job_title: contact?.job_title || '',
    group_id: contact?.group_id || '',
    notes: contact?.notes || '',
    favorite: contact?.favorite === 1,
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
        favorite: formData.favorite ? 1 : 0,
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-light rounded-xl border border-border-light p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Placeholder */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 text-2xl">photo_camera</span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-main mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm ${
                errors.name ? 'border-red-300' : 'border-border-light'
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-main mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm ${
                  errors.email ? 'border-red-300' : 'border-border-light'
                }`}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-main mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm ${
                  errors.phone ? 'border-red-300' : 'border-border-light'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Company and Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-text-main mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm ${
                  errors.company ? 'border-red-300' : 'border-border-light'
                }`}
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-text-main mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm ${
                  errors.job_title ? 'border-red-300' : 'border-border-light'
                }`}
              />
              {errors.job_title && <p className="mt-1 text-sm text-red-600">{errors.job_title}</p>}
            </div>
          </div>

          {/* Group */}
          <div>
            <label htmlFor="group_id" className="block text-sm font-medium text-text-main mb-2">
              Group
            </label>
            <select
              id="group_id"
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main transition-all shadow-sm ${
                errors.group_id ? 'border-red-300' : 'border-border-light'
              }`}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.group_id && <p className="mt-1 text-sm text-red-600">{errors.group_id}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-main mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-light border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm resize-none ${
                errors.notes ? 'border-red-300' : 'border-border-light'
              }`}
              placeholder="Add any additional notes..."
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>

          {/* Mark as Favorite */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="favorite"
              name="favorite"
              checked={formData.favorite}
              onChange={handleChange}
              className="w-4 h-4 text-primary bg-surface-light border-border-light rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="favorite" className="text-sm font-medium text-text-main">
              Mark as Favorite
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-text-muted hover:bg-slate-100 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}