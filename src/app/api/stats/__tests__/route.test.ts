import { GET } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    all: jest.fn()
  })
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return comprehensive dashboard stats', async () => {
      // Mock all database queries
      mockDb.prepare
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalContacts: 150 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalCompanies: 45 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ openDeals: 23 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ pipelineValue: 250000 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ wonThisMonth: 75000 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ activitiesThisWeek: 12 }) } as any)
        .mockReturnValueOnce({ 
          all: jest.fn().mockReturnValue([
            {
              id: 1,
              type: 'call',
              subject: 'Follow up call',
              activity_date: '2024-01-01T10:00:00Z',
              contact_name: 'John Doe',
              deal_name: 'Big Deal',
              company_name: 'Acme Corp'
            },
            {
              id: 2,
              type: 'email',
              subject: 'Proposal sent',
              activity_date: '2024-01-01T09:00:00Z',
              contact_name: 'Jane Smith',
              deal_name: null,
              company_name: 'Beta Inc'
            }
          ])
        } as any)
        .mockReturnValueOnce({ 
          all: jest.fn().mockReturnValue([
            {
              id: 1,
              title: 'Call client back',
              type: 'call_back',
              priority: 'high',
              status: 'pending',
              due_date: '2024-12-31',
              contact_name: 'John Doe',
              deal_name: 'Big Deal'
            },
            {
              id: 2,
              title: 'Send follow-up email',
              type: 'send_email',
              priority: 'medium',
              status: 'pending',
              due_date: '2023-12-01', // overdue
              contact_name: 'Jane Smith',
              deal_name: null
            }
          ])
        } as any)
        .mockReturnValueOnce({ 
          all: jest.fn().mockReturnValue([
            { stage: 'lead', count: 5, value: 25000 },
            { stage: 'qualified', count: 8, value: 80000 },
            { stage: 'proposal', count: 6, value: 90000 },
            { stage: 'negotiation', count: 4, value: 55000 },
            { stage: 'closed_won', count: 10, value: 150000 },
            { stage: 'closed_lost', count: 3, value: 0 }
          ])
        } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        totalContacts: 150,
        totalCompanies: 45,
        openDeals: 23,
        pipelineValue: 250000,
        wonThisMonth: 75000,
        activitiesThisWeek: 12,
        recentActivities: [
          {
            id: 1,
            type: 'call',
            subject: 'Follow up call',
            activity_date: '2024-01-01T10:00:00Z',
            contact_name: 'John Doe',
            deal_name: 'Big Deal',
            company_name: 'Acme Corp'
          },
          {
            id: 2,
            type: 'email',
            subject: 'Proposal sent',
            activity_date: '2024-01-01T09:00:00Z',
            contact_name: 'Jane Smith',
            deal_name: null,
            company_name: 'Beta Inc'
          }
        ],
        upcomingTasks: [
          {
            id: 1,
            title: 'Call client back',
            type: 'call_back',
            priority: 'high',
            status: 'pending',
            due_date: '2024-12-31',
            contact_name: 'John Doe',
            deal_name: 'Big Deal'
          },
          {
            id: 2,
            title: 'Send follow-up email',
            type: 'send_email',
            priority: 'medium',
            status: 'pending',
            due_date: '2023-12-01',
            contact_name: 'Jane Smith',
            deal_name: null
          }
        ],
        dealsByStage: [
          { stage: 'lead', count: 5, value: 25000 },
          { stage: 'qualified', count: 8, value: 80000 },
          { stage: 'proposal', count: 6, value: 90000 },
          { stage: 'negotiation', count: 4, value: 55000 },
          { stage: 'closed_won', count: 10, value: 150000 },
          { stage: 'closed_lost', count: 3, value: 0 }
        ]
      });
    });

    it('should handle zero values gracefully', async () => {
      // Mock all queries returning zero/empty results
      mockDb.prepare
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalContacts: 0 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalCompanies: 0 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ openDeals: 0 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ pipelineValue: 0 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ wonThisMonth: 0 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ activitiesThisWeek: 0 }) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalContacts).toBe(0);
      expect(data.totalCompanies).toBe(0);
      expect(data.openDeals).toBe(0);
      expect(data.pipelineValue).toBe(0);
      expect(data.wonThisMonth).toBe(0);
      expect(data.activitiesThisWeek).toBe(0);
      expect(data.recentActivities).toEqual([]);
      expect(data.upcomingTasks).toEqual([]);
      expect(data.dealsByStage).toEqual([]);
    });

    it('should handle null values from database', async () => {
      // Mock queries that might return null
      mockDb.prepare
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalContacts: 10 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalCompanies: 5 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ openDeals: 3 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ pipelineValue: null }) } as any) // null value
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ wonThisMonth: null }) } as any) // null value
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ activitiesThisWeek: 2 }) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pipelineValue).toBe(0); // Should handle null as 0
      expect(data.wonThisMonth).toBe(0); // Should handle null as 0
    });

    it('should execute correct SQL queries', async () => {
      // Mock all queries
      const mockQueries = Array(9).fill(null).map(() => ({
        get: jest.fn().mockReturnValue({ count: 0, value: 0 }),
        all: jest.fn().mockReturnValue([])
      }));
      
      mockDb.prepare.mockImplementation(() => mockQueries.shift() as any);

      await GET();

      // Verify key queries are executed
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT COUNT(*) as totalContacts FROM contacts');
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT COUNT(*) as totalCompanies FROM companies');
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE stage NOT IN (\'closed_won\', \'closed_lost\')'));
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE stage = \'closed_won\''));
      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE date(activity_date) >= date(\'now\', \'-7 days\')'));
    });

    it('should limit recent activities and upcoming tasks', async () => {
      // Mock queries with limits
      mockDb.prepare
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalContacts: 1 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ totalCompanies: 1 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ openDeals: 1 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ pipelineValue: 1000 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ wonThisMonth: 500 }) } as any)
        .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ activitiesThisWeek: 1 }) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any)
        .mockReturnValueOnce({ all: jest.fn().mockReturnValue([]) } as any);

      await GET();

      // Check that LIMIT clauses are used
      const calls = mockDb.prepare.mock.calls;
      const activitiesQuery = calls.find(call => call[0].includes('activities') && call[0].includes('LIMIT'));
      const tasksQuery = calls.find(call => call[0].includes('tasks') && call[0].includes('LIMIT'));
      
      expect(activitiesQuery).toBeDefined();
      expect(activitiesQuery![0]).toContain('LIMIT 10');
      expect(tasksQuery).toBeDefined();
      expect(tasksQuery![0]).toContain('LIMIT 10');
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch dashboard stats');
    });
  });
});