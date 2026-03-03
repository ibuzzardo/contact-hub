import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from '@/components/Avatar';
import * as utils from '@/lib/utils';

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  getAvatarColor: jest.fn(),
  getInitials: jest.fn()
}));

const mockGetAvatarColor = utils.getAvatarColor as jest.MockedFunction<typeof utils.getAvatarColor>;
const mockGetInitials = utils.getInitials as jest.MockedFunction<typeof utils.getInitials>;

describe('Avatar', () => {
  beforeEach(() => {
    mockGetAvatarColor.mockReturnValue({ bg: 'bg-blue-500', text: 'text-white' });
    mockGetInitials.mockReturnValue('JD');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct initials', () => {
    render(<Avatar name="John Doe" />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(mockGetInitials).toHaveBeenCalledWith('John Doe');
  });

  it('applies correct color classes', () => {
    render(<Avatar name="John Doe" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('bg-blue-500', 'text-white');
    expect(mockGetAvatarColor).toHaveBeenCalledWith('John Doe');
  });

  it('renders with small size', () => {
    render(<Avatar name="John Doe" size="sm" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('w-8', 'h-8', 'text-sm');
  });

  it('renders with medium size by default', () => {
    render(<Avatar name="John Doe" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('w-16', 'h-16', 'text-xl');
  });

  it('renders with large size', () => {
    render(<Avatar name="John Doe" size="lg" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('w-20', 'h-20', 'text-2xl');
  });

  it('has consistent styling classes', () => {
    render(<Avatar name="John Doe" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass(
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'font-bold',
      'border-2',
      'border-white',
      'shadow-sm'
    );
  });

  it('handles empty name gracefully', () => {
    mockGetInitials.mockReturnValue('');
    render(<Avatar name="" />);
    
    expect(mockGetInitials).toHaveBeenCalledWith('');
    expect(mockGetAvatarColor).toHaveBeenCalledWith('');
  });

  it('handles single character names', () => {
    mockGetInitials.mockReturnValue('J');
    render(<Avatar name="John" />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles names with special characters', () => {
    mockGetInitials.mockReturnValue('JO');
    render(<Avatar name="John O'Connor" />);
    
    expect(mockGetInitials).toHaveBeenCalledWith("John O'Connor");
    expect(mockGetAvatarColor).toHaveBeenCalledWith("John O'Connor");
  });
});