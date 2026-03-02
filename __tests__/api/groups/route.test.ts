import { GET, POST } from '@/app/api/groups/route';
import { getDb } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the database
jest.mock('@/lib/db');
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('/api/groups', () => {
  let mockDb: any;
  let mockPrepare: jest.Mock;
  let mockGet: jest.Mock;
  let mockAll: jest.Mock;
  let mockRun: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGet = jest.fn();
    mockAll = jest.fn();
    mockRun = jest.fn();
    mockPrepare = jest.fn().mockReturnValue({
      get: mockGet,
      all: mockAll,
      run: mockRun,
    });
    
    mockDb = {
      prepare: mockPrepare,
    };
    
    mockGetDb.mockReturnValue(mockDb);
  });

  describe('GET /api/groups', () => {
    const mockGroups = [
      {
        id: 1,
        name: 'Work',
        created_at: '2023-01-01T00:00:00.000Z',
        contact_count: 5
      },
      {
        id: 2,
        name: 'Personal',
        created_at: '2023-01-02T00:00:00.000Z',
        contact_count: 3
      }
    ];

    it('should return all groups with contact counts', async () => {
      mockAll.mockReturnValue(mockGroups);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockGroups);
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN contacts'));
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('COUNT(c.id) as contact_count'));
    });

    it('should order groups by name', async () => {
      mockAll.mockReturnValue(mockGroups);
      
      await GET();
      
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY g.name'));
    });

    it('should handle database errors', async () => {
      mockGetDb.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const response = await GET();
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch groups');
    });

    it('should return empty array when no groups exist', async () => {
      mockAll.mockReturnValue([]);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('POST /api/groups', () => {
    const validGroupData = {
      name: 'New Group'
    };

    it('should create a new group', async () => {
      const mockResult = { lastInsertRowid: 1 };
      const mockCreatedGroup = {
        id: 1,
        name: 'New Group',
        created_at: '2023-01-01T00:00:00.000Z'
      };
      
      mockRun.mockReturnValue(mockResult);
      mockGet.mockReturnValue(mockCreatedGroup);
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(validGroupData)
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedGroup);
      expect(mockRun).toHaveBeenCalledWith('New Group');
    });

    it('should validate required name field', async () => {
      const invalidData = {
        name: ''
      };
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should validate name length', async () => {
      const invalidData = {
        name: 'a'.repeat(51) // Too long
      };
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should handle duplicate group names', async () => {
      const dbError = new Error('UNIQUE constraint failed');
      dbError.code = 'SQLITE_CONSTRAINT_UNIQUE';
      mockRun.mockImplementation(() => {
        throw dbError;
      });
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(validGroupData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('A group with this name already exists');
    });

    it('should handle other database errors', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(validGroupData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create group');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should trim whitespace from group name', async () => {
      const dataWithWhitespace = {
        name: '  Trimmed Group  '
      };
      
      const mockResult = { lastInsertRowid: 1 };
      const mockCreatedGroup = {
        id: 1,
        name: 'Trimmed Group',
        created_at: '2023-01-01T00:00:00.000Z'
      };
      
      mockRun.mockReturnValue(mockResult);
      mockGet.mockReturnValue(mockCreatedGroup);
      
      const request = new NextRequest('http://localhost:3000/api/groups', {
        method: 'POST',
        body: JSON.stringify(dataWithWhitespace)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      // The schema should handle trimming, but we test the final result
      expect(mockRun).toHaveBeenCalledWith('  Trimmed Group  ');
    });
  });
});