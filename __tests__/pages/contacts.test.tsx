import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactsPage from '@/app/contacts/page';
import { Contact, Group } from '@/types';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockContacts: Contact[] = [
  {
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
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    company: 'Tech Inc',
    job_title: 'Product Manager',
    group_id: 2,
    notes: '',
    favorite: 1,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z'
  }
];

const mockGroups: Group[] = [
  { id: 1, name: 'VIP', color: '#ff0000', created_at: '2023-01-01T00:00:00Z' },
  { id: 2, name: 'Partners', color: '#00ff00', created_at: '2023-01-01T00:00:00Z' }
];

describe('ContactsPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ContactsPage />);
    
    expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
  });

  it('fetches and displays contacts', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: mockContacts,
          totalPages: 1,
          total: 2
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Manage your 2 contacts')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: mockContacts,
          totalPages: 1,
          total: 2
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [mockContacts[0]],
          totalPages: 1,
          total: 1
        })
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search contacts/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John')
      );
    });
  });

  it('handles group filtering', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: mockContacts,
          totalPages: 1,
          total: 2
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [mockContacts[0]],
          totalPages: 1,
          total: 1
        })
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const groupSelect = screen.getByDisplayValue('All Groups');
    fireEvent.change(groupSelect, { target: { value: '1' } });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('group=1')
      );
    });
  });

  it('handles pagination', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: mockContacts,
          totalPages: 3,
          total: 30
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [],
          totalPages: 3,
          total: 30
        })
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('displays empty state when no contacts', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [],
          totalPages: 0,
          total: 0
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No contacts found')).toBeInTheDocument();
    });
  });

  it('handles favorite toggle', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: mockContacts,
          totalPages: 1,
          total: 2
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Test the favorite toggle functionality through ContactCard
    const favoriteButtons = screen.getAllByText('star');
    expect(favoriteButtons).toHaveLength(2);
  });

  it('handles API errors gracefully', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockGroups
      } as Response);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<ContactsPage />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching contacts:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});