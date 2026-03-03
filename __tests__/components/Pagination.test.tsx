import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination 
        currentPage={1}
        totalPages={1}
        totalItems={10}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('displays correct item range information', () => {
    render(
      <Pagination 
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('Showing 11 to 20 of 50 results')).toBeInTheDocument();
  });

  it('renders page buttons correctly', () => {
    render(
      <Pagination 
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(
      <Pagination 
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const currentPageButton = screen.getByRole('button', { name: '3' });
    expect(currentPageButton).toHaveClass('bg-primary');
  });

  it('disables Previous button on first page', () => {
    render(
      <Pagination 
        currentPage={1}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(
      <Pagination 
        currentPage={5}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when page button is clicked', () => {
    render(
      <Pagination 
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const pageButton = screen.getByRole('button', { name: '4' });
    fireEvent.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange when Previous button is clicked', () => {
    render(
      <Pagination 
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when Next button is clicked', () => {
    render(
      <Pagination 
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('shows ellipsis for large page ranges', () => {
    render(
      <Pagination 
        currentPage={10}
        totalPages={20}
        totalItems={200}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('handles edge case with fewer items than itemsPerPage', () => {
    render(
      <Pagination 
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Should render nothing for single page
    const { container } = render(
      <Pagination 
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});