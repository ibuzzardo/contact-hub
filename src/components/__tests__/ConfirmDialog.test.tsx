import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test Message'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });

  it('should render default button texts', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('should render custom button texts', () => {
    render(
      <ConfirmDialog 
        {...defaultProps} 
        confirmText="Delete" 
        cancelText="Keep" 
      />
    );
    
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(backdrop!);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should apply destructive styling when isDestructive is true', () => {
    render(<ConfirmDialog {...defaultProps} isDestructive={true} />);
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('text-red-600', 'hover:bg-red-50', 'border-red-200');
  });

  it('should apply primary styling when isDestructive is false', () => {
    render(<ConfirmDialog {...defaultProps} isDestructive={false} />);
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('bg-primary', 'hover:bg-primary-dark', 'text-white');
  });

  it('should have proper accessibility attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
  });

  it('should prevent event propagation on dialog content click', () => {
    const onClose = jest.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);
    
    const dialogContent = document.querySelector('.relative.bg-surface-light');
    fireEvent.click(dialogContent!);
    expect(onClose).not.toHaveBeenCalled();
  });
});