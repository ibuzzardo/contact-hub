import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn()
  })
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/companies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return companies with default parameters', async () => {
      const mockCompanies = [
        { id: 1, name: 'Acme Corp', industry: 'Tech', contact_count: 5, total_deal_value: 10000, open_deal_count: 2 },
        { id: 2, name: 'Beta Inc', industry: 'Finance', contact_count: 3, total_deal_value: 5000, open_deal_count: 1 }
      ];
      
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockCompanies)
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 2 })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toEqual(mockCompanies);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      });
    });

    it('should handle search parameter', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 0 })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies?search=acme');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE c.name LIKE ?'));
    });

    it('should handle sorting parameters', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 0 })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies?sort=industry');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY c.industry ASC'));
    });

    it('should handle pagination parameters', async () => {
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 0 })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies?page=2&limit=10');
      await GET(request);

      expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('LIMIT ? OFFSET ?'));
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/companies');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch companies');
    });
  });

  describe('POST', () => {
    it('should create a new company with valid data', async () => {
      const newCompany = {
        name: 'New Corp',
        industry: 'Technology',
        website: 'https://newcorp.com',
        phone: '+1234567890',
        address: '123 Main St',
        notes: 'Test company'
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 })
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1, ...newCompany, created_at: '2024-01-01', updated_at: '2024-01-01' })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(newCompany)
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(newCompany.name);
    });

    it('should validate required fields', async () => {
      const invalidCompany = {
        industry: 'Technology'
        // missing required name field
      };

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(invalidCompany)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should handle duplicate company names', async () => {
      const company = { name: 'Existing Corp' };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockImplementation(() => {
          const error = new Error('UNIQUE constraint failed');
          (error as any).code = 'SQLITE_CONSTRAINT_UNIQUE';
          throw error;
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(company)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Company name already exists');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle database errors', async () => {
      const company = { name: 'Test Corp' };

      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/companies', {
        method: 'POST',
        body: JSON.stringify(company)
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create company');
    });
  });
});