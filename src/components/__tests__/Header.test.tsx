import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header Component', () => {
  it('should render title', () => {
    render(<Header title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
  });

  it('should render subtitle when provided', () => {
    render(<Header title="Test Title" subtitle="Test Subtitle" />);
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    render(<Header title="Test Title" />);
    
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should render children when provided', () => {
    render(
      <Header title="Test Title">
        <button>Test Button</button>
      </Header>
    );
    
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('should not render children container when no children', () => {
    const { container } = render(<Header title="Test Title" />);
    
    const childrenContainer = container.querySelector('.flex.items-center.gap-3');
    expect(childrenContainer).not.toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<Header title="Test Title" />);
    
    const header = container.firstChild;
    expect(header).toHaveClass(
      'sticky',
      'top-0',
      'z-10',
      'bg-background-light/80',
      'backdrop-blur-sm',
      'border-b',
      'border-border-light'
    );
  });

  it('should render multiple children', () => {
    render(
      <Header title="Test Title">
        <button>Button 1</button>
        <button>Button 2</button>
      </Header>
    );
    
    expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
  });

  it('should render both subtitle and children', () => {
    render(
      <Header title="Test Title" subtitle="Test Subtitle">
        <button>Test Button</button>
      </Header>
    );
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });
});