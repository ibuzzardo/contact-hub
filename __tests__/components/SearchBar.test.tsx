import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

jest.useFakeTimers();

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render search input with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render search input with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Search contacts..." />);
    
    const searchInput = screen.getByPlaceholderText('Search contacts...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render with initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="test query" />);
    
    const searchInput = screen.getByDisplayValue('test query');
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearch after debounce delay', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should debounce multiple rapid changes', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Rapid changes
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Should not call during rapid changes
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should only call once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('should cancel previous timeout on new input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // First change
    fireEvent.change(searchInput, { target: { value: 'first' } });
    jest.advanceTimersByTime(200);
    
    // Second change before timeout
    fireEvent.change(searchInput, { target: { value: 'second' } });
    jest.advanceTimersByTime(300);
    
    // Should only call with second value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('second');
  });

  it('should handle empty search query', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="test" />);
    
    const searchInput = screen.getByDisplayValue('test');
    fireEvent.change(searchInput, { target: { value: '' } });
    
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should render search icon', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchIcon = screen.getByRole('img', { hidden: true });
    expect(searchIcon).toBeInTheDocument();
  });

  it('should have correct input styling', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toHaveClass('input', 'pl-10');
  });

  it('should call onSearch with initial value on mount', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial" />);
    
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('initial');
  });

  it('should handle special characters in search query', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const specialQuery = 'test@example.com & special chars!';
    
    fireEvent.change(searchInput, { target: { value: specialQuery } });
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith(specialQuery);
  });
});