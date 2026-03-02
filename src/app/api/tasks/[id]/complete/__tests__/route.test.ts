import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn()
  })
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/tasks/[id]/complete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should mark pending task as completed', async () => {
      const currentTask = { status: 'pending' };
      const completedTask = {
        id: 1,
        title: 'Test task',
        status: 'completed',
        completed_at: '2024-01-01T10:00:00.000Z',
        contact_name: 'John Doe',
        deal_name: 'Big Deal'
      };

      // Mock current task fetch
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(currentTask)
      } as any);
      
      // Mock status update
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn()
      } as any);
      
      // Mock updated task fetch
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(completedTask)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks/1/complete', {
        method: 'PATCH'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('completed');
      expect(data.completed_at).toBeTruthy();
    });

    it('should mark completed task as pending', async () => {
      const currentTask = { status: 'completed' };
      const pendingTask = {
        id: 1,
        title: 'Test task',
        status: 'pending',
        completed_at: null,
        contact_name: 'John Doe',
        deal_name: 'Big Deal'
      };

      // Mock current task fetch
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(currentTask)
      } as any);
      
      // Mock status update
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn()
      } as any);
      
      // Mock updated task fetch
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(pendingTask)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks/1/complete', {
        method: 'PATCH'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('pending');
      expect(data.completed_at).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks/999/complete', {
        method: 'PATCH'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Task not found');
    });

    it('should return 400 for invalid task ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/tasks/invalid/complete', {
        method: 'PATCH'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid task ID');
    });

    it('should update completed_at timestamp correctly', async () => {
      const currentTask = { status: 'pending' };
      const updateStmt = { run: jest.fn() };
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(currentTask)
      } as any);
      
      mockDb.prepare.mockReturnValueOnce(updateStmt as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1, status: 'completed' })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks/1/complete', {
        method: 'PATCH'
      });
      
      await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(updateStmt.run).toHaveBeenCalledWith(
        'completed',
        expect.any(String), // ISO timestamp
        1
      );
    });

    it('should clear completed_at when marking as pending', async () => {
      const currentTask = { status: 'completed' };
      const updateStmt = { run: jest.fn() };
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(currentTask)
      } as any);
      
      mockDb.prepare.mockReturnValueOnce(updateStmt as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1, status: 'pending' })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/tasks/1/complete', {
        method: 'PATCH'
      });
      
      await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(updateStmt.run).toHaveBeenCalledWith(
        'pending',
        null,
        1
      );
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/tasks/1/complete', {
        method: 'PATCH'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to update task');
    });
  });
});