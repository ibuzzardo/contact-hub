import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ContactsPage from '@/app/contacts/page';
import NewContactPage from '@/app/contacts/new/page';
import ContactDetailPage from '@/app/contacts/[id]/page';
import { Contact, Group } from '@/types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn()
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockContact: Contact = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Acme Corp',
  job_title: 'Software Engineer',
  group_id: 1,
  notes: 'Test notes',
  favorite: 0,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

const mockGroups: Group[] = [
  { id: 1, name: 'VIP', color: '#ff0000', created_at: '2023-01-01T00:00:00Z' }
];

describe('Contact Workflow Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
  });

  describe('Contact Creation Flow', () => {
    it('creates a new contact and navigates to detail page', async () => {
      // Mock groups fetch for form
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
      
      // Mock contact creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockContact, id: 123 })
      } as Response);
      
      render(<NewContactPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Contact')).toBeInTheDocument();
      });
      
      // Fill out form
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+1234567890' }
      });
      
      // Submit form
      const submitButton = screen.getByText('Create Contact');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('john@example.com')
        });
      });
      
      expect(mockRouter.push).toHaveBeenCalledWith('/contacts/123');
    });
    
    it('handles validation errors during creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Validation failed',
          details: [{ path: ['email'], message: 'Invalid email format' }]
        })
      } as Response);
      
      render(<NewContactPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Contact')).toBeInTheDocument();
      });
      
      // Fill out form with invalid data
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' }
      });
      
      const submitButton = screen.getByText('Create Contact');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
      
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
  
  describe('Contact Search and Filter Flow', () => {
    it('searches contacts and updates results', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            contacts: [mockContact],
            totalPages: 1,
            total: 1
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGroups
        } as Response);
      
      // Search results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [],
          totalPages: 0,
          total: 0
        })
      } as Response);
      
      render(<ContactsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Perform search
      const searchInput = screen.getByPlaceholderText(/search contacts/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('search=nonexistent')
        );
      });
      
      await waitFor(() => {
        expect(screen.getByText('No contacts found')).toBeInTheDocument();
      });
    });
  });
  
  describe('Contact Detail and Edit Flow', () => {
    it('loads contact details and allows editing', async () => {
      // Mock useParams
      const mockUseParams = require('next/navigation').useParams as jest.Mock;
      mockUseParams.mockReturnValue({ id: '1' });
      
      // Mock contact fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContact
      } as Response);
      
      // Mock activities, deals, tasks fetch
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response);
      
      render(<ContactDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });
      
      expect(mockFetch).toHaveBeenCalledWith('/api/contacts/1');
    });
    
    it('handles contact not found', async () => {
      const mockUseParams = require('next/navigation').useParams as jest.Mock;
      mockUseParams.mockReturnValue({ id: '999' });
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);
      
      render(<ContactDetailPage />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/contacts');
      });
    });
  });
  
  describe('Favorite Toggle Flow', () => {
    it('toggles favorite status across components', async () => {
      // Mock initial contacts load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            contacts: [mockContact],
            totalPages: 1,
            total: 1
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGroups
        } as Response);
      
      // Mock favorite toggle
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response);
      
      render(<ContactsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Click favorite button
      const favoriteButton = screen.getByRole('button');
      fireEvent.click(favoriteButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/contacts/1/favorite',
          { method: 'PATCH' }
        );
      });
    });
  });
});