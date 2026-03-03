import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactCard from '@/components/ContactCard';
import { Contact } from '@/types';

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

describe('ContactCard', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders contact information correctly', () => {
    render(<ContactCard contact={mockContact} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('renders group badge when groupName is provided', () => {
    render(<ContactCard contact={mockContact} groupName="VIP" />);
    
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('handles favorite toggle correctly', async () => {
    const mockOnFavoriteToggle = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    } as Response);
    
    render(
      <ContactCard 
        contact={mockContact} 
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );
    
    const favoriteButton = screen.getByRole('button');
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/contacts/1/favorite',
        { method: 'PATCH' }
      );
    });
    
    expect(mockOnFavoriteToggle).toHaveBeenCalledWith(1, true);
  });

  it('reverts favorite state on API error', async () => {
    const mockOnFavoriteToggle = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed' })
    } as Response);
    
    render(
      <ContactCard 
        contact={mockContact} 
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );
    
    const favoriteButton = screen.getByRole('button');
    fireEvent.click(favoriteButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // Should not call onFavoriteToggle on error
    expect(mockOnFavoriteToggle).not.toHaveBeenCalled();
  });

  it('shows favorite contact with filled star', () => {
    const favoriteContact = { ...mockContact, favorite: 1 };
    render(<ContactCard contact={favoriteContact} />);
    
    const starIcon = screen.getByText('star');
    expect(starIcon).toHaveClass('fill-current', 'text-yellow-400');
  });

  it('prevents multiple simultaneous favorite toggles', async () => {
    const mockOnFavoriteToggle = jest.fn();
    mockFetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, json: async () => ({}) } as Response), 100)
    ));
    
    render(
      <ContactCard 
        contact={mockContact} 
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    );
    
    const favoriteButton = screen.getByRole('button');
    
    // Click multiple times quickly
    fireEvent.click(favoriteButton);
    fireEvent.click(favoriteButton);
    fireEvent.click(favoriteButton);
    
    // Should only make one API call
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles missing optional fields gracefully', () => {
    const minimalContact: Contact = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      company: '',
      job_title: '',
      group_id: null,
      notes: '',
      favorite: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    render(<ContactCard contact={minimalContact} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });
});