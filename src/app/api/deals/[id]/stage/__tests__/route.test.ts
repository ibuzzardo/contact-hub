import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn()
  }),
  transaction: jest.fn().mockImplementation((fn) => fn)
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/deals/[id]/stage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should update deal stage successfully', async () => {
      const currentDeal = {
        id: 1,
        name: 'Test Deal',
        stage: 'lead',
        value: 10000
      };

      const updatedDeal = {
        id: 1,
        name: 'Test Deal',
        stage: 'qualified',
        value: 10000,
        company_name: 'Acme Corp',
        contact_name: 'John Doe',
        tags: 'urgent,enterprise'
      };

      // Mock transaction
      mockDb.transaction.mockImplementationOnce((fn) => {
        // Mock current deal fetch
        mockDb.prepare.mockReturnValueOnce({
          get: jest.fn().mockReturnValue(currentDeal)
        } as any);
        
        // Mock stage update
        mockDb.prepare.mockReturnValueOnce({
          run: jest.fn()
        } as any);
        
        // Mock activity creation
        mockDb.prepare.mockReturnValueOnce({
          run: jest.fn()
        } as any);
        
        return fn();
      });

      // Mock updated deal fetch
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedDeal)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals/1/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'qualified' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stage).toBe('qualified');
      expect(data.tags).toEqual(['urgent', 'enterprise']);
    });

    it('should return 404 for non-existent deal', async () => {
      mockDb.transaction.mockImplementationOnce((fn) => {
        mockDb.prepare.mockReturnValueOnce({
          get: jest.fn().mockReturnValue(null)
        } as any);
        
        throw new Error('Deal not found');
      });

      const request = new NextRequest('http://localhost:3000/api/deals/999/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'qualified' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Deal not found');
    });

    it('should return 400 for invalid deal ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/deals/invalid/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'qualified' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid deal ID');
    });

    it('should validate stage enum', async () => {
      const request = new NextRequest('http://localhost:3000/api/deals/1/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'invalid_stage' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should create activity record for stage change', async () => {
      const currentDeal = { id: 1, name: 'Test Deal', stage: 'lead' };
      const activityStmt = { run: jest.fn() };

      mockDb.transaction.mockImplementationOnce((fn) => {
        mockDb.prepare.mockReturnValueOnce({
          get: jest.fn().mockReturnValue(currentDeal)
        } as any);
        
        mockDb.prepare.mockReturnValueOnce({
          run: jest.fn()
        } as any);
        
        mockDb.prepare.mockReturnValueOnce(activityStmt as any);
        
        return fn();
      });

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1, stage: 'qualified', tags: null })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals/1/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'qualified' })
      });
      
      await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(activityStmt.run).toHaveBeenCalledWith(
        'Deal moved to QUALIFIED',
        1
      );
    });

    it('should handle all valid stage transitions', async () => {
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      
      for (const stage of stages) {
        jest.clearAllMocks();
        
        const currentDeal = { id: 1, name: 'Test Deal', stage: 'lead' };
        
        mockDb.transaction.mockImplementationOnce((fn) => {
          mockDb.prepare.mockReturnValueOnce({
            get: jest.fn().mockReturnValue(currentDeal)
          } as any);
          
          mockDb.prepare.mockReturnValueOnce({
            run: jest.fn()
          } as any);
          
          mockDb.prepare.mockReturnValueOnce({
            run: jest.fn()
          } as any);
          
          return fn();
        });

        mockDb.prepare.mockReturnValueOnce({
          get: jest.fn().mockReturnValue({ id: 1, stage, tags: null })
        } as any);

        const request = new NextRequest(`http://localhost:3000/api/deals/1/stage`, {
          method: 'PATCH',
          body: JSON.stringify({ stage })
        });
        
        const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
        
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.stage).toBe(stage);
      }
    });

    it('should handle database errors', async () => {
      mockDb.transaction.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/deals/1/stage', {
        method: 'PATCH',
        body: JSON.stringify({ stage: 'qualified' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to update deal stage');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/deals/1/stage', {
        method: 'PATCH',
        body: 'invalid json'
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(400);
    });
  });
});