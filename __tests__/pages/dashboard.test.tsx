import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/page';
import { CrmDashboardStats } from '@/types';
import * as utils from '@/lib/utils';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock utils
jest.mock('@/lib/utils', () => ({
  getGreeting: jest.fn(),
  getRelativeTime: jest.fn()
}));

const mockGetGreeting = utils.getGreeting as jest.MockedFunction<typeof utils.getGreeting>;
const mockGetRelativeTime = utils.getRelativeTime as jest.MockedFunction<typeof utils.getRelativeTime>;

const mockStats: CrmDashboardStats = {
  totalContacts: 150,
  totalCompanies: 45,
  openDeals: 23,
  pipelineValue: 125000,
  wonThisMonth: 85000,
  activitiesThisWeek: 12,
  recentActivities: [
    {
      id: 1,
      type: 'call',
      subject: 'Follow-up call',
      contact_id: 1,
      deal_id: 1,
      activity_date: '2023-01-01T10:00:00Z',
      duration_minutes: 30,
      outcome: 'positive',
      description: 'Great conversation',
      created_at: '2023-01-01T10:00:00Z'
    }
  ],
  upcomingTasks: [
    {
      id: 1,
      title: 'Prepare proposal',
      description: 'Draft proposal for client',
      contact_id: 1,
      due_date: '2023-01-02T00:00:00Z',
      priority: 'high',
      status: 'pending',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ],
  dealsByStage: [
    { stage: 'lead', count: 10, value: 50000 },
    { stage: 'qualified', count: 8, value: 40000 },
    { stage: 'proposal', count: 3, value: 25000 },
    { stage: 'won', count: 2, value: 10000 }
  ]
};

describe('Dashboard', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockGetGreeting.mockReturnValue('Good morning');
    mockGetRelativeTime.mockReturnValue('2 hours ago');
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('fetches and displays dashboard stats', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // totalContacts
      expect(screen.getByText('45')).toBeInTheDocument(); // totalCompanies
      expect(screen.getByText('23')).toBeInTheDocument(); // openDeals
      expect(screen.getByText('$125,000')).toBeInTheDocument(); // pipelineValue
    });
  });

  it('displays greeting message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Good morning')).toBeInTheDocument();
    });
    
    expect(mockGetGreeting).toHaveBeenCalled();
  });

  it('displays recent activities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Follow-up call')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  it('displays upcoming tasks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Prepare proposal')).toBeInTheDocument();
    });
  });

  it('displays deals by stage chart', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Qualified')).toBeInTheDocument();
      expect(screen.getByText('Proposal')).toBeInTheDocument();
      expect(screen.getByText('Won')).toBeInTheDocument();
    });
  });

  it('formats currency correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('$125,000')).toBeInTheDocument();
      expect(screen.getByText('$85,000')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching dashboard stats:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('displays empty state when no data', async () => {
    const emptyStats = {
      ...mockStats,
      recentActivities: [],
      upcomingTasks: [],
      dealsByStage: []
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => emptyStats
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No recent activities')).toBeInTheDocument();
      expect(screen.getByText('No upcoming tasks')).toBeInTheDocument();
    });
  });

  it('shows correct activity icons and colors', async () => {
    const statsWithVariousActivities = {
      ...mockStats,
      recentActivities: [
        { ...mockStats.recentActivities[0], type: 'call' },
        { ...mockStats.recentActivities[0], id: 2, type: 'email' },
        { ...mockStats.recentActivities[0], id: 3, type: 'meeting' },
        { ...mockStats.recentActivities[0], id: 4, type: 'note' }
      ]
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => statsWithVariousActivities
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getAllByText('call')).toHaveLength(1);
      expect(screen.getAllByText('mail')).toHaveLength(1);
      expect(screen.getAllByText('event')).toHaveLength(1);
      expect(screen.getAllByText('note')).toHaveLength(1);
    });
  });

  it('shows task priority indicators', async () => {
    const statsWithVariousTasks = {
      ...mockStats,
      upcomingTasks: [
        { ...mockStats.upcomingTasks[0], priority: 'high' },
        { ...mockStats.upcomingTasks[0], id: 2, priority: 'medium' },
        { ...mockStats.upcomingTasks[0], id: 3, priority: 'low' }
      ]
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => statsWithVariousTasks
    } as Response);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      const highPriorityElements = screen.getAllByText('Prepare proposal');
      expect(highPriorityElements.length).toBeGreaterThan(0);
    });
  });
});