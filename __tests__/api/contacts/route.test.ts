import { GET, POST } from '@/app/api/contacts/route';
import { getDb } from '@/lib/db';
import { NextRequest } from 'next/server';

// Mock the database
jest.mock('@/lib/db');
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('/api/contacts', () => {
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

  describe('GET /api/contacts', () => {
    const mockContacts = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        created_at: '2023-01-02T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z'
      }
    ];

    it('should return paginated contacts', async () => {
      mockGet.mockReturnValue({ total: 2 });
      mockAll.mockReturnValue(mockContacts);
      
      const request = new NextRequest('http://localhost:3000/api/contacts');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: mockContacts,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1
      });
    });

    it('should handle search parameter', async () => {
      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue([mockContacts[0]]);
      
      const request = new NextRequest('http://localhost:3000/api/contacts?search=john');
      const response = await GET(request);
      
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('WHERE (name LIKE ? OR email LIKE ?)'));
      expect(mockGet).toHaveBeenCalledWith('%john%', '%john%');
      expect(mockAll).toHaveBeenCalledWith('%john%', '%john%', 20, 0);
    });

    it('should handle group filter parameter', async () => {
      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue([mockContacts[0]]);
      
      const request = new NextRequest('http://localhost:3000/api/contacts?group=1');
      const response = await GET(request);
      
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('WHERE group_id = ?'));
      expect(mockGet).toHaveBeenCalledWith(1);
      expect(mockAll).toHaveBeenCalledWith(1, 20, 0);
    });

    it('should handle both search and group parameters', async () => {
      mockGet.mockReturnValue({ total: 1 });
      mockAll.mockReturnValue([mockContacts[0]]);
      
      const request = new NextRequest('http://localhost:3000/api/contacts?search=john&group=1');
      const response = await GET(request);
      
      expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('WHERE (name LIKE ? OR email LIKE ?) AND group_id = ?'));
      expect(mockGet).toHaveBeenCalledWith('%john%', '%john%', 1);
      expect(mockAll).toHaveBeenCalledWith('%john%', '%john%', 1, 20, 0);
    });

    it('should handle pagination parameters', async () => {
      mockGet.mockReturnValue({ total: 50 });
      mockAll.mockReturnValue(mockContacts);
      
      const request = new NextRequest('http://localhost:3000/api/contacts?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.totalPages).toBe(5);
      expect(mockAll).toHaveBeenCalledWith(10, 10); // limit, offset
    });

    it('should handle database errors', async () => {
      mockGetDb.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const request = new NextRequest('http://localhost:3000/api/contacts');
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch contacts');
    });
  });

  describe('POST /api/contacts', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      group_id: 1,
      notes: 'Test notes'
    };

    it('should create a new contact', async () => {
      const mockGroup = { id: 1, name: 'Work' };
      const mockResult = { lastInsertRowid: 1 };
      const mockCreatedContact = { id: 1, ...validContactData };
      
      mockGet.mockReturnValueOnce(mockGroup).mockReturnValueOnce(mockCreatedContact);
      mockRun.mockReturnValue(mockResult);
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(validContactData)
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedContact);
    });

    it('should create contact without optional fields', async () => {
      const minimalContactData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };
      
      const mockResult = { lastInsertRowid: 2 };
      const mockCreatedContact = { id: 2, ...minimalContactData };
      
      mockGet.mockReturnValue(mockCreatedContact);
      mockRun.mockReturnValue(mockResult);
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(minimalContactData)
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedContact);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'john@example.com'
        // missing name
      };
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email'
      };
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should validate group exists when group_id provided', async () => {
      mockGet.mockReturnValue(null); // Group not found
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(validContactData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Group not found');
    });

    it('should handle database errors', async () => {
      mockRun.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(validContactData)
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create contact');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: 'invalid json'
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});