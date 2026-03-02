import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
    run: jest.fn(),
    get: jest.fn()
  })
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return tasks with default parameters', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Follow up with client',
          type: 'call_back',
          priority: 'high',
          status: 'pending',
          due_date: '2024-12-31',
          contact_name: 'John Doe',
          deal_name: 'Big Deal'
        },
        {
          id: 2,
          title: 'Send proposal',
          type: 'send_email',
          priority: 'medium',
          status: 'completed',
          due_date: null,
          contact_name: null,
          deal_name: null
        }
      ];

      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockTasks)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTasks);
    });

    it('should filter by status', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks?status=pending');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('AND t.status = ?'));
    });

    it('should handle limit parameter', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks?limit=25');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('LIMIT ?'));
    });

    it('should order by overdue tasks first', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks');
      await GET(request);

      const query = mockDb.prepare.mock.calls[0][0];
      expect(query).toContain('ORDER BY');
      expect(query).toContain('CASE WHEN t.due_date IS NOT NULL AND t.due_date < date(\'now\')');  
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch tasks');
    });
  });

  describe('POST', () => {
    it('should create a new task with valid data', async () => {
      const newTask = {
        title: 'Call client back',
        type: 'call_back',
        priority: 'high',
        due_date: '2024-12-31',
        contact_id: 1,
        deal_id: 1,
        notes: 'Important follow-up'
      };

      const createdTask = {
        id: 1,
        ...newTask,
        status: 'pending',
        contact_name: 'John Doe',
        deal_name: 'Big Deal',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 })
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(createdTask)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask)
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(newTask.title);
      expect(data.contact_name).toBe('John Doe');
    });

    it('should create task with minimal data', async () => {
      const minimalTask = {
        title: 'Simple task'
      };

      const createdTask = {
        id: 1,
        title: 'Simple task',
        type: 'follow_up',
        priority: 'medium',
        status: 'pending',
        due_date: null,
        contact_id: null,
        deal_id: null,
        notes: null,
        contact_name: null,
        deal_name: null
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 })
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(createdTask)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(minimalTask)
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Simple task');
      expect(data.type).toBe('follow_up');
      expect(data.priority).toBe('medium');
    });

    it('should validate required fields', async () => {
      const invalidTask = {
        type: 'call_back'
        // missing required title field
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate type enum', async () => {
      const invalidTask = {
        title: 'Test task',
        type: 'invalid_type'
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate priority enum', async () => {
      const invalidTask = {
        title: 'Test task',
        priority: 'invalid_priority'
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate title length', async () => {
      const invalidTask = {
        title: 'a'.repeat(201) // exceeds 200 character limit
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should handle database errors', async () => {
      const task = { title: 'Test task' };

      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create task');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});