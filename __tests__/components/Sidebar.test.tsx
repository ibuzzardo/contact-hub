import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar with navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('ContactHub')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Groups')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    mockUsePathname.mockReturnValue('/contacts');
    render(<Sidebar />);
    
    const contactsLink = screen.getByText('Contacts');
    expect(contactsLink).toHaveClass('bg-primary', 'text-white');
  });

  it('should highlight dashboard when on home page', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Sidebar />);
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveClass('bg-primary', 'text-white');
  });

  it('should highlight contacts for contact detail pages', () => {
    mockUsePathname.mockReturnValue('/contacts/123');
    render(<Sidebar />);
    
    const contactsLink = screen.getByText('Contacts');
    expect(contactsLink).toHaveClass('bg-primary', 'text-white');
  });

  it('should show mobile menu button', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile menu on button click', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    const sidebar = screen.getByText('ContactHub').closest('div');
    
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
    
    const menuButton = screen.getByRole('button');
    const contactsLink = screen.getByText('Contacts');
    const sidebar = screen.getByText('ContactHub').closest('div');
    
    // Open menu
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click navigation link
    fireEvent.click(contactsLink);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should render overlay when mobile menu is open', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    
    // Initially no overlay
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
    
    // Open menu
    fireEvent.click(menuButton);
    
    // Overlay should be present
    const overlay = document.querySelector('.bg-black.bg-opacity-50');
    expect(overlay).toBeInTheDocument();
  });

  it('should close mobile menu when overlay is clicked', () => {
    render(<Sidebar />);
    
    const menuButton = screen.getByRole('button');
    const sidebar = screen.getByText('ContactHub').closest('div');
    
    // Open menu
    fireEvent.click(menuButton);
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Click overlay
    const overlay = document.querySelector('.bg-black.bg-opacity-50');
    fireEvent.click(overlay!);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should have correct href attributes for navigation links', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Contacts').closest('a')).toHaveAttribute('href', '/contacts');
    expect(screen.getByText('Groups').closest('a')).toHaveAttribute('href', '/groups');
  });
});