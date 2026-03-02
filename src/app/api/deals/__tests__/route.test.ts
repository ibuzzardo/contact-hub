import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
    run: jest.fn()
  }),
  transaction: jest.fn().mockImplementation((fn) => fn)
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/deals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return deals with default parameters', async () => {
      const mockDeals = [
        {
          id: 1,
          name: 'Deal 1',
          value: 10000,
          stage: 'qualified',
          company_name: 'Acme Corp',
          contact_name: 'John Doe',
          tags: 'urgent,enterprise'
        },
        {
          id: 2,
          name: 'Deal 2',
          value: 5000,
          stage: 'proposal',
          company_name: 'Beta Inc',
          contact_name: 'Jane Smith',
          tags: null
        }
      ];

      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockDeals)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].tags).toEqual(['urgent', 'enterprise']);
      expect(data[1].tags).toEqual([]);
    });

    it('should filter by stage', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals?stage=qualified');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE d.stage = ?'));
    });

    it('should handle sorting parameters', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals?sort=value');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY d.value DESC'));
    });

    it('should handle pagination', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals?page=2&limit=25');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('LIMIT ? OFFSET ?'));
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/deals');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch deals');
    });
  });

  describe('POST', () => {
    it('should create a new deal with valid data', async () => {
      const newDeal = {
        name: 'New Deal',
        company_id: 1,
        contact_id: 1,
        value: 15000,
        stage: 'qualified',
        probability: 75,
        expected_close: '2024-12-31',
        notes: 'Important deal',
        tags: ['urgent', 'enterprise']
      };

      const mockInsertResult = { lastInsertRowid: 1 };
      const mockCreatedDeal = {
        id: 1,
        ...newDeal,
        company_name: 'Acme Corp',
        contact_name: 'John Doe',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      // Mock transaction function
      mockDb.transaction.mockImplementationOnce((fn) => {
        // Mock deal insert
        mockDb.prepare.mockReturnValueOnce({
          run: jest.fn().mockReturnValue(mockInsertResult)
        } as any);
        
        // Mock tag inserts
        mockDb.prepare.mockReturnValue({
          run: jest.fn()
        } as any);
        
        return fn();
      });

      // Mock deal fetch after creation
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ ...mockCreatedDeal, tags: 'urgent,enterprise' })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(newDeal)
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(newDeal.name);
      expect(data.tags).toEqual(['urgent', 'enterprise']);
    });

    it('should create deal without optional fields', async () => {
      const minimalDeal = {
        name: 'Minimal Deal'
      };

      mockDb.transaction.mockImplementationOnce((fn) => {
        mockDb.prepare.mockReturnValueOnce({
          run: jest.fn().mockReturnValue({ lastInsertRowid: 1 })
        } as any);
        return fn();
      });

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({
          id: 1,
          name: 'Minimal Deal',
          value: 0,
          stage: 'lead',
          probability: 10,
          tags: null
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(minimalDeal)
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Minimal Deal');
      expect(data.value).toBe(0);
      expect(data.stage).toBe('lead');
      expect(data.tags).toEqual([]);
    });

    it('should validate required fields', async () => {
      const invalidDeal = {
        value: 1000
        // missing required name field
      };

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(invalidDeal)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate stage enum', async () => {
      const invalidDeal = {
        name: 'Test Deal',
        stage: 'invalid_stage'
      };

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(invalidDeal)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate probability range', async () => {
      const invalidDeal = {
        name: 'Test Deal',
        probability: 150 // invalid probability > 100
      };

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(invalidDeal)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate negative value', async () => {
      const invalidDeal = {
        name: 'Test Deal',
        value: -1000
      };

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(invalidDeal)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should handle database errors', async () => {
      const deal = { name: 'Test Deal' };

      mockDb.transaction.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: JSON.stringify(deal)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create deal');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/deals', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});