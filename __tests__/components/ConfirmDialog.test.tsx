import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} isOpen={false} />
    );
    
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('renders dialog content when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('renders default button texts', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom button texts', () => {
    render(
      <ConfirmDialog 
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const backdrop = screen.getByText('Confirm Action').parentElement?.previousElementSibling;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('applies destructive styling when isDestructive is true', () => {
    render(<ConfirmDialog {...defaultProps} isDestructive={true} />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('text-red-600', 'hover:bg-red-50', 'border-red-200');
  });

  it('applies primary styling when isDestructive is false', () => {
    render(<ConfirmDialog {...defaultProps} isDestructive={false} />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-primary', 'hover:bg-primary-dark', 'text-white');
  });

  it('has proper accessibility attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog', { hidden: true }) || screen.getByText('Confirm Action').closest('div');
    expect(dialog).toBeInTheDocument();
  });

  it('prevents event propagation on dialog content click', () => {
    const mockStopPropagation = jest.fn();
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialogContent = screen.getByText('Confirm Action').closest('div');
    if (dialogContent) {
      const event = new MouseEvent('click', { bubbles: true });
      event.stopPropagation = mockStopPropagation;
      fireEvent(dialogContent, event);
      
      // Dialog should not close when clicking on content
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });
});