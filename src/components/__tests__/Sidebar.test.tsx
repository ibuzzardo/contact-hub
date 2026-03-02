import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render all navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should render logo and title', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('ContactHub')).toBeInTheDocument();
    expect(screen.getByText('Sales CRM')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    mockUsePathname.mockReturnValue('/contacts');
    render(<Sidebar />);
    
    const contactsLink = screen.getByRole('link', { name: /contacts/i });
    expect(contactsLink).toHaveClass('bg-primary');
  });

  it('should highlight dashboard when on root path', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-primary');
  });

  it('should handle nested paths correctly', () => {
    mockUsePathname.mockReturnValue('/contacts/123');
    render(<Sidebar />);
    
    const contactsLink = screen.getByRole('link', { name: /contacts/i });
    expect(contactsLink).toHaveClass('bg-primary');
  });

  it('should not highlight dashboard for non-root paths', () => {
    mockUsePathname.mockReturnValue('/contacts');
    render(<Sidebar />);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveClass('bg-primary');
  });

  it('should render mobile menu button', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton.querySelector('.material-symbols-outlined')).toHaveTextContent('menu');
  });

  it('should toggle mobile menu when button is clicked', () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole('navigation').parentElement;
    const menuButton = screen.getByRole('button');
    
    // Initially closed on mobile
    expect(sidebar).toHaveClass('-translate-x-full');
    
    // Click to open
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click to close
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should close mobile menu when navigation link is clicked', () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole('navigation').parentElement;
    const menuButton = screen.getByRole('button');
    const contactsLink = screen.getByRole('link', { name: /contacts/i });
    
    // Open menu
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click navigation link
    fireEvent.click(contactsLink);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should have correct href attributes for all links', () => {
    render(<Sidebar />);
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /contacts/i })).toHaveAttribute('href', '/contacts');
    expect(screen.getByRole('link', { name: /companies/i })).toHaveAttribute('href', '/companies');
    expect(screen.getByRole('link', { name: /deals/i })).toHaveAttribute('href', '/deals');
    expect(screen.getByRole('link', { name: /activities/i })).toHaveAttribute('href', '/activities');
    expect(screen.getByRole('link', { name: /tasks/i })).toHaveAttribute('href', '/tasks');
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute('href', '/reports');
  });

  it('should render correct icons for navigation items', () => {
    render(<Sidebar />);
    
    const icons = screen.getAllByClassName('material-symbols-outlined');
    const iconTexts = icons.map(icon => icon.textContent);
    
    expect(iconTexts).toContain('hub'); // logo
    expect(iconTexts).toContain('menu'); // mobile menu
    expect(iconTexts).toContain('dashboard');
    expect(iconTexts).toContain('group');
    expect(iconTexts).toContain('domain');
    expect(iconTexts).toContain('view_kanban');
    expect(iconTexts).toContain('timeline');
    expect(iconTexts).toContain('check_box');
    expect(iconTexts).toContain('bar_chart');
  });

  it('should apply correct CSS classes for styling', () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('bg-surface-light', 'w-64', 'h-full', 'shadow-lg', 'fixed');
    
    const logo = screen.getByText('ContactHub').parentElement?.parentElement;
    expect(logo).toHaveClass('p-6', 'border-b', 'border-border-light');
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('flex-1', 'p-4');
  });
});