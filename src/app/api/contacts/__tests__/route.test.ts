import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import db from '@/lib/db';

jest.mock('@/lib/db');

const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn()
  })
};

(db as any) = mockDb;

describe('/api/contacts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return contacts with default pagination', async () => {
      const mockContacts = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];
      const mockGroups = [{ id: 1, name: 'Customer' }];
      
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 2 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockContacts)
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockGroups)
      });

      const request = new NextRequest('http://localhost:3000/api/contacts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.contacts).toEqual(mockContacts);
      expect(data.groups).toEqual(mockGroups);
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.totalPages).toBe(1);
    });

    it('should handle search parameter', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([{ id: 1, name: 'John Doe', email: 'john@example.com' }])
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });

      const request = new NextRequest('http://localhost:3000/api/contacts?search=john');
      await GET(request);

      // Verify search parameters were used in query
      const countCall = mockDb.prepare.mock.calls[0][0];
      expect(countCall).toContain('name LIKE ? OR email LIKE ? OR company LIKE ?');
    });

    it('should handle group filter', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([{ id: 1, name: 'John Doe', email: 'john@example.com' }])
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });

      const request = new NextRequest('http://localhost:3000/api/contacts?group=1');
      await GET(request);

      const countCall = mockDb.prepare.mock.calls[0][0];
      expect(countCall).toContain('group_id = ?');
    });

    it('should handle favorite filter', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([{ id: 1, name: 'John Doe', email: 'john@example.com' }])
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });

      const request = new NextRequest('http://localhost:3000/api/contacts?favorite=true');
      await GET(request);

      const countCall = mockDb.prepare.mock.calls[0][0];
      expect(countCall).toContain('favorite = 1');
    });

    it('should handle different sort options', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([{ id: 1, name: 'John Doe', email: 'john@example.com' }])
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });

      const request = new NextRequest('http://localhost:3000/api/contacts?sort=newest');
      await GET(request);

      const contactsCall = mockDb.prepare.mock.calls[1][0];
      expect(contactsCall).toContain('ORDER BY created_at DESC');
    });

    it('should handle pagination', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ total: 25 })
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });
      mockDb.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue([])
      });

      const request = new NextRequest('http://localhost:3000/api/contacts?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.totalPages).toBe(3);
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/contacts');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch contacts');
    });
  });

  describe('POST', () => {
    it('should create a new contact', async () => {
      const newContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp'
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ lastInsertRowid: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1, ...newContact })
      });

      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(newContact)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(1);
      expect(data.name).toBe(newContact.name);
      expect(data.email).toBe(newContact.email);
    });

    it('should validate required fields', async () => {
      const invalidContact = {
        email: 'john@example.com'
        // missing name
      };

      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(invalidContact)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should handle duplicate email', async () => {
      const newContact = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockImplementation(() => {
          const error = new Error('UNIQUE constraint failed');
          (error as any).code = 'SQLITE_CONSTRAINT_UNIQUE';
          throw error;
        })
      });

      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(newContact)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('A contact with this email already exists');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON');
    });

    it('should handle database errors', async () => {
      const newContact = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(newContact)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create contact');
    });
  });
});