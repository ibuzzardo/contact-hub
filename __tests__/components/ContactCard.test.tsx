import { render, screen } from '@testing-library/react';
import ContactCard from '@/components/ContactCard';
import { Contact } from '@/types';

const mockContact: Contact = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Acme Corp',
  group_id: 1,
  notes: 'Test notes for the contact',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
};

describe('ContactCard Component', () => {
  it('should render contact information', () => {
    render(<ContactCard contact={mockContact} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Test notes for the contact')).toBeInTheDocument();
  });

  it('should render group badge when group name is provided', () => {
    render(<ContactCard contact={mockContact} groupName="Work" />);
    
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should not render group badge when no group name provided', () => {
    render(<ContactCard contact={mockContact} />);
    
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });

  it('should handle contact without optional fields', () => {
    const minimalContact: Contact = {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };
    
    render(<ContactCard contact={minimalContact} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.queryByText('+1234567890')).not.toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('should truncate long notes', () => {
    const longNotes = 'a'.repeat(150);
    const contactWithLongNotes = {
      ...mockContact,
      notes: longNotes
    };
    
    render(<ContactCard contact={contactWithLongNotes} />);
    
    const notesElement = screen.getByText(/aaa/);
    expect(notesElement.textContent).toContain('...');
    expect(notesElement.textContent?.length).toBeLessThan(longNotes.length);
  });

  it('should not truncate short notes', () => {
    const shortNotes = 'Short notes';
    const contactWithShortNotes = {
      ...mockContact,
      notes: shortNotes
    };
    
    render(<ContactCard contact={contactWithShortNotes} />);
    
    expect(screen.getByText(shortNotes)).toBeInTheDocument();
  });

  it('should format creation date', () => {
    render(<ContactCard contact={mockContact} />);
    
    const formattedDate = new Date(mockContact.created_at).toLocaleDateString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('should render view details link with correct href', () => {
    render(<ContactCard contact={mockContact} />);
    
    const viewDetailsLink = screen.getByText('View Details');
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink.closest('a')).toHaveAttribute('href', '/contacts/1');
  });

  it('should apply hover styles', () => {
    render(<ContactCard contact={mockContact} />);
    
    const cardElement = screen.getByText('John Doe').closest('div');
    expect(cardElement).toHaveClass('card', 'hover:shadow-lg', 'transition-shadow');
  });

  it('should truncate long text fields', () => {
    const longName = 'a'.repeat(100);
    const longEmail = 'verylongemail@' + 'a'.repeat(50) + '.com';
    const contactWithLongFields = {
      ...mockContact,
      name: longName,
      email: longEmail
    };
    
    render(<ContactCard contact={contactWithLongFields} />);
    
    const nameElement = screen.getByText(longName);
    const emailElement = screen.getByText(longEmail);
    
    expect(nameElement).toHaveClass('truncate');
    expect(emailElement).toHaveClass('truncate');
  });
});