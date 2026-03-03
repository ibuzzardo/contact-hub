import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

jest.useFakeTimers();

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder="Search contacts..."
      />
    );
    
    expect(screen.getByPlaceholderText('Search contacts...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('test query');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange with debounced input', async () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not call immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('debounces multiple rapid changes', async () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'tes' } });
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should only call once with the final value
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when there is text', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
    expect(screen.getByText('close')).toBeInTheDocument();
  });

  it('hides clear button when text is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('updates local value when prop value changes', () => {
    const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);
    
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
    
    rerender(<SearchBar value="updated" onChange={mockOnChange} />);
    
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        className="custom-class"
      />
    );
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders search icon', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    expect(screen.getByText('search')).toBeInTheDocument();
  });
});