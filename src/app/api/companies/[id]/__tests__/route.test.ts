import { NextRequest } from 'next/server';
import { GET, PUT } from '../route';
import db from '@/lib/db';

// Mock the database
jest.mock('@/lib/db', () => ({
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn()
  })
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('/api/companies/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return company by ID', async () => {
      const mockCompany = {
        id: 1,
        name: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.com',
        contact_count: 5,
        total_deal_value: 10000,
        open_deal_count: 2
      };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockCompany)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCompany);
    });

    it('should return 404 for non-existent company', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(null)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies/999');
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Company not found');
    });

    it('should return 400 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/companies/invalid');
      const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid company ID');
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/companies/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch company');
    });
  });

  describe('PUT', () => {
    it('should update company with valid data', async () => {
      const updateData = {
        name: 'Updated Corp',
        industry: 'Finance',
        website: 'https://updated.com'
      };

      const updatedCompany = {
        id: 1,
        ...updateData,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 1 })
      } as any);
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedCompany)
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent company', async () => {
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 0 })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies/999', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' })
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Company not found');
    });

    it('should return 400 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/companies/invalid', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' })
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid company ID');
    });

    it('should validate input data', async () => {
      const invalidData = {
        name: '', // empty name should fail validation
        website: 'invalid-url'
      };

      const request = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PUT',
        body: JSON.stringify(invalidData)
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should handle duplicate company names', async () => {
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockImplementation(() => {
          const error = new Error('UNIQUE constraint failed');
          (error as any).code = 'SQLITE_CONSTRAINT_UNIQUE';
          throw error;
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Existing Corp' })
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Company name already exists');
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/companies/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' })
      });
      
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to update company');
    });
  });
});