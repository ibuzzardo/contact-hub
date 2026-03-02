import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    );
    
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('should render pagination controls for multiple pages', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
    expect(prevButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('should disable Next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should highlight current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('text-white', 'bg-primary', 'border-primary');
  });

  it('should call onPageChange when page button is clicked', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when Previous button is clicked', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when Next button is clicked', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should show ellipsis for large page ranges', () => {
    render(
      <Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis).toHaveLength(2);
  });

  it('should show first and last page with ellipsis', () => {
    render(
      <Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should limit visible pages to maximum', () => {
    render(
      <Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    // Should show pages around current page (8, 9, 10, 11, 12)
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should handle edge case at beginning of page range', () => {
    render(
      <Pagination currentPage={2} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    // Should show pages 1, 2, 3, 4, 5
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should handle edge case at end of page range', () => {
    render(
      <Pagination currentPage={19} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    // Should show pages 16, 17, 18, 19, 20
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should not show ellipsis when not needed', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});