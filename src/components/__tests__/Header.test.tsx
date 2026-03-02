import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
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
        <span>Test Span</span>
      </Header>
    );
    
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    expect(screen.getByText('Test Span')).toBeInTheDocument();
  });

  it('should not render children container when no children provided', () => {
    const { container } = render(<Header title="Test Title" />);
    
    const childrenContainer = container.querySelector('.flex.items-center.gap-3');
    expect(childrenContainer).not.toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(<Header title="Test Title" subtitle="Test Subtitle" />);
    
    const header = container.firstChild;
    expect(header).toHaveClass('bg-surface-light', 'border-b', 'border-border-light', 'px-6', 'py-4');
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-text-main');
    
    const subtitle = screen.getByText('Test Subtitle');
    expect(subtitle).toHaveClass('text-text-muted', 'mt-1');
  });

  it('should have proper layout structure', () => {
    render(
      <Header title="Test Title" subtitle="Test Subtitle">
        <button>Action</button>
      </Header>
    );
    
    const mainContainer = screen.getByText('Test Title').closest('.flex.justify-between.items-start');
    expect(mainContainer).toBeInTheDocument();
    
    const leftSection = screen.getByText('Test Title').parentElement;
    expect(leftSection).toBeInTheDocument();
    
    const rightSection = screen.getByRole('button').parentElement;
    expect(rightSection).toHaveClass('flex', 'items-center', 'gap-3');
  });

  it('should handle multiple children correctly', () => {
    render(
      <Header title="Test Title">
        <button>Button 1</button>
        <button>Button 2</button>
        <div>Custom Element</div>
      </Header>
    );
    
    expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
    expect(screen.getByText('Custom Element')).toBeInTheDocument();
  });

  it('should handle empty title gracefully', () => {
    render(<Header title="" />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('');
  });

  it('should handle long titles and subtitles', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const longSubtitle = 'This is a very long subtitle that provides detailed information about the current page or section';
    
    render(<Header title={longTitle} subtitle={longSubtitle} />);
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longSubtitle)).toBeInTheDocument();
  });
});