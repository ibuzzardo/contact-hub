import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../SearchBar';

jest.useFakeTimers();

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render with default placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText('Search by name, email, or company...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should render with initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="test query" />);
    
    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('should update input value on change', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new query' } });
    
    expect(input).toHaveValue('new query');
  });

  it('should debounce search calls', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should not call onSearch immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should call onSearch once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('abc');
  });

  it('should call onSearch with initial value on mount', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial" />);
    
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('initial');
  });

  it('should call onSearch with empty string initially', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    jest.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should have search icon', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(document.querySelector('.material-symbols-outlined')).toBeInTheDocument();
    expect(document.querySelector('.material-symbols-outlined')).toHaveTextContent('search');
  });

  it('should have proper styling classes', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'w-full',
      'px-4',
      'py-2.5',
      'pl-12',
      'bg-surface-light',
      'border',
      'border-border-light',
      'rounded-xl',
      'focus:ring-2',
      'focus:ring-primary/20',
      'focus:border-primary'
    );
  });

  it('should clear previous timeout on new input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'first' } });
    jest.advanceTimersByTime(200);
    
    fireEvent.change(input, { target: { value: 'second' } });
    jest.advanceTimersByTime(300);
    
    // Should only call with the latest value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('second');
  });
});