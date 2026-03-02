import { render, screen } from '@testing-library/react';
import Avatar from '../Avatar';
import * as utils from '@/lib/utils';

jest.mock('@/lib/utils');

const mockGetAvatarColor = utils.getAvatarColor as jest.MockedFunction<typeof utils.getAvatarColor>;
const mockGetInitials = utils.getInitials as jest.MockedFunction<typeof utils.getInitials>;

describe('Avatar Component', () => {
  beforeEach(() => {
    mockGetAvatarColor.mockReturnValue({ bg: 'bg-blue-100', text: 'text-blue-600' });
    mockGetInitials.mockReturnValue('JD');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default medium size', () => {
    render(<Avatar name="John Doe" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-16', 'h-16', 'text-xl');
  });

  it('should render with small size', () => {
    render(<Avatar name="John Doe" size="sm" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('w-8', 'h-8', 'text-sm');
  });

  it('should render with large size', () => {
    render(<Avatar name="John Doe" size="lg" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('w-20', 'h-20', 'text-2xl');
  });

  it('should apply correct colors from utility function', () => {
    render(<Avatar name="John Doe" />);
    
    const avatar = screen.getByText('JD');
    expect(avatar).toHaveClass('bg-blue-100', 'text-blue-600');
    expect(mockGetAvatarColor).toHaveBeenCalledWith('John Doe');
  });

  it('should display initials from utility function', () => {
    render(<Avatar name="John Doe" />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(mockGetInitials).toHaveBeenCalledWith('John Doe');
  });

  it('should have proper styling classes', () => {
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

  it('should handle empty name', () => {
    mockGetInitials.mockReturnValue('');
    render(<Avatar name="" />);
    
    expect(mockGetInitials).toHaveBeenCalledWith('');
  });

  it('should handle special characters in name', () => {
    render(<Avatar name="José María" />);
    
    expect(mockGetAvatarColor).toHaveBeenCalledWith('José María');
    expect(mockGetInitials).toHaveBeenCalledWith('José María');
  });
});