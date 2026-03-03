import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sidebar with logo and navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('ContactHub')).toBeInTheDocument();
    expect(screen.getByText('University of Sydney — AI Hub')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('highlights the active navigation item correctly', () => {
    mockUsePathname.mockReturnValue('/contacts');
    render(<Sidebar />);
    
    const contactsLink = screen.getByRole('link', { name: /contacts/i });
    expect(contactsLink).toHaveClass('bg-primary');
  });

  it('highlights dashboard as active when on root path', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-primary');
  });

  it('handles nested paths correctly', () => {
    mockUsePathname.mockReturnValue('/contacts/123');
    render(<Sidebar />);
    
    const contactsLink = screen.getByRole('link', { name: /contacts/i });
    expect(contactsLink).toHaveClass('bg-primary');
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    const sidebar = screen.getByRole('navigation').parentElement;
    
    // Initially hidden on mobile
    expect(sidebar).toHaveClass('-translate-x-full');
    
    // Click to open
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click to close
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('renders all navigation icons', () => {
    render(<Sidebar />);
    
    const expectedIcons = ['dashboard', 'group', 'domain', 'view_kanban', 'forum', 'check_box', 'bar_chart', 'group_work', 'settings'];
    expectedIcons.forEach(icon => {
      expect(screen.getByText(icon)).toBeInTheDocument();
    });
  });
});